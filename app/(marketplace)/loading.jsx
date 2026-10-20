import { MediConnectLoader } from '@/components/ui/MediConnectLoader';

export default function MarketplaceLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <MediConnectLoader
        variant="embedded"
        text="Loading healthcare services and medical catalog..."
        subtitle="Connecting you with verified medical providers."
      />
    </div>
  );
}
