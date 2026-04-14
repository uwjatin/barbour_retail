import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding products...');

  // Create or get categories
  let barbourCategory = await prisma.category.findFirst({ where: { name: 'Barbour' } });
  if (!barbourCategory) {
    barbourCategory = await prisma.category.create({
      data: {
        name: 'Barbour',
        description: 'Vêtements Barbour',
      },
    });
  }
  console.log(`✅ Category: ${barbourCategory.name}`);

  let jockeyCategory = await prisma.category.findFirst({ where: { name: 'Jockey Club' } });
  if (!jockeyCategory) {
    jockeyCategory = await prisma.category.create({
      data: {
        name: 'Jockey Club',
        description: 'Accessoires Jockey Club',
      },
    });
  }
  console.log(`✅ Category: ${jockeyCategory.name}`);

  // Barbour products
  const barbourProducts = [
    { sku: 'BARB-WAX-001', name: 'Veste Barbour Wax', type: 'homme' as const, basePrice: 279 },
    { sku: 'BARB-WAX-002', name: 'Veste Barbour Bedale', type: 'homme' as const, basePrice: 269 },
    { sku: 'BARB-WAX-003', name: 'Veste Barbour Beaufort', type: 'homme' as const, basePrice: 289 },
    { sku: 'BARB-PANT-001', name: 'Pantalon Barbour', type: 'homme' as const, basePrice: 129 },
    { sku: 'BARB-SWE-001', name: 'Pull Barbour Maille', type: 'homme' as const, basePrice: 159 },
    { sku: 'BARB-LIN-001', name: 'Chemise Barbour', type: 'homme' as const, basePrice: 119 },
  ];

  // Jockey Club products
  const jockeyProducts = [
    { sku: 'PARA-001', name: 'Parapluie Golf Classic', type: 'accessoires' as const, basePrice: 45 },
    { sku: 'PARA-002', name: 'Parapluie Golf Marine', type: 'accessoires' as const, basePrice: 35 },
    { sku: 'PARA-003', name: 'Parapluie Compact', type: 'accessoires' as const, basePrice: 29 },
    { sku: 'SCARF-001', name: 'Écharpe Laine', type: 'accessoires' as const, basePrice: 59 },
    { sku: 'SCARF-002', name: 'Écharpe Cachemire', type: 'accessoires' as const, basePrice: 129 },
    { sku: 'GLOVE-001', name: 'Gants Cuir', type: 'accessoires' as const, basePrice: 49 },
    { sku: 'BELT-001', name: 'Ceinture Cuir', type: 'accessoires' as const, basePrice: 79 },
  ];

  for (const product of barbourProducts) {
    const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...product,
          categoryId: barbourCategory.id,
        },
      });
      console.log(`✅ Product: ${product.name} (${product.sku})`);
    } else {
      console.log(`⏭️  Already exists: ${product.name}`);
    }
  }

  for (const product of jockeyProducts) {
    const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...product,
          categoryId: jockeyCategory.id,
        },
      });
      console.log(`✅ Product: ${product.name} (${product.sku})`);
    } else {
      console.log(`⏭️  Already exists: ${product.name}`);
    }
  }

  const count = await prisma.product.count();
  console.log(`\n✅ Products seeded successfully! Total: ${count}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
