import Link from 'next/link';
import { ArrowLeft, CircleHelp } from 'lucide-react';

export function ServiceUnavailable({ title, summary, missingIntegration }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
          <CircleHelp className="h-6 w-6" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[.16em] text-teal-800">Service information</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{summary}</p>
        <div role="status" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-950">This service is not available for online booking yet.</p>
          <p className="mt-1 text-sm leading-6 text-amber-900">{missingIntegration}</p>
        </div>
        <Link href="/healthcare#services" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">
          <ArrowLeft className="h-4 w-4" /> Explore available services
        </Link>
      </div>
    </div>
  );
}
