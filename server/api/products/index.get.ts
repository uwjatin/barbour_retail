import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variations: true,
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return {
      success: true,
      data: serializeToJSON(products)
    }
  } catch (error: any) {
    console.error('Error fetching products:', error.message)
    return {
      success: false,
      error: 'Failed to fetch products',
      details: error.message
    }
  }
})
