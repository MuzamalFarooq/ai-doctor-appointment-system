import { MediConnectLoader } from '@/components/ui/MediConnectLoader';

export default function Loading() {
  return (
    <MediConnectLoader
      variant="full"
      text="Preparing your healthcare experience..."
      subtitle="Your health, intelligently connected."
    />
  );
}
