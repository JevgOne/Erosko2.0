import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Holky na sex Praha, Brno, Ostrava | Přes 300+ ověřených holek ❤️ | EROSKO.CZ',
  description: '💋 Najděte holky na sex ve vašem městě. ✨ Přes 300+ ověřených profilů s reálnými fotkami a kontakty bez zprostředkovatele. 📍 Praha, Brno, Ostrava, Plzeň a další města.',
  keywords: 'holky na sex, holky na sex Praha, dívky na sex Brno, holky Ostrava, sex Praha, na privát, ověřené holky, reálné fotky, call girls, společnice, GFE, doprovod, holky Plzeň, sex holky',
  openGraph: {
    title: 'Dívky na sex Praha, Brno, Ostrava | EROSKO.CZ',
    description: 'Najděte dívky na sex ve vašem městě. Ověřené profily společnic s fotkami a kontakty.',
    url: 'https://www.erosko.cz/holky-na-sex',
    siteName: 'EROSKO.CZ',
    locale: 'cs_CZ',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.erosko.cz/holky-na-sex',
  },
};

export default function HolkyNaSexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
