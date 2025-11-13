interface ProfileSchemaProps {
  profile: {
    id: string;
    name: string;
    city: string;
    category: string;
    description?: string;
    phone?: string;
    rating?: number;
    reviewCount?: number;
    verified?: boolean;
    services?: string[];
  };
}

export default function ProfileSchema({ profile }: ProfileSchemaProps) {
  const categoryMap: Record<string, string> = {
    HOLKY_NA_SEX: 'Escort služby',
    EROTICKE_MASERKY: 'Erotické masáže',
    DOMINA: 'BDSM služby',
    DIGITALNI_SLUZBY: 'Digitální služby',
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": profile.name,
    "description": profile.description || `${categoryMap[profile.category] || profile.category} v ${profile.city}`,
    "serviceType": categoryMap[profile.category] || profile.category,
    "telephone": profile.phone,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": profile.city,
      "addressCountry": "CZ"
    },
    ...(profile.rating && profile.reviewCount ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": profile.rating,
        "reviewCount": profile.reviewCount
      }
    } : {}),
    "url": `https://erosko.cz/divky/${(profile as any).slug || profile.id}`
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
