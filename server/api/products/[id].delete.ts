import prisma from '~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const { id } = getRouterParams(event)
    
    await prisma.$transaction([
      prisma.stockMovement.deleteMany({
        where: { productId: id }
      }),
      prisma.orderItem.deleteMany({
        where: { productId: id }
      }),
      prisma.productVariation.deleteMany({
        where: { productId: id }
      }),
      prisma.product.delete({
        where: { id }
      })
    ])
    
    return {
      success: true,
      message: 'Product deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting product:', error.message)
    return {
      success: false,
      error: error.message || 'Failed to delete product'
    }
  }
})
