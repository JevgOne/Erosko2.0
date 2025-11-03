'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star, MapPin, CheckCircle, Phone, Heart, Globe2, Clock, Building2, Users, Award, Shield, Mail, MessageSquare, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import BusinessLocationMap from '@/components/BusinessLocationMap';

const profileTypes = {
  SOLO: { color: 'bg-purple-500', label: 'SOLO' },
  PRIVAT: { color: 'bg-indigo-500', label: 'Privát' },
  MASSAGE_SALON: { color: 'bg-teal-500', label: 'Masážní salon' },
  ESCORT_AGENCY: { color: 'bg-pink-500', label: 'Escort Agentura' },
  DIGITAL_AGENCY: { color: 'bg-blue-500', label: 'Digitální Agentura' },
  SWINGERS_CLUB: { color: 'bg-red-500', label: 'Swingers klub' },
  NIGHT_CLUB: { color: 'bg-orange-500', label: 'Night Club' },
  STRIP_CLUB: { color: 'bg-yellow-500', label: 'Strip Club' },
};

const czechDays = {
  monday: 'Pondělí',
  tuesday: 'Úterý',
  wednesday: 'Středa',
  thursday: 'Čtvrtek',
  friday: 'Pátek',
  saturday: 'Sobota',
  sunday: 'Neděle',
};

