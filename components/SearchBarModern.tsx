'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';

interface SearchBarModernProps {
  pageType?: string;
}

export default function SearchBarModern({ pageType = 'holky-na-sex' }: SearchBarModernProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Celá ČR');
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);

  const cities = [
    'Celá ČR',
    'Praha',
    'Brno',
    'České Budějovice',
    'Zlín',
    'Mladá Boleslav',
    'Karlovy Vary',
    'Plzeň',
    'Pardubice',
    'Olomouc',
    'Ostrava',
    'Liberec',
    'Hradec Králové',
    'Jihlava',
    'Ústí nad Labem'
  ];

  const practices = [
    'Klasický sex',
    'Orální sex',
    'Anální sex',
    'Masáže',
    'BDSM',
    'Erotické masáže',
    'Tantrické masáže',
    'Eskort',
    'Girlfriend Experience (GFE)',
    'Role play',
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity !== 'Celá ČR') params.set('city', selectedCity.toUpperCase());
    if (selectedPractices.length > 0) params.set('practices', selectedPractices.join(','));

    const url = `/${pageType}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(url);
    setShowFilters(false);
  };

  const togglePractice = (practice: string) => {
    setSelectedPractices(prev =>
      prev.includes(practice)
        ? prev.filter(p => p !== practice)
        : [...prev, practice]
    );
  };

  const clearFilters = () => {
    setSelectedCity('Celá ČR');
    setSelectedPractices([]);
    setSearchQuery('');
  };

  const activeFiltersCount =
    (selectedCity !== 'Celá ČR' ? 1 : 0) +
    selectedPractices.length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Box */}
      <div className="glass rounded-2xl p-2 border border-white/20 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2">
          {/* Search Icon */}
          <div className="pl-4">
            <Search className="w-5 h-5 text-gray-400" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Hledat podle jména, služeb, lokace..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 px-2 py-3"
          />

          {/* City Display */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/10">
            <MapPin className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-gray-300">{selectedCity}</span>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              showFilters || activeFiltersCount > 0
                ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtry</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all"
          >
            Hledat
          </button>
        </div>
      </div>

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          <span className="text-xs text-gray-400">Aktivní filtry:</span>
          {selectedCity !== 'Celá ČR' && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm">
              <MapPin className="w-3 h-3" />
              <span>{selectedCity}</span>
              <button
                onClick={() => setSelectedCity('Celá ČR')}
                className="ml-1 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {selectedPractices.map(practice => (
            <div
              key={practice}
              className="flex items-center gap-1 px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-sm"
            >
              <span>{practice}</span>
              <button
                onClick={() => togglePractice(practice)}
                className="ml-1 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Vymazat vše
          </button>
        </div>
      )}

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowFilters(false)}>
          <div
            className="w-full max-w-3xl glass rounded-3xl p-8 border border-white/20 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">Filtry vyhledávání</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* City Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                📍 Město
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {cities.map(city => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      selectedCity === city
                        ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Practices Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                💋 Praktiky ({selectedPractices.length} vybráno)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {practices.map(practice => (
                  <button
                    key={practice}
                    onClick={() => togglePractice(practice)}
                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all text-left ${
                      selectedPractices.includes(practice)
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {practice}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-6 border-t border-white/10">
              <button
                onClick={clearFilters}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
              >
                Vymazat vše
              </button>
              <button
                onClick={handleSearch}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all"
              >
                Použít filtry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
