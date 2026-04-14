import prisma from '~/server/db'
import { serializeToJSON } from '~/server/utils/serialize'

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params!
    const method = event.method

    if (method === 'GET') {
      const notification = await prisma.notification.findUnique({
        where: { id },
        include: {
          order: true,
          repair: true,
          customer: true
        }
      })

      if (!notification) {
        return {
          success: false,
          error: 'Notification not found'
        }
      }

      return {
        success: true,
        data: serializeToJSON(notification)
      }
    }

    if (method === 'PATCH') {
      const body = await readBody(event)
      const { status, sentAt, error: errorField } = body

      const notification = await prisma.notification.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(sentAt && { sentAt: new Date(sentAt) }),
          ...(errorField && { error: errorField })
        },
        include: {
          order: true,
          repair: true,
          customer: true
        }
      })

      return {
        success: true,
        data: serializeToJSON(notification)
      }
    }

    if (method === 'DELETE') {
      await prisma.notification.delete({
        where: { id }
      })

      return {
        success: true,
        message: 'Notification deleted'
      }
    }

    return {
      success: false,
      error: 'Method not allowed'
    }
  } catch (error: any) {
    console.error('Error handling notification:', error.message)
    return {
      success: false,
      error: 'Failed to handle notification',
      details: error.message
    }
  }
})
