const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testSalesAPI() {
  try {
    const where = {
      status: { not: 'cancelled' }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100,
      skip: 0
    })

    console.log('Orders found:', orders.length)

    const aggregatedSales = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.type,
        COUNT(oi.id) as times_sold,
        COALESCE(SUM(oi.quantity), 0) as total_quantity,
        COALESCE(SUM(oi.total), 0) as total_revenue
      FROM order_items oi
      JOIN products p ON oi."productId" = p.id
      JOIN orders o ON oi."orderId" = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id, p.name, p.type
      ORDER BY total_quantity DESC
      LIMIT 50`

    console.log('Aggregated sales:', JSON.stringify(aggregatedSales, (k,v) => typeof v === 'bigint' ? Number(v) : v, 2))

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
      LIMIT 90`

    console.log('Sales by day:', JSON.stringify(salesByDay, (k,v) => typeof v === 'bigint' ? Number(v) : v, 2))

    const salesBySize = await prisma.$queryRaw`
      SELECT 
        oi.size,
        COALESCE(SUM(oi.quantity), 0) as total_quantity,
        COALESCE(SUM(oi.total), 0) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi."orderId" = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.size
      ORDER BY total_quantity DESC`

    console.log('Sales by size:', JSON.stringify(salesBySize, (k,v) => typeof v === 'bigint' ? Number(v) : v, 2))

    const salesByColor = await prisma.$queryRaw`
      SELECT 
        oi.color,
        COALESCE(SUM(oi.quantity), 0) as total_quantity,
        COALESCE(SUM(oi.total), 0) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi."orderId" = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.color
      ORDER BY total_quantity DESC`

    console.log('Sales by color:', JSON.stringify(salesByColor, (k,v) => typeof v === 'bigint' ? Number(v) : v, 2))

  } catch (error) {
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testSalesAPI()
