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
          const adminUsername = process.env.ADMIN_USERNAME;
          const adminEmail = process.env.ADMIN_EMAIL || adminUsername;
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (
            adminPassword &&
            (adminEmail || adminUsername) &&
            (credentials.email === adminEmail || credentials.email === adminUsername) &&
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
            where: { email: credentials.email },
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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { doctor: true, patient: true },
          });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                image: user.image,
                role: 'PATIENT',
                emailVerified: new Date(),
                patient: { create: {} },
              },
              include: { doctor: true, patient: true },
            });
          } else if (dbUser.role === 'PATIENT' && !dbUser.patient) {
            const newPatient = await prisma.patient.create({ data: { userId: dbUser.id } });
            dbUser.patient = newPatient;
          }
          user.role = dbUser.role;
          user.dbId = dbUser.id;
          user.doctorId = dbUser.doctor?.id ?? null;
          user.patientId = dbUser.patient?.id ?? null;
        } catch { return false; }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.doctorId = user.doctorId;
        token.patientId = user.patientId;
        token.id = user.id ?? user.dbId ?? token.sub;
      } else if (!token.id && token.sub) {
        token.id = token.sub;
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
