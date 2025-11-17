'use client';

import { Search, MapPin, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { czechCities } from '@/lib/cities-data';

const categories = [
  'Erotické masáže',
  'Holky na sex',
  'Online sex',
  'Priváty',
  'Podniky',
  'BDSM',
];

const regions = [
  'Hlavní město Praha',
  'Středočeský kraj',
  'Jihočeský kraj',
  'Plzeňský kraj',
  'Karlovarský kraj',
  'Ústecký kraj',
  'Liberecký kraj',
  'Královéhradecký kraj',
  'Pardubický kraj',
  'Kraj Vysočina',
  'Jihomoravský kraj',
  'Olomoucký kraj',
  'Zlínský kraj',
  'Moravskoslezský kraj',
];

// Oblíbené praktiky/služby pro každou stránku
const popularPractices = {
  home: [
    'Klasický sex', 'Orální sex', 'Anální sex', '69', 'French kiss',
    'Striptýz', 'Masáž', 'Happy end', 'Body to body', 'Girlfriend experience',
    'Tantra', 'Squirting', 'Fisting', 'BDSM'
  ],
  escort: [
    'Klasický sex', 'Orální sex', 'Anální sex', '69', 'French kiss',
    'Striptýz', 'Girlfriend experience', 'Squirting', 'Fisting',
    'Závěrečná ejakulace', 'Role play', 'Foot fetish', 'Toys', 'Dvojitá penetrace'
  ],
  masaze: [
    'Klasická masáž', 'Erotická masáž', 'Tantra', 'Body to body',
    'Nuru masáž', 'Happy end', 'Prostatická masáž', 'Thajská masáž',
    'Masáž 4 ruky', 'Lingam masáž', 'Yoni masáž', 'Párovka'
  ],
  'online-sex': [
    'Webcam show', 'Video chat', 'Sexting', 'Dick rating',
    'Custom content', 'Joi', 'Role play', 'Virtual girlfriend',
    'Live stream', 'Private show', 'Feet content', 'Cosplay'
  ],
  podniky: [
    'Erotické masáže', 'Escort', 'BDSM', 'Striptýz',
    'Privát', 'VIP balíčky', 'Párové masáže', 'Relax zóna'
  ]
};

interface SearchBarProps {
  pageType?: string;
}

export default function SearchBar({ pageType = 'home' }: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showPracticesModal, setShowPracticesModal] = useState(false);
  const [showDetailedFilters, setShowDetailedFilters] = useState(false);

  // Detailed filters state
  const [hairColor, setHairColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [breastSize, setBreastSize] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [tattoo, setTattoo] = useState('');
  const [piercing, setPiercing] = useState('');
  const [ageRange, setAgeRange] = useState({ min: 18, max: 50 });
  const [heightRange, setHeightRange] = useState({ min: 150, max: 190 });
  const [weightRange, setWeightRange] = useState({ min: 45, max: 90 });

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const togglePractice = (practice: string) => {
    if (selectedPractices.includes(practice)) {
      setSelectedPractices(selectedPractices.filter(p => p !== practice));
    } else {
      setSelectedPractices([...selectedPractices, practice]);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    // Add city filter
    if (selectedCity) params.set('city', selectedCity);
    if (selectedRegion && !selectedCity) params.set('region', selectedRegion);

    // Add practices/services
    if (selectedPractices.length > 0) {
      params.set('services', selectedPractices.join(','));
    }

    // Add detailed filters
    if (hairColor) params.set('hairColor', hairColor);
    if (eyeColor) params.set('eyeColor', eyeColor);
    if (breastSize) params.set('breastSize', breastSize);
    if (bodyType) params.set('bodyType', bodyType);
    if (ethnicity) params.set('ethnicity', ethnicity);
    if (tattoo) params.set('tattoo', tattoo);
    if (piercing) params.set('piercing', piercing);

    // Add age range (only if changed from default)
    if (ageRange.min !== 18 || ageRange.max !== 50) {
      params.set('ageMin', ageRange.min.toString());
      params.set('ageMax', ageRange.max.toString());
    }

    // Add height range (only if changed from default)
    if (heightRange.min !== 150 || heightRange.max !== 190) {
      params.set('heightMin', heightRange.min.toString());
      params.set('heightMax', heightRange.max.toString());
    }

    // Add weight range (only if changed from default)
    if (weightRange.min !== 45 || weightRange.max !== 90) {
      params.set('weightMin', weightRange.min.toString());
      params.set('weightMax', weightRange.max.toString());
    }

    // Navigate to search results
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPractices([]);
    setSelectedRegion('');
    setSelectedCity('');
    setSearchQuery('');
    setHairColor('');
    setEyeColor('');
    setBreastSize('');
    setBodyType('');
    setEthnicity('');
    setTattoo('');
    setPiercing('');
    setAgeRange({ min: 18, max: 50 });
    setHeightRange({ min: 150, max: 190 });
    setWeightRange({ min: 45, max: 90 });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar - 3 fields like banging.cz */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-pink-500 to-purple-500 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity"></div>

        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-2">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Kraj/Město dropdown */}
            <div className="flex-1 relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-700 font-semibold outline-none hover:border-primary-300 focus:border-primary-500 transition-all cursor-pointer appearance-none"
              >
                <option value="">Celá ČR</option>
                <optgroup label="Kraje">
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region.replace(' kraj', '').replace('Hlavní město ', '')}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Města">
                  {czechCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </optgroup>
              </select>
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Praktiky button/modal */}
            <button
              onClick={() => setShowPracticesModal(!showPracticesModal)}
              className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all text-left relative ${
                selectedPractices.length > 0
                  ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              <span>
                {selectedPractices.length > 0
                  ? `${selectedPractices.length} ${selectedPractices.length === 1 ? 'praktika' : selectedPractices.length < 5 ? 'praktiky' : 'praktik'}`
                  : 'Praktiky'}
              </span>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" />
            </button>

            {/* Detailed Filters button */}
            <button
              onClick={() => setShowDetailedFilters(!showDetailedFilters)}
              className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all text-left relative ${
                hairColor || eyeColor || breastSize || bodyType || ethnicity || tattoo || piercing || ageRange.min !== 18 || ageRange.max !== 50 || heightRange.min !== 150 || heightRange.max !== 190
                  ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              <span>Filtry</span>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" />
            </button>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-pink-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:shadow-2xl hover:shadow-primary-500/50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Hledat
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Practices Modal */}
      {showPracticesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowPracticesModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Vyberte praktiky</h3>
              <button
                onClick={() => setShowPracticesModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(popularPractices[pageType as keyof typeof popularPractices] || popularPractices.home).map((practice, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedPractices.includes(practice)
                      ? 'bg-gradient-to-r from-primary-50 to-pink-50 border-2 border-primary-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPractices.includes(practice)}
                    onChange={() => togglePractice(practice)}
                    className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{practice}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedPractices([])}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Vymazat vše
              </button>
              <button
                onClick={() => setShowPracticesModal(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Použít filtry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Filters Modal */}
      {showDetailedFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowDetailedFilters(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Podrobné filtry</h3>
              <button
                onClick={() => setShowDetailedFilters(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Hair Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Barva vlasů</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Blond', 'Hnědá', 'Černá', 'Zrzavá', 'Jiná'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setHairColor(hairColor === color ? '' : color)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        hairColor === color
                          ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eye Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Barva očí</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Modré', 'Zelené', 'Hnědé', 'Šedé', 'Jiné'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setEyeColor(eyeColor === color ? '' : color)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        eyeColor === color
                          ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breast Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Velikost prsou</label>
                <div className="grid grid-cols-4 gap-2">
                  {['1', '2', '3', '4'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBreastSize(breastSize === size ? '' : size)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        breastSize === size
                          ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Typ postavy</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Štíhlá', 'Atletická', 'Průměrná', 'Kulatá', 'Plus size'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setBodyType(bodyType === type ? '' : type)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        bodyType === type
                          ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ethnicity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Národnost/Etnikum</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Česká', 'Slovenská', 'Polská', 'Ukrajinská', 'Ruská', 'Asijská', 'Latina', 'Africká', 'Jiná'].map((eth) => (
                    <button
                      key={eth}
                      onClick={() => setEthnicity(ethnicity === eth ? '' : eth)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        ethnicity === eth
                          ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {eth}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tattoo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Tetování</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Ano', 'Ne', 'Malé'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTattoo(tattoo === opt ? '' : opt)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        tattoo === opt
                          ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Piercing */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Piercing</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Ano', 'Ne', 'Jen uši'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPiercing(piercing === opt ? '' : opt)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        piercing === opt
                          ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Věk: {ageRange.min} - {ageRange.max} let
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={ageRange.min}
                    onChange={(e) => setAgeRange({ ...ageRange, min: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={ageRange.max}
                    onChange={(e) => setAgeRange({ ...ageRange, max: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Height Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Výška: {heightRange.min} - {heightRange.max} cm
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="150"
                    max="190"
                    value={heightRange.min}
                    onChange={(e) => setHeightRange({ ...heightRange, min: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="150"
                    max="190"
                    value={heightRange.max}
                    onChange={(e) => setHeightRange({ ...heightRange, max: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Weight Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Váha: {weightRange.min} - {weightRange.max} kg
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="45"
                    max="90"
                    value={weightRange.min}
                    onChange={(e) => setWeightRange({ ...weightRange, min: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="45"
                    max="90"
                    value={weightRange.max}
                    onChange={(e) => setWeightRange({ ...weightRange, max: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setHairColor('');
                  setEyeColor('');
                  setBreastSize('');
                  setBodyType('');
                  setEthnicity('');
                  setTattoo('');
                  setPiercing('');
                  setAgeRange({ min: 18, max: 50 });
                  setHeightRange({ min: 150, max: 190 });
                  setWeightRange({ min: 45, max: 90 });
                }}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Vymazat vše
              </button>
              <button
                onClick={() => setShowDetailedFilters(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Použít filtry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 relative group/panel">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-pink-500 to-purple-500 rounded-3xl opacity-10 blur-xl"></div>
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
                    <Filter className="w-4 h-4 text-white" />
                  </span>
                  Kategorie služeb
                </h3>
              </div>
              {selectedCategories.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-500 hover:text-pink-500 flex items-center gap-1 font-semibold transition-colors"
                >
                  <X className="w-4 h-4" />
                  Vymazat
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`relative overflow-hidden px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    selectedCategories.includes(category)
                      ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(selectedCategories.length > 0 || selectedCity || selectedRegion) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedRegion && (
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-pink-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-primary-200 hover:border-primary-300 transition-all">
              <MapPin className="w-4 h-4 text-primary-500" />
              {selectedRegion}
              <button onClick={() => setSelectedRegion('')} className="hover:rotate-90 transition-transform">
                <X className="w-4 h-4 text-primary-500 hover:text-pink-500" />
              </button>
            </span>
          )}
          {selectedCity && (
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-pink-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-primary-200 hover:border-primary-300 transition-all">
              <MapPin className="w-4 h-4 text-primary-500" />
              {selectedCity}
              <button onClick={() => setSelectedCity('')} className="hover:rotate-90 transition-transform">
                <X className="w-4 h-4 text-primary-500 hover:text-pink-500" />
              </button>
            </span>
          )}
          {selectedCategories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-pink-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-primary-200 hover:border-primary-300 transition-all"
            >
              {category}
              <button onClick={() => toggleCategory(category)} className="hover:rotate-90 transition-transform">
                <X className="w-4 h-4 text-primary-500 hover:text-pink-500" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
