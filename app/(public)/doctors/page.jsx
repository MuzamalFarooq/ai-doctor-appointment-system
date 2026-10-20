import Link from 'next/link';
import { Activity, Baby, Bone, Brain, Eye, HeartPulse, Microscope, Scissors, Smile, Stethoscope, Wind } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { excludeDemoData } from '@/lib/demo-data';

export const metadata = {
  title: 'Doctor Specialties',
  description: 'Browse medical specialties and find a doctor on MediConnect AI.',
};

const specialtyIcons = {
  Cardiology: HeartPulse,
  Dermatology: Activity,
  Neurology: Brain,
  Orthopedics: Bone,
  Pediatrics: Baby,
  Gynecology: HeartPulse,
  'General Medicine': Stethoscope,
  Psychiatry: Brain,
  Dentistry: Smile,
  Ophthalmology: Eye,
  ENT: Stethoscope,
  Gastroenterology: Activity,
  Urology: Activity,
  Pulmonology: Wind,
  Endocrinology: Activity,
  Oncology: Microscope,
  'General Surgery': Scissors,
  Physiotherapy: Bone,
};

export default async function DoctorSpecialtiesPage() {
  let specialties = [];
  let loadingError = false;
  const demoCatalogVisible = process.env.NODE_ENV === 'development';

  try {
    specialties = await prisma.specialization.findMany({
      where: demoCatalogVisible ? { isActive: true } : excludeDemoData({ isActive: true }),
      orderBy: { name: 'asc' },
      select: { name: true, description: true },
    });
    specialties = await Promise.all(specialties.map(async specialty => ({
      ...specialty,
      doctorCount: await prisma.doctor.count({
        where: (demoCatalogVisible ? {
          status: 'APPROVED',
          specialization: { equals: specialty.name, mode: 'insensitive' },
        } : excludeDemoData({
          status: 'APPROVED',
          specialization: { equals: specialty.name, mode: 'insensitive' },
        })),
      }),
    })));
  } catch (error) {
    console.error('Doctor specialties could not be loaded:', error);
    loadingError = true;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8">
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-green-700">Explore care</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Find a doctor by specialty</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Browse specialties and review provider profiles, consultation fees, and appointment options.</p>
        {demoCatalogVisible && (
          <p role="note" className="mt-4 max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Development demo doctors are shown with a clear label for interface testing. They are not real providers and cannot accept appointments.
          </p>
        )}
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {loadingError ? (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
            We could not load specialties right now. Please try again later.
          </p>
        ) : specialties.length === 0 ? (
          <p className="rounded-xl border border-[#D1FAE5] bg-white p-8 text-center text-slate-600">
            No specialties are currently listed.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {specialties.map(specialty => {
              const Icon = specialtyIcons[specialty.name] || Stethoscope;
              return (
                <article key={specialty.name} className="group rounded-2xl border border-[#D1FAE5] bg-white p-5 transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg hover:shadow-green-950/5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FDF4] text-green-700 transition group-hover:bg-green-600 group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 text-lg font-semibold text-slate-950">{specialty.name}</h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{specialty.description || `Explore doctors in ${specialty.name}.`}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-500">
                      {specialty.doctorCount} {specialty.doctorCount === 1 ? 'doctor' : 'doctors'}
                    </span>
                    <Link href={`/doctors/search?spec=${encodeURIComponent(specialty.name)}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-green-700 hover:bg-[#F0FDF4] transition-colors">
                      View doctors
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
