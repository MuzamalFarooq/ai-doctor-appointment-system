import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Star, MessageSquare, Stethoscope, ArrowRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

export const metadata = {
  title: 'My Reviews | Patient Dashboard',
};

export default async function PatientReviewsPage() {
  const session = await auth();
  if (!session) return null;

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  const reviews = patient
    ? await prisma.review.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: {
            include: {
              user: { select: { name: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading">
            My Reviews
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Ratings and feedback you have given to doctors after consultations
          </p>
        </div>
        <Link
          href="/dashboard/appointments"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm w-fit"
        >
          <Stethoscope className="w-4 h-4" />
          View Completed Visits
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
            After completing an appointment with a doctor, you can rate your experience and leave helpful feedback.
          </p>
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-semibold rounded-xl text-sm hover:bg-primary-100 transition-colors"
          >
            Go to Appointments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={rev.doctor?.user?.image}
                      name={rev.doctor?.user?.name || 'Doctor'}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Dr. {rev.doctor?.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {rev.doctor?.specialization || 'Specialist'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-600 px-2.5 py-1 rounded-xl text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rev.rating}/5</span>
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed mb-3">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                )}
                {rev.reply && (
                  <div className="bg-primary-50/60 dark:bg-primary-950/40 p-3 rounded-xl border border-primary-100 dark:border-primary-900 text-xs">
                    <p className="font-semibold text-primary-700 dark:text-primary-300 mb-0.5">Doctor&apos;s Reply:</p>
                    <p className="text-gray-600 dark:text-gray-400">{rev.reply}</p>
                  </div>
                )}
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                Reviewed on {format(new Date(rev.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
