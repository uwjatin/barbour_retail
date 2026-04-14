const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  try {
    // Check order_items columns
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order_items'
    `
    console.log('Order Items Columns:', JSON.stringify(columns, null, 2))
    
    // Check sample order item
    const sampleItem = await prisma.orderItem.findFirst()
    console.log('Sample Order Item:', JSON.stringify(sampleItem, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

check()
