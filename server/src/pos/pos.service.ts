import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, SaleStatus, StockMovementType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { ProductsService } from '../products/products.service';
import { CreatePosSaleDto } from './dto/pos-sale.dto';

@Injectable()
export class PosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly products: ProductsService,
  ) {}

  getProducts(search?: string) {
    return this.products.findAll({ search });
  }

  async createSale(employeeId: string, dto: CreatePosSaleDto) {
    if (dto.paymentMethod !== PaymentMethod.CASH && dto.paymentMethod !== PaymentMethod.CARD) {
      throw new BadRequestException('Le POS accepte uniquement les paiements espèces ou carte.');
    }
    if (dto.items.length === 0) {
      throw new BadRequestException('Le panier caisse est vide.');
    }

    const itemMap = new Map<string, number>();
    for (const item of dto.items) {
      itemMap.set(item.productId, (itemMap.get(item.productId) ?? 0) + item.quantity);
    }
    const items = Array.from(itemMap, ([productId, quantity]) => ({ productId, quantity }));
    const store = await this.inventory.getDefaultStore();

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((item) => item.productId) }, isActive: true },
        include: { brand: true },
      });
      const productsById = new Map(products.map((product) => [product.id, product]));
      if (productsById.size !== items.length) {
        throw new BadRequestException('Un article de la vente est indisponible.');
      }

      const saleItems = items.map((item) => {
        const product = productsById.get(item.productId)!;
        const unitPrice = Number(product.price);
        return {
          productId: product.id,
          productName: product.name,
          brandName: product.brand.name,
          unitPrice,
          quantity: item.quantity,
          lineTotal: unitPrice * item.quantity,
        };
      });
      const total = saleItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const receiptNumber = `POS-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

      const sale = await tx.posSale.create({
        data: {
          receiptNumber,
          employeeId,
          customerId: dto.customerId,
          storeId: store.id,
          status: SaleStatus.COMPLETED,
          subtotal: total,
          total,
          paymentMethod: dto.paymentMethod,
          items: { create: saleItems },
          payments: { create: { method: dto.paymentMethod, status: PaymentStatus.PAID, amount: total } },
        },
        include: { items: true, payments: true },
      });

      for (const item of saleItems) {
        await this.inventory.decreaseInTransaction(tx, store.id, item.productId, item.quantity, {
          type: StockMovementType.POS_SALE,
          reason: `Vente caisse ${sale.receiptNumber}`,
          reference: sale.receiptNumber,
          posSaleId: sale.id,
          createdById: employeeId,
        });
      }

      return sale;
    });
  }

  findAll() {
    return this.prisma.posSale.findMany({
      include: {
        employee: { select: { firstName: true, lastName: true, email: true } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
