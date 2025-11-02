'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchWithMap from '@/components/SearchWithMap';
import BusinessGrid from '@/components/BusinessGrid';
import { profiles } from '@/components/TopProfiles';
import { Building2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function PodnikyPage() {
  const searchParams = useSearchParams();
  const cityFilter = searchParams.get('city');
  const typeFilter = searchParams.get('type');

  // Map business type labels to profile types
  const getProfileType = (typeLabel: string) => {
    switch (typeLabel.toUpperCase()) {
      case 'SALONY':
        return 'salon';
      case 'PRIVATY':
        return 'privat';
      case 'ESCORT AGENTURY':
        return 'escort_agency';
      case 'SWINGERS KLUBY':
        return 'swingers_club';
      case 'NIGHT KLUBY':
        return 'night_club';
      case 'STRIP KLUBY':
        return 'strip_club';
      default:
        return null;
    }
  };

  // Filter all business types including new club types
  let podnikyProfiles = profiles.filter(profile =>
    profile.profileType === 'salon' ||
    profile.profileType === 'privat' ||
    profile.profileType === 'escort_agency' ||
    profile.profileType === 'digital_agency' ||
    profile.profileType === 'swingers_club' ||
    profile.profileType === 'night_club' ||
    profile.profileType === 'strip_club'
  );

  // Apply business type filter if present
  if (typeFilter) {
    const profileType = getProfileType(typeFilter);
    if (profileType) {
      podnikyProfiles = podnikyProfiles.filter(profile =>
        profile.profileType === profileType
      );
    }
  }

  // Apply city filter if present
  if (cityFilter) {
    podnikyProfiles = podnikyProfiles.filter(profile =>
      profile.location.toUpperCase().includes(cityFilter.toUpperCase())
    );
  }

  // Count unique businesses
  const uniqueBusinesses = new Set(podnikyProfiles.map(p => p.businessName)).size;

  return (
    <main className="min-h-screen">
      <Header />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <Building2 className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">{uniqueBusinesses} aktivních podniků</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Erotické podniky</span>
            </h1>
            <p className="text-xl text-gray-400">
              Erotické kluby, salony a agentury s ověřenými profily
            </p>
          </div>

          {/* Search With Map and Business Type Buttons */}
          <SearchWithMap businessMode={true} pageType="podniky" />
        </div>
      </section>

      {/* Display business cards */}
      <BusinessGrid profiles={podnikyProfiles} />

      <Footer />
    </main>
  );
}
