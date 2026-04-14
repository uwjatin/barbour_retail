import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    // Test simpler raw query
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM orders`
    
    return {
      success: true,
      result: serializeToJSON(result)
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      code: error.code
    }
  }
})
