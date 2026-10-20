'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';

/**
 * RouteProgressBar
 *
 * Provides a lightweight, high-performance top progress line for Next.js App Router.
 * - Emerald palette (#059669, #10B981)
 * - Activates on internal link clicks and dismisses upon pathname change
 * - Zero artificial delays or blocking behavior
 * - Full reduced-motion awareness
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Dismiss progress bar when route destination changes
    if (isVisible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Find closest anchor tag
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');

      // Skip invalid, external, hash, or new-tab targets
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || target === '_blank') {
        return;
      }

      // Check if it's the exact same pathname
      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(href, window.location.href);
      if (targetUrl.origin === currentUrl.origin && targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
        return;
      }

      if (targetUrl.origin === currentUrl.origin) {
        // Start route transition progress
        setIsVisible(true);
        setProgress(25);

        const step1 = setTimeout(() => setProgress(65), 180);
        const step2 = setTimeout(() => setProgress(85), 450);

        return () => {
          clearTimeout(step1);
          clearTimeout(step2);
        };
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent"
      role="progressbar"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] shadow-[0_0_8px_rgba(5,150,105,0.7)] transition-all duration-300 ease-out motion-reduce:transition-none"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

export default RouteProgressBar;
