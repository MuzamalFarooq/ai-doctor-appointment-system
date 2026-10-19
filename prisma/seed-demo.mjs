import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

function getDatabaseName(connectionString) {
  const match = connectionString?.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

const databaseName = getDatabaseName(process.env.DATABASE_URL);
const requestedDatabase = process.argv.find(value => value.startsWith('--database='))?.split('=')[1];
const confirmed = process.argv.includes('--confirm-demo-data');

if (process.env.NODE_ENV !== 'development') {
  throw new Error('Demo seeding is allowed only when NODE_ENV=development.');
}
if (!confirmed || !requestedDatabase || databaseName !== requestedDatabase) {
  throw new Error('Pass --confirm-demo-data and the exact database name with --database=<name>. No records were changed.');
}

const specialties = [
  ['Cardiology', 'Cardiologist', 'Heart and cardiovascular care.'],
  ['Dermatology', 'Dermatologist', 'Skin, hair, and nail care.'],
  ['Neurology', 'Neurologist', 'Brain, nerve, and nervous system care.'],
  ['Orthopedics', 'Orthopedic', 'Bone, joint, and musculoskeletal care.'],
  ['Pediatrics', 'Pediatrician', 'Medical care for infants, children, and adolescents.'],
  ['Gynecology', 'Gynecologist', 'Women’s reproductive and gynecologic care.'],
  ['General Medicine', 'General Physician', 'Primary care for common health concerns.'],
  ['Psychiatry', 'Psychiatrist', 'Assessment and care for mental health concerns.'],
  ['Dentistry', 'Dentist', 'Oral health and dental care.'],
  ['Ophthalmology', 'Ophthalmologist', 'Eye health and vision care.'],
  ['ENT', 'ENT Specialist', 'Ear, nose, and throat care.'],
  ['Gastroenterology', 'Gastroenterologist', 'Digestive system and gastrointestinal care.'],
  ['Urology', 'Urologist', 'Urinary tract and urologic care.'],
  ['Pulmonology', 'Pulmonologist', 'Lung and respiratory care.'],
  ['Endocrinology', 'Endocrinologist', 'Hormone and endocrine system care.'],
  ['Oncology', 'Oncologist', 'Specialist cancer care.'],
  ['General Surgery', 'General Surgeon', 'Consultation for surgical concerns.'],
  ['Physiotherapy', 'Physiotherapist', 'Movement and rehabilitation care.'],
];

const productCategories = [
  'Pain Relief', 'Cold and Flu', 'Digestive Health', 'Vitamins and Supplements',
  'Skin Care', 'Hair Care', 'Women’s Healthcare', 'Baby Care', 'First Aid',
  'Diabetes Care', 'Medical Devices', 'General Healthcare',
];

const labTests = [
  ['cbc', 'Complete Blood Count (CBC)', 'Hematology', 'A routine blood test catalog entry.'],
  ['blood-glucose', 'Blood Glucose', 'Diabetes Care', 'A blood glucose test catalog entry.'],
  ['hba1c', 'HbA1c', 'Diabetes Care', 'A glycated hemoglobin test catalog entry.'],
  ['lipid-profile', 'Lipid Profile', 'Clinical Chemistry', 'A blood lipid test catalog entry.'],
  ['liver-function', 'Liver Function Tests', 'Clinical Chemistry', 'A liver chemistry test catalog entry.'],
  ['kidney-function', 'Kidney Function Tests', 'Clinical Chemistry', 'A kidney chemistry test catalog entry.'],
  ['thyroid-function', 'Thyroid Function Tests', 'Endocrinology', 'A thyroid test catalog entry.'],
  ['urine-examination', 'Urine Complete Examination', 'Urinalysis', 'A routine urine test catalog entry.'],
  ['vitamin-d', 'Vitamin D', 'Vitamins', 'A vitamin D test catalog entry.'],
  ['vitamin-b12', 'Vitamin B12', 'Vitamins', 'A vitamin B12 test catalog entry.'],
  ['pregnancy-test', 'Pregnancy Test', 'Women’s Health', 'A pregnancy test catalog entry.'],
  ['electrolytes', 'Electrolytes', 'Clinical Chemistry', 'An electrolyte test catalog entry.'],
  ['crp', 'C-Reactive Protein (CRP)', 'Inflammation', 'A CRP test catalog entry.'],
  ['iron-studies', 'Iron Studies', 'Hematology', 'An iron studies test catalog entry.'],
];

const surgicalSpecialties = [
  ['general-surgery', 'General Surgery', 'Consultation and clinical assessment for general surgical concerns.'],
  ['orthopedic-surgery', 'Orthopedic Surgery', 'Consultation and clinical assessment for musculoskeletal surgical concerns.'],
  ['cardiothoracic-surgery', 'Cardiothoracic Surgery', 'Consultation and clinical assessment for chest and heart surgical concerns.'],
  ['neurosurgery', 'Neurosurgery', 'Consultation and clinical assessment for neurological surgical concerns.'],
  ['urological-surgery', 'Urological Surgery', 'Consultation and clinical assessment for urological surgical concerns.'],
  ['gynecological-surgery', 'Gynecological Surgery', 'Consultation and clinical assessment for gynecological surgical concerns.'],
  ['ent-surgery', 'ENT Surgery', 'Consultation and clinical assessment for ear, nose, and throat surgical concerns.'],
  ['ophthalmic-surgery', 'Ophthalmic Surgery', 'Consultation and clinical assessment for eye surgical concerns.'],
  ['plastic-reconstructive-surgery', 'Plastic and Reconstructive Surgery', 'Consultation and clinical assessment for reconstructive surgical concerns.'],
];

const counts = {
  created: { specialties: 0, doctors: 0, availability: 0, medicines: 0, labTests: 0, surgicalSpecialties: 0 },
  updated: { specialties: 0, doctors: 0, availability: 0, medicines: 0, labTests: 0, surgicalSpecialties: 0 },
  skipped: { specialties: 0, doctors: 0, availability: 0, medicines: 0, labTests: 0, surgicalSpecialties: 0 },
  failed: [],
};

const prisma = new PrismaClient();

async function inBatches(items, operation, size = 8) {
  for (let index = 0; index < items.length; index += size) {
    await Promise.all(items.slice(index, index + size).map(async item => {
      try {
        await operation(item);
      } catch (error) {
        counts.failed.push({
          name: error.name,
          code: error.code || 'UNKNOWN',
          message: error.message,
        });
      }
    }));
  }
}

async function upsertManagedCatalog(model, key, create, update, counter) {
  const existing = await model.findUnique({ where: { [key.field]: key.value }, select: { id: true, demoData: true } });
  if (existing) {
    if (existing.demoData !== true) {
      counts.skipped[counter] += 1;
      return;
    }
  }
  if (existing) {
    await model.update({ where: { id: existing.id }, data: update });
  } else {
    await model.create({ data: create });
  }
  counts[existing ? 'updated' : 'created'][counter] += 1;
}

async function seedSpecialties() {
  for (const [name, , description] of specialties) {
    const existing = await prisma.specialization.findUnique({ where: { name }, select: { id: true, demoData: true } });
    if (existing) {
      if (!existing.demoData) {
        counts.skipped.specialties += 1;
        continue;
      }
      await prisma.specialization.update({
        where: { id: existing.id },
        data: { description, isActive: true, demoData: true },
      });
      counts.updated.specialties += 1;
      continue;
    }
    await prisma.specialization.create({ data: { name, description, isActive: true, demoData: true } });
    counts.created.specialties += 1;
  }
}

async function seedDoctors() {
  const days = [1, 2, 3, 4, 5];
  const entries = [];
  for (let index = 0; index < 36; index += 1) {
    const [specialty] = specialties[index % specialties.length];
    const sequence = String(index + 1).padStart(2, '0');
    const email = `demo-provider-${sequence}@example.invalid`;
    const name = `DEMO PROVIDER ${sequence} — ${specialty}`;
    entries.push({ email, name, specialization: specialty });
  }

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: entries.map(entry => entry.email) } },
    include: { doctor: true },
  });
  const usersByEmail = new Map(existingUsers.map(user => [user.email, user]));
  const doctors = [];

  await inBatches(entries, async entry => {
    const existingUser = usersByEmail.get(entry.email);
    if (existingUser && (!existingUser.doctor || !existingUser.doctor.demoData)) {
      counts.skipped.doctors += 1;
      return;
    }

    const doctorData = {
      specialization: entry.specialization,
      degree: [],
      experience: 0,
      consultationFee: 0,
      languages: [],
      city: 'Development demo',
      location: null,
      education: [],
      awards: [],
      biography: 'DEMONSTRATION PROFILE — not a real healthcare provider. No credentials, real-world availability, or clinical services are represented.',
      rating: 0,
      totalReviews: 0,
      profilePhoto: null,
      status: 'APPROVED',
      isVerified: false,
      demoData: true,
    };
    let doctor;
    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          name: entry.name,
          email: entry.email,
          role: 'DOCTOR',
          isActive: false,
          doctor: { create: doctorData },
        },
        include: { doctor: true },
      });
      doctor = user.doctor;
      counts.created.doctors += 1;
    } else {
      doctor = await prisma.doctor.update({
        where: { id: existingUser.doctor.id },
        data: doctorData,
      });
      counts.updated.doctors += 1;
    }
    doctors.push(doctor);
  });

  if (!doctors.length) return;
  const existingAvailability = await prisma.availability.findMany({
    where: { doctorId: { in: doctors.map(doctor => doctor.id) }, dayOfWeek: { in: days } },
    select: { id: true, doctorId: true, dayOfWeek: true },
  });
  const availabilityByKey = new Map(existingAvailability.map(item => [`${item.doctorId}:${item.dayOfWeek}`, item]));
  const scheduleEntries = doctors.flatMap(doctor => days.map(dayOfWeek => ({ doctorId: doctor.id, dayOfWeek })));
  await inBatches(scheduleEntries, async ({ doctorId, dayOfWeek }) => {
    const prior = availabilityByKey.get(`${doctorId}:${dayOfWeek}`);
    const data = { startTime: '09:00', endTime: '12:00', slotDuration: 30, isAvailable: true };
    if (prior) {
      await prisma.availability.update({ where: { id: prior.id }, data });
      counts.updated.availability += 1;
    } else {
      await prisma.availability.create({ data: { doctorId, dayOfWeek, ...data } });
      counts.created.availability += 1;
    }
  });
}

