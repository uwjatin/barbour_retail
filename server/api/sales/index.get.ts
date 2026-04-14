import prisma from '~/server/db'
import { Prisma } from '@prisma/client'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const startDate = query.startDate ? new Date(query.startDate as string) : null
    const endDate = query.endDate ? new Date(query.endDate as string) : null
    const type = query.type as string | undefined
    const productId = query.productId as string | undefined
    const limit = query.limit ? parseInt(query.limit as string) : 100
    const offset = query.offset ? parseInt(query.offset as string) : 0

    const where: any = {
      status: { not: 'cancelled' }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    if (type) {
      where.type = type
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const total = await prisma.order.count({
      where
    })

    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

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

    const responseData = {
      orders,
      total,
      aggregatedSales,
      salesByDay,
      salesBySize,
      salesByColor
    }

    return {
      success: true,
      data: serializeToJSON(responseData)
    }
  } catch (error: any) {
    console.error('Error fetching sales data:', error.message)
    console.error('Stack:', error.stack)
    return {
      success: false,
      error: 'Failed to fetch sales data',
      details: error.message
    }
  }
})
