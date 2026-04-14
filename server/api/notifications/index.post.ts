import prisma from '~/server/db'
import { sendNotification } from '~/server/utils/notificationService'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const {
      type,
      recipient,
      subject,
      content,
      status = 'PENDING',
      orderId,
      repairId,
      reference,
      customerId
    } = body

    if (!type || !recipient || !content) {
      return {
        success: false,
        error: 'Missing required fields: type, recipient, content'
      }
    }

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        type,
        recipient,
        subject,
        content,
        status,
        orderId,
        repairId,
        reference,
        customerId
      },
      include: {
        order: true,
        repair: true,
        Customer: true
      }
    })

    // If status is PENDING, try to send it immediately
    if (status === 'PENDING') {
      const result = await sendNotification(
        type as 'SMS' | 'EMAIL',
        recipient,
        content,
        subject
      )

      if (result.success) {
        // Update notification as SENT
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            reference: result.messageId
          }
        })

        return {
          success: true,
          data: {
            ...notification,
            status: 'SENT',
            reference: result.messageId
          },
          message: `${type} sent successfully`
        }
      } else {
        // Update notification as FAILED
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'FAILED',
            error: result.error
          }
        })

        return {
          success: false,
          error: result.error || `Failed to send ${type}`
        }
      }
    }

    return {
      success: true,
      data: notification,
      message: `${type} saved as PENDING`
    }
  } catch (error) {
    console.error('Error creating notification:', error)
    return {
      success: false,
      error: 'Failed to create notification'
    }
  }
})
