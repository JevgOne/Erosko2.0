import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO Master Dashboard | EROSKO.CZ Admin',
  description: 'AI-powered SEO management dashboard',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SEOMasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
