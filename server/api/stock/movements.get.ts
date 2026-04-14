import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const { productId, variationId, type, limit } = getQuery(event) as any
    
    const movements = await prisma.stockMovement.findMany({
      where: {
        productId: productId || undefined,
        variationId: variationId || undefined,
        type: type || undefined
      },
      include: {
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : 100
    })
    
    return {
      success: true,
      data: serializeToJSON(movements)
    }
  } catch (error: any) {
    console.error('Error fetching stock movements:', error.message)
    return {
      success: false,
      error: 'Failed to fetch stock movements',
      details: error.message
    }
  }
})
