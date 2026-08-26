import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const emailInput = credentials.email.toLowerCase().trim();
          const adminUsername = process.env.ADMIN_USERNAME?.toLowerCase().trim();
          const adminEmail = (process.env.ADMIN_EMAIL || adminUsername)?.toLowerCase().trim();
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (
            adminPassword &&
            (adminEmail || adminUsername) &&
            (emailInput === adminEmail || emailInput === adminUsername) &&
            credentials.password === adminPassword
          ) {
            let adminUser = await prisma.user.findUnique({
              where: { email: adminEmail || adminUsername },
              include: { doctor: true, patient: true },
            });
            if (!adminUser) {
              const hashedPassword = await bcrypt.hash(adminPassword, 12);
              adminUser = await prisma.user.create({
                data: {
                  name: 'System Admin',
                  email: adminEmail || adminUsername,
                  password: hashedPassword,
                  role: 'ADMIN',
                  isActive: true,
                },
                include: { doctor: true, patient: true },
              });
            }
            return {
              id: adminUser.id,
              name: adminUser.name,
              email: adminUser.email,
              image: adminUser.image,
              role: 'ADMIN',
              doctorId: null,
              patientId: null,
            };
          }

          const user = await prisma.user.findUnique({
            where: { email: emailInput },
            include: { doctor: true, patient: true },
          });
          if (!user || !user.password) return null;
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          if (!user.isActive) throw new Error('Account suspended');

          let patientId = user.patient?.id ?? null;
          if (user.role === 'PATIENT' && !patientId) {
            try {
              const newPatient = await prisma.patient.create({ data: { userId: user.id } });
              patientId = newPatient.id;
            } catch (err) {
              console.error('Failed to auto-create patient profile:', err);
            }
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            doctorId: user.doctor?.id ?? null,
            patientId,
          };
        } catch (err) {
          throw new Error(err.message || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          if (!user?.email) {
            console.error('Google sign-in failed: No email provided by Google account');
            return false;
          }

          const normalizedEmail = user.email.toLowerCase().trim();

          let dbUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { doctor: true, patient: true },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                name: user.name || profile?.name || normalizedEmail.split('@')[0] || 'User',
                email: normalizedEmail,
                image: user.image || profile?.picture || null,
                role: 'PATIENT',
                emailVerified: new Date(),
                patient: { create: {} },
              },
              include: { doctor: true, patient: true },
            });
          } else {
            if (dbUser.isActive === false) {
              console.error('Google sign-in rejected: Account suspended for email', normalizedEmail);
              return false;
            }

            // Ensure patient record exists if patient role
            if (dbUser.role === 'PATIENT' && !dbUser.patient) {
              const newPatient = await prisma.patient.create({ data: { userId: dbUser.id } });
              dbUser.patient = newPatient;
            }

            // Update image if available from Google and not set
            if (!dbUser.image && (user.image || profile?.picture)) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { image: user.image || profile?.picture },
              }).catch(() => {});
            }
          }

          user.id = dbUser.id;
          user.dbId = dbUser.id;
          user.role = dbUser.role;
          user.doctorId = dbUser.doctor?.id ?? null;
          user.patientId = dbUser.patient?.id ?? null;
          return true;
        } catch (err) {
          console.error('Google signIn callback error in Prisma:', err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.dbId || user.id;
        token.role = user.role || 'PATIENT';
        token.doctorId = user.doctorId || null;
        token.patientId = user.patientId || null;
      }

      // Hydrate from DB if token.id is not a valid 24-char ObjectId or missing role/patientId
      if (token?.email && (!token.id || token.id.length !== 24 || !token.role)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            include: { doctor: true, patient: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.doctorId = dbUser.doctor?.id ?? null;
            token.patientId = dbUser.patient?.id ?? null;
          }
        } catch (err) {
          console.error('Failed to re-hydrate token from database:', err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id ?? token.sub;
        session.user.role = token.role;
        session.user.doctorId = token.doctorId;
        session.user.patientId = token.patientId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
