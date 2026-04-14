import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const totalSales = await prisma.order.aggregate({
      where: {
        status: { not: 'cancelled' }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })
    
    const totalRepairs = await prisma.repair.aggregate({
      where: {
        isPaid: true
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })
    
    const pendingOrders = await prisma.order.count({
      where: {
        status: 'pending'
      }
    })
    
    const inProgressRepairs = await prisma.repair.count({
      where: {
        status: 'en_cours'
      }
    })
    
    const lowStockProducts = await prisma.productVariation.groupBy({
      by: ['productId'],
      where: {
        stock: {
          lt: 5
        }
      }
    })
    
    const dailySales = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as order_count,
        SUM("totalAmount") as total_amount
      FROM orders
      WHERE "createdAt" >= ${sevenDaysAgo}
      AND status != 'cancelled'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `
    
    const topProducts = await prisma.$queryRaw`
      SELECT 
        p.name,
        p.type,
        SUM(oi.quantity) as total_quantity
      FROM order_items oi
      JOIN products p ON oi."productId" = p.id
      JOIN orders o ON oi."orderId" = o.id
      WHERE o."createdAt" >= ${sevenDaysAgo}
      AND o.status != 'cancelled'
      GROUP BY p.id, p.name, p.type
      ORDER BY total_quantity DESC
      LIMIT 10
    `

    const responseData = {
      totalSales: {
        amount: totalSales._sum.totalAmount,
        count: totalSales._count.id
      },
      totalRepairs: {
        amount: totalRepairs._sum.amount,
        count: totalRepairs._count.id
      },
      pendingOrders,
      inProgressRepairs,
      lowStockCount: lowStockProducts.length,
      dailySales,
      topProducts
    }

    return {
      success: true,
      data: serializeToJSON(responseData)
    }
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error.message)
    return {
      success: false,
      error: 'Failed to fetch dashboard data',
      details: error.message
    }
  }
})
