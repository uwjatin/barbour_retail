import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
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

    return {
      success: true,
      salesByDay: serializeToJSON(salesByDay)
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})
