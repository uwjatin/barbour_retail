import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const test = await prisma.order.findFirst()
    
    return {
      success: true,
      test: serializeToJSON(test)
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})
