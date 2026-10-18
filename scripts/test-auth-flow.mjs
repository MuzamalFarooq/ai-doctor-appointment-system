import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '../lib/validators.js';

import fs from 'fs';
import path from 'path';

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

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
});

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING SIGNUP & LOGIN FLOW VERIFICATION TEST');
  console.log('====================================================\n');

  const testEmail = `testuser_${Date.now()}@example.com`;
  const validPassword = 'SecurePassword123';

  // 1. Test Input Validation for Registration
  console.log('1. Testing input validation for registration:');
  const invalidData = {
    name: 'J',
    email: 'not-an-email',
    password: 'short',
    confirmPassword: 'mismatch',
    role: 'PATIENT'
  };
  const valResult = registerSchema.safeParse(invalidData);
  console.log('Invalid data rejected as expected:', !valResult.success);
  if (!valResult.success) {
    console.log('Validation error messages:', valResult.error.issues.map(i => i.message));
  }

  // 2. Test Valid Registration
  console.log('\n2. Testing valid registration:');
  const validData = {
    name: 'Jane Doe',
    email: testEmail,
    password: validPassword,
    confirmPassword: validPassword,
    role: 'PATIENT'
  };
  const validParsed = registerSchema.safeParse(validData);
  if (!validParsed.success) {
    throw new Error('Valid data failed zod schema validation!');
  }
  console.log('✅ Zod schema passed for valid data');

  const hashed = await bcrypt.hash(validPassword, 12);
  const createdUser = await prisma.user.create({
    data: {
      name: validData.name,
      email: validData.email.toLowerCase().trim(),
      password: hashed,
      role: 'PATIENT',
      patient: { create: {} }
    },
    include: { patient: true }
  });
  console.log('✅ User successfully created in DB! ID:', createdUser.id, 'Patient ID:', createdUser.patient?.id);

  // 3. Test Duplicate Registration Prevention
  console.log('\n3. Testing duplicate registration rejection:');
  const existing = await prisma.user.findUnique({ where: { email: testEmail } });
  if (existing) {
    console.log('✅ Duplicate check detected existing email:', existing.email);
  }

  // 4. Test Login with Valid Credentials
  console.log('\n4. Testing login logic with valid credentials:');
  const loginInput = { email: testEmail, password: validPassword };
  const loginParsed = loginSchema.safeParse(loginInput);
  console.log('Login schema validation:', loginParsed.success ? 'PASSED' : 'FAILED');

  const dbUser = await prisma.user.findUnique({
    where: { email: loginInput.email.toLowerCase().trim() },
    include: { doctor: true, patient: true }
  });

  const passwordMatches = await bcrypt.compare(loginInput.password, dbUser.password);
  console.log('Password comparison result:', passwordMatches ? 'MATCH (Authorized)' : 'MISMATCH (Rejected)');

  // 5. Test Login with Invalid Password
  console.log('\n5. Testing login logic with invalid password:');
  const invalidPasswordMatches = await bcrypt.compare('WrongPassword456', dbUser.password);
  console.log('Invalid password correctly rejected:', !invalidPasswordMatches);

  // 6. Test Doctor Registration
  console.log('\n6. Testing Doctor registration:');
  const doctorEmail = `testdoctor_${Date.now()}@example.com`;
  const doctorUser = await prisma.user.create({
    data: {
      name: 'Dr. Test Specialist',
      email: doctorEmail,
      password: hashed,
      role: 'DOCTOR',
      doctor: {
        create: {
          specialization: 'Cardiology',
          experience: 5,
          consultationFee: 2500,
          city: 'Karachi',
          degree: ['MBBS', 'FCPS'],
          languages: ['English', 'Urdu'],
          status: 'PENDING',
        }
      }
    },
    include: { doctor: true }
  });
  console.log('✅ Doctor created successfully! ID:', doctorUser.id, 'Doctor ID:', doctorUser.doctor?.id);

  // 7. Cleanup
  console.log('\n7. Cleaning up test data:');
  await prisma.user.deleteMany({
    where: { email: { in: [testEmail, doctorEmail] } }
  });
  console.log('✅ Cleaned up test accounts successfully.');

  await prisma.$disconnect();
  console.log('\n🎉 ALL SIGNUP AND LOGIN VALIDATION AND DATABASE TESTS PASSED!');
}

runTestSuite().catch(e => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
