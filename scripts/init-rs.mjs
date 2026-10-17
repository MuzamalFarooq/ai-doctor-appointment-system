import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'mongodb://127.0.0.1:27018/admin?directConnection=true' }
  }
});

async function initiate() {
  console.log('Initiating replica set rs0...');
  try {
    const result = await prisma.$runCommandRaw({
      replSetInitiate: {
        _id: 'rs0',
        members: [{ _id: 0, host: '127.0.0.1:27018' }]
      }
    });
    console.log('Replica set initiate result:', result);
  } catch (err) {
    if (err.message && err.message.includes('already initialized')) {
      console.log('Replica set is already initialized.');
    } else {
      console.error('Error initiating replica set:', err);
    }
  } finally {
    await prisma.$disconnect();
  }
}

initiate();
