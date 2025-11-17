'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileSchema from '@/components/ProfileSchema';
import { Star, MapPin, CheckCircle, Phone, Heart, MessageCircle, Clock, Shield, Award, Video, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Profile types with their colors
const profileTypes = {
  solo: { color: 'bg-purple-500', label: 'SOLO' },
  privat: { color: 'bg-indigo-500', label: 'Privát' },
  salon: { color: 'bg-teal-500', label: 'Salon' },
  escort_agency: { color: 'bg-pink-500', label: 'Escort Agentura' },
  digital_agency: { color: 'bg-blue-500', label: 'Digitální Agentura' },
  swingers_club: { color: 'bg-red-500', label: 'Swingers Klub' },
  night_club: { color: 'bg-orange-500', label: 'Night Club' },
  strip_club: { color: 'bg-yellow-500', label: 'Strip Club' },
  MASSAGE_SALON: { color: 'bg-teal-500', label: 'Masážní salon' },
  PRIVAT: { color: 'bg-indigo-500', label: 'Privát' },
  ESCORT_AGENCY: { color: 'bg-pink-500', label: 'Escort Agentura' },
  DIGITAL_AGENCY: { color: 'bg-blue-500', label: 'Digitální Agentura' },
  SWINGERS_CLUB: { color: 'bg-red-500', label: 'Swingers Klub' },
  NIGHT_CLUB: { color: 'bg-orange-500', label: 'Night Club' },
  STRIP_CLUB: { color: 'bg-yellow-500', label: 'Strip Club' },
};

export default function ProfileDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState('o-me');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Array<{label: string, url: string}>>([]);

  // Fetch profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profiles/${slug}`);

        if (!response.ok) {
          setProfile(null);
          return;
        }

        const data = await response.json();
        setProfile(data);

        // Process services
        if (data.services && data.services.length > 0) {
          const formattedServices = data.services.map((item: any) => ({
            label: item.service.name,
            url: `/holky-na-sex?service=${encodeURIComponent(item.service.name.toLowerCase().replace(/\s+/g, '-'))}`
          }));
          setServices(formattedServices);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProfile();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <p className="text-gray-400">Načítání profilu...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Profil nenalezen</h1>
          <p className="text-gray-400 mb-8">Omlouváme se, tento profil neexistuje nebo byl odstraněn.</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg font-semibold">
            Zpět na hlavní stránku
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Parse languages if it's a JSON string
  let parsedLanguages = [];
  try {
    parsedLanguages = typeof profile.languages === 'string'
      ? JSON.parse(profile.languages)
      : profile.languages || [];
  } catch (e) {
    parsedLanguages = [];
  }

  // Map category to display name
  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      'HOLKY_NA_SEX': 'Holky na sex',
      'EROTICKE_MASERKY': 'Erotické masérky',
      'DOMINA': 'Domina',
      'DIGITALNI_SLUZBY': 'Online modelka',
    };
    return categoryMap[category] || category;
  };

  // Map category to URL
  const getCategoryUrl = (category: string) => {
    const urlMap: Record<string, string> = {
      'HOLKY_NA_SEX': 'holky-na-sex',
      'EROTICKE_MASERKY': 'eroticke-masaze',
      'DOMINA': 'bdsm',
      'DIGITALNI_SLUZBY': 'online-sex',
    };
    return urlMap[category] || 'holky-na-sex';
  };

  const categoryDisplay = getCategoryDisplay(profile.category);
  const categoryUrl = getCategoryUrl(profile.category);

  // Get main photo or use placeholder
  const mainPhoto = profile.photos && profile.photos.length > 0
    ? profile.photos[0].url
    : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop';

  return (
    <main className="min-h-screen bg-dark-950">
      {/* SEO: Schema.org strukturovaná data */}
      <ProfileSchema profile={{
        ...profile,
        category: categoryDisplay,
        rating: 4.5,
        reviews: 0,
        location: profile.city,
      }} />

      <Header />

      {/* Hero Section with Image */}
      <section className="relative pt-24 pb-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Image Gallery */}
            <div className="relative">
              <div className="relative h-[600px] rounded-3xl overflow-hidden glass group">
                {/* Main Image */}
                <img
                  src={mainPhoto}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20"></div>

                {/* Badges on image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {profile.isNew && (
                    <span className="bg-blue-500 px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center justify-center">
                      Nový profil
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <button className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center hover:bg-black/70 transition-all hover:scale-110">
                  <Heart className="w-6 h-6 text-white" />
                </button>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent opacity-60"></div>
              </div>

              {/* Thumbnail Gallery */}
              {profile.photos && profile.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {profile.photos.slice(1, 5).map((photo: any, i: number) => (
                    <div key={i} className="relative h-24 rounded-xl overflow-hidden glass cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all">
                      <img
                        src={photo.url}
                        alt={`${profile.name} ${i + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Profile Info */}
            <div className="space-y-6">
              {/* Profile Type Badge */}
              <div>
                <span className={`${(profileTypes as any)[profile.profileType]?.color || 'bg-purple-500'} px-4 py-2 rounded-full text-sm font-bold inline-flex items-center justify-center`}>
                  {(profileTypes as any)[profile.profileType]?.label || profile.profileType}
                </span>
              </div>

              {/* Name and Verification */}
              <div>
                <h1 className="text-5xl font-bold mb-2 flex items-center gap-3">
                  {profile.name}, {profile.age}
                  {profile.verified && (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                </h1>
                <Link
                  href={`/${categoryUrl}`}
                  className="text-xl text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  {categoryDisplay}
                </Link>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                  <span className="text-2xl font-bold">4.5</span>
                  <span className="text-gray-400">(0 hodnocení)</span>
                </div>
                {profile.verified && (
                  <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-semibold text-green-400">Ověřený profil</span>
                  </div>
                )}
              </div>

              {/* Service Badges */}
              {(profile.offersEscort || profile.travels) && (
                <div className="flex flex-wrap gap-2">
                  {profile.offersEscort && (
                    <span className="inline-flex items-center text-sm px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full font-semibold border border-purple-500/30">
                      Nabízím escort
                    </span>
                  )}
                  {profile.travels && (
                    <span className="inline-flex items-center text-sm px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full font-semibold border border-blue-500/30">
                      Cestuji
                    </span>
                  )}
                </div>
              )}

              {/* Location and Contact */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-lg">
                  <MapPin className="w-6 h-6 text-primary-400" />
                  <span>{profile.location || profile.city}</span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                  <Phone className="w-6 h-6 text-primary-400" />
                  <span className="font-semibold">{profile.phone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    Zavolat
                  </a>
                  <a
                    href={`sms:${profile.phone}`}
                    className="flex items-center justify-center gap-2 px-6 py-4 glass rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    SMS
                  </a>
                </div>

                {/* Messaging Apps */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/${profile.phone.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl font-semibold hover:bg-green-500/20 transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="text-sm">WhatsApp</span>
                  </a>
                  <a
                    href={`https://t.me/${profile.phone.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl font-semibold hover:bg-cyan-500/20 transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span className="text-sm">Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 🔥 NABÍZENÉ SLUŽBY - PROMINENTNÍ SEKCE (ALFA OMEGA) */}
          {services.length > 0 && (
            <div className="glass rounded-2xl p-8 mt-8 border-2 border-primary-500/30">
              <h2 className="text-4xl font-bold mb-6 text-center gradient-text flex items-center justify-center gap-3">
                <CheckCircle className="w-10 h-10 text-primary-500" />
                Nabízené služby
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {services.map((service: any, index: number) => (
                  <Link
                    key={index}
                    href={service.url}
                    className="group flex items-center gap-4 p-4 bg-dark-800/30 border border-white/10 rounded-xl hover:bg-dark-800/50 hover:border-primary-500/50 transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-medium group-hover:text-primary-400 transition-colors">
                      {service.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="glass rounded-2xl p-2 mt-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('o-me')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'o-me'
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                O mně
              </button>
              <button
                onClick={() => setActiveTab('osobni-udaje')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'osobni-udaje'
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Osobní údaje
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* O mně Tab */}
            {activeTab === 'o-me' && (
              <div className="glass rounded-2xl p-8">
                <h3 className="text-3xl font-bold mb-4">O mně</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {profile.description || `Ahoj, jsem ${profile.name} a ráda bych vás přivítala na nezapomenutelnou relaxační chvíli. Nabízím profesionální erotické služby v příjemném a diskrétním prostředí.`}
                </p>
              </div>
            )}

            {/* Osobní údaje Tab */}
            {activeTab === 'osobni-udaje' && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary-400" />
                  Osobní údaje
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Age */}
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                    <div className="text-gray-400 text-sm mb-1">Věk</div>
                    <div className="text-white font-semibold text-lg">{profile.age} let</div>
                  </div>

                  {/* Weight */}
                  {profile.weight && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Váha</div>
                      <div className="text-white font-semibold text-lg">{profile.weight} kg</div>
                    </div>
                  )}

                  {/* Height */}
                  {profile.height && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Výška</div>
                      <div className="text-white font-semibold text-lg">{profile.height} cm</div>
                    </div>
                  )}

                  {/* Breast Size */}
                  {profile.bust && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Velikost prsou</div>
                      <div className="text-white font-semibold text-lg">{profile.bust}</div>
                    </div>
                  )}

                  {/* Breast Type */}
                  {profile.breastType && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Typ prsou</div>
                      <div className="text-white font-semibold text-lg">
                        {profile.breastType === 'natural' ? 'Přirozená' :
                         profile.breastType === 'silicone' ? 'Silikonová' : profile.breastType}
                      </div>
                    </div>
                  )}

                  {/* Hair Color */}
                  {profile.hairColor && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Barva vlasů</div>
                      <div className="text-white font-semibold text-lg">{profile.hairColor}</div>
                    </div>
                  )}

                  {/* Nationality */}
                  {profile.nationality && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Národnost</div>
                      <div className="text-white font-semibold text-lg">{profile.nationality}</div>
                    </div>
                  )}

                  {/* Tattoos */}
                  {profile.tattoos && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Tetování</div>
                      <div className="text-white font-semibold text-lg">{profile.tattoos}</div>
                    </div>
                  )}

                  {/* Piercing */}
                  {profile.piercing && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Piercing</div>
                      <div className="text-white font-semibold text-lg">{profile.piercing}</div>
                    </div>
                  )}

                  {/* Orientation */}
                  {profile.orientation && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Orientace</div>
                      <div className="text-white font-semibold text-lg">{profile.orientation}</div>
                    </div>
                  )}

                  {/* Languages with Flags */}
                  {parsedLanguages.length > 0 && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10 col-span-2">
                      <div className="text-gray-400 text-sm mb-1">Jazyky</div>
                      <div className="text-white font-semibold text-lg flex flex-wrap items-center gap-2">
                        {parsedLanguages.map((lang: string, idx: number) => {
                          const langMap: Record<string, { flag: string; name: string }> = {
                            'CZ': { flag: '🇨🇿', name: 'Čeština' },
                            'SK': { flag: '🇸🇰', name: 'Slovenština' },
                            'EN': { flag: '🇬🇧', name: 'Angličtina' },
                            'DE': { flag: '🇩🇪', name: 'Němčina' },
                            'RU': { flag: '🇷🇺', name: 'Ruština' },
                            'PL': { flag: '🇵🇱', name: 'Polština' },
                            'FR': { flag: '🇫🇷', name: 'Francouzština' },
                            'ES': { flag: '🇪🇸', name: 'Španělština' },
                            'IT': { flag: '🇮🇹', name: 'Italština' },
                          };
                          const langData = langMap[lang.toUpperCase()] || { flag: '', name: lang };
                          return (
                            <span key={idx} className="inline-flex items-center gap-1">
                              {langData.flag && <span className="text-xl">{langData.flag}</span>}
                              <span>{langData.name}</span>
                              {idx < parsedLanguages.length - 1 && <span className="text-gray-500">,</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Related Categories */}
          <div className="glass rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-400">Oblíbené vyhledávání</h3>
            <div className="flex flex-wrap gap-2">
              {/* Category + City */}
              <Link
                href={`/${categoryUrl}?city=${profile.city}`}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
              >
                {categoryDisplay} {profile.city}
              </Link>

              {/* All profiles in city */}
              <Link
                href={`/holky-na-sex?city=${profile.city}`}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
              >
                Všechny holky {profile.city}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
