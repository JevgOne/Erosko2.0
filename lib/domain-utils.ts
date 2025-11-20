import { NextRequest } from 'next/server';

export type Domain = 'erosko.cz' | 'nhescort.com';

const DOMAIN_CONFIG: Record<Domain, { url: string; name: string; color: string; language: string }> = {
  'erosko.cz': {
    url: 'https://erosko.cz',
    name: 'Erosko.cz',
    color: '#ec4899', // Pink
    language: 'cs'
  },
  'nhescort.com': {
    url: 'https://nhescort.com',
    name: 'NHescort.com',
    color: '#1e40af', // Blue
    language: 'en'
  }
};

/**
 * Extract domain from request headers
 * @param headers Request headers
 * @returns Domain name
 */
export function getDomainFromHeaders(headers: Headers): Domain {
  const host = headers.get('host') || '';

  if (host.includes('nhescort.com')) return 'nhescort.com';
  if (host.includes('erosko.cz')) return 'erosko.cz';

  // Default based on environment
  const envDomain = process.env.NEXT_PUBLIC_DEFAULT_DOMAIN as Domain;
  return envDomain || 'erosko.cz';
}

/**
 * Get domain from environment or default
 */
export function getCurrentDomain(): Domain {
  const envDomain = process.env.NEXT_PUBLIC_DEFAULT_DOMAIN as Domain;
  return envDomain || 'erosko.cz';
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