export default function BusinessDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const response = await fetch(`/api/businesses/${slug}`);
        if (!response.ok) {
          setError(true);
          return;
        }
        const data = await response.json();
        setBusiness(data);
      } catch (err) {
        console.error('Error fetching business:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBusiness();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Načítání...</h1>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !business) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Podnik nenalezen</h1>
          <p className="text-gray-400 mb-8">
            Omlouváme se, tento podnik neexistuje nebo byl odstraněn.
          </p>
          <Link
            href="/eroticke-podniky"
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg font-semibold"
          >
            Zpět na podniky
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const averageRating = 4.5; // TODO: Calculate from real reviews
  const totalReviews = business.profiles?.length * 3 || 0;

  function getCategoryInfo(profileType: string) {
    switch (profileType) {
      case 'MASSAGE_SALON':
        return {
          category: 'Erotické masáže',
          categoryUrl: '/eroticke-masaze',
          description: 'Profesionální masážní salon s diskrétním prostředím a kvalitními službami.',
        };
      case 'PRIVAT':
        return {
          category: 'Holky na sex',
          categoryUrl: '/holky-na-sex',
          description: 'Privátní prostředí s profesionálními slečnami pro nezapomenutelné chvíle.',
        };
      case 'ESCORT_AGENCY':
        return {
          category: 'Holky na escort',
          categoryUrl: '/escort',
          description: 'Prémiová escort agentura s ověřenými a diskrétními slečnami.',
        };
      case 'DIGITAL_AGENCY':
        return {
          category: 'Digitální služby',
          categoryUrl: '/online-sex',
          description: 'Online erotické služby - video hovory, cam shows a premium obsah.',
        };
      default:
        return {
          category: 'Erotické služby',
          categoryUrl: '/eroticke-podniky',
          description: 'Profesionální erotické služby v příjemném prostředí.',
        };
    }
  }

  const categoryInfo = getCategoryInfo(business.profileType);
  const mainPhoto = business.photos?.find((p: any) => p.isMain) || business.photos?.[0];

  return (
    <main className="min-h-screen bg-dark-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Profile Card - Photo + Info */}
          <div className="glass rounded-3xl p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Main Photo */}
              <div className="relative h-full min-h-[600px] rounded-2xl overflow-hidden group cursor-pointer">
                {mainPhoto ? (
                  <img
                    src={mainPhoto.url}
                    alt={business.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30"></div>
                )}

                {/* Business Type Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`${profileTypes[business.profileType]?.color || 'bg-gray-500'} px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2`}>
                    <Building2 className="w-4 h-4" />
                    {profileTypes[business.profileType]?.label || business.profileType}
                  </span>
                </div>

                {/* Verified Badge */}
                {business.verified && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-green-500 px-3 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Ověřeno
                    </span>
                  </div>
                )}

                {/* New Badge */}
                {business.isNew && (
                  <div className="absolute top-16 right-4 z-10">
                    <span className="bg-blue-500 px-3 py-1.5 rounded-full text-sm font-semibold">
                      NOVÝ
                    </span>
                  </div>
                )}

                {/* More Photos Badge */}
                {business.photos && business.photos.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-10">
                    <span className="glass px-4 py-2 rounded-xl text-sm font-semibold">
                      +{business.photos.length - 1} fotek
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
              </div>

              {/* Right: Business Info */}
              <div className="space-y-6">
                {/* Business Name and Category */}
                <div>
                <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
                  {business.name}
                  {business.verified && (
                    <Shield className="w-8 h-8 text-green-500" />
                  )}
                </h1>
                <Link
                  href={categoryInfo.categoryUrl}
                  className="text-xl text-primary-400 font-semibold mb-2 hover:text-pink-400 transition-colors inline-block"
                >
                  {categoryInfo.category} →
                </Link>
                <p className="text-gray-400 text-lg mt-2">{categoryInfo.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rating */}
                <div className="bg-yellow-500/20 backdrop-blur-sm px-6 py-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                    <span className="text-3xl font-bold">{averageRating}</span>
                  </div>
                  <p className="text-sm text-gray-400">{totalReviews} hodnocení</p>
                </div>

                {/* Number of Girls */}
                <div className="bg-primary-500/20 backdrop-blur-sm px-6 py-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-6 h-6 text-primary-400" />
                    <span className="text-3xl font-bold">{business.profiles?.length || 0}</span>
                  </div>
                  <p className="text-sm text-gray-400">Dívek k dispozici</p>
                </div>

                {/* Verified Business */}
                {business.verified && (
                  <div className="bg-green-500/20 backdrop-blur-sm px-6 py-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-6 h-6 text-green-400" />
                      <span className="text-lg font-bold">Ověřený</span>
                    </div>
                    <p className="text-sm text-gray-400">Podnik je ověřený</p>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-lg">
                    <MapPin className="w-6 h-6 text-primary-400 flex-shrink-0" />
                    <span>{business.city}{business.address ? `, ${business.address}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-3 text-lg">
                    <Phone className="w-6 h-6 text-primary-400 flex-shrink-0" />
                    <span className="font-semibold">{business.phone}</span>
                  </div>
                  {business.website && (
                    <div className="flex items-center gap-3 text-lg">
                      <Globe2 className="w-6 h-6 text-primary-400 flex-shrink-0" />
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-400 transition-colors truncate"
                      >
                        {business.website.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-3 text-lg">
                      <Mail className="w-6 h-6 text-primary-400 flex-shrink-0" />
                      <a
                        href={`mailto:${business.email}`}
                        className="hover:text-primary-400 transition-colors truncate"
                      >
                        {business.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Opening Hours */}
                <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-primary-400" />
                    <h4 className="font-semibold">Otevírací doba</h4>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {[
                      { day: 'Pondělí', hours: '9:00 - 22:00', open: true },
                      { day: 'Úterý', hours: '9:00 - 22:00', open: true },
                      { day: 'Středa', hours: '9:00 - 22:00', open: true },
                      { day: 'Čtvrtek', hours: '9:00 - 22:00', open: true },
                      { day: 'Pátek', hours: '9:00 - 23:00', open: true },
                      { day: 'Sobota', hours: '10:00 - 23:00', open: true },
                      { day: 'Neděle', hours: '10:00 - 22:00', open: true },
                    ].map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-400">{schedule.day}</span>
                        <span className={schedule.open ? 'text-green-400 font-medium' : 'text-red-400'}>
                          {schedule.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/50 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    Zavolat
                  </a>
                  <button className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all">
                    <Heart className="w-5 h-5" />
                    Oblíbené
                  </button>
                </div>

                {/* Communication Options */}
                <div className="grid grid-cols-4 gap-2">
                  <a
                    href={`sms:${business.phone}`}
                    className="flex flex-col items-center justify-center gap-1 px-3 py-3 glass rounded-xl hover:bg-white/10 transition-all"
                  >
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-medium">SMS</span>
                  </a>
                  <a
                    href={`https://wa.me/${business.phone.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 px-3 py-3 glass rounded-xl hover:bg-white/10 transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="text-xs font-medium">WhatsApp</span>
                  </a>
                  <a
                    href={`https://t.me/${business.phone.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 px-3 py-3 glass rounded-xl hover:bg-white/10 transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0088cc">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span className="text-xs font-medium">Telegram</span>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${business.city}, ${business.address || ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 px-3 py-3 glass rounded-xl hover:bg-white/10 transition-all"
                  >
                    <MapPin className="w-5 h-5 text-red-400" />
                    <span className="text-xs font-medium">Navigace</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* About Section */}
          <div className="glass rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-primary-400" />
              O podniku
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {business.description || `Vítejte v ${business.name}! Jsme profesionální ${profileTypes[business.profileType]?.label.toLowerCase() || 'erotické služby'} v ${business.city}${business.profiles && business.profiles.length > 0 ? ` s týmem ${business.profiles.length} krásných a profesionálních dívek` : ''}. Nabízíme diskrétní prostředí, maximální hygienu a nezapomenutelné zážitky. Naše služby jsou vždy na vysoké úrovni a klademe důraz na spokojenost našich klientů. Těšíme se na vaši návštěvu!`}
            </p>
          </div>

          {/* Equipment & Location */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Equipment */}
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary-400" />
                Vybavení
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { icon: '❄️', label: 'Klimatizace' },
                  { icon: '🚿', label: 'Sprcha' },
                  { icon: '✅', label: 'Hygiena' },
                  { icon: '🅿️', label: 'Parkování' },
                  { icon: '💳', label: 'Platba kartou' },
                  { icon: '🚪', label: 'Diskrétní vchod' },
                  { icon: '🌐', label: 'Wi-Fi' },
                  { icon: '🔒', label: 'Bezpečné prostředí' },
                  { icon: '🧖', label: 'Sauna' },
                  { icon: '🛁', label: 'Whirlpool' },
                  { icon: '🎵', label: 'Hudba' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-dark-800/50 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center gap-2 hover:bg-dark-800 transition-colors"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-xs text-center text-gray-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div className="lg:col-span-1">
              <BusinessLocationMap
                businessName={business.name}
                location={business.city}
                fullAddress={`${business.city}${business.address ? `, ${business.address}` : ''}`}
              />
            </div>
          </div>

          {/* Workers/Profiles Section */}
          {business.profiles && business.profiles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-primary-400" />
                Naše dívky ({business.profiles.length})
              </h2>

              {/* Profiles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {business.profiles.map((profile: any) => (
                  <Link
                    key={profile.id}
                    href={`/profil/${profile.slug || profile.id}`}
                    className="glass rounded-2xl overflow-hidden card-hover group"
                  >
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden bg-dark-800">
                      {profile.photos && profile.photos.length > 0 ? (
                        <img
                          src={profile.photos[0].url}
                          alt={profile.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20"></div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {profile.isNew && (
                          <span className="bg-blue-500 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            Nový
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="text-base font-semibold mb-1 truncate flex items-center gap-1">
                        {profile.verified && (
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        )}
                        <span>{profile.name}{profile.age ? `, ${profile.age}` : ''}</span>
                      </h3>

                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-500 truncate">{profile.category || 'Escort'}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                          <span className="font-medium">4.5</span>
                        </div>
                      </div>

                      {profile.phone && (
                        <div className="text-xs text-gray-400">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {profile.phone}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
