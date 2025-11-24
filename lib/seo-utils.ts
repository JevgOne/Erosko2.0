// SEO Utility Functions - Automatické generování META tagů a ALT textů

type ProfileCategory = 'HOLKY_NA_SEX' | 'EROTICKE_MASERKY' | 'DOMINA' | 'DIGITALNI_SLUZBY';
type BusinessType = 'PRIVAT' | 'MASSAGE_SALON' | 'ESCORT_AGENCY' | 'SWINGERS_CLUB' | 'NIGHT_CLUB' | 'STRIP_CLUB';

interface ProfileSEOData {
  name: string;
  age?: number;
  city: string;
  category: ProfileCategory;
  services?: string[];
  description?: string;
  verified?: boolean;
}

interface BusinessSEOData {
  name: string;
  city: string;
  profileType: BusinessType;
  description?: string;
  rating?: number;
  reviewCount?: number;
}

// Kategorie mapa pro lepší SEO
const categoryKeywords: Record<ProfileCategory, { main: string; alt: string[]; emoji: string }> = {
  HOLKY_NA_SEX: {
    main: 'holky na sex',
    alt: ['společnice', 'dívky na sex', 'holka na privát', 'sex holky', 'call girls'],
    emoji: '💋'
  },
  EROTICKE_MASERKY: {
    main: 'erotické masáže',
    alt: ['tantra masáž', 'erotická masérka', 'masáž', 'relaxační masáž', 'body to body'],
    emoji: '💆'
  },
  DOMINA: {
    main: 'domina',
    alt: ['BDSM', 'SM privát', 'femdom', 'dominatrix', 'mistress'],
    emoji: '⛓️'
  },
  DIGITALNI_SLUZBY: {
    main: 'digitální služby',
    alt: ['webcam', 'videochat', 'phone sex', 'online'],
    emoji: '📱'
  }
};

const businessKeywords: Record<BusinessType, { main: string; alt: string[] }> = {
  PRIVAT: { main: 'erotický privát', alt: ['privát', 'erotický salon'] },
  MASSAGE_SALON: { main: 'masážní salon', alt: ['erotické masáže', 'tantra salon'] },
  ESCORT_AGENCY: { main: 'agentura', alt: ['escort agentura', 'společnice'] },
  SWINGERS_CLUB: { main: 'swingers klub', alt: ['swing klub', 'páry'] },
  NIGHT_CLUB: { main: 'night club', alt: ['erotický klub', 'nightclub'] },
  STRIP_CLUB: { main: 'strip club', alt: ['stripclub', 'striptýz'] }
};

/**
 * Generuje optimalizovaný META title pro profil
 * Lepší než konkurence: více variant, long-tail keywords
 */
export function generateProfileMetaTitle(data: ProfileSEOData): string {
  const cat = categoryKeywords[data.category];
  const ageStr = data.age ? `, ${data.age} let` : '';
  const verified = data.verified ? ' ✓' : '';

  // Varianta 1: Jméno + služba + město (nejvíc se používá)
  return `${data.name}${ageStr} - ${cat.main} ${data.city}${verified} | EROSKO.CZ`;
}

/**
 * Generuje META description pro profil
 * 3 varianty pro rotaci (lepší CTR než konkurence)
 */
export function generateProfileMetaDescription(data: ProfileSEOData, variant: 1 | 2 | 3 = 1): string {
  const cat = categoryKeywords[data.category];
  const ageStr = data.age ? ` (${data.age} let)` : '';
  const verified = data.verified ? ' ✨ Ověřený profil.' : '';
  const services = data.services?.slice(0, 3).join(', ') || cat.alt.slice(0, 3).join(', ');

  const descriptions = [
    // Varianta 1: Emotivní s emoji
    `${cat.emoji} ${data.name}${ageStr} - ${cat.main} ${data.city}.${verified} ${services}. 📞 Reálné fotky, diskrétní jednání.`,

    // Varianta 2: Faktická
    `${data.name} nabízí ${cat.main} v ${data.city}.${verified} Služby: ${services}. Kontakt a fotky na profilu.`,

    // Varianta 3: S výhodami
    `${cat.emoji} Ověřená ${cat.main} ${data.city} - ${data.name}${ageStr}. ${services}. ⭐ Bez zprostředkovatele. 📞 Přímý kontakt.`
  ];

  return descriptions[variant - 1];
}

