import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Heart, Star, MapPin, Clock, Calendar } from 'lucide-react';

export const metadata = { title: 'Favorite Doctors' };

async function getFavorites(userId) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true, favoriteDoctors: true },
    });
    if (!patient || !patient.favoriteDoctors.length) return [];
    return prisma.doctor.findMany({
      where: { id: { in: patient.favoriteDoctors } },
      include: { user: { select: { name: true, image: true } } },
    });
  } catch { return []; }
}

export default async function FavoritesPage() {
  const session = await auth();
  if (!session) redirect('/login');
  const doctors = await getFavorites(session.user.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black font-heading text-gray-900 dark:text-white">Favorite Doctors</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Doctors you&apos;ve saved for quick access</p>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Save your preferred doctors for quick booking</p>
          <Link href="/doctors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl text-sm hover:opacity-90">
            Browse Doctors
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map(doctor => (
            <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {doctor.user?.image
                    ? <img src={doctor.user.image} alt={doctor.user.name} className="w-full h-full object-cover" />
                    : <span className="text-xl font-bold text-primary-600">{doctor.user?.name?.[0] || 'D'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{doctor.user?.name}</h3>
                  <p className="text-primary-600 text-xs">{doctor.specialization}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-xs text-gray-500">{doctor.rating?.toFixed(1) || '5.0'} ({doctor.totalReviews})</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3.5 h-3.5" /><span>{doctor.city}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5" /><span>{doctor.experience} years experience</span>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">PKR {doctor.consultationFee?.toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/book-appointment?doctorId=${doctor.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-xs font-semibold rounded-xl hover:opacity-90">
                  <Calendar className="w-3.5 h-3.5" /> Book
                </Link>
                <Link href={`/doctors/${doctor.id}`}
                  className="flex-1 flex items-center justify-center py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
