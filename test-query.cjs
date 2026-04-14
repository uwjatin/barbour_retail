const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  try {
    // Test the exact query from sales API
    const salesByDay = await prisma.$queryRaw`
      SELECT 
        DATE(o."createdAt") as date,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(oi.quantity), 0) as items_sold,
        COALESCE(SUM(oi.total), 0) as daily_revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi."orderId"
      WHERE o.status != 'cancelled'
      GROUP BY DATE(o."createdAt")
      ORDER BY date DESC
      LIMIT 5`
    
    console.log('Sales by day:', JSON.stringify(salesByDay, (key, value) => typeof value === 'bigint' ? Number(value) : value, 2))
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

check()
