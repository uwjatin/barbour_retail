import prisma from '~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id } = getRouterParams(event)
    
    const { variations, ...updateData } = body
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        variations: variations ? {
          deleteMany: {},
          create: variations.map((v: any) => ({
            size: v.size,
            color: v.color,
            stock: v.stock || 0,
            price: v.price || updateData.basePrice
          }))
        } : undefined
      },
      include: {
        variations: true,
        category: true
      }
    })
    
    return {
      success: true,
      data: product
    }
  } catch (error) {
    console.error('Error updating product:', error)
    return {
      success: false,
      error: 'Failed to update product'
    }
  }
})
