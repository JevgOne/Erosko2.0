// Instagram-style Profile Card Types
// Based on zadani-instagram-karty-erosko.md

export interface ProfileCard {
  // Základní info
  id: string;
  name: string;
  age: number | null; // null pro podniky
  category: 'HOLKY NA SEX' | 'EROTICKÉ MASÁŽE' | 'EROTICKÝ PODNIK' | 'BDSM' | 'DIGITÁLNÍ SLUŽBY';

  // Obrázek
  imageUrl: string;
  imageAlt: string;

  // Status badges
  isNew: boolean;          // Zobrazí "Nový profil" badge
  isOnline: boolean;       // Zobrazí zelený pulsující dot
  isVerified: boolean;     // Zobrazí modré verified checkmark

  // Lokace
  location: {
    city: string;          // např. "Kolín"
    area?: string;         // např. "centrum" (optional)
  };

  // Rating
  rating: {
    average: number;       // např. 5.0
    count: number;         // např. 43 (počet recenzí)
  };

  // Telefon
  phone: string;           // např. "773 424 599"

  // Typ profilu
  profileType: {
    type: 'solo' | 'studio';
    studioName?: string;   // Pokud type === 'studio'
    studioUrl?: string;    // Pokud type === 'studio'
    soloDescription?: string; // Pokud type === 'solo', např. "Solo masérka"
  };

  // Pro podniky (EROTICKÝ PODNIK)
  businessInfo?: {
    girlsCount?: number;   // např. 5
    description?: string;  // např. "Luxusní studio"
  };

  // Favorite state (pro user interakci)
  isFavorite?: boolean;

  // Slug pro detail page
  slug?: string;
}

export interface ProfileCardGridProps {
  cards: ProfileCard[];
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
}

export interface ProfileCardProps {
  card: ProfileCard;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
}
