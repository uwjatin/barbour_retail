import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const { status } = getQuery(event) as any
    
    const repairs = await prisma.repair.findMany({
      where: {
        status: status || undefined
      },
      include: {
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return {
      success: true,
      data: serializeToJSON(repairs)
    }
  } catch (error: any) {
    console.error('Error fetching repairs:', error.message)
    return {
      success: false,
      error: 'Failed to fetch repairs',
      details: error.message
    }
  }
})
