import { Business } from '@prisma/client';
import { BusinessCard, BusinessType, OpeningHours } from '@/types/business-card';

type BusinessWithPhotos = Business & {
  photos?: Array<{ url: string; alt?: string | null }>;
  profiles?: Array<any>; // For counting girls
};

/**
 * Maps Prisma ProfileType to BusinessType
 */
function mapProfileTypeToBusinessType(profileType: string): BusinessType {
  const mapping: Record<string, BusinessType> = {
    MASSAGE_SALON: 'salon',
    PRIVAT: 'privat',
    ESCORT_AGENCY: 'privat',
    DIGITAL_AGENCY: 'online',
    SWINGERS_CLUB: 'bdsm',
    NIGHT_CLUB: 'salon',
    STRIP_CLUB: 'salon',
  };

  return mapping[profileType] || 'salon';
}

/**
 * Determines business category label
 */
function getBusinessCategory(profileType: string): string {
  const categories: Record<string, string> = {
    MASSAGE_SALON: 'EROTICKÝ SALON',
    PRIVAT: 'EROTICKÝ PODNIK',
    ESCORT_AGENCY: 'ESCORT AGENTURA',
    DIGITAL_AGENCY: 'DIGITÁLNÍ SLUŽBY',
    SWINGERS_CLUB: 'SWINGERS KLUB',
    NIGHT_CLUB: 'NIGHT CLUB',
    STRIP_CLUB: 'STRIP CLUB',
  };

  return categories[profileType] || 'EROTICKÝ PODNIK';
}

/**
 * Parses opening hours from JSON to OpeningHours interface
 */
function parseOpeningHours(openingHoursJson: any): OpeningHours | null {
  if (!openingHoursJson || typeof openingHoursJson !== 'object') {
    return null;
  }

  // Ensure all days are present
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hours: any = {};

  for (const day of days) {
    hours[day] = openingHoursJson[day] || 'Zavřeno';
  }

  return hours as OpeningHours;
}

/**
 * Checks if business is currently open based on opening hours
 */
function isBusinessOpen(openingHours: OpeningHours | null): boolean {
  if (!openingHours) return false;

  const now = new Date();
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    now.getDay()
  ] as keyof OpeningHours;

  const todayHours = openingHours[currentDay];
  if (!todayHours || todayHours === 'Zavřeno') return false;

  const currentTime = now.getHours() * 60 + now.getMinutes();

  try {
    const [open, close] = todayHours.split('-').map((time) => {
      const [hours, minutes] = time.trim().split(':').map(Number);
      return hours * 60 + minutes;
    });

    // Handle overnight hours (e.g., 20:00-04:00)
    if (close < open) {
      return currentTime >= open || currentTime < close;
    }

    return currentTime >= open && currentTime < close;
  } catch (error) {
    return false;
  }
}

/**
 * Gets current day's opening hours
 */
function getCurrentDayHours(openingHours: OpeningHours | null): string | undefined {
  if (!openingHours) return undefined;

  const now = new Date();
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    now.getDay()
  ] as keyof OpeningHours;

  return openingHours[currentDay];
}

/**
 * Converts Prisma Business model to BusinessCard interface
 */
export function businessToBusinessCard(business: BusinessWithPhotos): BusinessCard {
  const openingHours = parseOpeningHours(business.openingHours);
  const mainPhoto = business.photos?.find((p) => p) || business.photos?.[0];

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    type: mapProfileTypeToBusinessType(business.profileType),
    category: getBusinessCategory(business.profileType),
    description: business.description || '',
    imageUrl: mainPhoto?.url || '/placeholder-business.svg',
    imageAlt: mainPhoto?.alt || business.name,

    // Status
    isOnline: false, // Businesses don't have online status
    isVerified: business.verified,
    isOpen: isBusinessOpen(openingHours),

    // Location
    location: {
      city: business.city,
      area: business.address || undefined,
      fullAddress: business.address || undefined,
    },

    // Stats
    rating: {
      average: business.rating || 0,
      count: business.reviewCount || 0,
    },
    girlsCount: business.profiles?.length || undefined,

    // Contact
    phone: business.phone,
    website: business.website || undefined,

    // Opening hours
    openingHours: openingHours,
    currentDayHours: getCurrentDayHours(openingHours),

    // Optional
    isFavorite: false, // Will be set based on user's favorites
  };
}

/**
 * Converts array of Prisma Business models to BusinessCard array
 */
export function businessesToBusinessCards(businesses: BusinessWithPhotos[]): BusinessCard[] {
  return businesses.map(businessToBusinessCard);
}
