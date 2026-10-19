import Image from 'next/image';
import Link from 'next/link';
import { excludeDemoData } from '@/lib/demo-data';
import { prisma } from '@/lib/prisma';
import {
  ArrowRight, Brain, CalendarCheck, FlaskConical, HeartPulse,
  Pill, ShieldCheck, Stethoscope, Users,
} from 'lucide-react';

export const metadata = {
  title: 'Your Health, Our Priority',
  description: 'Discover doctors, explore healthcare services, and book appointments with MediConnect AI.',
};

async function getMarketplaceData() {
  try {
    const [doctorCount, doctors, medicineCount, labTestCount] = await Promise.all([
      prisma.doctor.count({ where: excludeDemoData({ status: 'APPROVED' }) }),
      prisma.doctor.findMany({
        where: excludeDemoData({ status: 'APPROVED' }),
        orderBy: [{ rating: 'desc' }, { experience: 'desc' }],
        take: 3,
        select: {
          id: true,
          specialization: true,
          degree: true,
          experience: true,
          consultationFee: true,
          city: true,
          rating: true,
          totalReviews: true,
          profilePhoto: true,
          isVerified: true,
          user: { select: { name: true, image: true } },
          hospital: { select: { name: true } },
        },
      }),
      prisma.medicineProduct.count({ where: excludeDemoData({ isActive: true }) }),
      prisma.labTest.count({ where: excludeDemoData({ isActive: true }) }),
    ]);
    return { doctorCount, doctors, medicineCount, labTestCount, error: false };
  } catch (error) {
    console.error('Marketplace homepage data could not be loaded:', error);
    return { doctorCount: null, doctors: [], medicineCount: null, labTestCount: null, error: true };
  }
}

function getServices(medicineCount, labTestCount) {
  return [
    {
      title: 'Book a Doctor',
      description: 'Explore real doctor profiles, credentials, consultation fees, and appointment options.',
      href: '/doctors',
      icon: Stethoscope,
      tone: 'bg-teal-50 text-teal-800',
      available: true,
      action: 'Find a doctor',
    },
    {
      title: 'Order Medicines',
      description: medicineCount > 0
        ? `${medicineCount} listed products. Pharmacy stock, prescription checks, and online ordering are not connected.`
        : 'Medicine catalog, pharmacy stock, prescription checks, and online ordering are not connected yet.',
      href: '/medicines',
      icon: Pill,
      tone: 'bg-sky-50 text-sky-800',
      available: false,
      action: 'Browse catalog',
    },
    {
      title: 'Book a Lab Test',
      description: labTestCount > 0
        ? `${labTestCount} catalog tests. Participating laboratories, schedules, verified prices, and booking are not connected.`
        : 'Laboratory listings, test prices, schedules, and booking are not connected yet.',
      href: '/lab-tests',
      icon: FlaskConical,
      tone: 'bg-violet-50 text-violet-800',
      available: false,
      action: 'Browse catalog',
    },
    {
      title: 'Surgery Consultation',
      description: 'Explore listed surgeons and request a regular consultation for clinical assessment.',
      href: '/surgery',
      icon: HeartPulse,
      tone: 'bg-rose-50 text-rose-800',
      available: true,
      action: 'Explore surgeons',
    },
  ];
}

function DoctorPreview({ doctor }) {
  const name = doctor.user?.name || 'Doctor';
  const photo = doctor.profilePhoto || doctor.user?.image;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-50 text-teal-800">
          {photo ? (
            <Image src={photo} alt={name} fill sizes="56px" unoptimized className="object-cover" />
          ) : (
            <Stethoscope className="h-6 w-6" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-teal-800">{doctor.specialization}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>{doctor.degree?.length ? doctor.degree.join(', ') : 'Qualifications not provided'}</p>
        <p>{doctor.experience} years of experience{doctor.hospital?.name ? ` · ${doctor.hospital.name}` : ''}</p>
        {doctor.totalReviews > 0 && <p>{doctor.rating.toFixed(1)} / 5 from {doctor.totalReviews} reviews</p>}
      </div>
      <Link href={`/doctors/${doctor.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950">
        View profile <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export default async function HealthcareHomePage() {
  const { doctorCount, doctors, medicineCount, labTestCount, error } = await getMarketplaceData();
  const services = getServices(medicineCount, labTestCount);

  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-[#f1f8f7]">
        <div className="absolute -right-36 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-teal-100/70 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.04fr_.96fr] lg:px-8 lg:py-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.14em] text-teal-800">
              <ShieldCheck className="h-4 w-4" /> Care that starts with you
            </p>
            <h1 className="max-w-2xl font-heading text-4xl font-bold leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Your health, <span className="text-teal-700">our priority.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Find a doctor, understand your care options, and book an appointment through one thoughtful healthcare experience.
            </p>

            <form action="/doctors/search" className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/5 sm:flex-row">
              <label className="sr-only" htmlFor="doctor-search">Search doctors by name, specialty, or condition</label>
              <input id="doctor-search" name="q" type="search" placeholder="Doctor name, specialty, or condition" className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-teal-600/30" />
              <button type="submit" className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800">Find a doctor</button>
            </form>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-teal-700" /> {error ? 'Doctor directory temporarily unavailable' : `${doctorCount} approved doctor profiles listed`}</span>
              <span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-teal-700" /> {doctorCount ? 'Request an appointment with a listed doctor' : 'Appointment requests open when doctors are listed'}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-5 top-10 z-10 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:-left-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><HeartPulse className="h-5 w-5" /></span>
                <div><p className="text-xs text-slate-500">Patient-first care</p><p className="text-sm font-semibold text-slate-900">Support at every step</p></div>
              </div>
            </div>
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-teal-100 shadow-2xl shadow-teal-950/10">
              <Image
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&auto=format&fit=crop&q=85"
                alt="Doctor speaking with a patient"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 48vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/40 bg-white/90 p-4 backdrop-blur-sm">
                <p className="font-semibold text-slate-900">A clearer way to find care</p>
                <p className="mt-1 text-sm text-slate-600">Real provider details. Appointment requests reviewed by care professionals.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-800">Care made easier</p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950">Explore our services</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-600">Choose a care path and see what is currently available through MediConnect AI.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {services.map(({ title, description, href, icon: Icon, tone, available, action }) => (
            <article key={title} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-950/5">
              <div className="flex items-start justify-between gap-2">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></span>
                {!available && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">Not available yet</span>}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
              <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 group-hover:gap-3">
                {action} <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="specialties" className="scroll-mt-24 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-800">Start with a specialty</p>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950">Find the right doctor</h2>
            </div>
            <Link href="/doctors" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">Browse specialties <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {error ? (
            <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              Doctor listings could not be loaded right now. Please try again later or contact support.
            </div>
          ) : doctors.length ? (
            <div className="grid gap-4 md:grid-cols-3">{doctors.map(doctor => <DoctorPreview key={doctor.id} doctor={doctor} />)}</div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">No approved doctor profiles are available yet.</div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-800">A helpful first step</p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950">Find the right specialist</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Use the AI symptom checker to explore care options. Its suggestions are informational only and are not a diagnosis or a substitute for professional medical advice.</p>
        </div>
        <Link href="/ai-symptom-checker" className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-700 px-5 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50">
          <Brain className="h-4 w-4" /> Try symptom checker <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
