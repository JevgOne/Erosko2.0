# Web Scrapers pro erosko.cz - Implementace

**Datum:** 2025-11-09
**Kategorie:** funkcionalita
**Status:** ✅ Základní implementace hotová

---

## Původní zadání uživatele

User požadoval:

> "Já bych potřeboval vytěžit tyto 3 weby postupně:
> - Dobryprivat.cz
> - Eroguide.cz
> - Banging.cz
>
> Potřebuji ho vytěžit o data která lze vložit do erosko.cz podle toho jak je tam připravený profil uživatele nebo podniku. Potřebuji z toho udělat databázi včetně komentářů neboli recenzí a odkazů na původní data kde jsme si je půjčili.
>
> Narvat to asi do firebase nebo kde to má připravený propojení na daný admin toho webu ale **nezapojuj to do sebe zatím** ale jen to stáhneme a připravíme a pak to nějako postupně zapojíme.
>
> Nechceme to dělat a připojovat do nasazené verze aby se nám nestala nejaká chyba která by funkční web vyřadila z provozo a to samé s databází. Jen si bereme data která máme stahovat a vytvoříme to někde tzv vedle a pak to připojíme do sebe, až budeme vědět, že všechno proběhlo ok a že máme data v požadovaném formátu a kompletní a bez chyb."

---

## Klíčová rozhodnutí

1. **Separace dat od produkce**
   - Scraped data uložena v `/scrapers/output/` (lokální disk)
   - NENÍ automaticky importováno do databáze
   - Import script bude vytvořen později jako samostatný krok

2. **Technologie**
   - axios + cheerio (ne Puppeteer) - rychlejší pro statické HTML
   - TypeScript pro type safety
   - ES modules
   - Mapování na erosko.cz Prisma schema

3. **Struktura dat**
   - Každý profil obsahuje `sourceUrl` a `sourceSite` pro attribution
   - Reviews/komentáře jsou součástí ScrapedProfile interface
   - Data připravena pro direct import do Prisma (Profile/Business models)

4. **Etické scraping**
   - 2 sekundové delay mezi požadavky
   - User-Agent header
   - Respektování server load

---

## Implementované funkce

### 1. Scraper pro dobryprivat.cz ✅
**Soubory:**
- `/scrapers/dobryprivat/scraper.ts` - plná verze (124+ profilů)
- `/scrapers/dobryprivat/scraper-quick.ts` - testovací (10 profilů)

**Funguje:**
- Získávání seznamu profilů z různých měst (Praha, Brno, Ostrava, Plzeň, Liberec)
- URL pattern: `/divka/slug-profilu/`
- Extrakce věku, telefonu, source URL
- Testováno: 10 profilů úspěšně staženo

**Potřebuje vylepšení:**
- HTML selektory pro jména profilů (aktuálně "Neznámé jméno")
- Fotky (není implementováno)
- Detailní popis
- Služby a parametry

### 2. Scraper pro eroguide.cz ✅
**Soubor:** `/scrapers/eroguide/scraper.ts`

**Připraveno:**
- Next.js based scraping
- Multiple kategorie (privat, escort, masaze)
- Detekce typu profilu podle URL a badges
- Reviews extraction
- CDN image support (cdn.eroguide.cz)

**Status:** Napsáno, netestováno

### 3. Scraper pro banging.cz ✅
**Soubor:** `/scrapers/banging/scraper.ts`

**Připraveno:**
- PHP based scraping
- Multi-category (priváty: 157, eskorty: 84, masáže: 186, podniky: 13)
- Email extraction
- Reviews parsing

**Status:** Napsáno, netestováno

---

## Aktuální výstup

### Testovací data (dobryprivat-sample.json)
```json
{
  "name": "Neznámé jméno",  // ⚠️ potřebuje fix
  "slug": "nezname-jmeno",
  "age": 32,                 // ✅ funguje
  "phone": "+420770668803",  // ✅ funguje
  "city": "Praha",
  "profileType": "PRIVAT",
  "category": "HOLKY_NA_SEX",
  "sourceUrl": "https://dobryprivat.cz/divka/ul-na-smetance/",  // ✅
  "sourceSite": "dobryprivat.cz",
  "scrapedAt": "2025-11-09T14:31:01.475Z"
}
```

**Statistiky:** 10/10 profilů staženo, 9/10 má telefon, všechny mají věk

---

## Zjištěné struktury webů

### dobryprivat.cz
- **Platform:** WordPress (Divi theme)
- **Profile URL:** `/divka/slug/`
- **Listing URL:** `/divky/{mesto}/`
- **Počet profilů:** ~124 (Praha, Brno, Ostrava, Plzeň, Liberec)

### eroguide.cz
- **Platform:** Next.js s SSR
- **Profile URL:** `/profil/`, `/escort/`, `/privat/`
- **CDN:** cdn.eroguide.cz
- **Kategorie:** Multiple (privat, escort, masaze)

### banging.cz
- **Platform:** PHP
- **Profile URL:** `/profil/`, `/privat/`, `/masaz/`, `/podnik/`
- **Kategorie:**
  - Priváty: 157
  - Eskorty: 84
  - Masáže: 186
  - Podniky: 13
  - **CELKEM: ~440 profilů**

