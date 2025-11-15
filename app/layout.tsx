import type { Metadata } from "next";
import "./globals.css";
import "./profile-cards.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "EROSKO.CZ - Prémiové Erotické Služby v ČR",
  description: "Nejlepší platforma pro erotické služby, escort, masáže a soukromé služby v České republice. Ověřené profily, diskrétní a bezpečné.",
  keywords: "erotické služby, escort, erotické masáže, priváty, BDSM, escort Praha, escort Brno",
  openGraph: {
    title: "EROSKO.CZ - Prémiové Erotické Služby",
    description: "Nejlepší platforma pro erotické služby v ČR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
