import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVADFlow() {
  console.log('🧪 Testing VAD Flow - Create, Update, and Retrieve Orders with Items\n');

  // Step 1: Find Jean Dupont customer
  const customer = await prisma.customer.findFirst({
    where: {
      email: 'jean.dupont.test@example.com'
    }
  });

  if (!customer) {
    console.error('❌ Jean Dupont customer not found');
    process.exit(1);
  }

  console.log('✅ Found Jean Dupont:', customer.firstName, customer.lastName);

  // Step 2: Create a new order with items
  const createOrder = await prisma.order.create({
    data: {
      orderNumber: 'VAD-TEST-' + Date.now(),
      type: 'phone',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      clientId: customer.id,
      clientTitle: 'Mr',
      clientFirstName: 'Jean',
      clientLastName: 'Dupont',
      clientName: 'Jean Dupont',
      clientPhone: '+33612345678',
      clientEmail: 'jean.dupont.test@example.com',
      shippingStreet: '123 Rue de Test',
      shippingPostalCode: '75001',
      shippingCity: 'Paris',
      billingDifferent: false,
      notes: 'Test order for VAD flow verification',
      totalAmount: '338',
      items: {
        create: [
          {
            productName: 'Veste Barbour Beaufort',
            sku: 'BARB-WAX-003',
            quantity: 1,
            unitPrice: '289',
            total: '289',
            size: 'M',
            color: 'Black'
          },
          {
            productName: 'Chaussures Derby',
            sku: 'JOCK-DRY-001',
            quantity: 2,
            unitPrice: '24.5',
            total: '49',
            size: 'L',
            color: 'Marron'
          }
        ]
      }
    },
    include: {
      items: true
    }
  });

  console.log('\n✅ Created order:', createOrder.orderNumber);
  console.log('   Items count:', createOrder.items.length);
  console.log('   Items:', JSON.stringify(createOrder.items, null, 2));

  const orderId = createOrder.id;

  // Step 3: Update the order with modified items
  const existingItems = await prisma.orderItem.findMany({
    where: { orderId }
  });

  await prisma.$transaction([
    // Delete existing items
    ...existingItems.map(item => prisma.orderItem.delete({ where: { id: item.id } })),
    // Create new items
    prisma.orderItem.createMany({
      data: [
        {
          orderId,
          productName: 'Veste Barbour Bedale',
          sku: 'BARB-WAX-002',
          quantity: 1,
          unitPrice: '279',
          total: '279',
          size: 'L',
          color: 'Marron'
        },
        {
          orderId,
          productName: 'Pull en Laine',
          sku: 'JOCK-KNIT-003',
          quantity: 1,
          unitPrice: '89',
          total: '89',
          size: 'M',
          color: 'Navy'
        },
        {
          orderId,
          productName: 'Chaussures Derby',
          sku: 'JOCK-DRY-001',
          quantity: 1,
          unitPrice: '24.5',
          total: '24.5',
          size: 'L',
          color: 'Marron'
        }
      ]
    })
  ]);

  console.log('\n✅ Updated order with new items');

  // Step 4: Retrieve the order and verify items
  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true
    }
  });

  console.log('\n📋 Retrieved order:', updatedOrder?.orderNumber);
  console.log('   Items count:', updatedOrder?.items.length);
  console.log('   Items:', JSON.stringify(updatedOrder?.items, null, 2));

  // Step 5: Verify
  const success = updatedOrder?.items.length === 3 &&
    updatedOrder?.items.some(i => i.productName === 'Veste Barbour Bedale') &&
    updatedOrder?.items.some(i => i.productName === 'Pull en Laine') &&
    updatedOrder?.items.some(i => i.productName === 'Chaussures Derby');

  if (success) {
    console.log('\n✅ SUCCESS: All items were correctly saved and retrieved!');
  } else {
    console.log('\n❌ FAILURE: Items were not correctly saved or retrieved');
  }

  // Cleanup: Delete the test order
  await prisma.order.delete({ where: { id: orderId } });
  console.log('\n🗑️  Cleaned up test order');

  await prisma.$disconnect();
  process.exit(success ? 0 : 1);
}

testVADFlow().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
