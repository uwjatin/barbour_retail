import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return {
      success: true,
      data: serializeToJSON(customers)
    }
  } catch (error: any) {
    console.error('Error fetching customers:', error.message)
    return {
      success: false,
      error: 'Failed to fetch customers',
      details: error.message
    }
  }
})
