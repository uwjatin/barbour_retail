import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = [
  { id: 'cat-vestments', name: 'Vêtements', description: 'Vêtements homme et femme' },
  { id: 'cat-accessoires', name: 'Accessoires', description: 'Accessoires et compléments' }
];

const productTypeMap = {
  'Veste': 'homme',
  'Doublure': 'homme',
  'Pantalon': 'homme',
  'Chemise': 'homme',
  'Pull': 'homme',
  'Ceinture': 'accessoires',
  'Chaussettes': 'accessoires',
  'Casquette': 'accessoires',
  'Écharpe': 'accessoires',
  'Gants': 'accessoires',
  'Sac': 'accessoires',
  'Parapluie': 'accessoires'
};

const sizeMap = {
  'XXS': 'XXS', 'XS': 'XS', 'S': 'S', 'M': 'M', 'L': 'L', 'XL': 'XL', 'XXL': 'XXL', 'XXXL': 'XXXL',
  '30': 'S', '32': 'M', '90cm': 'M', '95cm': 'L', 'x3': 'S'
};

const colorMap = {
  'Noir': 'Black', 'Marine': 'Navy', 'Gris': 'Beige', 'Beige': 'Beige',
  'Bleu': 'Navy', 'Blanc': 'Beige', 'Marron': 'Marron', 'Olive': 'Olive',
  'Sage': 'Sage', 'Camel': 'Camel', 'Vert': 'Olive', 'Tartan': 'Tartan'
};

function extractSizeAndColor(name) {
  const sizeKeywords = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '30', '32', '90cm', '95cm', 'x3'];
  const colorKeywords = ['Noir', 'Marine', 'Navy', 'Gris', 'Beige', 'Bleu', 'Blanc', 'Marron', 'Brown', 'Olive', 'Sage', 'Camel', 'Vert', 'Green', 'Tartan'];
  
  let size = 'M';
  let color = 'Black';
  
  for (const s of sizeKeywords) {
    if (name.includes(s)) {
      size = sizeMap[s] || 'M';
      break;
    }
  }
  
  for (const c of colorKeywords) {
    if (name.includes(c)) {
      color = colorMap[c] || 'Black';
      break;
    }
  }
  
  return { size, color };
}

function getProductType(name) {
  for (const [prefix, type] of Object.entries(productTypeMap)) {
    if (name.includes(prefix)) return type;
  }
  return 'homme';
}

function getCategoryId(name) {
  const accessoiresKeywords = ['Ceinture', 'Chaussettes', 'Casquette', 'Écharpe', 'Gants', 'Sac', 'Parapluie'];
  for (const keyword of accessoiresKeywords) {
    if (name.includes(keyword)) return 'cat-accessoires';
  }
  return 'cat-vestments';
}

async function seed() {
  console.log('🌱 Starting seed...');
  
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category
    });
    console.log(`✅ Created category: ${category.name}`);
  }
  
  const productsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../public/products.json'), 'utf-8')
  );
  
  for (const productData of productsData) {
    const productType = getProductType(productData.name);
    const categoryId = getCategoryId(productData.name);
    const { size, color } = extractSizeAndColor(productData.name);
    
    const existingProduct = await prisma.product.findUnique({
      where: { sku: productData.sku }
    });
    
    if (existingProduct) {
      await prisma.product.update({
        where: { sku: productData.sku },
        data: {
          name: productData.name,
          basePrice: productData.price,
          variations: {
            upsert: {
              where: { productId_size_color: { productId: existingProduct.id, size, color } },
              update: {
                price: productData.price,
                stock: 10
              },
              create: {
                size,
                color,
                stock: 10,
                price: productData.price
              }
            }
          }
        }
      });
      console.log(`✅ Updated product: ${productData.name} (SKU: ${productData.sku})`);
    } else {
      const product = await prisma.product.create({
        data: {
          sku: productData.sku,
          name: productData.name,
          description: `${productData.name} - Produit de qualité`,
          type: productType,
          categoryId,
          basePrice: productData.price,
          active: true,
          variations: {
            create: {
              size,
              color,
              stock: 10,
              price: productData.price
            }
          }
        }
      });
      console.log(`✅ Created product: ${productData.name} (SKU: ${productData.sku})`);
    }
  }
  
  console.log('\n✨ Seed completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
