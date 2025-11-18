'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import ProfileCardGrid from '@/components/ProfileCardGrid';
import Breadcrumb from '@/components/Breadcrumb';
import { Search, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ProfileCard } from '@/types/profile-card';
import { profilesToCards } from '@/lib/profile-card-adapter';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract active filters from URL
  const getActiveFilters = () => {
    const filters: { key: string; label: string; value: string }[] = [];

    const city = searchParams.get('city');
    const region = searchParams.get('region');
    const services = searchParams.get('services');
    const hairColor = searchParams.get('hairColor');
    const eyeColor = searchParams.get('eyeColor');
    const breastSize = searchParams.get('breastSize');
    const bodyType = searchParams.get('bodyType');
    const ethnicity = searchParams.get('ethnicity');
    const tattoo = searchParams.get('tattoo');
    const piercing = searchParams.get('piercing');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const heightMin = searchParams.get('heightMin');
    const heightMax = searchParams.get('heightMax');
    const weightMin = searchParams.get('weightMin');
    const weightMax = searchParams.get('weightMax');

    if (city) filters.push({ key: 'city', label: 'Město', value: city });
    if (region) filters.push({ key: 'region', label: 'Kraj', value: region });
    if (services) {
      services.split(',').forEach(service => {
        filters.push({ key: 'services', label: 'Praktika', value: service });
      });
    }
    if (hairColor) filters.push({ key: 'hairColor', label: 'Barva vlasů', value: hairColor });
    if (eyeColor) filters.push({ key: 'eyeColor', label: 'Barva očí', value: eyeColor });
    if (breastSize) filters.push({ key: 'breastSize', label: 'Velikost prsou', value: breastSize });
    if (bodyType) filters.push({ key: 'bodyType', label: 'Typ postavy', value: bodyType });
    if (ethnicity) filters.push({ key: 'ethnicity', label: 'Národnost', value: ethnicity });
    if (tattoo) filters.push({ key: 'tattoo', label: 'Tetování', value: tattoo });
    if (piercing) filters.push({ key: 'piercing', label: 'Piercing', value: piercing });
    if (ageMin || ageMax) {
      filters.push({
        key: 'age',
        label: 'Věk',
        value: `${ageMin || '18'} - ${ageMax || '50'} let`
      });
    }
    if (heightMin || heightMax) {
      filters.push({
        key: 'height',
        label: 'Výška',
        value: `${heightMin || '150'} - ${heightMax || '190'} cm`
      });
    }
    if (weightMin || weightMax) {
      filters.push({
        key: 'weight',
        label: 'Váha',
        value: `${weightMin || '45'} - ${weightMax || '90'} kg`
      });
    }

    return filters;
  };

  const activeFilters = getActiveFilters();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);

        // Forward all search params to API
        const response = await fetch(`/api/profiles?${searchParams.toString()}`);
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

  const removeFilter = (filterKey: string, filterValue?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (filterKey === 'services' && filterValue) {
      // Remove specific service from comma-separated list
      const services = params.get('services')?.split(',') || [];
      const updated = services.filter(s => s !== filterValue);
      if (updated.length > 0) {
        params.set('services', updated.join(','));
      } else {
        params.delete('services');
      }
    } else if (filterKey === 'age') {
      params.delete('ageMin');
      params.delete('ageMax');
    } else if (filterKey === 'height') {
      params.delete('heightMin');
      params.delete('heightMax');
    } else if (filterKey === 'weight') {
      params.delete('weightMin');
      params.delete('weightMax');
    } else {
      params.delete(filterKey);
    }

    // Navigate to updated URL
    window.location.href = `/search?${params.toString()}`;
  };

  const clearAllFilters = () => {
    window.location.href = '/search';
  };

  return (
    <>
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumb items={[{ label: 'Výsledky vyhledávání' }]} />

          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6">
              <Search className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">
                {loading ? 'Vyhledávání...' : `${profiles.length} ${profiles.length === 1 ? 'profil' : profiles.length < 5 ? 'profily' : 'profilů'}`}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Výsledky vyhledávání</span>
            </h1>
            {activeFilters.length > 0 ? (
              <p className="text-xl text-gray-400">
                Filtrováno podle {activeFilters.length} {activeFilters.length === 1 ? 'kritéria' : activeFilters.length < 5 ? 'kritérií' : 'kritérií'}
              </p>
            ) : (
              <p className="text-xl text-gray-400">
                Všechny profily
              </p>
            )}
          </div>

          <div className="mb-8">
            <SearchBar pageType="home" />
          </div>

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">Aktivní filtry</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-400 hover:text-pink-400 flex items-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Vymazat vše
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <span
                    key={`${filter.key}-${index}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-pink-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-primary-200 hover:border-primary-300 transition-all"
                  >
                    <span className="text-xs text-gray-500">{filter.label}:</span>
                    <span className="font-semibold">{filter.value}</span>
                    <button
                      onClick={() => removeFilter(filter.key, filter.key === 'services' ? filter.value : undefined)}
                      className="hover:rotate-90 transition-transform"
                    >
                      <X className="w-4 h-4 text-primary-500 hover:text-pink-500" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-400">Načítání profilů...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-200 mb-2">Žádné výsledky</h3>
            <p className="text-gray-400 mb-6">
              Zkuste upravit filtry nebo vyhledat v jiné oblasti
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Vymazat všechny filtry
            </button>
          </div>
        </div>
      ) : (
        <ProfileCardGrid cards={profiles} />
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Načítání...</div>}>
        <SearchResultsContent />
      </Suspense>
      <Footer />
    </main>
  );
}
