import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function testWithUrl(url) {
  console.log(`\nTesting connection with URL: ${url.replace(/:[^:@]+@/, ':****@')}`);
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    await prisma.$connect();
    console.log('Connected!');
    const count = await prisma.user.count();
    console.log(`Prisma user.count() succeeded! Count = ${count}`);
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('Users found:', users);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.error('Failed:');
    console.error(err.message || err);
    await prisma.$disconnect();
    return false;
  }
}

async function run() {
  if (process.env.DATABASE_URL) {
    console.log('--- Testing DATABASE_URL from environment ---');
    await testWithUrl(process.env.DATABASE_URL);
  } else {
    console.error('DATABASE_URL is not set in environment.');
  }
}

run();