/**
 * Generuje keywords pro profil
 * 12-15 keywords s long-tail variantami
 */
export function generateProfileKeywords(data: ProfileSEOData): string {
  const cat = categoryKeywords[data.category];

  const keywords = [
    `${data.name} ${data.city}`,
    `${cat.main} ${data.city}`,
    ...cat.alt.map(alt => `${alt} ${data.city}`),
    cat.main,
    `${data.city} ${cat.alt[0]}`,
    data.verified ? `ověřená ${cat.main}` : `${cat.main} inzerce`,
    `diskrétní ${cat.main}`,
    `reálné fotky ${data.city}`
  ];

  return keywords.slice(0, 15).join(', ');
}

/**
 * Generuje ALT text pro fotku profilu
 * Formát jako Eroguide ale s více kontextem
 */
export function generateProfileImageAlt(data: ProfileSEOData, imageIndex: number = 0): string {
  const cat = categoryKeywords[data.category];
  const ageStr = data.age ? `, ${data.age} let` : '';
  const verified = data.verified ? ' - Ověřený profil' : '';

  const alts = [
    `${data.name}${ageStr} - ${cat.main} ${data.city}${verified}`,
    `Fotka ${data.name} - ${cat.alt[0]} ${data.city}`,
    `${data.name} - ${cat.main} ${data.city} - reálné fotky`,
    `Profil ${data.name} - ${cat.main} ${data.city}`
  ];

  return alts[imageIndex % alts.length];
}

/**
 * Generuje META title pro podnik
 */
export function generateBusinessMetaTitle(data: BusinessSEOData): string {
  const type = businessKeywords[data.profileType];
  const rating = data.rating ? ` ⭐ ${data.rating.toFixed(1)}` : '';

  return `${data.name} - ${type.main} ${data.city}${rating} | EROSKO.CZ`;
}

/**
 * Generuje META description pro podnik
 */
export function generateBusinessMetaDescription(data: BusinessSEOData): string {
  const type = businessKeywords[data.profileType];
  const rating = data.rating && data.reviewCount
    ? ` ⭐ Hodnocení ${data.rating.toFixed(1)}/5 (${data.reviewCount} recenzí).`
    : '';
  const desc = data.description
    ? ` ${data.description.slice(0, 100)}...`
    : ` Kvalitní ${type.main} v ${data.city}.`;

  return `🏢 ${data.name} - ${type.main} ${data.city}.${rating}${desc} Fotky, otevírací doba, kontakt.`;
}

/**
 * Generuje keywords pro podnik
 */
export function generateBusinessKeywords(data: BusinessSEOData): string {
  const type = businessKeywords[data.profileType];

  const keywords = [
    `${data.name} ${data.city}`,
    `${type.main} ${data.city}`,
    ...type.alt.map(alt => `${alt} ${data.city}`),
    type.main,
    `erotický podnik ${data.city}`,
    `${data.city} ${type.alt[0]}`,
    `recenze ${type.main}`,
    `otevírací doba ${data.city}`
  ];

  return keywords.slice(0, 12).join(', ');
}

/**
 * Generuje ALT text pro fotku podniku
 */
export function generateBusinessImageAlt(data: BusinessSEOData, imageType: 'main' | 'interior' | 'exterior' = 'main'): string {
  const type = businessKeywords[data.profileType];

  const typeTexts = {
    main: `${data.name} - ${type.main} ${data.city}`,
    interior: `Interiér ${data.name} - ${type.main} ${data.city}`,
    exterior: `Exteriér a vstup ${data.name} - ${data.city}`
  };

  return typeTexts[imageType];
}

/**
 * Generuje canonical URL
 */
export function generateCanonicalUrl(type: 'profile' | 'business', slug: string): string {
  const base = 'https://www.erosko.cz';
  return type === 'profile'
    ? `${base}/divky/${slug}`  // ← SEO keyword "dívky" v URL!
    : `${base}/podnik/${slug}`;
}
