import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileText, Plus, Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'Prescriptions | Doctor Dashboard',
};

export default async function DoctorPrescriptionsPage() {
  const session = await auth();
  if (!session) return null;

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  });

  const prescriptions = doctor
    ? await prisma.prescription.findMany({
        where: { doctorId: doctor.id },
        include: {
          patient: {
            include: {
              user: { select: { name: true, email: true, image: true } },
            },
          },
          appointment: { select: { date: true, timeSlot: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
            Prescriptions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            View and manage all prescriptions issued to your patients
          </p>
        </div>
        <Link
          href="/doctor/appointments"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          Write Prescription from Appointment
        </Link>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Prescriptions Issued Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
            You can create and send digital prescriptions to patients directly after completing their consultation.
          </p>
          <Link
            href="/doctor/appointments"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-colors shadow-sm"
          >
            View Appointments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prescriptions.map((p) => {
            const medCount = Array.isArray(p.medicines) ? p.medicines.length : 0;
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:border-primary-200 dark:hover:border-primary-800 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider bg-primary-50 dark:bg-primary-950 px-2.5 py-1 rounded-lg">
                      {medCount} {medCount === 1 ? 'Medicine' : 'Medicines'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(p.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {p.patient?.user?.name || 'Patient'}
                  </h3>
                  {p.diagnosis && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Diagnosis:</span> {p.diagnosis}
                    </p>
                  )}
                  {p.instructions && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 line-clamp-3 mb-4">
                      {p.instructions}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                  <span>Visit: {p.appointment?.date ? format(new Date(p.appointment.date), 'MMM dd') : 'Online'}</span>
                  {p.followUpDate && (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Follow-up: {format(new Date(p.followUpDate), 'MMM dd')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
