'use client';

import { useState, useEffect } from 'react';

export type Domain = 'erosko.cz' | 'nhescort.com';

export function useDomain(): Domain {
  const [domain, setDomain] = useState<Domain>('erosko.cz');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check URL parameter for testing (e.g., ?domain=nhescort)
      const urlParams = new URLSearchParams(window.location.search);
      const domainParam = urlParams.get('domain');

      const host = window.location.hostname;
      console.log('🌐 Detected hostname:', host);
      console.log('🔍 Domain param:', domainParam);

      if (domainParam === 'nhescort' || host.includes('nhescort')) {
        console.log('✅ Setting domain to nhescort.com');
        setDomain('nhescort.com');
      } else {
        console.log('✅ Setting domain to erosko.cz');
        setDomain('erosko.cz');
      }
    }
  }, []);

  return domain;
}

export function useDomainName(): string {
  const domain = useDomain();
  return domain === 'nhescort.com' ? 'NHESCORT.COM' : 'EROSKO.CZ';
}
