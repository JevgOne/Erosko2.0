export type BusinessType = 'salon' | 'privat' | 'bdsm' | 'online';

export interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface BusinessCard {
  id: string;
  name: string;
  slug: string;
  type: BusinessType;
  category: string; // "EROTICKÝ PODNIK"
  description: string;
  imageUrl: string;
  imageAlt: string;

  // Status
  isOnline: boolean;
  isVerified: boolean;
  isOpen: boolean;

  // Location
  location: {
    city: string;
    area?: string;
    fullAddress?: string;
  };

  // Stats
  rating: {
    average: number;
    count: number;
  };
  girlsCount?: number;
  onlineNow?: number; // For online services

  // Contact
  phone: string;
  website?: string;

  // Opening hours
  openingHours: OpeningHours | null;
  is24_7?: boolean;
  currentDayHours?: string;

  // Optional
  isFavorite?: boolean;
}
