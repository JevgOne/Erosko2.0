'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchWithMap from '@/components/SearchWithMap';
import ProfileCardGrid from '@/components/ProfileCardGrid';
import Breadcrumb from '@/components/Breadcrumb';
import { Heart } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ProfileCard } from '@/types/profile-card';
import { profilesToCards } from '@/lib/profile-card-adapter';

function HolkyNaSexContent() {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const city = searchParams.get('city');

        const params = new URLSearchParams();
        params.set('category', 'HOLKY_NA_SEX');
        if (city) params.set('city', city);

        const response = await fetch(`/api/profiles?${params.toString()}`);
        const data = await response.json();

        if (data.profiles) {
          const cards = profilesToCards(data.profiles);
          setProfiles(cards);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [searchParams]);

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
              <span className="text-sm font-medium">{profiles.length} aktivních profilů</span>
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

      {loading ? (
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-400">Načítání profilů...</p>
        </div>
      ) : (
        <ProfileCardGrid cards={profiles} />
      )}
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
