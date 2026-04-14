import prisma from '~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id } = getRouterParams(event)
    
    // Get the current order to find the client
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { customer: true }
    })
    
    if (!currentOrder) {
      return {
        success: false,
        error: 'Order not found'
      }
    }
    
    // Update order fields
    const updateData: any = {
      status: body.status,
      paymentStatus: body.paymentStatus,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      lastNotificationSent: body.lastNotificationSent ? new Date() : undefined
    }
    
    if (body.totalAmount !== undefined && body.totalAmount !== null) {
      updateData.totalAmount = body.totalAmount
    }
    
    // Add client information fields to update
    if (body.clientPhone !== undefined) {
      updateData.clientPhone = body.clientPhone
    }
    if (body.clientEmail !== undefined) {
      updateData.clientEmail = body.clientEmail
    }
    if (body.clientFirstName !== undefined) {
      updateData.clientFirstName = body.clientFirstName
    }
    if (body.clientLastName !== undefined) {
      updateData.clientLastName = body.clientLastName
    }
    if (body.clientTitle !== undefined) {
      updateData.clientTitle = body.clientTitle
    }
    if (body.clientName !== undefined) {
      updateData.clientName = body.clientName
    }
    if (body.shippingStreet !== undefined) {
      updateData.shippingStreet = body.shippingStreet
    }
    if (body.shippingPostalCode !== undefined) {
      updateData.shippingPostalCode = body.shippingPostalCode
    }
    if (body.shippingCity !== undefined) {
      updateData.shippingCity = body.shippingCity
    }
    if (body.billingDifferent !== undefined) {
      updateData.billingDifferent = body.billingDifferent
    }
    if (body.billingName !== undefined) {
      updateData.billingName = body.billingName
    }
    if (body.billingCompany !== undefined) {
      updateData.billingCompany = body.billingCompany
    }
    if (body.billingStreet !== undefined) {
      updateData.billingStreet = body.billingStreet
    }
    if (body.billingPostalCode !== undefined) {
      updateData.billingPostalCode = body.billingPostalCode
    }
    if (body.billingCity !== undefined) {
      updateData.billingCity = body.billingCity
    }
    
    // Handle order items - delete old ones and create new ones
    if (body.items && Array.isArray(body.items)) {
      // Delete existing order items
      await prisma.orderItem.deleteMany({
        where: { orderId: id }
      });
      
      // Create new order items
      await prisma.orderItem.createMany({
        data: body.items.map((item: any) => ({
          orderId: id,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          size: item.size || 'M',
          color: item.color || 'Black',
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.price,
          total: item.total || (item.unitPrice || item.price) * item.quantity
        }))
      });
    }
    
    // Update the order
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        customer: true
      }
    })
    
    // Update the customer record with the new phone/email if provided
    const customerUpdateFields: any = {}
    if (body.clientPhone !== undefined) customerUpdateFields.phone = body.clientPhone
    if (body.clientEmail !== undefined) customerUpdateFields.email = body.clientEmail
    if (body.clientFirstName !== undefined) customerUpdateFields.firstName = body.clientFirstName
    if (body.clientLastName !== undefined) customerUpdateFields.lastName = body.clientLastName
    if (body.shippingStreet !== undefined) customerUpdateFields.shippingStreet = body.shippingStreet
    if (body.shippingPostalCode !== undefined) customerUpdateFields.shippingPostalCode = body.shippingPostalCode
    if (body.shippingCity !== undefined) customerUpdateFields.shippingCity = body.shippingCity
    
    if (Object.keys(customerUpdateFields).length > 0 && currentOrder.clientId) {
      console.log(`[Order Update] Updating customer ${currentOrder.clientId} with:`, customerUpdateFields)
      try {
        await prisma.customer.update({
          where: { id: currentOrder.clientId },
          data: customerUpdateFields
        })
        console.log(`[Order Update] Customer updated successfully`)
      } catch (customerError) {
        console.error('[Order Update] Error updating customer:', customerError)
      }
    }
    
    return {
      success: true,
      data: order
    }
  } catch (error) {
    console.error('Error updating order:', error)
    return {
      success: false,
      error: 'Failed to update order'
    }
  }
})
