import prisma from '../server/db'

async function testOrderItems() {
  try {
    console.log('=== Testing Order Items Persistence ===\n');
    
    // Find a test order with Jean Dupont
    const testOrder = await prisma.order.findFirst({
      where: {
        clientEmail: 'jean.dupont.test@example.com'
      },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!testOrder) {
      console.log('No test order found for Jean Dupont');
      return;
    }
    
    console.log(`Found order: ${testOrder.id}`);
    console.log(`Client: ${testOrder.clientName}`);
    console.log(`Email: ${testOrder.clientEmail}`);
    console.log(`Items count: ${testOrder.items.length}`);
    
    if (testOrder.items.length > 0) {
      console.log('\nOrder Items:');
      testOrder.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.productName} (${item.sku}) - Qty: ${item.quantity}, Price: ${item.unitPrice}, Total: ${item.total}`);
      });
    } else {
      console.log('\n⚠️  WARNING: This order has NO items!');
      console.log('This confirms the bug - items are not being persisted.');
    }
    
    // Now let's test updating this order with items
    console.log('\n=== Testing Update with Items ===');
    const testItems = [
      {
        productName: 'Barbour Bedale',
        sku: 'WOBW07159BE92',
        quantity: 1,
        unitPrice: 349.00,
        total: 349.00,
        size: 'M',
        color: 'Navy'
      },
      {
        productName: 'Jockey Club Sweater',
        sku: 'JCK-M-SWL-001',
        quantity: 2,
        unitPrice: 89.00,
        total: 178.00,
        size: 'L',
        color: 'Black'
      }
    ];
    
    console.log('Updating order with items:', JSON.stringify(testItems, null, 2));
    
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.orderItem.deleteMany({
        where: { orderId: testOrder.id }
      });
      
      // Create new items
      await tx.orderItem.createMany({
        data: testItems.map(item => ({
          orderId: testOrder.id,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          size: item.size,
          color: item.color
        }))
      });
      
      // Fetch updated order with items
      return tx.order.findUnique({
        where: { id: testOrder.id },
        include: { items: true }
      });
    });
    
    console.log(`\n✅ Update successful! Items count: ${updatedOrder?.items.length}`);
    if (updatedOrder?.items.length > 0) {
      console.log('\nUpdated Items:');
      updatedOrder.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.productName} (${item.sku}) - Qty: ${item.quantity}, Total: ${item.total}`);
      });
    }
    
    await prisma.$disconnect();
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testOrderItems();
