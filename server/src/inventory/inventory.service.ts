import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StockMovementType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

type Transaction = Prisma.TransactionClient;

type MovementInput = {
  type: StockMovementType;
  reason?: string;
  reference?: string;
  orderId?: string;
  posSaleId?: string;
  createdById?: string;
};

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  getDefaultStore() {
    return this.prisma.store.upsert({
      where: { code: 'SOUSSE-CENTRE' },
      update: {},
      create: { code: 'SOUSSE-CENTRE', name: 'LOLA Parapharmacie Sousse', city: 'Sousse' },
    });
  }

  async findAll() {
    const store = await this.getDefaultStore();
    return this.prisma.inventoryItem.findMany({
      where: { storeId: store.id },
      include: { product: { include: { brand: true, category: true } }, store: true },
      orderBy: { product: { name: 'asc' } },
    });
  }

  async adjust(dto: AdjustInventoryDto, userId: string) {
    if (dto.quantity === 0) {
      throw new BadRequestException('L’ajustement doit être différent de zéro.');
    }

    const store = await this.getDefaultStore();
    return this.prisma.$transaction((tx) =>
      dto.quantity > 0
        ? this.increaseInTransaction(tx, store.id, dto.productId, dto.quantity, {
            type: StockMovementType.ADJUSTMENT,
            reason: dto.reason ?? 'Ajustement manuel de stock',
            createdById: userId,
          })
        : this.decreaseInTransaction(tx, store.id, dto.productId, Math.abs(dto.quantity), {
            type: StockMovementType.ADJUSTMENT,
            reason: dto.reason ?? 'Ajustement manuel de stock',
            createdById: userId,
          }),
    );
  }

  async decreaseInTransaction(tx: Transaction, storeId: string, productId: string, quantity: number, input: MovementInput) {
    const inventory = await tx.inventoryItem.findUnique({
      where: { productId_storeId: { productId, storeId } },
    });
    if (!inventory) {
      throw new NotFoundException('Stock introuvable pour ce produit.');
    }

    const updatedCount = await tx.inventoryItem.updateMany({
      where: { id: inventory.id, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });
    if (updatedCount.count !== 1) {
      throw new BadRequestException('Stock insuffisant pour finaliser cette opération.');
    }

    const updated = await tx.inventoryItem.findUniqueOrThrow({ where: { id: inventory.id } });
    await tx.stockMovement.create({
      data: {
        inventoryId: inventory.id,
        productId,
        storeId,
        type: input.type,
        quantity: -quantity,
        beforeQuantity: inventory.quantity,
        afterQuantity: updated.quantity,
        reason: input.reason,
        reference: input.reference,
        orderId: input.orderId,
        posSaleId: input.posSaleId,
        createdById: input.createdById,
      },
    });
    return updated;
  }

  async increaseInTransaction(tx: Transaction, storeId: string, productId: string, quantity: number, input: MovementInput) {
    const inventory = await tx.inventoryItem.findUnique({
      where: { productId_storeId: { productId, storeId } },
    });
    if (!inventory) {
      throw new NotFoundException('Stock introuvable pour ce produit.');
    }

    const updated = await tx.inventoryItem.update({
      where: { id: inventory.id },
      data: { quantity: { increment: quantity } },
    });
    await tx.stockMovement.create({
      data: {
        inventoryId: inventory.id,
        productId,
        storeId,
        type: input.type,
        quantity,
        beforeQuantity: inventory.quantity,
        afterQuantity: updated.quantity,
        reason: input.reason,
        reference: input.reference,
        orderId: input.orderId,
        posSaleId: input.posSaleId,
        createdById: input.createdById,
      },
    });
    return updated;
  }
}
