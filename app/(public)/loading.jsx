import { MediConnectLoader } from '@/components/ui/MediConnectLoader';

export default function PublicLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh] flex items-center justify-center">
      <MediConnectLoader
        variant="embedded"
        text="Loading MediConnect AI healthcare services..."
        subtitle="Connecting you with verified doctors and intelligent care."
      />
    </div>
  );
}
