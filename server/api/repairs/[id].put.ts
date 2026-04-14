import prisma from '~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id } = getRouterParams(event)
    
    const updateData: any = {}
    
    if (body.status) updateData.status = body.status
    if (body.amount !== undefined) updateData.amount = body.amount
    if (body.estimatedDays !== undefined) updateData.estimatedDays = body.estimatedDays
    if (body.isPaid !== undefined) updateData.isPaid = body.isPaid
    if (body.description !== undefined) updateData.description = body.description
    
    let updateCustomer = false
    const customerUpdateData: any = {}
    
    if (body.clientTitle !== undefined) {
      customerUpdateData.title = body.clientTitle
      updateCustomer = true
    }
    
    if (body.clientFirstName !== undefined) {
      customerUpdateData.firstName = body.clientFirstName
      updateCustomer = true
    }
    
    if (body.clientLastName !== undefined) {
      customerUpdateData.lastName = body.clientLastName
      updateCustomer = true
    }
    
    if (body.clientPhone !== undefined) {
      customerUpdateData.phone = body.clientPhone
      updateCustomer = true
    }
    
    if (body.clientEmail !== undefined) {
      customerUpdateData.email = body.clientEmail
      updateCustomer = true
    }
    
    let customer = null
    
    if (updateCustomer) {
      customer = await prisma.customer.findUnique({
        where: { id: body.clientId }
      })
      
      if (customer) {
        customer = await prisma.customer.update({
          where: { id: body.clientId },
          data: customerUpdateData
        })
      } else if (body.clientId) {
        customer = await prisma.customer.create({
          data: {
            id: body.clientId,
            ...customerUpdateData
          }
        })
      }
    }
    
    const repair = await prisma.repair.update({
      where: { id },
      data: {
        ...updateData,
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        clientEmail: body.clientEmail,
        ...(customer && { customer: { connect: { id: body.clientId } } })
      },
      include: {
        customer: true
      }
    })
    
    return {
      success: true,
      data: repair
    }
  } catch (error) {
    console.error('Error updating repair:', error)
    return {
      success: false,
      error: 'Failed to update repair'
    }
  }
})
