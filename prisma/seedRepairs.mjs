import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const repairDescriptions = [
  'Remplacement de fermeture éclair sur veste',
  'Raccourcissement de manches de pantalon',
  'Réparation de couture sur épaule',
  'Remplacement de boutons sur chemise',
  'Retouche de taille sur veste',
  'Réparation de doublure déchirée',
  'Remplacement de fermeture éclair sur pantalon',
  'Raccourcissement de jambes de pantalon',
  'Réparation de poche déchirée',
  'Remplacement de velcro sur veste',
  'Retouche de col sur chemise',
  'Réparation de coutures sur pull',
  'Remplacement de boutonnière',
  'Raccourcissement de manches de veste',
  'Réparation de renfort sur coude',
  'Remplacement de fermeture éclair sur veste',
  'Retouche de bas de pantalon',
  'Réparation de doublure sur veste',
  'Remplacement de zip sur sac',
  'Retouche de couture sur écharpe'
];

const statuses = ['devis_envoye', 'en_cours', 'pret_a_retirer', 'termine'];

const customerIds = [
  'cmnwvdpiw0003qddkb3ihls4k',  // Jean Dupont
  'cmnwvgqy80008qddku8hqksok'   // Marie Martin
];

async function seedRepairs() {
  console.log('🌱 Seeding repairs...');
  
  for (let i = 0; i < 20; i++) {
    const customerId = customerIds[i % customerIds.length];
    const status = statuses[i % statuses.length];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (20 - i));
    
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });
    
    if (!customer) {
      console.error(`❌ Customer not found: ${customerId}`);
      continue;
    }
    
    const repair = await prisma.repair.create({
      data: {
        repairNumber: `REP-${Date.now() + i}`,
        clientId: customerId,
        clientName: `${customer.firstName} ${customer.lastName}`,
        clientPhone: customer.phone,
        clientEmail: customer.email,
        description: repairDescriptions[i],
        status: status,
        amount: 29.99 + (i * 5),
        estimatedDays: 3 + (i % 5),
        isPaid: status === 'termine',
        createdAt: createdAt,
      }
    });
    
    console.log(`✅ Created repair: ${repair.repairNumber} - ${repair.clientName} (${status})`);
  }
  
  const count = await prisma.repair.count();
  console.log(`\n✨ Seeded ${count} repairs successfully!`);
}

seedRepairs()
  .catch((e) => {
    console.error('❌ Failed to seed repairs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
