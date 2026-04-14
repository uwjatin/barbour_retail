const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  try {
    const orderCount = await prisma.order.count()
    console.log('Total orders:', orderCount)
    
    const orderItemsCount = await prisma.orderItem.count()
    console.log('Total order items:', orderItemsCount)
    
    const sampleOrder = await prisma.order.findFirst()
    console.log('Sample order:', JSON.stringify(sampleOrder, null, 2))
    
    const salesByDay = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(DISTINCT id) as order_count,
        COALESCE(SUM("total"), 0) as daily_revenue
      FROM orders
      WHERE status != 'cancelled'
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 5`
    
    console.log('Sales by day:', JSON.stringify(salesByDay, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

check()
