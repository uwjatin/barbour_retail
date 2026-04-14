import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Products data embedded directly - matching Prisma schema
const PRODUCTS = [
  { "sku": "BAR001", "name": "Barbour Bedale Jacket", "description": "Classic waxed cotton jacket", "basePrice": 349, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR002", "name": "Barbour Beadnell Jacket", "description": "Traditional waxed cotton jacket", "basePrice": 369, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR003", "name": "Barbour Ashby Jacket", "description": "Slim fit waxed jacket", "basePrice": 329, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR004", "name": "Barbour Women's Bedale", "description": "Women's fit waxed jacket", "basePrice": 329, "type": "femme", "categoryId": null, "active": true },
  { "sku": "BAR005", "name": "Barbour International M12", "description": "Motorcycle waxed jacket", "basePrice": 399, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR006", "name": "Barbour Tartan Lining", "description": "Classic tartan jacket lining", "basePrice": 49, "type": "accessoires", "categoryId": null, "active": true },
  { "sku": "BAR007", "name": "Barbour Wax Polish", "description": "Cotton wax polish 100ml", "basePrice": 15, "type": "accessoires", "categoryId": null, "active": true },
  { "sku": "BAR008", "name": "Barbour Scarf Wool", "description": "100% wool scarf", "basePrice": 65, "type": "accessoires", "categoryId": null, "active": true },
  { "sku": "BAR009", "name": "Barbour Gloves Leather", "description": "Leather driving gloves", "basePrice": 85, "type": "accessoires", "categoryId": null, "active": true },
  { "sku": "BAR010", "name": "Barbour Cap Classic", "description": "Traditional cotton cap", "basePrice": 45, "type": "accessoires", "categoryId": null, "active": true },
  { "sku": "BAR011", "name": "Barbour Waterproof Pants", "description": "Waterproof over trousers", "basePrice": 129, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR012", "name": "Barbour Fleece Vest", "description": "Warm fleece gilet", "basePrice": 119, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR013", "name": "Barbour Quilted Jacket", "description": "Light quilted jacket", "basePrice": 249, "type": "femme", "categoryId": null, "active": true },
  { "sku": "BAR014", "name": "Barbour Rain Jacket", "description": "Lightweight rain jacket", "basePrice": 179, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR015", "name": "Barbour Waterproof Boots", "description": "Rubber wellington boots", "basePrice": 99, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR016", "name": "Barbour Rain Hat", "description": "Wide brim waterproof hat", "basePrice": 39, "type": "accessoires", "categoryId": null, "active": true },
  { "sku": "BAR017", "name": "Barbour Suede Jacket", "description": "Premium suede jacket", "basePrice": 549, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR018", "name": "Barbour Parka Jacket", "description": "Heavy duty parka", "basePrice": 499, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR019", "name": "Barbour Raincoat Long", "description": "Full length raincoat", "basePrice": 429, "type": "femme", "categoryId": null, "active": true },
  { "sku": "BAR020", "name": "Barbour Vest Puffer", "description": "Down filled vest", "basePrice": 199, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR021", "name": "Barbour Thermal Base Layer", "description": "Thermal underwear top", "basePrice": 55, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR022", "name": "Barbour Wool Sweater", "description": "Merino wool sweater", "basePrice": 149, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR023", "name": "Barbour Oxford Shirt", "description": "Classic oxford shirt", "basePrice": 89, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR024", "name": "Barbour Chino Pants", "description": "Classic fit chinos", "basePrice": 79, "type": "homme", "categoryId": null, "active": true },
  { "sku": "BAR025", "name": "Barbour Belt Leather", "description": "Genuine leather belt", "basePrice": 59, "type": "accessoires", "categoryId": null, "active": true },
  { "sku": "BAR026", "name": "Barbour Socks Pack", "description": "3-pack wool socks", "basePrice": 25, "type": "accessoires", "categoryId": null, "active": true },
  { "sku": "BAR027", "name": "Barbour Backpack", "description": "Waterproof backpack", "basePrice": 149, "type": "accessoires", "categoryId": null, "active": true },
  { "sku": "BAR028", "name": "Barbour Duffle Bag", "description": "Large travel duffle", "basePrice": 249, "type": "accessoires", "categoryId": null, "active": true }
]

export default defineEventHandler(async (event) => {
  try {
    // Seed products using upsert
    const seededProducts = []
    for (const product of PRODUCTS) {
      const seeded = await prisma.product.upsert({
        where: { sku: product.sku },
        update: product,
        create: product
      })
      seededProducts.push(seeded)
    }
    
    return {
      success: true,
      message: `Successfully seeded ${seededProducts.length} products`,
      count: seededProducts.length
    }
  } catch (error) {
    console.error('Seed error:', error)
    return {
      success: false,
      error: error.message
    }
  } finally {
    await prisma.$disconnect()
  }
})
