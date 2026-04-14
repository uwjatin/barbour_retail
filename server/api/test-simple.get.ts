import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    // Test simpler query first
    const count = await prisma.order.count({
      where: { status: { not: 'cancelled' } }
    })
    
    return {
      success: true,
      count: serializeToJSON(count),
      message: 'Basic query works'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      code: error.code
    }
  }
})
