'use client';

import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchWithMap from '@/components/SearchWithMap';
import ProfileGrid from '@/components/ProfileGrid';
import Breadcrumb from '@/components/Breadcrumb';
import { profiles } from '@/components/TopProfiles';
import { Heart } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { Profile } from '@prisma/client';

function HolkyNaSexContent() {
  const searchParams = useSearchParams();
  const cityFilter = searchParams.get('city');
  const serviceFilter = searchParams.get('service');

  let escortProfiles = profiles.filter(profile => profile.category === 'Holka na sex');

  if (cityFilter) {
    escortProfiles = escortProfiles.filter(profile =>
      profile.location.toUpperCase().includes(cityFilter.toUpperCase())
    );
  }

  if (serviceFilter) {
    // TODO: Filter by service when profile data includes services array
  }

  return (
    <>
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumb items={[{ label: 'Holky na sex' }]} />

          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">{escortProfiles.length} aktivních profilů</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Holky na sex</span>
            </h1>
            <p className="text-xl text-gray-400">
              Escort služby s ověřenými profily
            </p>
          </div>

          <SearchWithMap cityPrefix="Escort" pageType="holky-na-sex" />
        </div>
      </section>

      {/* @ts-ignore */}
      <ProfileGrid profiles={escortProfiles} />
    </>
  );
}

export default function HolkyNaSexPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Načítání...</div>}>
        <HolkyNaSexContent />
      </Suspense>
      <Footer />
    </main>
  );
}
