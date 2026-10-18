import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Accessibility, Activity, Baby, Bone, Brain, Eye, Heart, HeartPulse,
  Microscope, Scissors, Smile, Stethoscope, Wind,
} from 'lucide-react';
import { DOCTOR_SPECIALTIES } from '@/lib/doctor-specialties';

export const metadata = {
  title: 'Doctor Specialties',
  description: 'Browse medical specialties and find an approved doctor on MediConnect AI.',
};

const icons = [HeartPulse, Activity, Brain, Bone, Baby, Heart, Stethoscope, Brain, Smile, Eye, Stethoscope, Activity, Activity, Wind, Activity, Microscope, Scissors, Accessibility];

export default async function DoctorSpecialtiesPage() {
  let specialties = DOCTOR_SPECIALTIES;
  let loadingError = false;

  try {
    const extraSpecialties = await prisma.specialization.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { name: true, description: true },
    });
    const knownNames = new Set(DOCTOR_SPECIALTIES.flatMap(item => [
      item.name.toLowerCase(),
      item.specialization.toLowerCase(),
    ]));
    specialties = [
      ...DOCTOR_SPECIALTIES,
      ...extraSpecialties
        .filter(item => !knownNames.has(item.name.toLowerCase()))
        .map(item => ({ name: item.name, specialization: item.name, description: item.description || 'Explore doctors in this specialty.' })),
    ];

    specialties = await Promise.all(specialties.map(async item => ({
      ...item,
      doctorCount: await prisma.doctor.count({
        where: { status: 'APPROVED', specialization: { contains: item.specialization, mode: 'insensitive' } },
      }),
    })));
  } catch (error) {
    console.error('Doctor specialties could not be loaded:', error);
    loadingError = true;
    specialties = DOCTOR_SPECIALTIES.map(item => ({ ...item, doctorCount: null }));
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8">
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-800">Explore care</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Find a doctor by specialty</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Browse specialties and review real provider profiles, consultation fees, and appointment options.</p>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {loadingError && (
          <p role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Specialty counts are temporarily unavailable. Please refresh to try again.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {specialties.map((specialty, index) => {
            const Icon = icons[index % icons.length];
            return (
              <article key={specialty.specialization} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-950/5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 transition group-hover:bg-teal-700 group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-slate-950">{specialty.name}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{specialty.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-500">
                    {specialty.doctorCount === null ? 'Count unavailable' : `${specialty.doctorCount} ${specialty.doctorCount === 1 ? 'doctor' : 'doctors'}`}
                  </span>
                  <Link href={`/doctors/search?spec=${encodeURIComponent(specialty.specialization)}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50">
                    View doctors
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
