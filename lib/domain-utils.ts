import { headers } from 'next/headers';

export type Domain = 'erosko.cz' | 'nhescort.com';

const DOMAIN_CONFIG: Record<Domain, { url: string; name: string; color: string; language: string }> = {
  'erosko.cz': {
    url: 'https://www.erosko.cz',
    name: 'Erosko.cz',
    color: '#ec4899', // Pink
    language: 'cs'
  },
  'nhescort.com': {
    url: 'https://www.nhescort.com',
    name: 'NHescort.com',
    color: '#1e40af', // Blue
    language: 'en'
  }
};

/**
 * Get current domain from request headers
 * Works in Server Components and API routes
 */
export function getCurrentDomain(): Domain {
  try {
    const headersList = headers();
    const host = headersList.get('host') || '';

    // Check if it's nhescort.com
    if (host.includes('nhescort.com')) {
      return 'nhescort.com';
    }

    // Default to erosko.cz
    return 'erosko.cz';
  } catch (error) {
    // Fallback if headers() fails (e.g., in static generation)
    return 'erosko.cz';
  }
}

/**
 * Get domain configuration (URL, name, branding)
 */
export function getDomainConfig(domain: Domain) {
  return DOMAIN_CONFIG[domain] || DOMAIN_CONFIG['erosko.cz'];
}

/**
 * Get base URL for domain
 */
export function getBaseUrl(domain: Domain): string {
  return getDomainConfig(domain).url;
}

/**
 * Generate canonical URL for profile
 */
export function getProfileCanonical(slug: string, domain: Domain): string {
  return `${getBaseUrl(domain)}/profil/${slug}`;
}

/**
 * Generate canonical URL for business
 */
export function getBusinessCanonical(slug: string, domain: Domain): string {
  return `${getBaseUrl(domain)}/podnik/${slug}`;
}

/**
 * Generate canonical URL for static page
 */
export function getStaticPageCanonical(path: string, domain: Domain): string {
  return `${getBaseUrl(domain)}${path}`;
}

/**
 * Get domain display name (for admin panels, etc)
 */
export function getDomainName(domain: Domain): string {
  return getDomainConfig(domain).name;
}

/**
 * Get domain branding color for OG images
 */
export function getDomainColor(domain: Domain): string {
  return getDomainConfig(domain).color;
}

/**
 * Get domain language code
 */
export function getDomainLanguage(domain: Domain): string {
  return getDomainConfig(domain).language;
}

/**
 * Get all available domains
 */
export function getAllDomains(): Domain[] {
  return ['erosko.cz', 'nhescort.com'];
}
