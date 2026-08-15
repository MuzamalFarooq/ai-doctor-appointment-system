import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DoctorProfileClient } from '@/components/doctor/DoctorProfileClient';

export const metadata = { title: 'Doctor Profile' };

export default async function DoctorProfilePage() {
  const session = await auth();
  const doctorId = session?.user?.doctorId;
  let doctor = null;
  if (doctorId) {
    try {
      doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: { user: { select: { name: true, email: true, image: true } }, hospital: true },
      });
    } catch {}
  }
  return <DoctorProfileClient doctor={JSON.parse(JSON.stringify(doctor))} />;
}
