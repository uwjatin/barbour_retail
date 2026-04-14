import prisma from '~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Trouver ou créer un client
    let customer = null
    
    // Essayer de trouver par email OU téléphone
    if (body.clientEmail || body.clientPhone) {
      customer = await prisma.customer.findFirst({
        where: {
          OR: []
        }
      })
      
      // Construire dynamiquement les conditions OR
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
          firstName: body.clientName.split(' ')[0] || 'Inconnu',
          lastName: body.clientName.split(' ').slice(1).join(' ') || '',
          email: body.clientEmail || null,
          phone: body.clientPhone || null,
        }
      })
    }
    
    const repair = await prisma.repair.create({
      data: {
        repairNumber: body.repairNumber || `REP-${Date.now()}`,
        clientId: customer.id,
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        clientEmail: body.clientEmail,
        description: body.description,
        status: body.status || 'devis_envoye',
        amount: body.amount,
        estimatedDays: body.estimatedDays,
        isPaid: body.isPaid || false
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
    console.error('Error creating repair:', error)
    return {
      success: false,
      error: 'Failed to create repair'
    }
  }
})
