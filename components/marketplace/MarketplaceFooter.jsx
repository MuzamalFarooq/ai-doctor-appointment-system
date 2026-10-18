import Link from 'next/link';

export function MarketplaceFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} MediConnect AI. Healthcare decisions belong with qualified professionals.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/about" className="hover:text-teal-800">About</Link>
          <Link href="/contact" className="hover:text-teal-800">Contact</Link>
          <Link href="/faq" className="hover:text-teal-800">Help</Link>
          <Link href="/privacy-policy" className="hover:text-teal-800">Privacy</Link>
          <Link href="/terms" className="hover:text-teal-800">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
