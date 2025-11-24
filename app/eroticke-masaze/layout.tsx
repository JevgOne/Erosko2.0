import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Erotické masáže Praha, Brno | Tantra, nuru masáž 💆 | EROSKO.CZ',
  description: '💆 Přes 150+ ověřených masérek a masážních salonů. ✨ Erotické, tantrické a nuru masáže. 🌸 Reálné fotky, kontakty. Praha, Brno, Ostrava a další města.',
  keywords: 'erotické masáže, erotické masáže Praha, tantra masáž, nuru masáž Brno, body to body, masážní salon, maséřky, tantrická masáž Ostrava, relaxační masáž, masáž Praha, erotický salon',
  openGraph: {
    title: 'Erotické masáže Praha, Brno, Ostrava | Tantra | EROSKO.CZ',
    description: 'Erotické a tantrické masáže v ČR. Profesionální maséřky a masážní salony.',
    url: 'https://www.erosko.cz/eroticke-masaze',
    siteName: 'EROSKO.CZ',
    locale: 'cs_CZ',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.erosko.cz/eroticke-masaze',
  },
};

export default function ErotickeMasazeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
