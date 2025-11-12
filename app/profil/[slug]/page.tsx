'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileSchema from '@/components/ProfileSchema';
import { profiles } from '@/components/TopProfiles';
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
};

export default function ProfileDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState('o-me');

  // Find the profile by slug
  const profile = profiles.find(p => p.slug === slug);

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

  // Parse services from scraped data (stored in servicesJson field)
  const getServicesForProfile = () => {
    // Try to get services from servicesJson field (scraped data)
    if ((profile as any).servicesJson) {
      try {
        const parsedServices = typeof (profile as any).servicesJson === 'string'
          ? JSON.parse((profile as any).servicesJson)
          : (profile as any).servicesJson;

        // Convert scraped services to display format
        return parsedServices.map((serviceName: string) => ({
          label: serviceName,
          url: `/holky-na-sex?service=${encodeURIComponent(serviceName.toLowerCase().replace(/\s+/g, '-'))}`
        }));
      } catch (e) {
        console.error('Failed to parse servicesJson:', e);
      }
    }

    // Fallback: Return empty array if no services
    return [];
  };

  const services = getServicesForProfile();

  const pricing = [
    { duration: '30 minut', price: '1500 Kč' },
    { duration: '1 hodina', price: '2500 Kč' },
    { duration: '2 hodiny', price: '4500 Kč' },
  ];

  const availability = [
    { day: 'Pondělí - Pátek', hours: '10:00 - 22:00' },
    { day: 'Sobota - Neděle', hours: '12:00 - 20:00' },
  ];

  return (
    <main className="min-h-screen bg-dark-950">
      {/* SEO: Schema.org strukturovaná data */}
      <ProfileSchema profile={profile} />

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
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20"></div>

                {/* Badges on image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {profile.isNew && (
                    <span className="bg-blue-500 px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center justify-center">
                      Nový profil
                    </span>
                  )}
                  {profile.isPopular && (
                    <span className="bg-orange-500 px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-1">
                      <span>🔥</span> Populární
                    </span>
                  )}
                  {(profile as any).isOnline && (
                    <span className="bg-green-500 px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Online
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
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative h-24 rounded-xl overflow-hidden glass cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Profile Info */}
            <div className="space-y-6">
              {/* Profile Type Badge */}
              <div>
                <span className={`${profileTypes[profile.profileType].color} px-4 py-2 rounded-full text-sm font-bold inline-flex items-center justify-center`}>
                  {profile.profileType === 'solo'
                    ? profileTypes.solo.label
                    : profile.profileType === 'salon'
                    ? `Salon ${profile.businessName}`
                    : profile.profileType === 'privat'
                    ? `Privát ${profile.businessName}`
                    : profile.profileType === 'escort_agency'
                    ? profile.businessName
                    : profile.businessName
                  }
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
                  href={`/${profile.category === 'Holky na sex' ? 'holky-na-sex' : profile.category === 'Erotické masérky' ? 'eroticke-masaze' : profile.category === 'Online modelka' ? 'online-sex' : profile.category === 'Domina' ? 'bdsm' : 'escort'}`}
                  className="text-xl text-primary-400 hover:text-primary-300 transition-colors inline-block"
                >
                  {profile.category}
                </Link>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                  <span className="text-2xl font-bold">{profile.rating}</span>
                  <span className="text-gray-400">({profile.reviews} hodnocení)</span>
                </div>
                {profile.verified && (
                  <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-semibold text-green-400">Ověřený profil</span>
                  </div>
                )}
              </div>

              {/* Service Badges */}
              {((profile as any).offersEscort || (profile as any).travels) && (
                <div className="flex flex-wrap gap-2">
                  {(profile as any).offersEscort && (
                    <span className="inline-flex items-center text-sm px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full font-semibold border border-purple-500/30">
                      Nabízím escort
                    </span>
                  )}
                  {(profile as any).travels && (
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
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                  <Phone className="w-6 h-6 text-primary-400" />
                  <span className="font-semibold">{(profile as any).phone || '+420 123 456 789'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${(profile as any).phone || '+420123456789'}`}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    Zavolat
                  </a>
                  <a
                    href={`sms:${(profile as any).phone || '+420123456789'}`}
                    className="flex items-center justify-center gap-2 px-6 py-4 glass rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    SMS
                  </a>
                </div>

                {/* Messaging Apps */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/${((profile as any).phone || '+420123456789').replace(/\s/g, '')}`}
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
                    href={`https://t.me/${((profile as any).phone || '+420123456789').replace(/\s/g, '')}`}
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
              <button
                onClick={() => setActiveTab('sluzby')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'sluzby'
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Služby
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
                  Ahoj, jsem {profile.name} a ráda bych vás přivítala na nezapomenutelnou relaxační chvíli.
                  Nabízím profesionální erotické masáže v příjemném a diskrétním prostředí.
                  Mým cílem je, abyste se u mě cítili uvolněně a odcházeli s úsměvem na tváři.
                  Jsem komunikativní, milá a vždy dbám na maximální hygienu a diskrétnost.
                  Těším se na naši společnou chvíli relaxace!
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

                  {/* Age Category */}
                  {(profile as any).ageCategory && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Kategorie</div>
                      <div className="text-white font-semibold text-lg">
                        {(profile as any).ageCategory === '18-25' ? '18-25 let' :
                         (profile as any).ageCategory === '26-35' ? '26-35 let' :
                         (profile as any).ageCategory === '36-45' ? '36-45 let' :
                         (profile as any).ageCategory === '46+' ? '46+ let' :
                         (profile as any).ageCategory === 'student' ? 'Studentka' :
                         (profile as any).ageCategory === 'young' ? 'Mladá' :
                         (profile as any).ageCategory === 'milf' ? 'MILF' :
                         (profile as any).ageCategory === 'mature' ? 'Zralá' : (profile as any).ageCategory}
                      </div>
                    </div>
                  )}

                  {/* Weight */}
                  {(profile as any).weight && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Váha</div>
                      <div className="text-white font-semibold text-lg">{(profile as any).weight} kg</div>
                    </div>
                  )}

                  {/* Height */}
                  {(profile as any).height && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Výška</div>
                      <div className="text-white font-semibold text-lg">{(profile as any).height} cm</div>
                    </div>
                  )}

                  {/* Breast Size */}
                  {(profile as any).bust && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Velikost prsou</div>
                      <div className="text-white font-semibold text-lg">{(profile as any).bust}</div>
                    </div>
                  )}

                  {/* Breast Type */}
                  {(profile as any).breastType && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Typ prsou</div>
                      <div className="text-white font-semibold text-lg">
                        {(profile as any).breastType === 'natural' ? 'Přirozená' :
                         (profile as any).breastType === 'silicone' ? 'Silikonová' : (profile as any).breastType}
                      </div>
                    </div>
                  )}

                  {/* Hair Color */}
                  {(profile as any).hairColor && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Barva vlasů</div>
                      <div className="text-white font-semibold text-lg">{(profile as any).hairColor}</div>
                    </div>
                  )}

                  {/* Hair Length */}
                  {(profile as any).hairLength && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Délka vlasů</div>
                      <div className="text-white font-semibold text-lg">{(profile as any).hairLength}</div>
                    </div>
                  )}

                  {/* Body Type */}
                  {(profile as any).bodyType && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Typ postavy</div>
                      <div className="text-white font-semibold text-lg">
                        {(profile as any).bodyType === 'slim' ? 'Štíhlá' :
                         (profile as any).bodyType === 'fit' ? 'Fit' :
                         (profile as any).bodyType === 'athletic' ? 'Atletická' :
                         (profile as any).bodyType === 'curvy' ? 'Krev a mléko' : (profile as any).bodyType}
                      </div>
                    </div>
                  )}

                  {/* Pubic Hair */}
                  {(profile as any).pubicHair && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Úprava klínu</div>
                      <div className="text-white font-semibold text-lg">{(profile as any).pubicHair}</div>
                    </div>
                  )}

                  {/* Nationality */}
                  {(profile as any).nationality && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Národnost</div>
                      <div className="text-white font-semibold text-lg">
                        {(profile as any).nationality === 'czech' ? 'Česká' :
                         (profile as any).nationality === 'slovak' ? 'Slovenská' :
                         (profile as any).nationality === 'russian' ? 'Ruská' :
                         (profile as any).nationality === 'ukrainian' ? 'Ukrajinská' : (profile as any).nationality}
                      </div>
                    </div>
                  )}

                  {/* Tattoos */}
                  {(profile as any).tattoos && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Tetování</div>
                      <div className="text-white font-semibold text-lg">{(profile as any).tattoos}</div>
                    </div>
                  )}

                  {/* Piercing */}
                  {(profile as any).piercing && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Piercing</div>
                      <div className="text-white font-semibold text-lg">{(profile as any).piercing}</div>
                    </div>
                  )}

                  {/* Orientation */}
                  {(profile as any).orientation && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10">
                      <div className="text-gray-400 text-sm mb-1">Orientace</div>
                      <div className="text-white font-semibold text-lg">{(profile as any).orientation}</div>
                    </div>
                  )}

                  {/* Languages with Flags */}
                  {(profile as any).languages && (
                    <div className="bg-dark-800/50 rounded-xl p-4 border border-white/10 col-span-2">
                      <div className="text-gray-400 text-sm mb-1">Jazyky</div>
                      <div className="text-white font-semibold text-lg flex flex-wrap items-center gap-2">
                        {(() => {
                          try {
                            const langs = typeof (profile as any).languages === 'string'
                              ? JSON.parse((profile as any).languages)
                              : (profile as any).languages;

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

                            return langs.map((lang: string, idx: number) => {
                              const langData = langMap[lang.toUpperCase()] || { flag: '', name: lang };
                              return (
                                <span key={idx} className="inline-flex items-center gap-1">
                                  {langData.flag && <span className="text-xl">{langData.flag}</span>}
                                  <span>{langData.name}</span>
                                  {idx < langs.length - 1 && <span className="text-gray-500">,</span>}
                                </span>
                              );
                            });
                          } catch (e) {
                            return <span>{(profile as any).languages}</span>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Oblíbené role sekce */}
                {(profile as any).roles && (profile as any).roles.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-400" />
                      Oblíbené role
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile as any).roles.map((role: string, index: number) => {
                        const roleLabels: Record<string, string> = {
                          student: 'Studentka',
                          teacher: 'Učitelka',
                          nurse: 'Zdravotní sestra',
                          secretary: 'Sekretářka',
                          police: 'Policistka',
                          boss: 'Šéfová',
                          waitress: 'Servírka',
                          domina: 'Domina',
                          neighbor: 'Sousedka',
                          fitness: 'Fitneska',
                          catgirl: 'Kočička',
                          cosplay: 'Cosplay',
                        };
                        return (
                          <Link
                            key={index}
                            href={`/holky-na-sex?role=${role}`}
                            className="px-4 py-2 bg-gradient-to-r from-primary-500/20 to-pink-500/20 border border-primary-500/30 rounded-full hover:from-primary-500/30 hover:to-pink-500/30 hover:border-primary-500/50 transition-all"
                          >
                            {roleLabels[role] || role}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SEO Tags sekce */}
                {(profile as any).tags && (profile as any).tags.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary-400" />
                      Klíčová slova
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile as any).tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-dark-800/50 border border-white/10 rounded-full text-sm text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Služby Tab */}
            {activeTab === 'sluzby' && (
              <div className="glass rounded-2xl p-8">
                <h3 className="text-3xl font-bold mb-8 text-center gradient-text">
                  Nabízené služby
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {services.map((service, index) => (
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
          </div>

          {/* Escort Agency Badge */}
          {profile.profileType === 'escort_agency' && (
            <div className="glass rounded-2xl p-6 mt-6 border-2 border-pink-500/30">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" fill="white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-pink-400">Holky na escort</h3>
                  <p className="text-sm text-gray-400">Profesionální eskortní služby</p>
                </div>
              </div>
            </div>
          )}

          {/* Related Categories - Auto-generated based on profile attributes */}
          <div className="glass rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-400">Oblíbené vyhledávání</h3>
            <div className="flex flex-wrap gap-2">
              {/* Generate links dynamically based on profile attributes */}

              {/* Hair Color */}
              {(profile as any).hairColor && (
                <Link
                  href={`/holky-na-sex?hairColor=${(profile as any).hairColor}&city=${profile.location}`}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
                >
                  {(profile as any).hairColor === 'blonde' ? 'Blondýnky' :
                   (profile as any).hairColor === 'brunette' ? 'Brunety' :
                   (profile as any).hairColor === 'redhead' ? 'Zrzky' :
                   (profile as any).hairColor === 'black' ? 'Černovlásky' : 'Holky'} {profile.location}
                </Link>
              )}

              {/* Body Type */}
              {(profile as any).bodyType && (
                <Link
                  href={`/holky-na-sex?bodyType=${(profile as any).bodyType}&city=${profile.location}`}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
                >
                  {(profile as any).bodyType === 'slim' ? 'Hubené' :
                   (profile as any).bodyType === 'fit' ? 'Štíhlé' :
                   (profile as any).bodyType === 'athletic' ? 'Atletické' :
                   (profile as any).bodyType === 'curvy' ? 'Krev a mléko' : 'Holky'} {profile.location}
                </Link>
              )}

              {/* Age Category */}
              {(profile as any).ageCategory && (
                <Link
                  href={`/holky-na-sex?ageCategory=${(profile as any).ageCategory}&city=${profile.location}`}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
                >
                  {(profile as any).ageCategory === 'student' ? 'Studentky' :
                   (profile as any).ageCategory === 'young' ? 'Mladé holky' :
                   (profile as any).ageCategory === 'milf' ? 'MILF' :
                   (profile as any).ageCategory === 'mature' ? 'Zralé' : 'Holky'} {profile.location}
                </Link>
              )}

              {/* Breast Type */}
              {(profile as any).breastType && (
                <Link
                  href={`/holky-na-sex?breastType=${(profile as any).breastType}&city=${profile.location}`}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
                >
                  {(profile as any).breastType === 'natural' ? 'Přírodní prsa' :
                   (profile as any).breastType === 'silicone' ? 'Silikonová prsa' :
                   (profile as any).breastType === 'large' ? 'Velká prsa' : 'Prsa'} {profile.location}
                </Link>
              )}

              {/* Nationality */}
              {(profile as any).nationality && (
                <Link
                  href={`/holky-na-sex?nationality=${(profile as any).nationality}&city=${profile.location}`}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
                >
                  {(profile as any).nationality === 'czech' ? 'České holky' :
                   (profile as any).nationality === 'slovak' ? 'Slovenky' :
                   (profile as any).nationality === 'russian' ? 'Rusky' :
                   (profile as any).nationality === 'ukrainian' ? 'Ukrajinky' :
                   (profile as any).nationality === 'polish' ? 'Polky' : 'Holky'} {profile.location}
                </Link>
              )}

              {/* Escort Services */}
              {(profile as any).offersEscort && (
                <Link
                  href={`/holky-na-sex?offersEscort=true&city=${profile.location}`}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
                >
                  Escort {profile.location}
                </Link>
              )}

              {/* Travels */}
              {(profile as any).travels && (
                <Link
                  href={`/holky-na-sex?travels=true&city=${profile.location}`}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
                >
                  Holky na cesty {profile.location}
                </Link>
              )}

              {/* Category + City (always show) */}
              <Link
                href={`/${profile.category === 'Holky na sex' ? 'holky-na-sex' : profile.category === 'Erotická masérka' ? 'eroticke-masaze' : 'online-sex'}?city=${profile.location}`}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
              >
                {profile.category} {profile.location}
              </Link>

              {/* All profiles in city (always show) */}
              <Link
                href={`/holky-na-sex?city=${profile.location}`}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-primary-500/50 hover:bg-primary-500/10 transition-all text-xs"
              >
                Všechny holky {profile.location}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
