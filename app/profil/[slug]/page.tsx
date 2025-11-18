'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileSchema from '@/components/ProfileSchema';
import SearchBar from '@/components/SearchBar';
import {
  Star, MapPin, CheckCircle, Phone, Heart, MessageCircle,
  Clock, Shield, Award, Video, Sparkles, ChevronLeft,
  ChevronRight, X
} from 'lucide-react';
import Link from 'next/link';

// Format phone number for display
const formatPhone = (phone: string) => {
  if (!phone) return '';
  // +420731884923 → +420 731 884 923
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('+420')) {
    return `+420 ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
  }
  return phone;
};

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

  // Gallery state
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  // Gallery navigation
  const nextPhoto = () => {
    if (profile?.photos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length);
    }
  };

  const prevPhoto = () => {
    if (profile?.photos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
    }
  };

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

  // Get photos or use placeholder
  const photos = profile.photos && profile.photos.length > 0
    ? profile.photos
    : [{ url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop', id: '1' }];

  const currentPhoto = photos[currentPhotoIndex];

  // Get working hours from profile (if exists)
  const workingHours = profile.workingHours || {
    monday: { open: "10:00", close: "22:00", available: true },
    tuesday: { open: "10:00", close: "22:00", available: true },
    wednesday: { open: "10:00", close: "22:00", available: true },
    thursday: { open: "10:00", close: "22:00", available: true },
    friday: { open: "10:00", close: "24:00", available: true },
    saturday: { open: "12:00", close: "24:00", available: true },
    sunday: { open: "12:00", close: "20:00", available: true }
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: Record<string, string> = {
    monday: 'Pondělí',
    tuesday: 'Úterý',
    wednesday: 'Středa',
    thursday: 'Čtvrtek',
    friday: 'Pátek',
    saturday: 'Sobota',
    sunday: 'Neděle'
  };

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1; // Convert Sunday from 0 to 6

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

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 bg-white/10 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevPhoto}
            className="absolute left-4 z-50 bg-white/10 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <img
            src={currentPhoto?.url}
            alt={`${profile.name} ${currentPhotoIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          <button
            onClick={nextPhoto}
            className="absolute right-4 z-50 bg-white/10 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
            {currentPhotoIndex + 1} / {photos.length}
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="relative pt-24 pb-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar pageType="escort" />
          </div>

          {/* Back Navigation */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-primary-400 transition-colors">← Zpět na výpis</Link>
            <span>/</span>
            <span>{profile.city}</span>
            <span>/</span>
            <span>{categoryDisplay}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left: Gallery (2/3 width on desktop) */}
            <div className="lg:col-span-2 relative">
              {/* Main Image */}
              <div
                className="relative h-[600px] rounded-3xl overflow-hidden glass group cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={currentPhoto?.url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20"></div>

                {/* Photo Counter */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>

                {/* Badges on image */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  {profile.isNew && (
                    <span className="bg-blue-500 px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center justify-center">
                      Nový profil
                    </span>
                  )}
                </div>

                {/* Gallery Navigation */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                    className="bg-black/50 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center hover:bg-black/70 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                    className="bg-black/50 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center hover:bg-black/70 transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent opacity-60"></div>
              </div>

              {/* Thumbnail Gallery */}
              {photos.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-4">
                  {photos.slice(0, 8).map((photo: any, i: number) => (
                    <div
                      key={photo.id || i}
                      onClick={() => setCurrentPhotoIndex(i)}
                      className={`relative h-20 md:h-24 rounded-xl overflow-hidden glass cursor-pointer transition-all ${
                        i === currentPhotoIndex ? 'ring-2 ring-primary-500' : 'hover:ring-2 hover:ring-primary-500/50'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={`${profile.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Profile Info & Contact (1/3 width on desktop) */}
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="glass rounded-2xl p-6 space-y-4">
                {/* Online Status + Name */}
                <div>
                  <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    {profile.name}, {profile.age}
                    {profile.verified && (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    )}
                  </h1>
                  <Link
                    href={`/${categoryUrl}`}
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-block"
                  >
                    {categoryDisplay}
                  </Link>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span className="text-sm">{profile.location || profile.city}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">(0 recenzí)</span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Věk</div>
                    <div className="text-lg font-semibold">{profile.age}</div>
                  </div>
                  {profile.height && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Výška</div>
                      <div className="text-lg font-semibold">{profile.height} cm</div>
                    </div>
                  )}
                  {profile.weight && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Váha</div>
                      <div className="text-lg font-semibold">{profile.weight} kg</div>
                    </div>
                  )}
                  {profile.bust && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Prsa</div>
                      <div className="text-lg font-semibold">{profile.bust}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact CTA */}
              <div className="glass rounded-2xl p-6 space-y-4 sticky top-24">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">Kontaktujte mě</h3>
                  <p className="text-sm text-gray-400">Jsem online a k dispozici</p>
                </div>

                {/* Primary CTA */}
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all w-full"
                >
                  <Phone className="w-5 h-5" />
                  {formatPhone(profile.phone)}
                </a>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-dark-800 px-2 text-gray-400">Nebo napište přes</span>
                  </div>
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
                  <a
                    href={`sms:${profile.phone}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">SMS</span>
                  </a>
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                      <span className="text-sm">Web</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🔥 NABÍZENÉ SLUŽBY */}
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
          <div className="glass rounded-2xl p-2 mt-8 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setActiveTab('o-me')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'o-me'
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                O mně
              </button>
              <button
                onClick={() => setActiveTab('sluzby')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'sluzby'
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Služby
              </button>
              <button
                onClick={() => setActiveTab('pracovni-doba')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'pracovni-doba'
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Pracovní doba
              </button>
              <button
                onClick={() => setActiveTab('recenze')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'recenze'
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Recenze
              </button>
              <button
                onClick={() => setActiveTab('osobni-udaje')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
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
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {profile.description || `Ahoj, jsem ${profile.name} a ráda bych vás přivítala na nezapomenutelnou relaxační chvíli. Nabízím profesionální erotické služby v příjemném a diskrétním prostředí.`}
                </p>
              </div>
            )}

            {/* Služby Tab */}
            {activeTab === 'sluzby' && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-8">
                  <h3 className="text-3xl font-bold mb-6">Nabízené služby</h3>
                  {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map((service: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-dark-800/30 border border-white/10 rounded-xl"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-200">{service.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Žádné služby nejsou specifikovány.</p>
                  )}
                </div>

                {/* Role / Fantasy */}
                {profile?.role && (
                  <div className="glass rounded-2xl p-8">
                    <h3 className="text-3xl font-bold mb-6">Role & Fantasy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.role.split(',').map((role: string, index: number) => {
                        const roleMap: Record<string, string> = {
                          'schoolgirl': 'Školačka',
                          'secretary': 'Sekretářka',
                          'nurse': 'Zdravotní sestra',
                          'teacher': 'Učitelka',
                          'maid': 'Pokojská',
                          'stewardess': 'Letuška',
                          'police': 'Policistka',
                          'student': 'Studentka',
                          'boss': 'Šéfka',
                          'neighbor': 'Sousedka',
                          'librarian': 'Knihovnice',
                          'athlete': 'Sportovkyně',
                        };
                        const roleName = role.trim();
                        const czechLabel = roleMap[roleName] || roleName;

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl"
                          >
                            <Sparkles className="w-5 h-5 text-pink-400" />
                            <span className="text-gray-200">{czechLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pracovní doba Tab */}
            {activeTab === 'pracovni-doba' && (
              <div className="glass rounded-2xl p-8">
                <h3 className="text-3xl font-bold mb-6">Pracovní doba</h3>
                <div className="space-y-3">
                  {daysOfWeek.map((day, index) => {
                    const hours = workingHours[day as keyof typeof workingHours];
                    const isToday = index === todayIndex;

                    return (
                      <div
                        key={day}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          isToday
                            ? 'bg-primary-500/10 border border-primary-500/30'
                            : 'bg-dark-800/30 border border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isToday && <Clock className="w-5 h-5 text-primary-400" />}
                          <span className={`font-semibold ${isToday ? 'text-primary-400' : ''}`}>
                            {dayLabels[day]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {hours.available ? (
                            <span className="text-gray-300">
                              {hours.open} - {hours.close}
                            </span>
                          ) : (
                            <span className="text-gray-500">Zavřeno</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recenze Tab */}
            {activeTab === 'recenze' && (
              <div className="glass rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-2">Recenze</h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-6 h-6 text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-gray-400">0.0 z 5 (0 recenzí)</p>
                </div>
                <div className="text-center text-gray-400 py-12">
                  <p>Zatím žádné recenze. Buďte první, kdo napíše recenzi!</p>
                </div>
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
