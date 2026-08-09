import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, Prisma, SaleStatus, StockMovementType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { ProductsService } from '../products/products.service';
import { CreatePosSaleDto, RefundPosSaleDto } from './dto/pos-sale.dto';

const posSaleInclude = {
  employee: { select: { firstName: true, lastName: true, email: true } },
  customer: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } } },
  register: true,
  items: true,
  payments: true,
} satisfies Prisma.PosSaleInclude;

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

  getProductByBarcode(barcode: string) {
    return this.products.findByBarcode(barcode);
  }

  async createSale(employeeId: string, dto: CreatePosSaleDto) {
    if (dto.paymentMethod !== PaymentMethod.CASH && dto.paymentMethod !== PaymentMethod.CARD) {
      throw new BadRequestException('Le POS accepte uniquement les paiements especes ou carte.');
    }
    if (dto.items.length === 0) {
      throw new BadRequestException('Le panier caisse est vide.');
    }

    const store = await this.inventory.getDefaultStore();
    const register = await this.resolveRegister(store.id, dto.registerId);
    await this.ensureCustomerProfile(dto.customerId);

    if (dto.idempotencyKey) {
      const existingSale = await this.prisma.posSale.findFirst({
        where: { registerId: register.id, idempotencyKey: dto.idempotencyKey },
        include: posSaleInclude,
      });
      if (existingSale) {
        return existingSale;
      }
    }

    const itemMap = new Map<string, number>();
    for (const item of dto.items) {
      itemMap.set(item.productId, (itemMap.get(item.productId) ?? 0) + item.quantity);
    }
    const items = Array.from(itemMap, ([productId, quantity]) => ({ productId, quantity }));

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
          idempotencyKey: dto.idempotencyKey,
          employeeId,
          customerId: dto.customerId,
          storeId: store.id,
          registerId: register.id,
          status: SaleStatus.COMPLETED,
          subtotal: total,
          total,
          paymentMethod: dto.paymentMethod,
          items: { create: saleItems },
          payments: { create: { method: dto.paymentMethod, status: PaymentStatus.PAID, amount: total } },
        },
        include: posSaleInclude,
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
      include: posSaleInclude,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async refundSale(id: string, employeeId: string, dto: RefundPosSaleDto) {
    if (dto.paymentMethod !== PaymentMethod.CASH && dto.paymentMethod !== PaymentMethod.CARD) {
      throw new BadRequestException('Le remboursement POS accepte uniquement especes ou carte.');
    }

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.posSale.findUnique({
        where: { id },
        include: { items: true, payments: true, register: true },
      });
      if (!sale) {
        throw new NotFoundException('Vente POS introuvable.');
      }
      if (sale.status === SaleStatus.VOIDED) {
        throw new BadRequestException('Cette vente a deja ete annulee ou remboursee.');
      }

      const refundItems = dto.items?.length
        ? dto.items
        : sale.items.map((item) => ({ posSaleItemId: item.id, quantity: item.quantity }));
      const originalItems = new Map(sale.items.map((item) => [item.id, item]));
      let refundTotal = 0;

      const statusUpdate = await tx.posSale.updateMany({
        where: { id: sale.id, status: SaleStatus.COMPLETED },
        data: { status: SaleStatus.VOIDED, refundedAt: new Date() },
      });
      if (statusUpdate.count !== 1) {
        throw new BadRequestException('Cette vente a deja ete annulee ou remboursee.');
      }

      for (const refundItem of refundItems) {
        const original = originalItems.get(refundItem.posSaleItemId);
        if (!original) {
          throw new BadRequestException('Une ligne de remboursement ne correspond pas a cette vente.');
        }
        if (refundItem.quantity > original.quantity) {
          throw new BadRequestException('La quantite remboursee depasse la quantite vendue.');
        }

        refundTotal += Number(original.unitPrice) * refundItem.quantity;
        await this.inventory.increaseInTransaction(tx, sale.storeId, original.productId, refundItem.quantity, {
          type: StockMovementType.RETURN,
          reason: dto.reason ?? `Remboursement POS ${sale.receiptNumber}`,
          reference: sale.receiptNumber,
          posSaleId: sale.id,
          createdById: employeeId,
        });
      }

      await tx.payment.create({
        data: {
          posSaleId: sale.id,
          method: dto.paymentMethod,
          status: PaymentStatus.REFUNDED,
          amount: refundTotal,
          reference: `REFUND:${sale.receiptNumber}`,
        },
      });

      return tx.posSale.findUniqueOrThrow({
        where: { id: sale.id },
        include: posSaleInclude,
      });
    });
  }

  private async resolveRegister(storeId: string, idOrCode?: string) {
    const value = idOrCode?.trim();
    if (value) {
      const register = await this.prisma.cashRegister.findFirst({
        where: {
          storeId,
          isActive: true,
          OR: [{ id: value }, { code: value }],
        },
      });
      if (!register) {
        throw new BadRequestException('Caisse inconnue ou inactive.');
      }
      return register;
    }

    return this.prisma.cashRegister.upsert({
      where: { storeId_code: { storeId, code: 'CAISSE-01' } },
      update: { label: 'Caisse 01', isActive: true },
      create: { storeId, code: 'CAISSE-01', label: 'Caisse 01' },
    });
  }

  private async ensureCustomerProfile(customerId?: string) {
    if (!customerId) {
      return;
    }

    const customer = await this.prisma.customerProfile.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new BadRequestException('customerId doit correspondre a un CustomerProfile.id valide.');
    }
  }
}
