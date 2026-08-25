import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import { auth } from '@/lib/auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'MediConnect AI — Smart Doctor Appointment System',
    template: '%s | MediConnect AI',
  },
  description: 'AI-powered doctor appointment platform. Find top doctors, get AI health recommendations, book appointments instantly, and consult online.',
  keywords: ['doctor appointment', 'AI health', 'online consultation', 'medical booking', 'telemedicine', 'healthcare AI'],
  authors: [{ name: 'MediConnect AI' }],
  creator: 'MediConnect AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'MediConnect AI',
    title: 'MediConnect AI — Smart Doctor Appointment System',
    description: 'AI-powered healthcare platform for smarter doctor appointments',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MediConnect AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediConnect AI — Smart Doctor Appointment System',
    description: 'AI-powered doctor appointment platform',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
};

export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <AuthProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
            <QueryProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    padding: '12px 16px',
                  },
                  success: {
                    style: {
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                    },
                    iconTheme: { primary: '#10b981', secondary: '#ecfdf5' },
                  },
                  error: {
                    style: {
                      background: '#fef2f2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                    },
                    iconTheme: { primary: '#ef4444', secondary: '#fef2f2' },
                  },
                }}
              />
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
