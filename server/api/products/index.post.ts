import prisma from '~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const product = await prisma.product.create({
      data: {
        sku: body.sku,
        name: body.name,
        description: body.description,
        type: body.type,
        categoryId: body.categoryId,
        basePrice: body.basePrice,
        active: body.active !== false,
        variations: {
          create: body.variations?.map((v: any) => ({
            size: v.size,
            color: v.color,
            stock: v.stock || 0,
            price: v.price || body.basePrice
          })) || []
        }
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
    console.error('Error creating product:', error)
    return {
      success: false,
      error: 'Failed to create product'
    }
  }
})
