import { MediConnectLoader } from '@/components/ui/MediConnectLoader';

export default function AuthLoading() {
  return (
    <div className="py-8 flex flex-col items-center justify-center">
      <MediConnectLoader
        variant="compact"
        text="Preparing secure authentication portal..."
        className="bg-transparent border-none shadow-none"
      />
    </div>
  );
}
