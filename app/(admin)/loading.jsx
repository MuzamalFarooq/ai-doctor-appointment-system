import { DashboardLoadingSkeleton } from '@/components/ui/Skeleton';
import { MediConnectLoader } from '@/components/ui/MediConnectLoader';

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-[#D1E7DD] dark:border-emerald-900/40 flex items-center justify-between shadow-xs">
        <MediConnectLoader
          variant="inline"
          text="Syncing MediConnect AI administrative metrics..."
        />
        <span className="hidden sm:inline-flex items-center text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-[#ECFDF5] dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-[#D1E7DD] dark:border-emerald-800/40">
          Admin Console
        </span>
      </div>

      <DashboardLoadingSkeleton subtitle="Aggregating platform analytics and verification requests..." />
    </div>
  );
}
