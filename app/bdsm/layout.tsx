import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BDSM Praha, Brno | Domina, SM privát ⛓️ | EROSKO.CZ',
  description: '⛓️ Přes 50+ profesionálních domina a BDSM studií. 👠 SM privát, bondage, femdom, spanking. 🔥 Ověřené profily s reálnými fotkami. Praha, Brno, Ostrava.',
  keywords: 'BDSM, BDSM Praha, domina, domina Brno, SM privát, bondage, femdom, spanking Ostrava, dominatrix, mistress, BDSM studio Praha, domina služby, BDSM privát',
  openGraph: {
    title: 'BDSM Praha, Brno | Domina služby | EROSKO.CZ',
    description: 'BDSM služby, domina a SM privát v České republice. Profesionální dominy.',
    url: 'https://www.erosko.cz/bdsm',
    siteName: 'EROSKO.CZ',
    locale: 'cs_CZ',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.erosko.cz/bdsm',
  },
};

export default function BdsmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
