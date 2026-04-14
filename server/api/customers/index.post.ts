import prisma from '~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const customer = await prisma.customer.create({
      data: {
        title: body.title,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        shippingStreet: body.shippingStreet,
        shippingPostalCode: body.shippingPostalCode,
        shippingCity: body.shippingCity,
        billingDifferent: body.billingDifferent || false,
        billingName: body.billingName,
        billingCompany: body.billingCompany,
        billingStreet: body.billingStreet,
        billingPostalCode: body.billingPostalCode,
        billingCity: body.billingCity
      }
    })
    
    return {
      success: true,
      data: customer
    }
  } catch (error) {
    console.error('Error creating customer:', error)
    return {
      success: false,
      error: 'Failed to create customer'
    }
  }
})
