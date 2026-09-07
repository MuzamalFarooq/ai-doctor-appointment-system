import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, Mail, Phone, Calendar, ArrowRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { format } from 'date-fns';

export const metadata = {
  title: 'My Patients | Doctor Dashboard',
};

export default async function DoctorPatientsPage() {
  const session = await auth();
  if (!session) return null;

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  });

  const appointments = doctor
    ? await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: {
          patient: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true, phone: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
      })
    : [];

  // Deduplicate patients
  const patientMap = new Map();
  appointments.forEach((apt) => {
    if (apt.patient?.id && !patientMap.has(apt.patient.id)) {
      patientMap.set(apt.patient.id, {
        ...apt.patient,
        lastVisit: apt.date,
        totalVisits: 1,
      });
    } else if (apt.patient?.id) {
      const existing = patientMap.get(apt.patient.id);
      existing.totalVisits += 1;
    }
  });

  const patients = Array.from(patientMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
          My Patients
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          List of patients who have booked or completed consultations with you ({patients.length} total)
        </p>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Patients Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
            Patients who consult with you will automatically be saved to your patient registry.
          </p>
          <Link
            href="/doctor/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-colors shadow-sm"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start gap-3.5 mb-4">
                <Avatar src={p.user?.image} name={p.user?.name || 'Patient'} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {p.user?.name || 'Anonymous Patient'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    {p.user?.email}
                  </p>
                  {p.user?.phone && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {p.user.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{p.totalVisits} {p.totalVisits === 1 ? 'consultation' : 'consultations'}</span>
                {p.lastVisit && (
                  <span>Last: {format(new Date(p.lastVisit), 'MMM dd, yyyy')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
