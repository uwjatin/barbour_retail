import prisma from '~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const movement = await prisma.stockMovement.create({
      data: {
        productId: body.productId,
        variationId: body.variationId,
        type: body.type,
        quantity: body.quantity,
        unitPrice: body.unitPrice,
        totalValue: body.totalValue,
        size: body.size,
        color: body.color,
        referenceId: body.referenceId,
        referenceType: body.referenceType,
        notes: body.notes
      }
    })
    
    if (body.variationId && body.type !== 'ADJUSTMENT') {
      await prisma.productVariation.update({
        where: { id: body.variationId },
        data: {
          stock: {
            [body.type === 'SALE' || body.type === 'RETURN' ? 'decrement' : 'increment']: Math.abs(body.quantity)
          }
        }
      })
    }
    
    return {
      success: true,
      data: movement
    }
  } catch (error) {
    console.error('Error recording stock movement:', error)
    return {
      success: false,
      error: 'Failed to record stock movement'
    }
  }
})
