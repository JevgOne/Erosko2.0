import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import BusinessDetailPage from './business-client';

// Mock data temporarily - will be replaced by DB data
const mockBusiness = {
  id: "1",
  slug: "test-salon",
  name: "Luxury Wellness & Spa",
  verified: true,
  type: 'salon' as const,
  typeLabel: "Salon",
  typeIcon: "✨",

  description: {
    short: "Luxusní wellness centrum v srdci Prahy s profesionálním týmem krásných dívek.",
    full: "Vítejte v nejluxusnějším wellness centru v Praze. Nabízíme širokou škálu erotických služeb v elegantním prostředí. Náš profesionální tým krásných dívek se o vás postará s maximální diskrécí a profesionalitou. K dispozici máme moderně vybavené pokoje, soukromé sprchy, wellness zónu a VIP apartmá pro náročné klienty."
  },

  location: {
    address: "Vinohradská 123",
    city: "Praha 2",
    district: "Vinohrady",
    region: "Praha",
    latitude: 50.0755,
    longitude: 14.4378,
    parking: true,
    parkingDetails: "Soukromé parkoviště v areálu"
  },

  contact: {
    phone: "+420 777 888 999",
    phoneVerified: true,
    whatsapp: "+420 777 888 999",
    telegram: "@luxuryspa",
    email: "info@luxuryspa.cz",
    website: "https://luxuryspa.cz"
  },

  media: {
    logo: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400",
    photos: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200",
        thumbnail: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400",
        order: 0,
        category: 'interior' as const
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1596178060810-a4cf5c5a4ac2?w=1200",
        thumbnail: "https://images.unsplash.com/photo-1596178060810-a4cf5c5a4ac2?w=400",
        order: 1,
        category: 'interior' as const
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200",
        thumbnail: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
        order: 2,
        category: 'facility' as const
      }
    ]
  },

  workingHours: {
    monday: { open: "10:00", close: "22:00", available: true },
    tuesday: { open: "10:00", close: "22:00", available: true },
    wednesday: { open: "10:00", close: "22:00", available: true },
    thursday: { open: "10:00", close: "22:00", available: true },
    friday: { open: "10:00", close: "24:00", available: true },
    saturday: { open: "12:00", close: "24:00", available: true },
    sunday: { open: "12:00", close: "20:00", available: true }
  },

  facilities: {
    amenities: ['jacuzzi', 'sauna', 'shower', 'drinks', 'wifi', 'ac', 'parking', 'discreet'],
    rooms: 5,
    private: true,
    discreet: true,
    accessibility: true,
    languages: ['cs', 'en', 'de']
  },

  stats: {
    views: 3421,
    favorites: 89,
    profilesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  profiles: [],

  reviews: {
    overall: {
      average: 0,
      count: 0
    },
    vibe: {
      atmosphere: 0,
      cleanliness: 0,
      service: 0,
      discretion: 0,
      valueForMoney: 0
    },
    items: []
  }
};

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;

  // Try to fetch business from database
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      photos: {
        orderBy: { order: 'asc' }
      },
      profiles: {
        where: { approved: true },
        include: {
          photos: {
            where: { isMain: true },
            take: 1
          }
        },
        take: 6
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              phone: true
            }
          }
        },
        take: 10
      }
    }
  });

  // If no business found, return 404
  if (!business) {
    notFound();
  }

  // Transform database data to match the Business interface expected by client component
  const businessData = {
    id: business.id,
    slug: business.slug,
    name: business.name,
    verified: business.verified,

    type: (business.profileType.toLowerCase() === 'massage_salon' ? 'salon' :
           business.profileType.toLowerCase()) as any,
    typeLabel: business.profileType === 'MASSAGE_SALON' ? 'Salon' : business.profileType,
    typeIcon: mockBusiness.typeIcon,

    description: {
      short: business.description?.substring(0, 150) || mockBusiness.description.short,
      full: business.description || mockBusiness.description.full
    },

    location: {
      address: business.address || mockBusiness.location.address,
      city: business.city,
      district: mockBusiness.location.district,
      region: mockBusiness.location.region,
      latitude: mockBusiness.location.latitude,
      longitude: mockBusiness.location.longitude,
      parking: business.address !== null,
      parkingDetails: mockBusiness.location.parkingDetails
    },

    contact: {
      phone: business.phone,
      phoneVerified: business.verified,
      email: business.email || undefined,
      website: business.website || undefined,
      whatsapp: undefined,
      telegram: undefined
    },

    media: {
      logo: business.photos[0]?.url || mockBusiness.media.logo,
      photos: business.photos.length > 0
        ? business.photos.map(photo => ({
            id: photo.id,
            url: photo.url,
            thumbnail: photo.url,
            order: photo.order,
            category: 'interior' as const
          }))
        : mockBusiness.media.photos
    },

    workingHours: (business.openingHours as any) || mockBusiness.workingHours,

    facilities: mockBusiness.facilities,

    stats: {
      views: business.viewCount,
      favorites: 0,
      profilesCount: business.profiles?.length || 0,
      createdAt: business.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: business.updatedAt?.toISOString() || new Date().toISOString()
    },

    profiles: [],

    reviews: {
      overall: {
        average: business.reviews.length > 0 ? business.rating : 0,
        count: business.reviews.length
      },
      vibe: {
        atmosphere: 0,
        cleanliness: 0,
        service: 0,
        discretion: 0,
        valueForMoney: 0
      },
      items: business.reviews.map(review => ({
        id: review.id,
        overallRating: review.rating,
        vibeRatings: {
          atmosphere: review.vibeAtmosphere || 0,
          cleanliness: review.vibeCleanliness || 0,
          service: review.vibeService || 0,
          discretion: review.vibeDiscretion || 0,
          valueForMoney: review.vibeValue || 0
        },
        author: review.author?.phone ? `Uživatel ${review.author.phone.slice(-4)}` : 'Anonymní',
        date: review.createdAt.toISOString(),
        text: review.text,
        verified: review.verified,
        helpful: 0
      }))
    }
  };

  return <BusinessDetailPage business={businessData} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;

  const business = await prisma.business.findUnique({
    where: { slug },
    select: {
      name: true,
      seoTitle: true,
      seoDescription: true,
      description: true,
      city: true
    }
  });

  if (!business) {
    return {
      title: 'Podnik nenalezen',
      description: 'Tento podnik nebyl nalezen'
    };
  }

  const title = business.seoTitle || `${business.name} - ${business.city} | EROSKO.CZ`;
  const description = business.seoDescription || business.description || `Navštivte ${business.name} v ${business.city}. Profesionální erotické služby.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://erosko.cz/podnik/${slug}`,
      siteName: 'EROSKO.CZ',
      locale: 'cs_CZ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://erosko.cz/podnik/${slug}`,
    },
  };
}
