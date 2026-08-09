import { Prisma } from '@prisma/client';

const productWithRelations = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    category: true,
    brand: true,
    images: { orderBy: { sortOrder: 'asc' } },
    inventoryItems: true,
  },
});

export type ProductWithRelations = Prisma.ProductGetPayload<typeof productWithRelations>;

export function presentProduct(product: ProductWithRelations) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    sku: product.sku,
    barcode: product.barcode,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    badge: product.badge,
    image: product.imageUrl ?? product.images[0]?.url ?? null,
    images: product.images.map((image) => ({ id: image.id, url: image.url, alt: image.alt, sortOrder: image.sortOrder })),
    isActive: product.isActive,
    category: { id: product.category.id, slug: product.category.slug, name: product.category.name },
    brand: { id: product.brand.id, slug: product.brand.slug, name: product.brand.name },
    stock: product.inventoryItems.reduce((total, item) => total + item.quantity - item.reserved, 0),
  };
}
