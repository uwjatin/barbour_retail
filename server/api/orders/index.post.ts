import prisma from '~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Trouver ou créer un client
    let customer = null
    
    if (body.clientEmail || body.clientPhone) {
      const orConditions = []
      if (body.clientEmail) {
        orConditions.push({ email: body.clientEmail })
      }
      if (body.clientPhone) {
        orConditions.push({ phone: body.clientPhone })
      }
      
      if (orConditions.length > 0) {
        customer = await prisma.customer.findFirst({
          where: {
            OR: orConditions
          }
        })
      }
    }
    
    // Si pas trouvé, créer un nouveau client
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          title: body.clientTitle,
          firstName: body.clientFirstName || body.clientName?.split(' ')[0] || 'Inconnu',
          lastName: body.clientLastName || body.clientName?.split(' ').slice(1).join(' ') || '',
          email: body.clientEmail || null,
          phone: body.clientPhone || null,
          shippingStreet: body.shippingStreet,
          shippingPostalCode: body.shippingPostalCode,
          shippingCity: body.shippingCity,
          billingDifferent: body.billingDifferent || false,
          billingName: body.billingName,
          billingCompany: body.billingCompany,
          billingStreet: body.billingStreet,
          billingPostalCode: body.billingPostalCode,
          billingCity: body.billingCity,
        }
      })
    } else {
      // Mettre à jour le client existant avec les nouvelles informations
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          title: body.clientTitle,
          firstName: body.clientFirstName || body.clientName?.split(' ')[0] || 'Inconnu',
          lastName: body.clientLastName || body.clientName?.split(' ').slice(1).join(' ') || '',
          email: body.clientEmail || null,
          phone: body.clientPhone || null,
          shippingStreet: body.shippingStreet,
          shippingPostalCode: body.shippingPostalCode,
          shippingCity: body.shippingCity,
          billingDifferent: body.billingDifferent || false,
          billingName: body.billingName,
          billingCompany: body.billingCompany,
          billingStreet: body.billingStreet,
          billingPostalCode: body.billingPostalCode,
          billingCity: body.billingCity,
        }
      })
    }
    
    // Calculate total amount from items if not provided
    const totalAmount = body.totalAmount || body.items?.reduce((sum: number, item: any) => {
      const unitPrice = item.unitPrice || item.price || 0;
      const quantity = item.quantity || 1;
      const itemTotal = item.total ?? (parseFloat(unitPrice) * quantity);
      return sum + itemTotal;
    }, 0) || 0;

    const order = await prisma.order.create({
      data: {
        orderNumber: body.orderNumber || `ORD-${Date.now()}`,
        type: body.type || 'ecommerce',
        status: body.status || 'pending',
        paymentStatus: body.paymentStatus || 'pending',
        paymentMethod: body.paymentMethod,
        clientId: customer.id,
        clientName: body.clientName,
        clientTitle: body.clientTitle,
        clientFirstName: body.clientFirstName,
        clientLastName: body.clientLastName,
        clientPhone: body.clientPhone,
        clientEmail: body.clientEmail,
        shippingStreet: body.shippingStreet,
        shippingPostalCode: body.shippingPostalCode,
        shippingCity: body.shippingCity,
        billingDifferent: body.billingDifferent || false,
        billingName: body.billingName,
        billingCompany: body.billingCompany,
        billingStreet: body.billingStreet,
        billingPostalCode: body.billingPostalCode,
        billingCity: body.billingCity,
        notes: body.notes,
        totalAmount: totalAmount,
        items: {
          create: await Promise.all(body.items?.map(async (item: any) => {
            let productId = item.productId;
            if (item.sku && !productId) {
              const product = await prisma.product.findFirst({
                where: { sku: item.sku }
              });
              productId = product?.id || null;
            }
            
            const unitPrice = item.unitPrice || item.price || 0;
            const quantity = item.quantity || 1;
            const total = item.total ?? (parseFloat(unitPrice) * quantity);
            
            return {
              productName: item.productName || item.name,
              sku: item.sku,
              size: item.size || 'M',
              color: item.color || 'Black',
              quantity: quantity,
              unitPrice: unitPrice,
              total: total,
              productId: productId
            };
          }) || [])
        }
      },
      include: {
        items: true,
        customer: true
      }
    })
    
    return {
      success: true,
      data: order
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: 'Failed to create order'
    }
  }
})
