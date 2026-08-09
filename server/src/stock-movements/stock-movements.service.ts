import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  findRecent() {
    return this.prisma.stockMovement.findMany({
      include: { product: true, store: true, createdBy: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
