import Header from '@/components/Header';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Generate metadata from database
export async function generateMetadata(): Promise<Metadata> {
  // Fetch homepage SEO data from database
  const homepageData = await prisma.staticPage.findFirst({
    where: { path: '/' },
  });

  // Fallback values if database has no data
  const title = homepageData?.seoTitle || 'Holky na sex, erotické masáže a BDSM z celé ČR ❤️ | EROSKO.CZ';
  const description = homepageData?.seoDescription || '💋 Přes 500+ ověřených holek na sex, erotické masáže a privát z celé ČR. ✨ Reálné fotky, kontakty bez zprostředkovatele. Praha, Brno, Ostrava a další města. 🔥';
  const keywords = homepageData?.keywords || 'holky na sex, holky na sex Praha, erotické masáže, privát, dívky na sex Brno, BDSM, domina, tantra masáž, společnice, holky Ostrava, masérky, na privát, ověřené holky, reálné fotky';

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: 'https://erosko.cz',
      siteName: 'EROSKO.CZ',
      locale: 'cs_CZ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: 'https://erosko.cz',
    },
  };
}

import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import TrustSignals from '@/components/TrustSignals';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import ProfileCardGrid from '@/components/ProfileCardGrid';
import { profilesToCards } from '@/lib/profile-card-adapter';

async function getProfiles() {
  const profiles = await prisma.profile.findMany({
    where: {
      approved: true,
    },
    include: {
      photos: {
        take: 1,
        orderBy: {
          order: 'asc',
        },
      },
      business: true,
    },
    take: 18,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return profilesToCards(profiles);
}

export default async function Home() {
  const cards = await getProfiles();

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />

      {/* Instagram-Style Profile Cards */}
      <section className="py-12 sm:py-16 lg:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Všechny erotické profily</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Prohlédněte si naše ověřené profily · {cards.length} profilů
            </p>
          </div>

          <ProfileCardGrid cards={cards} />
        </div>
      </section>

      {/* Subtle horizontal banner between sections */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AdBanner
          size="horizontal"
          title="Propagujte svůj profil"
          ctaText="Více informací"
          ctaUrl="/kontakt"
        />
      </section>

      <Categories />
      <TrustSignals />
      <HowItWorks />
      <Footer />
    </main>
  );
}