async function seedProducts() {
  const entries = [];
  for (let index = 0; index < 96; index += 1) {
    const sequence = String(index + 1).padStart(3, '0');
    const category = productCategories[index % productCategories.length];
    const catalogKey = `demo-product-${sequence}`;
    const data = {
      catalogKey,
      name: `DEMO ${category} Product ${sequence}`,
      category,
      description: 'Demonstration catalog item for development only. This is not a verified medicine, medical device, pharmacy listing, or medical recommendation.',
      price: 100 + (index % 20) * 25,
      stock: 0,
      prescriptionRequired: false,
      sellerName: 'Development demo catalog — not a pharmacy',
      isActive: true,
      demoData: true,
    };
    entries.push({ key: catalogKey, data,
      update: {
        name: data.name,
        category: data.category,
        description: data.description,
        price: data.price,
        stock: 0,
        prescriptionRequired: false,
        sellerName: data.sellerName,
        isActive: true,
        demoData: true,
      },
    });
  }
  await inBatches(entries, async ({ key, data, update }) => upsertManagedCatalog(
      prisma.medicineProduct,
      { field: 'catalogKey', value: key },
      data,
      update,
      'medicines',
    ));
}

async function seedLabTests() {
  const entries = [];
  for (let index = 0; index < labTests.length; index += 1) {
    const [catalogKey, name, category, description] = labTests[index];
    const data = {
      catalogKey: `demo-${catalogKey}`,
      name,
      category,
      description: `DEMONSTRATION CATALOG ENTRY — ${description} No laboratory, service availability, clinical instruction, or booking is represented.`,
      price: 500 + index * 100,
      sampleType: null,
      preparationInstructions: null,
      estimatedTurnaround: null,
      homeCollectionEligible: false,
      collectionLocations: [],
      isActive: true,
      demoData: true,
    };
    entries.push({ key: data.catalogKey, data, update: {
      name: data.name,
      category: data.category,
      description: data.description,
      price: data.price,
      homeCollectionEligible: false,
      collectionLocations: [],
      isActive: true,
      demoData: true,
    } });
  }
  await inBatches(entries, async ({ key, data, update }) => upsertManagedCatalog(
      prisma.labTest,
      { field: 'catalogKey', value: key },
      data,
      update,
      'labTests',
    ));
}

