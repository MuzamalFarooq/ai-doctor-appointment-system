import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquare, Calendar, Video, ArrowRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { format } from 'date-fns';

export const metadata = {
  title: 'Consultations & Messages | Doctor Dashboard',
};

export default async function DoctorChatPage() {
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
              user: { select: { id: true, name: true, image: true, email: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
          Patient Consultations & Messages
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Direct communication channels and consultation notes with your patients
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Active Conversations</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
            When patients book video or in-clinic consultations, messaging threads are initiated here.
          </p>
          <Link
            href="/doctor/appointments"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-colors shadow-sm"
          >
            Check Appointments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={apt.patient?.user?.image}
                    name={apt.patient?.user?.name || 'Patient'}
                    size="md"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {apt.patient?.user?.name || 'Patient'}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(apt.date), 'MMM dd, yyyy')} • {apt.timeSlot}
                    </p>
                  </div>
                </div>
                {apt.type === 'VIDEO' && (
                  <span className="p-2 bg-primary-50 dark:bg-primary-950/50 text-primary-600 rounded-xl">
                    <Video className="w-4 h-4" />
                  </span>
                )}
              </div>

              {apt.symptoms && (
                <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800 mb-4 line-clamp-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Reported Symptoms:</span> {apt.symptoms}
                </p>
              )}

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                  Status: {apt.status}
                </span>
                <Link
                  href="/doctor/appointments"
                  className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 inline-flex items-center gap-1"
                >
                  Open Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
