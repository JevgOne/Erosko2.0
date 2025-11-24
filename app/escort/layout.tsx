import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxusní společnice Praha, Brno | VIP doprovod, escort 💎 | EROSKO.CZ',
  description: '💎 Přes 100+ luxusních společnic a VIP escort služeb. ✨ High-class doprovod pro večírky a akce. 🌟 Ověřené profily s reálnými fotkami. Praha, Brno, Ostrava.',
  keywords: 'luxusní společnice, luxusní společnice Praha, VIP doprovod Brno, společnice na večírek, high class escort, doprovod Praha, VIP společnice Ostrava, elite společnice, doprovod na večírek, společnice pro páry, GFE Praha, luxusní dívky Brno',
  openGraph: {
    title: 'Luxusní společnice Praha, Brno | VIP doprovod | EROSKO.CZ',
    description: 'Luxusní společnice a VIP doprovod v ČR. High-class společnice pro večírky a akce.',
    url: 'https://www.erosko.cz/escort',
    siteName: 'EROSKO.CZ',
    locale: 'cs_CZ',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.erosko.cz/escort',
  },
};

export default function EscortLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
