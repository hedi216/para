import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { presentProduct } from './products.presenter';

const productInclude = {
  category: true,
  brand: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  inventoryItems: true,
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
  ) {}

  async findAll(query: { search?: string; category?: string; includeInactive?: boolean } = {}) {
    const search = query.search?.trim();
    const products = await this.prisma.product.findMany({
      where: {
        ...(query.includeInactive ? {} : { isActive: true }),
        ...(query.category ? { category: { OR: [{ id: query.category }, { slug: query.category }] } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
                { brand: { name: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: productInclude,
      orderBy: { name: 'asc' },
    });

    return products.map(presentProduct);
  }

  async findOne(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], isActive: true },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException('Produit introuvable.');
    }

    return presentProduct(product);
  }

  async create(dto: CreateProductDto) {
    await this.ensureRelations(dto.categoryId, dto.brandId);
    const store = await this.inventory.getDefaultStore();
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);

    const product = await this.prisma.product.create({
      data: {
        slug,
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        barcode: dto.barcode,
        price: dto.price,
        oldPrice: dto.oldPrice,
        badge: dto.badge,
        imageUrl: dto.imageUrl,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        inventoryItems: { create: { storeId: store.id, quantity: dto.initialStock ?? 0 } },
        ...(dto.imageUrl ? { images: { create: { url: dto.imageUrl, alt: dto.name } } } : {}),
      },
      include: productInclude,
    });

    return presentProduct(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    if (dto.categoryId || dto.brandId) {
      const current = await this.prisma.product.findUnique({ where: { id } });
      if (!current) {
        throw new NotFoundException('Produit introuvable.');
      }
      await this.ensureRelations(dto.categoryId ?? current.categoryId, dto.brandId ?? current.brandId);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.slug ? { slug: this.slugify(dto.slug) } : {}),
        ...(dto.imageUrl ? { images: { create: { url: dto.imageUrl, alt: dto.name ?? undefined } } } : {}),
      },
      include: productInclude,
    }).catch(() => {
      throw new NotFoundException('Produit introuvable.');
    });

    return presentProduct(product);
  }

  private async ensureRelations(categoryId: string, brandId: string) {
    const [category, brand] = await Promise.all([
      this.prisma.category.findUnique({ where: { id: categoryId } }),
      this.prisma.brand.findUnique({ where: { id: brandId } }),
    ]);

    if (!category || !brand) {
      throw new BadRequestException('La catégorie ou la marque sélectionnée est invalide.');
    }
  }

  private slugify(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
