import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin_panel/', '/api/', '/inzerent_dashboard/'],
    },
    sitemap: 'https://www.erosko.cz/sitemap.xml',
  };
}
