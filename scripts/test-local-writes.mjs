import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'mongodb://127.0.0.1:27018/ai_doctor_db?replicaSet=rs0&directConnection=true' }
  }
});

async function testWrites() {
  console.log('Testing nested writes on local replica set...');
  try {
    const testEmail = `test_patient_${Date.now()}@example.com`;
    const hashed = await bcrypt.hash('TestPass123', 12);
    
    console.log('1. Creating Patient user with nested patient profile...');
    const patientUser = await prisma.user.create({
      data: {
        name: 'Test Patient',
        email: testEmail,
        password: hashed,
        role: 'PATIENT',
        patient: { create: {} },
      },
      include: { patient: true }
    });
    console.log('✅ Patient created successfully! ID:', patientUser.id, 'Patient ID:', patientUser.patient?.id);

    console.log('2. Creating Doctor user with nested doctor profile...');
    const doctorEmail = `test_doctor_${Date.now()}@example.com`;
    const doctorUser = await prisma.user.create({
      data: {
        name: 'Test Doctor',
        email: doctorEmail,
        password: hashed,
        role: 'DOCTOR',
        doctor: {
          create: {
            specialization: 'General Physician',
            experience: 0,
            consultationFee: 1000,
            city: 'Test City',
            degree: [],
            languages: ['English'],
            status: 'PENDING',
          }
        }
      },
      include: { doctor: true }
    });
    console.log('✅ Doctor created successfully! ID:', doctorUser.id, 'Doctor ID:', doctorUser.doctor?.id);

    console.log('3. Testing query and password comparison...');
    const foundUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { patient: true }
    });
    const match = await bcrypt.compare('TestPass123', foundUser.password);
    console.log('✅ Found user & password matches:', match);

    console.log('4. Cleaning up test users...');
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, doctorEmail] } }
    });
    console.log('✅ Cleaned up successfully.');
    
    await prisma.$disconnect();
    console.log('\n🎉 ALL PRISMA DATABASE WRITES AND QUERIES PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test write failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testWrites();
