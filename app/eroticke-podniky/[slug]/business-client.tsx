'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface BusinessPhoto {
  id: string;
  url: string;
  thumbnail: string;
  order: number;
  category: 'interior' | 'exterior' | 'facility' | 'room';
}

interface Profile {
  id: string;
  slug: string;
  name: string;
  photo: string;
  age: number;
  online: boolean;
  verified: boolean;
  rating: {
    average: number;
    count: number;
  };
  category: string;
  location: {
    city: string;
    area: string;
  };
  phone: string;
  isNew?: boolean;
}

interface Review {
  id: string;
  overallRating: number;
  vibeRatings: {
    atmosphere: number;
    cleanliness: number;
    service: number;
    discretion: number;
    valueForMoney: number;
  };
  author: string;
  date: string;
  text: string;
  verified: boolean;
  helpful: number;
}

interface Business {
  id: string;
  slug: string;
  name: string;
  verified: boolean;
  type: 'salon' | 'privat' | 'club' | 'bdsm' | 'studio' | 'hotel';
  typeLabel: string;
  typeIcon: string;

  description: {
    short: string;
    full: string;
  };

  location: {
    address: string;
    city: string;
    district: string;
    region: string;
    latitude: number;
    longitude: number;
    parking: boolean;
    parkingDetails?: string;
  };

  contact: {
    phone: string;
    phoneVerified: boolean;
    whatsapp?: string;
    telegram?: string;
    email?: string;
    website?: string;
  };

  media: {
    logo?: string;
    photos: BusinessPhoto[];
  };

  workingHours: {
    [key: string]: {
      open: string;
      close: string;
      available: boolean;
    };
  };

  facilities: {
    amenities: string[];
    rooms: number;
    private: boolean;
    discreet: boolean;
    accessibility: boolean;
    languages: string[];
  };

  profiles: Profile[];

  reviews: {
    overall: {
      average: number;
      count: number;
    };
    vibe: {
      atmosphere: number;
      cleanliness: number;
      service: number;
      discretion: number;
      valueForMoney: number;
    };
    items: Review[];
  };

