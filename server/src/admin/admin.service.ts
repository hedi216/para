import { Injectable } from '@nestjs/common';
import { OrderStatus, SaleStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
  ) {}

  async getDashboard() {
    const store = await this.inventory.getDefaultStore();
    const [orders, posSales, inventoryItems] = await Promise.all([
      this.prisma.order.findMany({
        where: { status: { not: OrderStatus.CANCELLED } },
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.posSale.findMany({
        where: { status: SaleStatus.COMPLETED },
        include: {
          employee: { select: { firstName: true, lastName: true, email: true } },
          register: true,
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryItem.findMany({
        where: { storeId: store.id },
        include: { product: { include: { brand: true, category: true } } },
        orderBy: { product: { name: 'asc' } },
      }),
    ]);

    const webRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const storeRevenue = posSales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalRevenue = webRevenue + storeRevenue;
    const transactionCount = orders.length + posSales.length;

    const outOfStockItems = inventoryItems.filter((item) => item.quantity - item.reserved <= 0);
    const lowStockItems = inventoryItems.filter((item) => {
      const available = item.quantity - item.reserved;
      return available > 0 && (available <= item.reorderLevel || available <= 5);
    });

    const recentActivity = [
      ...orders.map((order) => ({
        id: order.id,
        type: 'WEB_ORDER' as const,
        reference: order.orderNumber,
        channel: 'WEB' as const,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
      })),
      ...posSales.map((sale) => ({
        id: sale.id,
        type: 'POS_SALE' as const,
        reference: sale.receiptNumber,
        channel: 'STORE' as const,
        employeeName: `${sale.employee.firstName} ${sale.employee.lastName}`.trim(),
        registerCode: sale.register.code,
        status: sale.status,
        total: Number(sale.total),
        createdAt: sale.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      generatedAt: new Date().toISOString(),
      store: { id: store.id, code: store.code, name: store.name },
      revenue: {
        total: totalRevenue,
        web: webRevenue,
        store: storeRevenue,
      },
      channels: [
        {
          channel: 'WEB',
          amount: webRevenue,
          count: orders.length,
          percent: totalRevenue ? Math.round((webRevenue / totalRevenue) * 100) : 0,
        },
        {
          channel: 'STORE',
          amount: storeRevenue,
          count: posSales.length,
          percent: totalRevenue ? Math.round((storeRevenue / totalRevenue) * 100) : 0,
        },
      ],
      averageBasket: transactionCount ? totalRevenue / transactionCount : 0,
      stockAlerts: {
        outOfStock: outOfStockItems.length,
        lowStock: lowStockItems.length,
        items: [...outOfStockItems, ...lowStockItems].slice(0, 10).map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          brandName: item.product.brand.name,
          quantity: item.quantity,
          reserved: item.reserved,
          available: item.quantity - item.reserved,
          reorderLevel: item.reorderLevel,
        })),
      },
      recentActivity,
    };
  }
}
