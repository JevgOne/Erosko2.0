'use client';

import { Star, MapPin, CheckCircle, Eye, Heart, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Profile types with their colors
const profileTypes: Record<string, { color: string; label?: string }> = {
  SOLO: { color: 'bg-purple-500' },
  PRIVAT: { color: 'bg-indigo-500' },
  MASSAGE_SALON: { color: 'bg-teal-500' },
  ESCORT_AGENCY: { color: 'bg-pink-500' },
  DIGITAL_AGENCY: { color: 'bg-blue-500', label: 'Digitální Agentura' },
  SWINGERS_CLUB: { color: 'bg-red-500', label: 'Swingers klub' },
  NIGHT_CLUB: { color: 'bg-orange-500', label: 'Night Club' },
  STRIP_CLUB: { color: 'bg-yellow-500', label: 'Strip Club' },
};

// Demo profiles removed - all data now comes from database
export const profiles: any[] = [];

export default function TopProfiles() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Prohlédněte si erotické profily</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Ověřené erotické profily ze všech kategorií
          </p>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-5 gap-4">
          {profiles.slice(0, 15).map((profile) => (
            <Link
              key={profile.id}
              href={`/divky/${profile.slug || profile.id}`}
              className="glass rounded-2xl overflow-hidden card-hover group"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden bg-dark-800">
                {/* Placeholder with gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20"></div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  {profile.isNew && (
                    <span className="bg-blue-500 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                      Nový
                    </span>
                  )}
                  {profile.isPopular && (
                    <span className="bg-orange-500 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-0.5">
                      <span className="text-[9px]">🔥</span>
                      <span>Populární</span>
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <button className="absolute top-2 right-2 z-10 bg-black/50 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                  <Heart className="w-4 h-4 text-white" />
                </button>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              </div>

              {/* Content */}
              <div className="p-3">
                {/* Profile Type Badge - Large */}
                <div className="mb-2">
                  <span className={`${profileTypes[profile.profileType].color} px-2 py-1 rounded-md text-xs font-bold inline-block truncate max-w-full`}>
                    {profile.profileType === 'SOLO'
                      ? 'SOLO'
                      : profile.profileType === 'MASSAGE_SALON'
                      ? `Salon ${profile.businessName}`
                      : profile.profileType === 'PRIVAT'
                      ? `Privát ${profile.businessName}`
                      : profile.profileType === 'ESCORT_AGENCY'
                      ? profile.businessName
                      : profile.businessName
                    }
                  </span>
                </div>

                <h3 className="text-base font-semibold mb-1 truncate flex items-center gap-1">
                  {profile.verified && (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                  <span>{profile.name}, {profile.age}</span>
                  {/* Online Status */}
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${profile.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </h3>

                <div className="flex items-center space-x-1 text-xs text-gray-400 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{profile.location}</span>
                </div>

                <div className="flex items-center space-x-1 text-xs text-gray-400 mb-2">
                  <Phone className="w-3 h-3" />
                  <span className="truncate">{profile.phone}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 truncate">{profile.category}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                    <span className="font-medium">{profile.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/profily"
            className="inline-flex items-center space-x-2 gradient-primary px-8 py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/50 transition-all"
          >
            <span>Zobrazit všechny erotické profily</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