async function seedSurgicalSpecialties() {
  await inBatches(surgicalSpecialties, async ([slug, name, description]) => upsertManagedCatalog(
      prisma.surgicalSpecialty,
      { field: 'slug', value: `demo-${slug}` },
      {
        slug: `demo-${slug}`,
        name,
        description: `DEMONSTRATION SERVICE CATEGORY — ${description} This does not represent an available provider or confirmed procedure.`,
        consultationType: 'Clinical assessment only',
        isActive: true,
        demoData: true,
      },
      {
        name,
        description: `DEMONSTRATION SERVICE CATEGORY — ${description} This does not represent an available provider or confirmed procedure.`,
        consultationType: 'Clinical assessment only',
        isActive: true,
        demoData: true,
      },
      'surgicalSpecialties',
    ));
}

try {
  await prisma.$connect();
  await seedSpecialties();
  await seedDoctors();
  await seedProducts();
  await seedLabTests();
  await seedSurgicalSpecialties();
  if (counts.failed.length) process.exitCode = 1;
  console.log(JSON.stringify({ database: databaseName, counts }, null, 2));
} catch (error) {
  counts.failed.push({ name: error.name, code: error.code || 'UNKNOWN', message: error.message });
  console.error(JSON.stringify({ database: databaseName, counts }, null, 2));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
