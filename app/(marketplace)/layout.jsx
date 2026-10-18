import { HealthcareNavbar } from '@/components/marketplace/HealthcareNavbar';
import { MarketplaceFooter } from '@/components/marketplace/MarketplaceFooter';

export default function MarketplaceLayout({ children }) {
  return (
    <>
      <HealthcareNavbar />
      <main id="main-content">{children}</main>
      <MarketplaceFooter />
    </>
  );
}
