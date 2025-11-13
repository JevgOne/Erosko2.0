'use client';

import { useState } from 'react';
import { Star, MapPin, CheckCircle, Heart, Phone } from 'lucide-react';
import Link from 'next/link';

// Profile types with their colors
const profileTypes: Record<string, { color: string }> = {
  SOLO: { color: 'bg-purple-500' },
  PRIVAT: { color: 'bg-indigo-500' },
  MASSAGE_SALON: { color: 'bg-teal-500' },
  ESCORT_AGENCY: { color: 'bg-pink-500' },
  DIGITAL_AGENCY: { color: 'bg-blue-500' },
  SWINGERS_CLUB: { color: 'bg-red-500' },
  NIGHT_CLUB: { color: 'bg-orange-500' },
  STRIP_CLUB: { color: 'bg-yellow-500' },
};

interface Profile {
  id: number;
  name: string;
  age: number;
  location: string;
  category: string;
  rating: number;
  reviews: number;
  verified: boolean;
  isNew: boolean;
  isPopular: boolean;
  profileType: keyof typeof profileTypes;
  businessName: string | null;
  phone: string;
  isOnline: boolean;
  image: string;
  offersEscort?: boolean;
  travels?: boolean;
}

interface ProfileGridProps {
  profiles: Profile[];
  title?: string;
  description?: string;
}

export default function ProfileGrid({ profiles, title, description }: ProfileGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 18; // 3 rows x 6 profiles

  // Calculate pagination
  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = profiles.slice(indexOfFirstProfile, indexOfLastProfile);
  const totalPages = Math.ceil(profiles.length / profilesPerPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {(title || description) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">{title}</span>
              </h2>
            )}
            {description && (
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Profiles Grid */}
        {profiles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {currentProfiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/divky/${(profile as any).slug || profile.id}`}
                className="glass rounded-2xl overflow-hidden card-hover group"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-dark-800">
                  {/* Profile Image */}
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Placeholder with gradient (fallback) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 mix-blend-overlay"></div>

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
                    <span className={`${profileTypes[profile.profileType]?.color || 'bg-gray-500'} px-2 py-1 rounded-md text-xs font-bold inline-block truncate max-w-full`}>
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

                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-xs px-2 py-1 bg-primary-500/10 text-primary-400 rounded-full font-semibold">
                      {profile.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                      <span className="font-medium">{profile.rating}</span>
                    </div>
                  </div>

                  {/* Escort & Travel Badges - separate from top badges */}
                  {(profile.offersEscort || profile.travels) && (
                    <div className="flex flex-wrap gap-1">
                      {profile.offersEscort && (
                        <span className="inline-flex items-center text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-semibold border border-purple-500/30">
                          Escort
                        </span>
                      )}
                      {profile.travels && (
                        <span className="inline-flex items-center text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-semibold border border-blue-500/30">
                          Cestuji
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="glass px-4 py-2 rounded-lg glass-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Předchozí
                </button>

                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'gradient-primary'
                          : 'glass glass-hover'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="glass px-4 py-2 rounded-lg glass-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Další
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">Žádné profily nenalezeny v této kategorii</p>
          </div>
        )}
      </div>
    </section>
  );
}
