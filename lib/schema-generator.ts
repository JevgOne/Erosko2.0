/**
 * Schema Markup Generator for SEO Master
 * Generates structured data (Schema.org) for better search engine visibility
 */

interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

interface PersonData {
  name: string;
  age: number;
  description?: string;
  url: string;
  image?: string;
  jobTitle?: string;
  address?: {
    city: string;
    addressLocality: string;
  };
}

interface LocalBusinessData {
  name: string;
  description?: string;
  url: string;
  image?: string;
  address: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  phone?: string;
  priceRange?: string;
  openingHours?: string[];
  rating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

interface ReviewData {
  itemReviewed: {
    name: string;
    url: string;
  };
  author: string;
  reviewRating: {
    ratingValue: number;
    bestRating: number;
  };
  reviewBody?: string;
  datePublished?: string;
}

/**
 * Generate Organization Schema (for site-wide use)
 */
export function generateOrganizationSchema(data: OrganizationData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo || `${data.url}/logo.png`,
    description: data.description,
    sameAs: data.sameAs || [],
  };
}

/**
 * Generate Person Schema (for escort profiles)
 */
export function generatePersonSchema(data: PersonData): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    url: data.url,
    description: data.description,
  };

  if (data.image) {
    schema.image = data.image;
  }

  if (data.jobTitle) {
    schema.jobTitle = data.jobTitle;
  }

  if (data.address) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: data.address.addressLocality,
    };
  }

  return schema;
}

/**
 * Generate LocalBusiness Schema (for erotic businesses)
 */
export function generateLocalBusinessSchema(data: LocalBusinessData): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    description: data.description,
    url: data.url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion,
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry,
    },
  };

  if (data.image) {
    schema.image = data.image;
  }

  if (data.phone) {
    schema.telephone = data.phone;
  }

  if (data.priceRange) {
    schema.priceRange = data.priceRange;
  }

  if (data.openingHours && data.openingHours.length > 0) {
    schema.openingHoursSpecification = data.openingHours.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours,
    }));
  }

  if (data.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.rating.ratingValue,
      reviewCount: data.rating.reviewCount,
      bestRating: 5,
    };
  }

  return schema;
}

/**
 * Generate Review Schema
 */
export function generateReviewSchema(data: ReviewData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Thing',
      name: data.itemReviewed.name,
      url: data.itemReviewed.url,
    },
    author: {
      '@type': 'Person',
      name: data.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: data.reviewRating.ratingValue,
      bestRating: data.reviewRating.bestRating,
    },
    reviewBody: data.reviewBody,
    datePublished: data.datePublished,
  };
}

/**
 * Generate Image Schema
 */
export function generateImageSchema(imageUrl: string, caption?: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: imageUrl,
    caption: caption,
  };
}

/**
 * Generate complete schema for Profile page
 */
export function generateProfilePageSchema(profile: {
  name: string;
  age: number;
  city: string;
  description?: string;
  slug: string;
  rating?: number;
  reviewCount?: number;
  mainPhotoUrl?: string;
}): object {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erosko.cz';

  return generatePersonSchema({
    name: `${profile.name}, ${profile.age}`,
    age: profile.age,
    description: profile.description,
    url: `${baseUrl}/${profile.slug}`,
    image: profile.mainPhotoUrl,
    jobTitle: 'Escort',
    address: {
      city: profile.city,
      addressLocality: profile.city,
    },
  });
}

/**
 * Generate complete schema for Business page
 */
export function generateBusinessPageSchema(business: {
  name: string;
  city: string;
  address?: string;
  description?: string;
  slug: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  mainPhotoUrl?: string;
  openingHours?: any;
}): object {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erosko.cz';

  // Convert opening hours to Schema.org format
  const openingHoursArray: string[] = [];
  if (business.openingHours) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    Object.entries(business.openingHours).forEach(([day, hours]) => {
      if (hours) {
        openingHoursArray.push(day.charAt(0).toUpperCase() + day.slice(1));
      }
    });
  }

  return generateLocalBusinessSchema({
    name: business.name,
    description: business.description,
    url: `${baseUrl}/${business.slug}`,
    image: business.mainPhotoUrl,
    address: {
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.city,
      addressCountry: 'CZ',
    },
    phone: business.phone,
    priceRange: '$$',
    openingHours: openingHoursArray.length > 0 ? openingHoursArray : undefined,
    rating: business.rating && business.reviewCount ? {
      ratingValue: business.rating,
      reviewCount: business.reviewCount,
    } : undefined,
  });
}

/**
 * Generate BreadcrumbList schema for better navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
