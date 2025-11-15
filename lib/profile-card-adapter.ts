// Adapter to convert Prisma Profile to ProfileCard format
import type { Profile, Business } from '@prisma/client';
import type { ProfileCard } from '@/types/profile-card';

// Map Prisma Category enum to ProfileCard category
function mapCategory(category: string): ProfileCard['category'] {
  const categoryMap: Record<string, ProfileCard['category']> = {
    HOLKY_NA_SEX: 'HOLKY NA SEX',
    EROTICKE_MASERKY: 'EROTICKÉ MASÁŽE',
    DOMINA: 'BDSM',
    DIGITALNI_SLUZBY: 'DIGITÁLNÍ SLUŽBY',
    EROTICKE_PODNIKY: 'EROTICKÝ PODNIK',
  };

  return categoryMap[category] || 'HOLKY NA SEX';
}

// Convert Prisma Profile to ProfileCard
export function profileToCard(
  profile: Profile & {
    photos?: { url: string; alt?: string | null }[];
    business?: Business | null;
  }
): ProfileCard {
  // Get main photo or first photo
  const mainPhoto = profile.photos?.find(p => p.url) || profile.photos?.[0];
  const imageUrl = mainPhoto?.url || '/placeholder-profile.jpg';
  const imageAlt = mainPhoto?.alt || `${profile.name} - ${profile.city}`;

  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    category: mapCategory(profile.category),

    imageUrl,
    imageAlt,

    isNew: profile.isNew,
    isOnline: profile.isOnline,
    isVerified: profile.verified,

    location: {
      city: profile.city,
      area: profile.address || undefined,
    },

    rating: {
      average: profile.rating,
      count: profile.reviewCount,
    },

    phone: profile.phone,

    profileType: profile.business
      ? {
          type: 'studio',
          studioName: profile.business.name,
          studioUrl: `/podnik/${profile.business.slug}`,
        }
      : {
          type: 'solo',
          soloDescription: getSoloDescription(profile.category, profile.profileType),
        },

    businessInfo: profile.category === 'EROTICKE_PODNIKY' && profile.business
      ? {
          girlsCount: undefined, // TODO: Count profiles in business
          description: profile.business.description || undefined,
        }
      : undefined,

    isFavorite: false, // TODO: Check user favorites

    slug: profile.slug,
  };
}

// Get solo description based on category and profile type
function getSoloDescription(category: string, profileType: string): string {
  if (category === 'EROTICKE_MASERKY') {
    return 'Solo masérka';
  }
  if (category === 'DOMINA') {
    return 'Nezávislá domina';
  }
  if (category === 'DIGITALNI_SLUZBY') {
    return 'Online služby';
  }
  if (profileType === 'PRIVAT') {
    return 'Soukromý privát';
  }
  return 'Nezávislá escort';
}

// Convert Business to ProfileCard
export function businessToCard(
  business: Business & {
    photos?: { url: string; alt?: string | null }[];
    profiles?: Profile[];
  }
): ProfileCard {
  const mainPhoto = business.photos?.find(p => p.url) || business.photos?.[0];
  const imageUrl = mainPhoto?.url || '/placeholder-business.jpg';
  const imageAlt = mainPhoto?.alt || `${business.name} - ${business.city}`;

  return {
    id: business.id,
    name: business.name,
    age: null, // Businesses don't have age
    category: 'EROTICKÝ PODNIK',

    imageUrl,
    imageAlt,

    isNew: business.isNew,
    isOnline: true, // Businesses are always "online"
    isVerified: business.verified,

    location: {
      city: business.city,
      area: business.address || undefined,
    },

    rating: {
      average: business.rating,
      count: business.reviewCount,
    },

    phone: business.phone,

    profileType: {
      type: 'solo',
      soloDescription: getBusinessTypeLabel(business.profileType),
    },

    businessInfo: {
      girlsCount: business.profiles?.length || undefined,
      description: business.description || undefined,
    },

    isFavorite: false,

    slug: business.slug,
  };
}

// Get business type label
function getBusinessTypeLabel(profileType: string): string {
  const typeMap: Record<string, string> = {
    MASSAGE_SALON: 'Masážní salon',
    ESCORT_AGENCY: 'Escort agentura',
    DIGITAL_AGENCY: 'Digitální agentura',
    SWINGERS_CLUB: 'Swingers klub',
    NIGHT_CLUB: 'Night club',
    STRIP_CLUB: 'Strip club',
    PRIVAT: 'Erotický privát',
  };

  return typeMap[profileType] || 'Erotický podnik';
}

// Batch convert profiles to cards
export function profilesToCards(
  profiles: (Profile & {
    photos?: { url: string; alt?: string | null }[];
    business?: Business | null;
  })[]
): ProfileCard[] {
  return profiles.map(profileToCard);
}

// Batch convert businesses to cards
export function businessesToCards(
  businesses: (Business & {
    photos?: { url: string; alt?: string | null }[];
    profiles?: Profile[];
  })[]
): ProfileCard[] {
  return businesses.map(businessToCard);
}
