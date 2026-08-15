import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export const metadata = { title: 'Page Not Found — MediConnect AI' };

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-lg">
        <div className="text-9xl font-black gradient-text mb-6">404</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
            <Home className="w-4 h-4" /> Back Home
          </Link>
          <Link href="/doctors" className="flex items-center gap-2 px-6 py-3 border-2 border-primary-200 text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
            <Search className="w-4 h-4" /> Find Doctors
          </Link>
        </div>
      </div>
    </div>
  );
}
