import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma, StockMovementType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
  ) {}

  async create(customerId: string, dto: CreateOrderDto) {
    if (dto.paymentMethod === PaymentMethod.ONLINE) {
      throw new BadRequestException('Le paiement en ligne sera activé dans une prochaine version.');
    }
    if (dto.paymentMethod !== PaymentMethod.CASH_ON_DELIVERY && dto.paymentMethod !== PaymentMethod.IN_STORE) {
      throw new BadRequestException('Le moyen de paiement sélectionné est indisponible pour une commande web.');
    }

    const items = this.aggregateItems(dto.items);
    const store = await this.inventory.getDefaultStore();

    return this.prisma.$transaction(async (tx) => {
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        include: { brand: true },
      });
      const productById = new Map(products.map((product) => [product.id, product]));

      if (productById.size !== productIds.length) {
        throw new BadRequestException('Un ou plusieurs produits ne sont plus disponibles.');
      }

      const preparedItems = items.map((item) => {
        const product = productById.get(item.productId)!;
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
      const subtotal = preparedItems.reduce((total, item) => total + item.lineTotal, 0);
      const deliveryFee = dto.paymentMethod === PaymentMethod.CASH_ON_DELIVERY ? 7 : 0;
      const total = subtotal + deliveryFee;
      const orderNumber = `WEB-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          storeId: store.id,
          status: OrderStatus.CONFIRMED,
          subtotal,
          deliveryFee,
          total,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          recipientName: dto.recipientName,
          recipientPhone: dto.recipientPhone,
          deliveryAddress: dto.deliveryAddress,
          deliveryCity: dto.deliveryCity,
          notes: dto.notes,
          items: { create: preparedItems },
          payments: {
            create: {
              method: dto.paymentMethod,
              status: PaymentStatus.PENDING,
              amount: total,
            },
          },
        },
        include: { items: true, payments: true },
      });

      for (const item of preparedItems) {
        await this.inventory.decreaseInTransaction(tx, store.id, item.productId, item.quantity, {
          type: StockMovementType.WEB_ORDER,
          reason: `Commande web ${order.orderNumber}`,
          reference: order.orderNumber,
          orderId: order.id,
          createdById: customerId,
        });
      }

      return order;
    });
  }

  findMine(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: OrderStatus, actorId: string) {
    const store = await this.inventory.getDefaultStore();
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order) {
        throw new NotFoundException('Commande introuvable.');
      }

      if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await this.inventory.increaseInTransaction(tx, store.id, item.productId, item.quantity, {
            type: StockMovementType.RETURN,
            reason: `Annulation de la commande ${order.orderNumber}`,
            reference: order.orderNumber,
            orderId: order.id,
            createdById: actorId,
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          status,
          ...(status === OrderStatus.CANCELLED ? { paymentStatus: PaymentStatus.CANCELLED } : {}),
        },
        include: { items: true, payments: true },
      });
    });
  }

  private aggregateItems(items: CreateOrderDto['items']) {
    if (items.length === 0) {
      throw new BadRequestException('Le panier est vide.');
    }

    return Array.from(
      items.reduce((map, item) => map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity), new Map<string, number>()),
      ([productId, quantity]) => ({ productId, quantity }),
    );
  }
}
