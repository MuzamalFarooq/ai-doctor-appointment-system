import { ServiceUnavailable } from '@/components/marketplace/ServiceUnavailable';

export const metadata = { title: 'Laboratory Tests' };

export default function LabTestsPage() {
  return (
    <ServiceUnavailable
      title="Laboratory tests"
      summary="A reliable test-booking service needs current information from participating laboratories and a confirmed booking workflow."
      missingIntegration="The current application does not include a laboratory catalog, test pricing, lab availability, preparation instructions, or lab booking APIs. No test appointments or confirmations can be placed yet."
    />
  );
}
