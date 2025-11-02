'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchWithMap from '@/components/SearchWithMap';
import ProfileGrid from '@/components/ProfileGrid';
import { profiles } from '@/components/TopProfiles';
import { Heart } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function HolkyNaSexPage() {
  const searchParams = useSearchParams();
  const cityFilter = searchParams.get('city');
  const serviceFilter = searchParams.get('service');
  const hairColorFilter = searchParams.get('hairColor');
  const bodyTypeFilter = searchParams.get('bodyType');
  const nationalityFilter = searchParams.get('nationality');
  const ageCategoryFilter = searchParams.get('ageCategory');
  const experienceLevelFilter = searchParams.get('experienceLevel');
  const breastTypeFilter = searchParams.get('breastType');
  const roleFilter = searchParams.get('role');

  // Filter profiles for "Holky na sex" category
  let holkyProfiles = profiles.filter(profile => profile.category === 'Holky na sex');

  // Apply city filter if present
  if (cityFilter) {
    holkyProfiles = holkyProfiles.filter(profile =>
      profile.location.toUpperCase().includes(cityFilter.toUpperCase())
    );
  }

  // Apply hair color filter
  if (hairColorFilter) {
    holkyProfiles = holkyProfiles.filter(profile =>
      (profile as any).hairColor === hairColorFilter
    );
  }

  // Apply body type filter
  if (bodyTypeFilter) {
    holkyProfiles = holkyProfiles.filter(profile =>
      (profile as any).bodyType === bodyTypeFilter
    );
  }

  // Apply nationality filter
  if (nationalityFilter) {
    holkyProfiles = holkyProfiles.filter(profile =>
      (profile as any).nationality === nationalityFilter
    );
  }

  // Apply age category filter
  if (ageCategoryFilter) {
    holkyProfiles = holkyProfiles.filter(profile =>
      (profile as any).ageCategory === ageCategoryFilter
    );
  }

  // Apply experience level filter
  if (experienceLevelFilter) {
    holkyProfiles = holkyProfiles.filter(profile =>
      (profile as any).experienceLevel === experienceLevelFilter
    );
  }

  // Apply breast type filter
  if (breastTypeFilter) {
    holkyProfiles = holkyProfiles.filter(profile =>
      (profile as any).breastType === breastTypeFilter
    );
  }

  // Apply role filter
  if (roleFilter) {
    holkyProfiles = holkyProfiles.filter(profile =>
      (profile as any).roles?.includes(roleFilter)
    );
  }

  // Apply service filter if present
  // Note: This requires profiles to have a 'services' array field
  // For now, we'll just pass it through - actual filtering will work when data is updated
  if (serviceFilter) {
    // TODO: Filter by service when profile data includes services array
    // holkyProfiles = holkyProfiles.filter(profile =>
    //   profile.services?.includes(serviceFilter)
    // );
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4 text-primary-400" fill="currentColor" />
              <span className="text-sm font-medium">{holkyProfiles.length} aktivních profilů</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Holky na sex</span>
            </h1>
            <p className="text-xl text-gray-400">
              Profesionální escort služby a doprovod s ověřenými profily
            </p>
          </div>

          {/* Search With Map */}
          <SearchWithMap cityPrefix="SEX" pageType="holky-na-sex" />
        </div>
      </section>

      {/* Display filtered profiles */}
      <ProfileGrid profiles={holkyProfiles} />

      <Footer />
    </main>
  );
}
