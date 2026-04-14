import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const method = event.method

    if (method === 'GET') {
      const { status, type, limit, offset } = getQuery(event) as any

      const where: any = {}
      if (status) where.status = status
      if (type) where.type = type

      const notifications = await prisma.notification.findMany({
        where,
        include: {
          order: true,
          repair: true,
          Customer: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit ? parseInt(limit) : undefined,
        skip: offset ? parseInt(offset) : undefined
      })

      const total = await prisma.notification.count({
        where
      })

      return {
        success: true,
        data: serializeToJSON(notifications),
        total: serializeToJSON(total)
      }
    }

    return {
      success: false,
      error: 'Method not allowed'
    }
  } catch (error: any) {
    console.error('Error fetching notifications:', error.message)
    return {
      success: false,
      error: 'Failed to fetch notifications',
      details: error.message
    }
  }
})
