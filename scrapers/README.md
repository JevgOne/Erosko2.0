# Web Scrapers pro erosko.cz

Automatické stahování profilů a dat z konkurenčních webů pro naplnění databáze erosko.cz.

## 🎯 Cílové weby

1. **dobryprivat.cz** - WordPress based, mainly priváty
2. **eroguide.cz** - Next.js based, různé kategorie
3. **banging.cz** - PHP based, multi-category (priváty, eskorty, masáže, podniky)

## 📁 Struktura

```
scrapers/
├── dobryprivat/
│   └── scraper.ts       # Scraper pro dobryprivat.cz
├── eroguide/
│   └── scraper.ts       # Scraper pro eroguide.cz
├── banging/
│   └── scraper.ts       # Scraper pro banging.cz
├── output/              # Výstupní JSON soubory
│   ├── dobryprivat-data.json
│   ├── eroguide-data.json
│   └── banging-data.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Instalace

```bash
cd scrapers
npm install
```

## 💻 Použití

### Spustit jednotlivé scrapery:

```bash
# Scraping dobryprivat.cz
npm run scrape:dobryprivat

# Scraping eroguide.cz
npm run scrape:eroguide

# Scraping banging.cz
npm run scrape:banging
```

### Spustit všechny najednou:

```bash
npm run scrape:all
```

## 📊 Výstupní formát dat

Každý scraper vytvoří JSON soubor v `output/` složce s tímto formátem:

```typescript
interface ScrapedProfile {
  // Basic info
  name: string;
  slug: string;
  age?: number;
  description?: string;
  phone: string;
  email?: string;

  // Location
  city: string;
  address?: string;
  location: string;

  // Profile type
  profileType: 'SOLO' | 'PRIVAT' | 'MASSAGE_SALON' | 'ESCORT_AGENCY';
  category: 'HOLKY_NA_SEX' | 'EROTICKE_MASERKY' | 'DOMINA' | 'DIGITALNI_SLUZBY' | 'EROTICKE_PODNIKY';

  // Physical attributes
  height?: number;
  weight?: number;
  bust?: string;
  hairColor?: string;
  breastType?: string;

  // Additional attributes
  nationality?: string;
  languages?: string[];
  orientation?: string;
  tattoos?: string;
  piercing?: string;

  // Services
  offersEscort: boolean;
  travels: boolean;
  services?: string[];

  // Photos
  photos: Array<{
    url: string;
    alt?: string;
    order: number;
    isMain: boolean;
  }>;

  // Reviews
  reviews?: Array<{
    rating: number;
    comment: string;
    createdAt: string;
  }>;

  // Source attribution
  sourceUrl: string;
  sourceSite: 'dobryprivat.cz' | 'eroguide.cz' | 'banging.cz';
  scrapedAt: string;
}
```

## ⚙️ Technické detaily

- **Axios** - HTTP requesty
- **Cheerio** - HTML parsing (jQuery-like syntax)
- **TypeScript** - Type safety
- **Delay 2s** mezi požadavky (gentle scraping, neoverload servery)

## 🔒 Etické scraping

- 2 sekundové delay mezi požadavky
- User-Agent header pro identifikaci
- Respektování robots.txt (pokud je to nutné)
- Pouze veřejně dostupná data

## 📝 Mapování na erosko.cz Prisma schema

Data jsou připravena pro direct import do erosko.cz databáze:

- **Profile model** - individální profily (SOLO, PRIVAT)
- **Business model** - podniky (MASSAGE_SALON, ESCORT_AGENCY, atd.)
- **Photo model** - fotky s pořadím a main flag
- **Review model** - recenze s rating 1-5

## ⚠️ Důležité

**Data jsou uložena ODDĚLENĚ od produkční databáze!**

- Output soubory jsou v `scrapers/output/`
- Nejsou automaticky importovány do erosko.cz
- Před importem je nutné:
  1. Ověřit kompletnost dat
  2. Zkontrolovat formát
  3. Odstranit chyby
  4. Manuálně spustit import script

## 🔄 Další kroky

1. ✅ Scraping dat ze 3 webů
2. ⏳ Ověření kvality dat
3. ⏳ Vytvoření import scriptu do Prisma
4. ⏳ Testovací import na dev databázi
5. ⏳ Produkční import (po ověření)

## 📧 Kontakt

Pro otázky: radim@wikiporadce.cz
