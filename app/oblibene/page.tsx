'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, Loader2, MapPin, Star, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FavoriteProfile {
  id: string;
  createdAt: string;
  profile: {
    id: string;
    name: string;
    slug: string;
    age: number;
    city: string;
    location: string;
    rating: number;
    reviewCount: number;
    viewCount: number;
    verified: boolean;
    isNew: boolean;
    isOnline: boolean;
    photos: Array<{
      url: string;
      alt?: string;
    }>;
  };
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<FavoriteProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/favorites');
          if (response.ok) {
            const data = await response.json();
            setFavorites(data.favorites || []);
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
        } finally {
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [status]);

  const removeFavorite = async (profileId: string) => {
    try {
      const response = await fetch(`/api/favorites?profileId=${profileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav.profile.id !== profileId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-dark-950">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-400 animate-spin" />
          <p className="text-gray-400">Načítání oblíbených...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-dark-950">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h1 className="text-3xl font-bold mb-4">Oblíbené profily</h1>
          <p className="text-gray-400 mb-6">
            Přihlaste se pro zobrazení oblíbených profilů
          </p>
          <Link
            href="/prihlaseni?redirect=/oblibene"
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:shadow-primary-500/50 transition-all"
          >
            Přihlásit se
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gradient-to-r from-primary-500 to-pink-500 p-3 rounded-xl">
              <Heart className="w-8 h-8" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Moje Oblíbené</h1>
              <p className="text-gray-400 mt-1">
                {favorites.length === 0
                  ? 'Zatím nemáte žádné oblíbené profily'
                  : `${favorites.length} ${
                      favorites.length === 1
                        ? 'oblíbený profil'
                        : favorites.length < 5
                        ? 'oblíbené profily'
                        : 'oblíbených profilů'
                    }`}
              </p>
            </div>
          </div>

          {/* Profiles Grid */}
          {favorites.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-bold mb-2">Zatím žádné oblíbené</h2>
              <p className="text-gray-400 mb-6">
                Začněte procházet profily a přidávejte je do oblíbených
              </p>
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:shadow-primary-500/50 transition-all"
              >
                Procházet profily
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => {
                const profile = favorite.profile;
                const mainPhoto =
                  profile.photos && profile.photos.length > 0
                    ? profile.photos[0]
                    : null;

                return (
                  <div
                    key={profile.id}
                    className="glass rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary-500/20 transition-all group"
                  >
                    <Link href={`/profil/${profile.slug}`} className="block">
                      {/* Image */}
                      <div className="relative h-80 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]">
                        {mainPhoto ? (
                          <Image
                            src={mainPhoto.url}
                            alt={profile.name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            Bez fotky
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {profile.isNew && (
                            <span className="bg-blue-500 px-2 py-1 rounded-lg text-xs font-semibold">
                              Nový profil
                            </span>
                          )}
                          {profile.isOnline && (
                            <span className="bg-green-500 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                              Online
                            </span>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeFavorite(profile.id);
                          }}
                          className="absolute top-3 right-3 bg-pink-500 p-2 rounded-full hover:bg-pink-600 transition-colors"
                          title="Odebrat z oblíbených"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="text-xl font-bold mb-2">
                          {profile.name}, {profile.age}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                          <MapPin className="w-4 h-4 text-primary-400" />
                          <span>{profile.location || profile.city}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                            <span className="text-sm font-medium">
                              {profile.rating > 0 ? profile.rating.toFixed(1) : '0.0'}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({profile.reviewCount})
                            </span>
                          </div>

                          {profile.viewCount > 0 && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <Eye className="w-4 h-4" />
                              <span className="text-xs">{profile.viewCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