---

## Příkazy

### Instalace:
```bash
cd scrapers
npm install
```

### Testovací scraping:
```bash
npm run scrape:dobryprivat:quick  # 10 profilů, ~15 sekund
```

### Plný scraping:
```bash
npm run scrape:dobryprivat  # ~124 profilů, ~5 minut
npm run scrape:eroguide     # připraveno
npm run scrape:banging      # připraveno
npm run scrape:all          # všechny 3 dohromady
```

---

## Další kroky (TODO)

### Priorita 1 (před full scrapingem):
1. ⏳ Vylepšit HTML selektory pro dobryprivat.cz
   - Zjistit správné selektory pro jména profilů
   - Přidat fotky
   - Přidat služby

2. ⏳ Otestovat eroguide.cz a banging.cz scrapery
   - Spustit quick test verze
   - Ověřit data output
   - Opravit případné chyby

### Priorita 2 (full scraping):
3. ⏳ Spustit plný scraping všech 3 webů
   - Očekávaný výstup: 1100-1900 profilů
   - Čas: 30-60 minut
   - Storage: ~5-10 MB JSON

### Priorita 3 (import do databáze):
4. ⏳ Vytvořit import script
   - Transformace ScrapedProfile → Prisma Profile/Business
   - Validace dat
   - Deduplikace (podle telefonu, jména, adresy)

5. ⏳ Firebase/Prisma integrace
   - Staging databáze pro testování
   - Ověření integrity
   - Produkční import

---

## Technické detaily

### Interface ScrapedProfile:
```typescript
interface ScrapedProfile {
  // Základní info
  name: string;
  slug: string;
  age?: number;
  phone: string;

  // Lokace
  city: string;
  location: string;

  // Typ
  profileType: 'SOLO' | 'PRIVAT' | 'MASSAGE_SALON' | 'ESCORT_AGENCY';
  category: 'HOLKY_NA_SEX' | 'EROTICKE_MASERKY' | 'DOMINA' | ...;

  // Parametry
  height?: number;
  weight?: number;
  bust?: string;
  hairColor?: string;

  // Služby
  services?: string[];
  offersEscort: boolean;
  travels: boolean;

  // Média
  photos: Array<{url, order, isMain}>;

  // Reviews
  reviews?: Array<{rating, comment, createdAt}>;

  // Source attribution
  sourceUrl: string;
  sourceSite: 'dobryprivat.cz' | 'eroguide.cz' | 'banging.cz';
  scrapedAt: string;
}
```

### Mapování na erosko.cz Prisma:
- ScrapedProfile → `Profile` nebo `Business` model
- Reviews → `Review` model
- Photos → `Photo` model
- Services → `ProfileService` model (many-to-many)

---

## Problémy a řešení

### 1. ES modules __dirname error
**Problém:** `ReferenceError: __dirname is not defined in ES module scope`

**Řešení:**
```typescript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 2. Timeout při full scrapingu
**Problém:** 5 minut limit pro bash command

**Řešení:**
- Vytvořena quick verze s limitem 10 profilů
- Full scraping spustit mimo Claude Code (direkt v terminálu)

### 3. HTML selektory nefungují
**Problém:** cheerio nedokáže najít správné elementy

**Plán řešení:**
- Použít Puppeteer pro debugging
- Screenshot + inspect HTML struktury
- Aktualizovat selektory podle reálné struktury

---

## Lessons Learned

1. **WebFetch nefunguje na adult content** → použití curl nebo Puppeteer
2. **Puppeteer je POMALÉ** → axios+cheerio je 100x rychlejší pro statické HTML
3. **WordPress (dobryprivat) vs Next.js (eroguide)** → různé scraping strategie
4. **Testing first** → quick verze před full scrapingem zachránila čas
5. **Source attribution je KRITICKÉ** → sourceUrl v každém záznamu

---

## Soubory vytvořené v této session

```
/Users/Radim/Projects/erosko.cz/scrapers/
├── dobryprivat/
│   ├── scraper.ts           # NOVÝ - plný scraper
│   └── scraper-quick.ts     # NOVÝ - testovací verze
├── eroguide/
│   └── scraper.ts           # NOVÝ
├── banging/
│   └── scraper.ts           # NOVÝ
├── output/
│   └── dobryprivat-sample.json  # NOVÝ - testovací data
├── package.json             # NOVÝ
├── tsconfig.json            # NOVÝ
├── README.md                # NOVÝ
└── STATUS.md                # NOVÝ
```

---

## Příští session - Checklist

Když budu pokračovat na tomto projektu:

1. [ ] Přečíst tento context file
2. [ ] Přečíst STATUS.md
3. [ ] Zkontrolovat output/ složku - jaká data už máme
4. [ ] Spustit quick testy pro eroguide a banging
5. [ ] Vylepšit selektory podle potřeby
6. [ ] Spustit full scraping (mimo Claude Code v terminálu)
7. [ ] Vytvořit import script

---

**Závěr:** Základní infrastruktura pro scraping hotová. Dobryprivat.cz testován a funguje. Další 2 weby připraveny ale netestovány. Data ODDĚLENÁ od produkce jak bylo požadováno.
