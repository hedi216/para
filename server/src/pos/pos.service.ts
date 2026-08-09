import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, Prisma, SaleStatus, StockMovementType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { ProductsService } from '../products/products.service';
import { CreatePosInvoiceDto, CreatePosSaleDto, PosStockAdjustDto, RefundPosSaleDto } from './dto/pos-sale.dto';

const posSaleInclude = {
  employee: { select: { firstName: true, lastName: true, email: true } },
  customer: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } } },
  register: true,
  items: true,
  payments: true,
  invoice: { select: { id: true, invoiceNumber: true } },
} satisfies Prisma.PosSaleInclude;

const invoiceInclude = {
  items: true,
  posSale: {
    include: {
      employee: { select: { firstName: true, lastName: true, email: true } },
      register: true,
      payments: true,
    },
  },
} satisfies Prisma.InvoiceInclude;

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

  async findOne(id: string) {
    const sale = await this.prisma.posSale.findUnique({
      where: { id },
      include: posSaleInclude,
    });
    if (!sale) {
      throw new NotFoundException('Vente POS introuvable.');
    }
    return sale;
  }

  async getStock(search?: string) {
    const query = search?.trim().toLocaleLowerCase('fr-FR');
    const items = await this.inventory.findAll();
    if (!query) {
      return items;
    }

    return items.filter((item) => {
      const haystack = [
        item.product.name,
        item.product.sku,
        item.product.barcode,
        item.product.brand.name,
        item.product.category.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('fr-FR');
      return haystack.includes(query);
    });
  }

  adjustStock(dto: PosStockAdjustDto, employeeId: string) {
    const reason = dto.reason.trim();
    if (!reason) {
      throw new BadRequestException('Le motif d ajustement est obligatoire.');
    }
    return this.inventory.adjust({ productId: dto.productId, quantity: dto.quantity, reason }, employeeId);
  }

  async getCustomers(search?: string) {
    const query = search?.trim();
    const customers = await this.prisma.customerProfile.findMany({
      where: query
        ? {
            OR: [
              { user: { firstName: { contains: query, mode: 'insensitive' } } },
              { user: { lastName: { contains: query, mode: 'insensitive' } } },
              { user: { email: { contains: query, mode: 'insensitive' } } },
              { user: { phone: { contains: query, mode: 'insensitive' } } },
            ],
          }
        : {},
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return customers.map((customer) => ({
      id: customer.id,
      userId: customer.userId,
      firstName: customer.user.firstName,
      lastName: customer.user.lastName,
      email: customer.user.email,
      phone: customer.user.phone,
      loyaltyPoints: customer.loyaltyPoints,
      defaultAddress: customer.defaultAddress,
      city: customer.city,
    }));
  }

  async findInvoices() {
    return this.prisma.invoice.findMany({
      include: invoiceInclude,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: invoiceInclude,
    });
    if (!invoice) {
      throw new NotFoundException('Facture POS introuvable.');
    }
    return invoice;
  }

  async createInvoice(dto: CreatePosInvoiceDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findUnique({
        where: { posSaleId: dto.posSaleId },
        include: invoiceInclude,
      });
      if (existing) {
        throw new BadRequestException('Une facture existe deja pour ce ticket.');
      }

      const sale = await tx.posSale.findUnique({
        where: { id: dto.posSaleId },
        include: { items: true },
      });
      if (!sale) {
        throw new NotFoundException('Ticket POS introuvable.');
      }
      if (sale.status !== SaleStatus.COMPLETED) {
        throw new BadRequestException('Seul un ticket encaisse peut etre converti en facture interne.');
      }

      const total = Number(sale.total);
      const subtotal = Number(sale.subtotal);
      const includedTax = Number((total - total / 1.19).toFixed(3));
      const invoiceNumber = `FAC-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

      return tx.invoice.create({
        data: {
          invoiceNumber,
          posSaleId: sale.id,
          customerName: dto.customerName.trim(),
          customerPhone: dto.customerPhone.trim(),
          customerAddress: dto.customerAddress.trim(),
          taxIdentifier: dto.taxIdentifier?.trim() || undefined,
          subtotal,
          taxTotal: includedTax,
          total,
          notes: dto.notes?.trim() || undefined,
          items: {
            create: sale.items.map((item) => ({
              productName: item.productName,
              brandName: item.brandName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: invoiceInclude,
      });
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
