import Link from 'next/link';
import { ArrowRight, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import { excludeDemoData } from '@/lib/demo-data';
import { prisma } from '@/lib/prisma';
import { ServiceUnavailable } from '@/components/marketplace/ServiceUnavailable';

export const metadata = {
  title: 'Surgical Consultation',
  description: 'Explore listed surgeons and request a clinical assessment appointment.',
};

export default async function SurgeryPage() {
  let surgeons = [];
  let loadError = false;

  try {
    surgeons = await prisma.doctor.findMany({
      where: excludeDemoData({
        status: 'APPROVED',
        specialization: { contains: 'surgeon', mode: 'insensitive' },
      }),
      take: 12,
      orderBy: { experience: 'desc' },
      select: {
        id: true,
        specialization: true,
        degree: true,
        experience: true,
        city: true,
        consultationFee: true,
        user: { select: { name: true } },
        hospital: { select: { name: true } },
      },
    });
  } catch (error) {
    console.error('Surgeon directory could not be loaded:', error);
    loadError = true;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-[#f1f8f7]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.14em] text-teal-800"><HeartPulse className="h-4 w-4" /> Surgical care</p>
          <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Start with a specialist consultation.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Discuss your concerns with a listed surgeon and receive a professional clinical assessment. A consultation request is not approval for surgery.</p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-teal-200 bg-white p-4 text-sm leading-6 text-slate-700">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
            Treatment decisions, risks, and suitability must be discussed with qualified medical professionals. No surgical outcome is guaranteed.
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7">
          <h2 className="font-heading text-2xl font-bold text-slate-950">Surgeons listed on MediConnect AI</h2>
          <p className="mt-2 text-sm text-slate-600">Only approved provider profiles with a surgical specialty are shown.</p>
        </div>
        {loadError ? (
          <ServiceUnavailable title="Surgeon listings are unavailable" summary="We could not load the current surgeon directory." missingIntegration="Please try again later. No consultation has been requested." />
        ) : surgeons.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <Stethoscope className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 font-semibold text-slate-900">No surgeon profiles are listed yet</h3>
            <p className="mt-1 text-sm text-slate-600">Check back later or browse other doctor specialties.</p>
            <Link href="/doctors" className="mt-4 inline-flex font-semibold text-teal-800">Browse doctors <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {surgeons.map(surgeon => (
              <article key={surgeon.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-950">{surgeon.user.name}</h3>
                <p className="mt-1 text-sm font-medium text-teal-800">{surgeon.specialization}</p>
                <p className="mt-3 text-sm text-slate-600">{surgeon.degree.length ? surgeon.degree.join(', ') : 'Qualifications not provided'}</p>
                <p className="mt-1 text-sm text-slate-600">{surgeon.experience} years experience · {surgeon.city}</p>
                {surgeon.hospital?.name && <p className="mt-1 text-sm text-slate-600">{surgeon.hospital.name}</p>}
                <Link href={`/doctors/${surgeon.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                  View profile and consultation options <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
        <p className="mt-8 text-xs leading-5 text-slate-500">The existing booking flow records standard doctor appointments only. It does not place a surgery booking or request a procedure.</p>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-bold text-slate-950">Surgical consultation specialties</h2>
        <p className="mt-2 text-sm text-slate-600">Development catalog categories are not a claim of service availability or a surgical booking.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {await getSurgicalSpecialties()}
        </div>
      </section>
    </div>
  );
}

async function getSurgicalSpecialties() {
  try {
    const specialties = await prisma.surgicalSpecialty.findMany({
      where: process.env.NODE_ENV === 'development'
        ? { isActive: true }
        : excludeDemoData({ isActive: true }),
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true, demoData: true },
    });
    return specialties.map(specialty => (
      <article key={specialty.id} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-950">{specialty.name}</h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{specialty.description}</p>
      </article>
    ));
  } catch (error) {
    console.error('Surgical specialty catalog could not be loaded:', error);
    return <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">Surgical specialties could not be loaded. No consultation has been requested.</p>;
  }
}
