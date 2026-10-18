import { ServiceUnavailable } from '@/components/marketplace/ServiceUnavailable';

export const metadata = { title: 'Medicine Ordering' };

export default function MedicinesPage() {
  return (
    <ServiceUnavailable
      title="Medicine ordering"
      summary="We want to help you find medicines from participating pharmacies while respecting prescription requirements."
      missingIntegration="There is no medicine catalog, pharmacy inventory, prescription verification, cart, or order API in the current application. No products, stock levels, checkout, or payment confirmations are shown here."
    />
  );
}
