import { HealthcareNavbar } from '@/components/marketplace/HealthcareNavbar';
import { MarketplaceFooter } from '@/components/marketplace/MarketplaceFooter';
import { CartDrawer } from '@/components/cart/CartDrawer';

export default function MarketplaceLayout({ children }) {
  return (
    <>
      <HealthcareNavbar />
      <main id="main-content">{children}</main>
      <CartDrawer />
      <MarketplaceFooter />
    </>
  );
}

