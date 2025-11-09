// Aktualizovaný typ pro scraped profily
// S podporou původních kategorií a mapping confidence

export interface ScrapedProfile {
  // ===== ZÁKLADNÍ INFO =====
  name: string;
  slug: string;
  age?: number;
  description?: string;
  phone: string;
  email?: string;

  // ===== LOKACE =====
  city: string;
  address?: string;
  location: string;

  // ===== NAŠE KATEGORIE (erosko.cz) =====
  profileType: 'SOLO' | 'PRIVAT' | 'MASSAGE_SALON' | 'ESCORT_AGENCY' | 'DIGITAL_AGENCY' | 'SWINGERS_CLUB' | 'NIGHT_CLUB' | 'STRIP_CLUB';
  category: 'HOLKY_NA_SEX' | 'EROTICKE_MASERKY' | 'DOMINA' | 'DIGITALNI_SLUZBY' | 'EROTICKE_PODNIKY';

  // ===== 🆕 PŮVODNÍ DATA ZE SOURCE WEBU =====
  source_original_category?: string;       // Např. "Erotické masáže", "VIP Escort", "Privát Praha"
  source_original_tags?: string[];         // Např. ["24/7", "Hotel", "Výjezdy", "BDSM"]
  source_original_profile_type?: string;   // Např. "Privát", "Salon", "Agentura"
  source_original_services?: string[];     // Původní názvy služeb (před mapováním)

  // ===== MAPPING CONFIDENCE =====
  category_confidence?: 'high' | 'medium' | 'low';  // Jak moc si jsme jistí mapováním
  needs_manual_review?: boolean;                     // True pokud není jasné
  mapping_notes?: string;                            // Poznámky proč jsme zvolili tuto kategorii

  // ===== FYZICKÉ PARAMETRY =====
  height?: number;        // cm
  weight?: number;        // kg
  bust?: string;          // "1", "2", "3", "4"
  hairColor?: string;     // "blonde", "brunette", "black", "red"
  breastType?: string;    // "natural", "silicone"

  // ===== DALŠÍ ATRIBUTY =====
  role?: string;          // "active", "passive", "switch", "dominant", "submissive"
  nationality?: string;   // "czech", "slovak", "polish", "ukrainian", "russian"
  languages?: string[];   // ["česky", "anglicky", "německy"]
  orientation?: string;   // "hetero", "bi", "lesbian", "gay"
  tattoos?: string;       // "none", "small", "medium", "large"
  piercing?: string;      // "none", "ears", "multiple"

  // ===== SLUŽBY =====
  offersEscort: boolean;
  travels: boolean;
  services?: string[];    // Mapované služby (naše kategorie)

  // ===== FOTKY =====
  photos: Array<{
    url: string;
    alt?: string;
    order: number;
    isMain: boolean;
    source_original_url?: string;  // Pokud stahujeme lokálně
  }>;

  // ===== RECENZE =====
  reviews?: Array<{
    rating: number;
    comment: string;
    author?: string;           // Pokud je k dispozici
    createdAt: string;
    source_review_id?: string; // ID na původním webu
  }>;

  // ===== SOURCE ATTRIBUTION =====
  sourceUrl: string;
  sourceSite: 'dobryprivat.cz' | 'eroguide.cz' | 'banging.cz';
  scrapedAt: string;
}

// ===== MAPPING RULES =====
export interface CategoryMappingRule {
  source_site: 'dobryprivat.cz' | 'eroguide.cz' | 'banging.cz';
  source_category: string;
  mapped_to_profile_type: ScrapedProfile['profileType'];
  mapped_to_category: ScrapedProfile['category'];
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

// Předdefinované mapping rules
export const CATEGORY_MAPPING_RULES: CategoryMappingRule[] = [
  // dobryprivat.cz
  {
    source_site: 'dobryprivat.cz',
    source_category: 'Dívky',
    mapped_to_profile_type: 'PRIVAT',
    mapped_to_category: 'HOLKY_NA_SEX',
    confidence: 'high',
  },
  {
    source_site: 'dobryprivat.cz',
    source_category: 'Erotické masáže',
    mapped_to_profile_type: 'MASSAGE_SALON',
    mapped_to_category: 'EROTICKE_MASERKY',
    confidence: 'high',
  },
  {
    source_site: 'dobryprivat.cz',
    source_category: 'BDSM',
    mapped_to_profile_type: 'PRIVAT',
    mapped_to_category: 'DOMINA',
    confidence: 'high',
  },
  {
    source_site: 'dobryprivat.cz',
    source_category: 'Podniky',
    mapped_to_profile_type: 'NIGHT_CLUB',
    mapped_to_category: 'EROTICKE_PODNIKY',
    confidence: 'medium',
    notes: 'Může být club, strip club, nebo swingers - potřebuje review',
  },

  // eroguide.cz
  {
    source_site: 'eroguide.cz',
    source_category: 'Privát',
    mapped_to_profile_type: 'PRIVAT',
    mapped_to_category: 'HOLKY_NA_SEX',
    confidence: 'high',
  },
  {
    source_site: 'eroguide.cz',
    source_category: 'Escort',
    mapped_to_profile_type: 'ESCORT_AGENCY',
    mapped_to_category: 'HOLKY_NA_SEX',
    confidence: 'high',
  },
  {
    source_site: 'eroguide.cz',
    source_category: 'Masáže',
    mapped_to_profile_type: 'MASSAGE_SALON',
    mapped_to_category: 'EROTICKE_MASERKY',
    confidence: 'high',
  },

  // banging.cz
  {
    source_site: 'banging.cz',
    source_category: 'Priváty',
    mapped_to_profile_type: 'PRIVAT',
    mapped_to_category: 'HOLKY_NA_SEX',
    confidence: 'high',
  },
  {
    source_site: 'banging.cz',
    source_category: 'Eskorty',
    mapped_to_profile_type: 'ESCORT_AGENCY',
    mapped_to_category: 'HOLKY_NA_SEX',
    confidence: 'high',
  },
  {
    source_site: 'banging.cz',
    source_category: 'Masáže',
    mapped_to_profile_type: 'MASSAGE_SALON',
    mapped_to_category: 'EROTICKE_MASERKY',
    confidence: 'high',
  },
  {
    source_site: 'banging.cz',
    source_category: 'Podniky',
    mapped_to_profile_type: 'NIGHT_CLUB',
    mapped_to_category: 'EROTICKE_PODNIKY',
    confidence: 'low',
    notes: 'Typ podniku nelze určit bez další analýzy',
  },
];

// Helper funkce pro mapování
export function mapCategory(
  sourceSite: ScrapedProfile['sourceSite'],
  sourceCategory: string,
  sourceTags: string[] = []
): {
  profileType: ScrapedProfile['profileType'];
  category: ScrapedProfile['category'];
  confidence: 'high' | 'medium' | 'low';
  needsReview: boolean;
} {
  // Najdi matching rule
  const rule = CATEGORY_MAPPING_RULES.find(
    r => r.source_site === sourceSite &&
         r.source_category.toLowerCase() === sourceCategory.toLowerCase()
  );

  if (rule) {
    return {
      profileType: rule.mapped_to_profile_type,
      category: rule.mapped_to_category,
      confidence: rule.confidence,
      needsReview: rule.confidence === 'low',
    };
  }

  // Default fallback
  return {
    profileType: 'SOLO',
    category: 'HOLKY_NA_SEX',
    confidence: 'low',
    needsReview: true,
  };
}
