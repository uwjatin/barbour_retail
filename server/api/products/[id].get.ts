import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const { id } = getRouterParams(event)
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variations: true,
        category: true
      }
    })
    
    if (!product) {
      return {
        success: false,
        error: 'Product not found'
      }
    }
    
    return {
      success: true,
      data: serializeToJSON(product)
    }
  } catch (error: any) {
    console.error('Error fetching product:', error.message)
    return {
      success: false,
      error: 'Failed to fetch product',
      details: error.message
    }
  }
})
