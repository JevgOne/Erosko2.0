import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Erotické podniky Praha, Brno | Salony, swingers kluby 🏢 | EROSKO.CZ',
  description: '🏢 Přes 80+ ověřených erotických podniků v ČR. ⭐ Erotické salony, swingers kluby, strip kluby a masážní studia s recenzemi. 📍 Praha, Brno, Ostrava a další města.',
  keywords: 'erotické podniky Praha, erotický salon Brno, swingers klub Praha, strip klub Ostrava, night club Praha, FKK sauna, erotický privát Brno, masážní studio Praha, swingers Brno, tantra salon, BDSM studio, erotický klub',
  openGraph: {
    title: 'Erotické podniky Praha, Brno | Salony, kluby | EROSKO.CZ',
    description: 'Najděte ověřené erotické podniky v ČR. Erotické salony, swingers kluby a strip kluby.',
    url: 'https://www.erosko.cz/eroticke-podniky',
    siteName: 'EROSKO.CZ',
    locale: 'cs_CZ',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.erosko.cz/eroticke-podniky',
  },
};

export default function ErotickePodnikyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
