interface BusinessSchemaProps {
  business: {
    id: string;
    name: string;
    city: string;
    profileType: string;
    description?: string;
    phone: string;
    email?: string;
    website?: string;
    address?: string;
    rating?: number;
    reviewCount?: number;
    openingHours?: Record<string, string>;
  };
}

export default function BusinessSchema({ business }: BusinessSchemaProps) {
  const typeMap: Record<string, string> = {
    PRIVAT: 'Erotický privát',
    MASSAGE_SALON: 'Masážní salon',
    ESCORT_AGENCY: 'Escort agentura',
    SWINGERS_CLUB: 'Swingers klub',
    NIGHT_CLUB: 'Night club',
    STRIP_CLUB: 'Strip club',
  };

  // Convert opening hours to schema.org format
  const openingHoursSpec = business.openingHours ?
    Object.entries(business.openingHours)
      .filter(([_, hours]) => hours && hours !== 'Zavřeno')
      .map(([day, hours]) => {
        const dayMap: Record<string, string> = {
          monday: 'Monday',
          tuesday: 'Tuesday',
          wednesday: 'Wednesday',
          thursday: 'Thursday',
          friday: 'Friday',
          saturday: 'Saturday',
          sunday: 'Sunday',
        };
        return `${dayMap[day]} ${hours}`;
      }) : [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.description || `${typeMap[business.profileType] || business.profileType} v ${business.city}`,
    "serviceType": typeMap[business.profileType] || business.profileType,
    "telephone": business.phone,
    "email": business.email,
    "url": business.website || `https://www.erosko.cz/podnik/${business.id}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address,
      "addressLocality": business.city,
      "addressCountry": "CZ"
    },
    ...(openingHoursSpec.length > 0 ? {
      "openingHours": openingHoursSpec
    } : {}),
    ...(business.rating && business.reviewCount ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": business.rating,
        "reviewCount": business.reviewCount
      }
    } : {})
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