  stats: {
    views: number;
    favorites: number;
    profilesCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockBusiness: Business = {
  id: '1',
  slug: 'luxusni-relax-salon',
  name: 'Luxusní Relax Salon',
  verified: true,
  type: 'salon',
  typeLabel: 'Masážní Salon',
  typeIcon: '🏢',

  description: {
    short: 'Prestižní wellness centrum v srdci Prahy',
    full: 'Vítejte v Luxusním Relax Salonu - prestižním wellness centru v srdci Prahy. Nabízíme kompletní škálu relaxačních a masážních služeb v diskrétním a luxusním prostředí. Náš profesionální tým zajišťuje nejvyšší standard služeb pro náročnou klientelu. Moderní interiér, absolutní diskrétnost a bezkonkurenční zážitek.'
  },

  location: {
    address: 'Václavské náměstí 15',
    city: 'Praha',
    district: 'Nové Město',
    region: 'Praha 1',
    latitude: 50.0815,
    longitude: 14.4274,
    parking: true,
    parkingDetails: 'Parkování v ulici i placené parkoviště poblíž'
  },

  contact: {
    phone: '+420 777 123 456',
    phoneVerified: true,
    whatsapp: '+420777123456',
    telegram: '@luxusrelax',
    email: 'info@luxusrelax.cz',
    website: 'https://luxusrelax.cz'
  },

  media: {
    logo: 'https://via.placeholder.com/80x80/ff0066/ffffff?text=LR',
    photos: Array.from({ length: 12 }, (_, i) => ({
      id: `photo-${i + 1}`,
      url: `https://via.placeholder.com/800x450/1a1a1a/666666?text=Foto+${i + 1}`,
      thumbnail: `https://via.placeholder.com/150x150/1a1a1a/666666?text=${i + 1}`,
      order: i,
      category: i < 3 ? 'interior' : i < 6 ? 'room' : i < 9 ? 'facility' : 'exterior'
    }))
  },

  workingHours: {
    monday: { open: '10:00', close: '22:00', available: true },
    tuesday: { open: '10:00', close: '22:00', available: true },
    wednesday: { open: '10:00', close: '22:00', available: true },
    thursday: { open: '10:00', close: '22:00', available: true },
    friday: { open: '10:00', close: '23:00', available: true },
    saturday: { open: '12:00', close: '23:00', available: true },
    sunday: { open: '00:00', close: '00:00', available: false }
  },

  facilities: {
    amenities: ['wifi', 'parking', 'shower', 'drinks', 'jacuzzi', 'sauna', 'ac', 'discreet'],
    rooms: 5,
    private: true,
    discreet: true,
    accessibility: true,
    languages: ['cs', 'en', 'de']
  },

  profiles: [
    {
      id: '1',
      slug: 'kristyna-25',
      name: 'Kristýna',
      photo: 'https://via.placeholder.com/300x400/2d3561/ffffff?text=K',
      age: 25,
      online: true,
      verified: true,
      rating: { average: 4.8, count: 24 },
      category: 'EROTICKÉ MASÁŽE',
      location: { city: 'Praha', area: 'Praha 1 - Nové Město' },
      phone: '+420 777 111 222',
      isNew: true
    },
    {
      id: '2',
      slug: 'veronika-28',
      name: 'Veronika',
      photo: 'https://via.placeholder.com/300x400/2d3561/ffffff?text=V',
      age: 28,
      online: true,
      verified: true,
      rating: { average: 4.9, count: 31 },
      category: 'EROTICKÉ MASÁŽE',
      location: { city: 'Praha', area: 'Praha 1 - Staré Město' },
      phone: '+420 777 222 333',
      isNew: true
    },
    {
      id: '3',
      slug: 'simona-23',
      name: 'Simona',
      photo: 'https://via.placeholder.com/300x400/2d3561/ffffff?text=S',
      age: 23,
      online: false,
      verified: true,
      rating: { average: 4.7, count: 18 },
      category: 'EROTICKÉ MASÁŽE',
      location: { city: 'Praha', area: 'Praha 1 - Nové Město' },
      phone: '+420 777 333 444'
    },
    {
      id: '4',
      slug: 'natalie-26',
      name: 'Natálie',
      photo: 'https://via.placeholder.com/300x400/2d3561/ffffff?text=N',
      age: 26,
      online: true,
      verified: false,
      rating: { average: 4.6, count: 15 },
      category: 'EROTICKÉ MASÁŽE',
      location: { city: 'Praha', area: 'Praha 2 - Vinohrady' },
      phone: '+420 777 444 555'
    },
    {
      id: '5',
      slug: 'andrea-29',
      name: 'Andrea',
      photo: 'https://via.placeholder.com/300x400/2d3561/ffffff?text=A',
      age: 29,
      online: false,
      verified: true,
      rating: { average: 4.9, count: 42 },
      category: 'EROTICKÉ MASÁŽE',
      location: { city: 'Praha', area: 'Praha 3 - Žižkov' },
      phone: '+420 777 555 666'
    },
    {
      id: '6',
      slug: 'petra-24',
      name: 'Petra',
      photo: 'https://via.placeholder.com/300x400/2d3561/ffffff?text=P',
      age: 24,
      online: true,
      verified: false,
      rating: { average: 4.8, count: 19 },
      category: 'EROTICKÉ MASÁŽE',
      location: { city: 'Praha', area: 'Praha 1 - Staré Město' },
      phone: '+420 777 666 777',
      isNew: true
    }
  ],

  reviews: {
    overall: {
      average: 4.6,
      count: 238
    },
    vibe: {
      atmosphere: 4.6,
      cleanliness: 4.8,
      service: 4.4,
      discretion: 4.7,
      valueForMoney: 4.1
    },
    items: [
      {
        id: '1',
        overallRating: 5.0,
        vibeRatings: {
          atmosphere: 5.0,
          cleanliness: 5.0,
          service: 5.0,
          discretion: 5.0,
          valueForMoney: 4.0
        },
        author: 'Anonymní návštěvník',
        date: '2025-11-15',
        text: 'Naprosto skvělý zážitek! Prostředí je luxusní, čisté a velmi diskrétní. Personál profesionální a příjemný. Určitě se vrátím.',
        verified: true,
        helpful: 12
      },
      {
        id: '2',
        overallRating: 4.0,
        vibeRatings: {
          atmosphere: 4.0,
          cleanliness: 5.0,
          service: 4.0,
          discretion: 5.0,
          valueForMoney: 3.0
        },
        author: 'Spokojený klient',
        date: '2025-11-10',
        text: 'Velmi příjemné místo, dobré služby. Jediné minus je cena, ale kvalita to vyvažuje. Parkování je trochu složitější, ale jinak doporučuji.',
        verified: true,
        helpful: 8
      },
      {
        id: '3',
        overallRating: 5.0,
        vibeRatings: {
          atmosphere: 5.0,
          cleanliness: 5.0,
          service: 5.0,
          discretion: 5.0,
          valueForMoney: 4.0
        },
        author: 'Pravidelný host',
        date: '2025-11-03',
        text: 'Chodím sem pravidelně a vždy jsem spokojený. Profesionální přístup, čistota na vysoké úrovni a příjemná atmosféra. Top místo v Praze!',
        verified: false,
        helpful: 15
      }
    ]
  },

  stats: {
    views: 15234,
    favorites: 432,
    profilesCount: 6,
    createdAt: '2024-01-15',
    updatedAt: '2025-11-17'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getVibeColor = (rating: number): string => {
  if (rating >= 4.5) return '#10b981';
  if (rating >= 4.0) return '#22c55e';
  if (rating >= 3.0) return '#eab308';
  if (rating >= 2.0) return '#f97316';
  return '#ef4444';
};

const getVibeColorClass = (rating: number): string => {
  if (rating >= 4.5) return 'bg-[#10b981]';
  if (rating >= 4.0) return 'bg-[#22c55e]';
  if (rating >= 3.0) return 'bg-[#eab308]';
  if (rating >= 2.0) return 'bg-[#f97316]';
  return 'bg-[#ef4444]';
};

const getCurrentDayKey = (): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Dnes';
  if (diffDays === 1) return 'Včera';
  if (diffDays < 7) return `Před ${diffDays} dny`;
  if (diffDays < 14) return 'Před týdnem';
  if (diffDays < 30) return `Před ${Math.floor(diffDays / 7)} týdny`;
  return date.toLocaleDateString('cs-CZ');
};

const facilityIcons: { [key: string]: { icon: string; label: string } } = {
  wifi: { icon: '📶', label: 'WiFi' },
  parking: { icon: '🅿️', label: 'Parkování' },
  shower: { icon: '🚿', label: 'Sprcha' },
  drinks: { icon: '🍷', label: 'Nápoje' },
  jacuzzi: { icon: '🛁', label: 'Jacuzzi' },
  sauna: { icon: '🧖', label: 'Sauna' },
  ac: { icon: '❄️', label: 'Klimatizace' },
  discreet: { icon: '🔒', label: 'Diskrétní' }
};

const languageFlags: { [key: string]: { flag: string; label: string } } = {
  cs: { flag: '🇨🇿', label: 'Čeština' },
  en: { flag: '🇬🇧', label: 'English' },
  de: { flag: '🇩🇪', label: 'Deutsch' }
};

const dayLabels: { [key: string]: string } = {
  monday: 'Pondělí',
  tuesday: 'Úterý',
  wednesday: 'Středa',
  thursday: 'Čtvrtek',
  friday: 'Pátek',
  saturday: 'Sobota',
  sunday: 'Neděle'
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface BusinessDetailPageProps {
  business: Business;
}

export default function BusinessDetailPage({ business }: BusinessDetailPageProps) {
  // Business data is now passed as prop from server component

  // State
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'about' | 'facilities' | 'profiles' | 'hours' | 'reviews' | 'map'>('about');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRatings, setReviewRatings] = useState({
    overall: 0,
    atmosphere: 0,
    cleanliness: 0,
    service: 0,
    discretion: 0,
    valueForMoney: 0
  });
  const [reviewText, setReviewText] = useState('');
  const [reviewVerified, setReviewVerified] = useState(false);

  // Gallery navigation
  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? business.media.photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === business.media.photos.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  // Review modal
  const handleRatingClick = (category: keyof typeof reviewRatings, value: number) => {
    setReviewRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (reviewRatings.overall === 0) {
      alert('Prosím nastavte celkové hodnocení');
      return;
    }

    if (
      reviewRatings.atmosphere === 0 ||
      reviewRatings.cleanliness === 0 ||
      reviewRatings.service === 0 ||
      reviewRatings.discretion === 0 ||
      reviewRatings.valueForMoney === 0
    ) {
      alert('Prosím ohodnoťte všechny VIBE kategorie');
      return;
    }

    if (reviewText.length < 50) {
      alert('Recenze musí mít alespoň 50 znaků');
      return;
    }

    // Submit (mock)
    console.log('Submitting review:', { reviewRatings, reviewText, reviewVerified });
    alert('Děkujeme za vaše hodnocení! Recenze bude po kontrole zveřejněna.');

    // Reset
    setShowReviewModal(false);
    setReviewRatings({
      overall: 0,
      atmosphere: 0,
      cleanliness: 0,
      service: 0,
      discretion: 0,
      valueForMoney: 0
    });
    setReviewText('');
    setReviewVerified(false);
  };

  const currentDay = getCurrentDayKey();
  const todayHours = business.workingHours[currentDay];
  const isOpen = todayHours?.available || false;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-[1400px] mx-auto px-5 py-5">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar pageType="podniky" />
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-3 mb-6 text-sm text-[#999]">
          <Link href="/" className="hover:text-[#ff0066] transition-colors">← Zpět</Link>
          <span>/</span>
          <Link href="/praha" className="hover:text-[#ff0066] transition-colors">Praha</Link>
          <span>/</span>
          <Link href="/salony" className="hover:text-[#ff0066] transition-colors">Salony</Link>
          <span>/</span>
          <span className="text-white">{business.name}</span>
        </nav>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-10">
          {/* LEFT COLUMN */}
          <div className="space-y-10">
            {/* GALLERY SECTION */}
            <section className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
              {/* Main Image */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={business.media.photos[currentPhotoIndex].url}
                    alt={`${business.name} - foto ${currentPhotoIndex + 1}`}
                    fill
                    className="object-contain"
                    priority={currentPhotoIndex === 0}
                    unoptimized
                  />
                </div>

                {/* Photo Counter */}
                <div className="absolute bottom-5 right-5 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">
                  📷 {business.media.photos.length} fotek
                </div>

                {/* Navigation Arrows */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-5">
                  <button
                    onClick={handlePrevPhoto}
                    className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center text-xl hover:bg-[#ff0066]/90 transition-all hover:scale-110"
                    aria-label="Předchozí foto"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center text-xl hover:bg-[#ff0066]/90 transition-all hover:scale-110"
                    aria-label="Další foto"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Thumbnail Grid */}
              <div className="grid grid-cols-8 gap-2 p-4 bg-[#0d0d0d]">
                {business.media.photos.slice(0, 8).map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => handleThumbnailClick(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 hover:border-[#ff0066] ${
                      index === currentPhotoIndex ? 'border-[#ff0066]' : 'border-transparent'
                    }`}
                  >
                    <div className="relative w-full h-full bg-[#1a1a1a]">
                      <Image
                        src={photo.thumbnail}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* TABS SECTION */}
            <section>
              {/* Tab Navigation */}
              <div className="flex gap-2 border-b border-[#222] mb-6 overflow-x-auto">
                {[
                  { key: 'about', label: 'O nás' },
                  { key: 'facilities', label: 'Vybavení' },
                  { key: 'profiles', label: 'Profily' },
                  { key: 'hours', label: 'Otevírací doba' },
                  { key: 'reviews', label: 'Recenze' },
                  { key: 'map', label: 'Mapa' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-5 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'text-[#ff0066] border-[#ff0066]'
                        : 'text-[#999] border-transparent hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div>
                {/* ABOUT TAB */}
                {activeTab === 'about' && (
                  <div className="bg-[#111] rounded-2xl border border-[#222] p-6">
                    <p className="text-[#ccc] text-[15px] leading-relaxed mb-6">
                      {business.description.full}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-[#ff0066]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          🏢
                        </div>
                        <div>
                          <div className="text-xs text-[#999] uppercase tracking-wide mb-1">Typ podniku</div>
                          <div className="text-sm font-medium">{business.typeLabel}</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-[#ff0066]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          🚪
                        </div>
                        <div>
                          <div className="text-xs text-[#999] uppercase tracking-wide mb-1">Počet pokojů</div>
                          <div className="text-sm font-medium">{business.facilities.rooms} luxusních pokojů</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-[#ff0066]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          💳
                        </div>
                        <div>
                          <div className="text-xs text-[#999] uppercase tracking-wide mb-1">Platební metody</div>
                          <div className="text-sm font-medium">Hotovost, Karta</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-[#ff0066]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          📅
                        </div>
                        <div>
                          <div className="text-xs text-[#999] uppercase tracking-wide mb-1">Rezervace</div>
                          <div className="text-sm font-medium">Doporučena</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-[#ff0066]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          ♿
                        </div>
                        <div>
                          <div className="text-xs text-[#999] uppercase tracking-wide mb-1">Bezbariérový</div>
                          <div className="text-sm font-medium">{business.facilities.accessibility ? 'Ano' : 'Ne'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FACILITIES TAB */}
                {activeTab === 'facilities' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {business.facilities.amenities.map((amenity) => {
                      const facilityInfo = facilityIcons[amenity];
                      return (
                        <div
                          key={amenity}
                          className="bg-[#111] rounded-xl border border-[#222] p-4 text-center transition-all hover:border-[#ff0066] hover:-translate-y-0.5"
                        >
                          <div className="text-3xl mb-2">{facilityInfo.icon}</div>
                          <div className="text-sm text-[#ccc] font-medium">{facilityInfo.label}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* PROFILES TAB */}
                {activeTab === 'profiles' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {business.profiles.map((profile) => (
                      <a
                        key={profile.id}
                        href={`/profil/${profile.slug}`}
                        className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden cursor-pointer transition-all hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:border-[#333]"
                      >
                        {/* Image */}
                        <div className="relative aspect-[3/4] bg-gradient-to-br from-[#2d3561] to-[#1a1f3a]">
                          {profile.photo ? (
                            <img
                              src={profile.photo}
                              alt={profile.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-5xl">
                              👩
                            </div>
                          )}

                          {/* Badges */}
                          {profile.isNew && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-[#ff0066] to-[#ff3385] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider z-10">
                              NOVÝ PROFIL
                            </div>
                          )}

                          <button className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-[#ff0066]/20 hover:border-[#ff0066] transition-all hover:scale-110 z-10">
                            <svg className="w-5 h-5" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </button>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {profile.online && (
                              <span className="w-2 h-2 bg-[#10b981] rounded-full flex-shrink-0 animate-pulse" />
                            )}
                            <span className="font-bold text-white">
                              {profile.name}, {profile.age}
                            </span>
                            {profile.verified && (
                              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#1DA1F2">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            )}
                          </div>

                          <div className="text-[11px] font-bold text-[#ff0066] uppercase tracking-wide mb-2.5">
                            {profile.category}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[#888] mb-2">
                            <span>📍</span>
                            <span>{profile.location.city}, {profile.location.area}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[13px] text-[#ffd700] mb-3">
                            <span>⭐</span>
                            <span>{profile.rating.average.toFixed(1)}</span>
                            <span className="text-[11px] text-[#666]">({profile.rating.count} recenzí)</span>
                          </div>

                          <button className="w-full bg-gradient-to-r from-[#ff0066] to-[#ff3385] text-white px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,0,102,0.4)]">
                            📞 Zobrazit kontakt
                          </button>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* HOURS TAB */}
                {activeTab === 'hours' && (
                  <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
                    {Object.entries(business.workingHours).map(([day, hours]) => (
                      <div
                        key={day}
                        className={`flex justify-between items-center px-6 py-4 border-b border-[#1a1a1a] last:border-b-0 ${
                          day === currentDay ? 'bg-[#ff0066]/5 border-l-[3px] border-l-[#ff0066]' : ''
                        }`}
                      >
                        <div className="font-semibold text-sm">{dayLabels[day]}</div>
                        <div className={`text-sm ${hours.available ? 'text-[#999]' : 'text-[#666]'}`}>
                          {hours.available ? `${hours.open} - ${hours.close}` : 'Zavřeno'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Review Header */}
                    <div className="bg-[#111] rounded-2xl border border-[#222] p-6">
                      <div className="flex items-start gap-6 mb-6">
                        <div className="text-6xl font-bold leading-none">
                          {business.reviews.overall.average.toFixed(1)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="text-[#ffd700] text-xl">★★★★★</div>
                            <span className="text-sm text-[#999]">{business.reviews.overall.count} recenzí</span>
                          </div>

                          <div className="space-y-2.5">
                            {[
                              { key: 'atmosphere', icon: '🎭', label: 'Atmosféra', value: business.reviews.vibe.atmosphere },
                              { key: 'cleanliness', icon: '🧼', label: 'Čistota', value: business.reviews.vibe.cleanliness },
                              { key: 'service', icon: '👔', label: 'Služby', value: business.reviews.vibe.service }
                            ].map((item) => (
                              <div key={item.key} className="flex items-center gap-3">
                                <span className="text-lg w-6 text-center">{item.icon}</span>
                                <span className="text-[13px] text-[#ccc] w-20">{item.label}</span>
                                <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${getVibeColorClass(item.value)}`}
                                    style={{ width: `${(item.value / 5) * 100}%` }}
                                  />
                                </div>
                                <span className="text-[13px] font-semibold w-8 text-right">{item.value.toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="w-full bg-[#ff0066] text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-[#e6005c] hover:-translate-y-0.5"
                      >
                        Přidat hodnocení
                      </button>
                    </div>

                    {/* Review List */}
                    <div className="space-y-4">
                      {business.reviews.items.map((review) => (
                        <div key={review.id} className="bg-[#111] rounded-xl border border-[#222] p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#2d3561] to-[#1a1f3a] rounded-full flex items-center justify-center text-lg">
                                👤
                              </div>
                              <div>
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                  {review.author}
                                  {review.verified && (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#10b981">
                                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                  )}
                                </div>
                                <div className="text-xs text-[#999]">{formatDate(review.date)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[#ffd700]">★★★★★</span>
                              <span className="font-semibold">{review.overallRating.toFixed(1)}</span>
                            </div>
                          </div>

                          <p className="text-sm text-[#ccc] leading-relaxed mb-3">
                            {review.text}
                          </p>

                          <div className="flex gap-4 pt-3 border-t border-[#222] text-xs">
                            {[
                              { icon: '🎭', value: review.vibeRatings.atmosphere },
                              { icon: '🧼', value: review.vibeRatings.cleanliness },
                              { icon: '👔', value: review.vibeRatings.service },
                              { icon: '🤫', value: review.vibeRatings.discretion },
                              { icon: '💰', value: review.vibeRatings.valueForMoney }
                            ].map((vibe, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[#999]">
                                <span>{vibe.icon}</span>
                                <span className="font-semibold text-white">{vibe.value.toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MAP TAB */}
                {activeTab === 'map' && (
                  <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
                    <div className="w-full h-[400px] bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center text-6xl text-[#666]">
                      🗺️
                    </div>
                    <div className="p-6 bg-[#0d0d0d]">
                      <div className="text-[15px] mb-3">
                        📍 {business.location.address}, {business.location.city}, {business.location.region}
                      </div>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-white/10 flex items-center justify-center gap-2">
                          🍎 Apple Maps
                        </button>
                        <button className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-white/10 flex items-center justify-center gap-2">
                          🗺️ Google Maps
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5 lg:sticky lg:top-5 lg:self-start">
            {/* BUSINESS HEADER */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-2xl border border-[#222] p-6">
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-3xl font-bold leading-tight flex-1">
                  {business.name}
                </h1>
                {business.verified && (
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="#1DA1F2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 bg-[#ff0066]/10 text-[#ff0066] px-3.5 py-1.5 rounded-xl text-[13px] font-semibold mb-3">
                <span>{business.typeIcon}</span>
                <span>{business.typeLabel}</span>
              </div>

              <div className="text-sm text-[#999] mb-2">
                {business.location.city}, {business.location.district}
              </div>

              <div className="flex items-center gap-2 text-sm text-[#ccc] mb-4">
                <span>📍</span>
                <span>{business.location.address}</span>
              </div>

              <div className="flex items-center gap-4 py-3 border-y border-[#222] mb-4">
                <div className="text-[#ffd700] text-xl">★★★★★</div>
                <div className="text-3xl font-bold">{business.reviews.overall.average.toFixed(1)}</div>
                <div className="text-sm text-[#999]">({business.reviews.overall.count})</div>
              </div>

              {/* VIBE Ratings */}
              <div className="mb-4">
                <div className="text-[11px] font-bold text-[#999] uppercase tracking-wider mb-3">
                  VIBE Hodnocení
                </div>
                <div className="space-y-2.5">
                  {[
                    { icon: '🎭', label: 'Atmosféra', value: business.reviews.vibe.atmosphere },
                    { icon: '🧼', label: 'Čistota', value: business.reviews.vibe.cleanliness },
                    { icon: '👔', label: 'Služby', value: business.reviews.vibe.service },
                    { icon: '🤫', label: 'Diskrétnost', value: business.reviews.vibe.discretion },
                    { icon: '💰', label: 'Cena/výkon', value: business.reviews.vibe.valueForMoney }
                  ].map((vibe) => (
                    <div key={vibe.label} className="flex items-center gap-3">
                      <span className="text-lg w-6">{vibe.icon}</span>
                      <span className="text-[13px] text-[#ccc] w-24">{vibe.label}</span>
                      <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getVibeColorClass(vibe.value)}`}
                          style={{ width: `${(vibe.value / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-[13px] font-semibold w-8 text-right">{vibe.value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#222] mb-4">
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full bg-[#ff0066]/10 border border-[#ff0066]/30 text-[#ff0066] px-4 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-[#ff0066]/20 hover:border-[#ff0066]/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  ⭐ Ohodnotit tento podnik
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-[#0d0d0d] p-3 rounded-lg text-center border border-[#1a1a1a]">
                  <div className="text-xl mb-1">🚪</div>
                  <div className="text-[11px] text-[#999] uppercase tracking-wide mb-0.5">Pokoje</div>
                  <div className="text-sm font-semibold">{business.facilities.rooms}</div>
                </div>
                <div className="bg-[#0d0d0d] p-3 rounded-lg text-center border border-[#1a1a1a]">
                  <div className="text-xl mb-1">🅿️</div>
                  <div className="text-[11px] text-[#999] uppercase tracking-wide mb-0.5">Parking</div>
                  <div className="text-sm font-semibold">{business.location.parking ? 'Ano' : 'Ne'}</div>
                </div>
                <div className="bg-[#0d0d0d] p-3 rounded-lg text-center border border-[#1a1a1a]">
                  <div className="text-xl mb-1">📶</div>
                  <div className="text-[11px] text-[#999] uppercase tracking-wide mb-0.5">WiFi</div>
                  <div className="text-sm font-semibold">Ano</div>
                </div>
              </div>

              {/* Languages */}
              <div className="pt-4 border-t border-[#222]">
                <div className="text-[11px] font-bold text-[#999] uppercase tracking-wider mb-3">
                  Mluvíme jazyky
                </div>
                <div className="flex gap-3 flex-wrap">
                  {business.facilities.languages.map((lang) => {
                    const langInfo = languageFlags[lang];
                    return (
                      <div
                        key={lang}
                        className="flex items-center gap-2 bg-white/[0.03] px-3.5 py-2 rounded-lg border border-white/5"
                      >
                        <span className="text-xl leading-none">{langInfo.flag}</span>
                        <span className="text-[13px] text-[#ccc] font-medium">{langInfo.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CONTACT CTA */}
            <div className="bg-gradient-to-br from-[#2d3561] to-[#1a1f3a] rounded-2xl border border-[#3d4571] p-6">
              <h2 className="text-lg font-bold mb-3">Kontaktovat podnik</h2>

              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${
                isOpen ? 'bg-[#10b981]/10' : 'bg-[#ef4444]/10'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  isOpen ? 'bg-[#10b981] animate-pulse' : 'bg-[#ef4444]'
                }`} />
                <div>
                  <div className={`text-[13px] font-semibold ${
                    isOpen ? 'text-[#10b981]' : 'text-[#ef4444]'
                  }`}>
                    {isOpen ? 'Otevřeno' : 'Zavřeno'}
                  </div>
                  {isOpen && todayHours && (
                    <div className="text-xs text-[#999]">Do {todayHours.close} • Dnes</div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <a
                  href={`tel:${business.contact.phone.replace(/\s/g, '')}`}
                  className="block w-full bg-[#ff0066] text-white px-6 py-3.5 rounded-xl font-semibold text-[15px] text-center transition-all hover:bg-[#e6005c] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,0,102,0.3)]"
                >
                  📞 {business.contact.phone}
                </a>

                {business.contact.website && (
                  <a
                    href={business.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-white/5 border border-white/10 text-white px-6 py-3.5 rounded-xl font-semibold text-[15px] text-center transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    🌐 Navštívit web
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {business.contact.whatsapp && (
                  <a
                    href={`https://wa.me/${business.contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/[0.03] border border-white/5 p-2.5 rounded-lg text-center transition-all hover:bg-white/[0.08] hover:border-white/15"
                  >
                    <div className="text-xl mb-1">💬</div>
                    <div className="text-[11px] text-[#999]">WhatsApp</div>
                  </a>
                )}

                {business.contact.telegram && (
                  <a
                    href={`https://t.me/${business.contact.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/[0.03] border border-white/5 p-2.5 rounded-lg text-center transition-all hover:bg-white/[0.08] hover:border-white/15"
                  >
                    <div className="text-xl mb-1">✈️</div>
                    <div className="text-[11px] text-[#999]">Telegram</div>
                  </a>
                )}

                {business.contact.email && (
                  <a
                    href={`mailto:${business.contact.email}`}
                    className="bg-white/[0.03] border border-white/5 p-2.5 rounded-lg text-center transition-all hover:bg-white/[0.08] hover:border-white/15"
                  >
                    <div className="text-xl mb-1">📧</div>
                    <div className="text-[11px] text-[#999]">Email</div>
                  </a>
                )}

                <button
                  onClick={() => {
                    const address = `${business.location.address}, ${business.location.city}`;
                    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
                  }}
                  className="bg-white/[0.03] border border-white/5 p-2.5 rounded-lg text-center transition-all hover:bg-white/[0.08] hover:border-white/15"
                >
                  <div className="text-xl mb-1">🗺️</div>
                  <div className="text-[11px] text-[#999]">Navigovat</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReviewModal(false);
          }}
        >
          <div className="bg-[#111] rounded-2xl border border-[#222] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#222]">
              <h2 className="text-2xl font-bold">Přidat hodnocení</h2>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6">
              {/* Overall Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Celkové hodnocení</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRatingClick('overall', value)}
                      className={`text-4xl transition-all hover:scale-110 ${
                        value <= reviewRatings.overall ? 'text-[#ffd700]' : 'text-[#333]'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* VIBE Ratings */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">VIBE Hodnocení</label>
                <div className="space-y-3">
                  {[
                    { key: 'atmosphere', icon: '🎭', label: 'Atmosféra' },
                    { key: 'cleanliness', icon: '🧼', label: 'Čistota' },
                    { key: 'service', icon: '👔', label: 'Služby' },
                    { key: 'discretion', icon: '🤫', label: 'Diskrétnost' },
                    { key: 'valueForMoney', icon: '💰', label: 'Cena/výkon' }
                  ].map((vibe) => (
                    <div key={vibe.key} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-[150px]">
                        <span className="text-xl">{vibe.icon}</span>
                        <span className="text-sm text-[#ccc]">{vibe.label}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleRatingClick(vibe.key as any, value)}
                            className={`text-2xl transition-all hover:scale-110 ${
                              value <= reviewRatings[vibe.key as keyof typeof reviewRatings]
                                ? 'text-[#ffd700]'
                                : 'text-[#333]'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">
                  Vaše recenze (min. 50 znaků)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Sdílejte své zkušenosti s tímto podnikem..."
                  className="w-full min-h-[120px] bg-[#0d0d0d] border border-[#222] rounded-lg p-3 text-sm text-white resize-vertical focus:outline-none focus:border-[#ff0066]"
                  required
                  minLength={50}
                />
                <div className="text-xs text-[#666] mt-1">
                  {reviewText.length} / 50 znaků
                </div>
              </div>

              {/* Verified Checkbox */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewVerified}
                    onChange={(e) => setReviewVerified(e.target.checked)}
                    className="w-[18px] h-[18px] cursor-pointer"
                  />
                  <span className="text-sm text-[#ccc]">
                    Potvrzuji, že jsem navštívil tento podnik
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-white/5 border border-white/10 px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-white/10"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#ff0066] text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-[#e6005c]"
                >
                  Odeslat hodnocení
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
