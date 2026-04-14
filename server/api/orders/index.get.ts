import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const { type, status, paymentStatus, limit, offset } = getQuery(event) as any
    
    const orders = await prisma.order.findMany({
      where: {
        type: type || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined
      },
      include: {
        items: true,
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined
    })
    
    const total = await prisma.order.count({
      where: {
        type: type || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined
      }
    })
    
    return {
      success: true,
      data: serializeToJSON(orders),
      total: serializeToJSON(total)
    }
  } catch (error: any) {
    console.error('Error fetching orders:', error.message)
    return {
      success: false,
      error: 'Failed to fetch orders',
      details: error.message
    }
  }
})
