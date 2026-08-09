import { PrismaClient, StockMovementType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { brands, categories, products } from '../../src/data/catalog';

const prisma = new PrismaClient();

const brandDisplayNames: Record<string, string> = {
  bioderma: 'Bioderma',
  mustela: 'Mustela',
  'la-roche-posay': 'La Roche-Posay',
  cerave: 'CeraVe',
  vichy: 'Vichy',
  svr: 'SVR',
  avene: 'Avene',
  uriage: 'Uriage',
  eucerin: 'Eucerin',
  nuxe: 'Nuxe',
  filorga: 'Filorga',
  cosrx: 'COSRX',
};

const brandIdAliases: Record<string, string> = {
  bioderma: 'bioderma',
  mustela: 'mustela',
  'la-roche-posay': 'la-roche-posay',
  cerave: 'cerave',
  vichy: 'vichy',
  svr: 'svr',
  avene: 'avene',
  'ava-ne': 'avene',
  uriage: 'uriage',
  eucerin: 'eucerin',
  nuxe: 'nuxe',
  filorga: 'filorga',
  cosrx: 'cosrx',
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function resolveBrandId(value: string) {
  return brandIdAliases[slugify(value)] ?? slugify(value);
}

async function main() {
  const store = await prisma.store.upsert({
    where: { code: 'SOUSSE-CENTRE' },
    update: { name: 'LOLA Parapharmacie Sousse', city: 'Sousse' },
    create: {
      code: 'SOUSSE-CENTRE',
      name: 'LOLA Parapharmacie Sousse',
      address: '2 Rue Dr Moreau',
      city: 'Sousse',
    },
  });

  await prisma.cashRegister.upsert({
    where: { storeId_code: { storeId: store.id, code: 'CAISSE-01' } },
    update: { label: 'Caisse 01', isActive: true },
    create: { storeId: store.id, code: 'CAISSE-01', label: 'Caisse 01' },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { slug: category.id, name: category.name, label: category.label, imageUrl: category.image },
      create: { id: category.id, slug: category.id, name: category.name, label: category.label, imageUrl: category.image },
    });
  }

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: { slug: brand.id, name: brandDisplayNames[brand.id] ?? brand.name },
      create: { id: brand.id, slug: brand.id, name: brandDisplayNames[brand.id] ?? brand.name },
    });
  }

  for (const [index, product] of products.entries()) {
    const brandId = resolveBrandId(product.brand);
    const existingBrand = await prisma.brand.findUnique({ where: { id: brandId } });
    const barcode = `619${String(index + 1).padStart(9, '0')}`;

    if (!existingBrand) {
      throw new Error(`Marque introuvable pour ${product.name}: ${product.brand} (${brandId})`);
    }

    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        slug: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        badge: product.badge,
        imageUrl: product.image,
        barcode,
        isActive: true,
        categoryId: product.category,
        brandId: existingBrand.id,
      },
      create: {
        id: product.id,
        slug: product.id,
        name: product.name,
        sku: `LOLA-${product.id.toUpperCase()}`,
        barcode,
        price: product.price,
        oldPrice: product.oldPrice,
        badge: product.badge,
        imageUrl: product.image,
        isActive: true,
        categoryId: product.category,
        brandId: existingBrand.id,
      },
    });

    const inventory = await prisma.inventoryItem.upsert({
      where: { productId_storeId: { productId: product.id, storeId: store.id } },
      update: { quantity: product.stock },
      create: { productId: product.id, storeId: store.id, quantity: product.stock },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: { productId: product.id, url: product.image, alt: `${product.brand} ${product.name}` },
    });

    await prisma.stockMovement.deleteMany({ where: { reference: `SEED:${product.id}` } });
    await prisma.stockMovement.create({
      data: {
        inventoryId: inventory.id,
        productId: product.id,
        storeId: store.id,
        type: StockMovementType.INITIAL,
        quantity: product.stock,
        beforeQuantity: 0,
        afterQuantity: product.stock,
        reason: 'Stock initial de demonstration',
        reference: `SEED:${product.id}`,
      },
    });
  }

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const employeePassword = await bcrypt.hash('Employee123!', 12);
  const customerPassword = await bcrypt.hash('Client123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lola.tn' },
    update: { role: UserRole.ADMIN, firstName: 'Admin', lastName: 'LOLA', passwordHash: adminPassword },
    create: { email: 'admin@lola.tn', passwordHash: adminPassword, role: UserRole.ADMIN, firstName: 'Admin', lastName: 'LOLA' },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@lola.tn' },
    update: { role: UserRole.EMPLOYEE, firstName: 'Employe', lastName: 'LOLA', passwordHash: employeePassword },
    create: { email: 'employee@lola.tn', passwordHash: employeePassword, role: UserRole.EMPLOYEE, firstName: 'Employe', lastName: 'LOLA' },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'client@lola.tn' },
    update: { role: UserRole.CUSTOMER, firstName: 'Client', lastName: 'LOLA', passwordHash: customerPassword },
    create: { email: 'client@lola.tn', passwordHash: customerPassword, role: UserRole.CUSTOMER, firstName: 'Client', lastName: 'LOLA' },
  });

  await prisma.employeeProfile.upsert({
    where: { userId: admin.id },
    update: { jobTitle: 'Administrateur' },
    create: { userId: admin.id, employeeNo: 'LOLA-ADMIN-001', jobTitle: 'Administrateur' },
  });

  await prisma.employeeProfile.upsert({
    where: { userId: employee.id },
    update: { jobTitle: 'Conseiller de vente' },
    create: { userId: employee.id, employeeNo: 'LOLA-EMP-001', jobTitle: 'Conseiller de vente' },
  });

  await prisma.customerProfile.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id, defaultAddress: 'Sousse', city: 'Sousse' },
  });

  console.log('Seed LOLA termine.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
