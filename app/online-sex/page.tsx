'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchWithMap from '@/components/SearchWithMap';
import ProfileGrid from '@/components/ProfileGrid';
import { profiles } from '@/components/TopProfiles';
import { Video } from 'lucide-react';

export default function OnlineSexPage() {

  // Filter profiles with category "Digitální"
  let onlineSexProfiles = profiles.filter(profile => profile.category === 'Digitální');

  // Note: For online-sex page, the "city" filter actually represents online categories
  // (ONLYFANS CZ, CAM SHOW, etc.) - actual filtering logic would go here if needed

  return (
    <main className="min-h-screen">
      <Header />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <Video className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">{onlineSexProfiles.length} aktivních profilů</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Online sex</span>
            </h1>
            <p className="text-xl text-gray-400">
              Video hovory, cam show, OnlyFans a premium obsah s ověřenými profily
            </p>
          </div>

          {/* Search With Map and Category Buttons */}
          <SearchWithMap onlineMode={true} pageType="online-sex" />
        </div>
      </section>

      {/* Display filtered profiles */}
      {/* @ts-ignore */}
      <ProfileGrid profiles={onlineSexProfiles} />

      <Footer />
    </main>
  );
}
