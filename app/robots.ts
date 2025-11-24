import { MetadataRoute } from 'next';
import { getCurrentDomain, getBaseUrl } from '@/lib/domain-utils';

/**
 * Dynamic robots.txt - domain-aware
 * Each domain gets its own sitemap URL
 */
export default function robots(): MetadataRoute.Robots {
  const domain = getCurrentDomain();
  const baseUrl = getBaseUrl(domain);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin_panel/',
        '/api/',
        '/inzerent_dashboard/',
        '/prihlaseni',
        '/registrace',
        '/zapomenute-heslo',
        '/partner/dashboard',
        '/pridat-inzerat',
        '/pridat-podnik',
        '/karty-demo',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
