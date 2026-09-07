import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, User, ArrowRight, Video, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Schedule & Calendar | Doctor Dashboard',
};

export default async function DoctorCalendarPage() {
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
              user: { select: { name: true, image: true, email: true, phone: true } },
            },
          },
        },
        orderBy: { date: 'asc' },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
            Schedule & Calendar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Overview of upcoming visits and consultation timings
          </p>
        </div>
        <Link
          href="/doctor/availability"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm w-fit"
        >
          <Clock className="w-4 h-4" />
          Edit Working Hours
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Scheduled Appointments</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
            When patients book consultations with you, your schedule will appear here.
          </p>
          <Link
            href="/doctor/availability"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-semibold rounded-xl text-sm hover:bg-primary-100 transition-colors"
          >
            Configure Availability <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex flex-col items-center justify-center font-bold text-xs shrink-0 border border-primary-100 dark:border-primary-900">
                  <span>{format(new Date(apt.date), 'MMM')}</span>
                  <span className="text-base leading-none">{format(new Date(apt.date), 'dd')}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {apt.patient?.user?.name || 'Patient'}
                    </h3>
                    <Badge variant={apt.status === 'CONFIRMED' ? 'success' : apt.status === 'COMPLETED' ? 'primary' : 'warning'}>
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary-500" />
                      {apt.timeSlot}
                    </span>
                    <span className="flex items-center gap-1">
                      {apt.type === 'VIDEO' ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-accent-500" />
                          <span>Video Consultation</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Clinic Visit</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="/doctor/appointments"
                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors text-center w-full sm:w-auto"
              >
                Manage Appointment
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
