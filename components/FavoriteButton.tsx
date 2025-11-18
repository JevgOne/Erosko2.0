'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  profileId: string;
  className?: string;
  variant?: 'default' | 'icon';
}

export default function FavoriteButton({ profileId, className = '', variant = 'default' }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if already favorited
  useEffect(() => {
    const checkFavorite = async () => {
      if (session?.user) {
        try {
          const response = await fetch(`/api/favorites/check?profileId=${profileId}`);
          if (response.ok) {
            const data = await response.json();
            setIsFavorite(data.isFavorite);
          }
        } catch (error) {
          console.error('Error checking favorite:', error);
        } finally {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    };

    checkFavorite();
  }, [session, profileId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push('/prihlaseni?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?profileId=${profileId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId }),
        });

        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <button
        disabled
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 text-gray-500 cursor-wait ${className}`}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        {variant === 'default' && <span>Načítání...</span>}
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
          isFavorite
            ? 'bg-pink-500 text-white hover:bg-pink-600'
            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
        } ${loading ? 'cursor-wait opacity-50' : ''} ${className}`}
        title={isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
          />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
        isFavorite
          ? 'bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20'
          : 'glass text-gray-300 hover:bg-white/10'
      } ${loading ? 'cursor-wait opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Ukládám...</span>
        </>
      ) : (
        <>
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
          />
          <span>{isFavorite ? 'V oblíbených' : 'Přidat do oblíbených'}</span>
        </>
      )}
    </button>
  );
}
