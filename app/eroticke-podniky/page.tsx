'use client';

import { useState, useEffect} from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchWithMap from '@/components/SearchWithMap';
import BusinessGrid from '@/components/BusinessGrid';
import Breadcrumb from '@/components/Breadcrumb';
import { Building2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function PodnikyPage() {
  const searchParams = useSearchParams();
  const cityFilter = searchParams.get('city');
  const typeFilter = searchParams.get('type');

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Map business type labels to profile types
  const getProfileType = (typeLabel: string) => {
    switch (typeLabel.toUpperCase()) {
      case 'SALONY':
        return 'MASSAGE_SALON';
      case 'PRIVATY':
        return 'PRIVAT';
      case 'ESCORT AGENTURY':
        return 'ESCORT_AGENCY';
      case 'SWINGERS KLUBY':
        return 'SWINGERS_CLUB';
      case 'NIGHT KLUBY':
        return 'NIGHT_CLUB';
      case 'STRIP KLUBY':
        return 'STRIP_CLUB';
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cityFilter) params.append('city', cityFilter);
        if (typeFilter) {
          const profileType = getProfileType(typeFilter);
          if (profileType) params.append('type', profileType);
        }

        const response = await fetch(`/api/businesses?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data.businesses || []);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [cityFilter, typeFilter]);

  // Convert businesses to profile format for BusinessGrid
  const podnikyProfiles = businesses.map(business => ({
    id: business.id,
    name: business.name,
    businessName: business.name,
    slug: business.slug,
    location: `${business.city}, centrum`,
    city: business.city,
    phone: business.phone,
    description: business.description,
    profileType: business.profileType.toLowerCase().replace('_', '_'),
    verified: business.verified,
    isNew: business.isNew,
    isPopular: business.isPopular,
    rating: business.rating,
    reviewCount: business.reviewCount,
    viewCount: business.viewCount,
    photos: business.photos,
    profiles: business.profiles,
  }));

  const uniqueBusinesses = businesses.length;

  return (
    <main className="min-h-screen">
      <Header />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumb items={[{ label: 'Erotické podniky' }]} />

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
      {/* @ts-ignore */}
      <BusinessGrid profiles={podnikyProfiles} />

      <Footer />
    </main>
  );
}
