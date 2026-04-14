import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create or update test customer
  const customer = await prisma.customer.upsert({
    where: { email: 'jean.dupont.test@example.com' },
    update: { phone: '+33612345678', firstName: 'Jean', lastName: 'Dupont' },
    create: { 
      email: 'jean.dupont.test@example.com', 
      phone: '+33612345678', 
      firstName: 'Jean', 
      lastName: 'Dupont' 
    }
  });
  
  console.log('Customer:', customer);
  
  // Check if order already exists
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber: 'VAD-2026-001' }
  });
  
  if (existingOrder) {
    console.log('Order already exists:', existingOrder);
  } else {
    // Create test order
    const order = await prisma.order.create({
      data: {
        orderNumber: 'VAD-2026-001',
        type: 'phone',
        status: 'pending',
        paymentStatus: 'pending',
        clientId: customer.id,
      clientName: 'Jean Dupont',
      clientPhone: '+33612345678',
      clientEmail: 'jean.dupont.test@example.com',
      clientFirstName: 'Jean',
      clientLastName: 'Dupont',
      totalAmount: 150.00,
      notes: 'Test order for phone editing'
      }
    });
    
    console.log('Order created:', order);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
