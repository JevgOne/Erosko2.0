'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchWithMap from '@/components/SearchWithMap';
import ProfileGrid from '@/components/ProfileGrid';
import { profiles } from '@/components/TopProfiles';
import { Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ErotickeMasazePage() {
  const searchParams = useSearchParams();
  const cityFilter = searchParams.get('city');
  const serviceFilter = searchParams.get('service');

  // Filter profiles for "Erotické masérky" category
  let masazeProfiles = profiles.filter(profile => profile.category === 'Erotické masérky');

  // Apply city filter if present
  if (cityFilter) {
    masazeProfiles = masazeProfiles.filter(profile =>
      profile.location.toUpperCase().includes(cityFilter.toUpperCase())
    );
  }

  // Apply service filter if present
  if (serviceFilter) {
    // TODO: Filter by service when profile data includes services array
    // masazeProfiles = masazeProfiles.filter(profile =>
    //   profile.services?.includes(serviceFilter)
    // );
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">{masazeProfiles.length} aktivních profilů</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Erotické masáže</span>
            </h1>
            <p className="text-xl text-gray-400">
              Relaxační a erotické masáže s profesionálními masérkami
            </p>
          </div>

          {/* Search With Map */}
          <SearchWithMap cityPrefix="MASÁŽE" pageType="eroticke-masaze" />
        </div>
      </section>

      {/* Display filtered profiles */}
      <ProfileGrid profiles={masazeProfiles} />

      <Footer />
    </main>
  );
}
