'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { List, Map, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBarModern from './SearchBarModern';
import SexMap from './SexMap';

interface SearchWithMapProps {
  cityPrefix?: string;
  pageType?: string;
  businessMode?: boolean;
  onlineMode?: boolean;
}

function SearchWithMapContent({ cityPrefix = 'SEX', pageType, businessMode = false, onlineMode = false }: SearchWithMapProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const searchParams = useSearchParams();
  const currentCity = searchParams.get('city');

  const cityNames = [
    'PRAHA',
    'BRNO',
    'ČESKÉ BUDĚJOVICE',
    'ZLÍN',
    'MLADÁ BOLESLAV',
    'KARLOVY VARY',
    'PLZEŇ',
    'PARDUBICE',
    'OLOMOUC',
    'OSTRAVA',
    'LIBEREC',
    'HRADEC KRÁLOVÉ',
    'JIHLAVA',
    'ÚSTÍ NAD LABEM'
  ];

  const businessTypes = ['SALONY', 'PRIVATY', 'ESCORT AGENTURY'];

  const onlineCategories = [
    'ONLYFANS CZ',
    'FANSLY CZ',
    'CAM SHOW',
    'VIDEO HOVORY',
    'LIVE STREAM',
    'SEXTING',
    'TELEFONSEX',
    'PREMIUM OBSAH',
    'CAMGIRLS',
    'ČESKÉ CREATORKY'
  ];

  // Generate buttons based on mode
  const buttons = onlineMode
    ? onlineCategories.map(cat => ({ label: cat, city: cat }))
    : businessMode
    ? businessTypes.flatMap(type => cityNames.slice(0, 6).map(city => ({
        label: `${type} ${city}`,
        city: city,
        businessType: type
      })))
    : cityNames.map(city => ({ label: `${cityPrefix} ${city}`, city: city }));

  // Helper function to extract city name from button label
  const extractCityName = (label: string) => {
    // For "SEX PRAHA", "EROTICKÉ MASÁŽE PRAHA", etc., extract the city name (last part)
    const parts = label.split(' ');
    return parts[parts.length - 1];
  };

  // Generate URL based on page type
  const getCityUrl = (city: string) => {
    // Map pageType to URL path
    const pageUrls: Record<string, string> = {
      'holky-na-sex': '/holky-na-sex',
      'eroticke-masaze': '/eroticke-masaze',
      'bdsm': '/bdsm',
      'online-sex': '/online-sex',
      'eroticke-podniky': '/eroticke-podniky',
    };

    const basePath = pageType && pageUrls[pageType] ? pageUrls[pageType] : '/holky-na-sex';
    return `${basePath}?city=${encodeURIComponent(city)}`;
  };

  return (
    <div className="w-full">
      {/* Modern Search Bar */}
      <div className="mb-8">
        <SearchBarModern pageType={pageType} />
      </div>

      {/* City Carousel */}
      <div className="mb-8">
        <div className="relative max-w-6xl mx-auto">
          {/* Scrollable Container */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2 px-1">
              {buttons.map((button) => {
                const isActive = currentCity === button.city;
                return (
                  <Link
                    key={button.label}
                    href={getCityUrl(button.city)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-500/30'
                        : 'glass border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {button.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Gradient Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-dark-950 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-dark-950 to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Tab Switcher - Smaller */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'list'
                ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Seznam</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'map'
                ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Mapa</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'map' && (
        <div className="mt-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <SexMap />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchWithMap(props: SearchWithMapProps) {
  return (
    <Suspense fallback={<div className="w-full h-64 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>}>
      <SearchWithMapContent {...props} />
    </Suspense>
  );
}
