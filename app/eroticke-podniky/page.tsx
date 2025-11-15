'use client';

import { Suspense, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchWithMap from '@/components/SearchWithMap';
import BusinessCardGrid from '@/components/BusinessCardGrid';
import Breadcrumb from '@/components/Breadcrumb';
import { Building2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { BusinessCard } from '@/types/business-card';
import { businessesToBusinessCards } from '@/lib/adapters/business-card-adapter';

function ErotickePodnikyContent() {
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const city = searchParams.get('city');
        const type = searchParams.get('type');

        const params = new URLSearchParams();
        if (city) params.set('city', city);
        if (type) params.set('type', type);

        const response = await fetch(`/api/businesses?${params.toString()}`);
        const data = await response.json();

        if (data.businesses) {
          const businessCards = businessesToBusinessCards(data.businesses);
          setBusinesses(businessCards);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [searchParams]);

  return (
    <>
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumb items={[{ label: 'Erotické podniky' }]} />

          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <Building2 className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">Prémiové podniky</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Erotické podniky</span>
            </h1>
            <p className="text-xl text-gray-400">
              Sauny, salóny a agentury s ověřenými profily
            </p>
          </div>

          <SearchWithMap cityPrefix="Podniky" pageType="eroticke-podniky" />
        </div>
      </section>

      {loading ? (
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-400">Načítání podniků...</p>
        </div>
      ) : (
        <BusinessCardGrid businesses={businesses} />
      )}
    </>
  );
}

export default function ErotickePodnikyPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Načítání...</div>}>
        <ErotickePodnikyContent />
      </Suspense>
      <Footer />
    </main>
  );
}
