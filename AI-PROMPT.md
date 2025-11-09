# AI Assistant Prompt - Erosko.cz Scraping Project

**Pokud čteš tento soubor, jsi AI asistent, který pokračuje v práci na erosko.cz scraping projektu.**

---

## 🎯 QUICK START - Co udělat HNED

### Krok 1: Přečti si kontext

```bash
cat SCRAPING-STATUS.md
cat INTEGRATION.md
cat DATA-STATUS.md
```

### Krok 2: Zkontroluj aktuální stav

```bash
cd scrapers

# Kolik profilů máme?
ls -lh output/dobryprivat-*.json
cat output/dobryprivat-dívky.json | grep -c '"name"'
cat output/dobryprivat-erotické-masáže.json | grep -c '"name"'
cat output/dobryprivat-podniky.json | grep -c '"name"'

# Kolik je v databázi?
cd ..
npx prisma studio  # Otevře DB browser
```

### Krok 3: Podle uživatele rozhodni co dělat

**Možnosti:**

**A) Dotáhnout BDSM kategorii dobryprivat:**
```bash
cd scrapers
npm run scrape:dobryprivat:batch
```

**B) Spustit full scraping eroguide.cz:**
```bash
cd scrapers
npm run scrape:eroguide
```

**C) Opravit a spustit banging.cz scraper:**
```bash
cd scrapers
# 1. Analyzuj HTML
npx tsx analyze-html.ts

# 2. Oprav banging/scraper.ts podle skutečné struktury
# 3. Otestuj
npm run scrape:banging:test

# 4. Spusť full
npm run scrape:banging
```

**D) Merge a import všech dat:**
```bash
cd scrapers
npm run merge    # Sloučí všechny JSONy
npm run import   # Importuje do Prisma DB
```

---

## 📁 Struktura Projektu

```
/Users/Radim/Projects/erosko.cz/
├── scrapers/
│   ├── dobryprivat/
│   │   ├── scraper-batch.ts          # ✅ Funguje - batch processing
│   │   └── ...
│   ├── eroguide/
│   │   ├── scraper.ts                # ✅ Funguje - full scraping
│   │   ├── scraper-test.ts           # ✅ Testováno - 10 profilů
│   │   └── ...
│   ├── banging/
│   │   ├── scraper.ts                # ⚠️ Potřebuje opravu
│   │   ├── scraper-test.ts           # ⚠️ Našel jen map URLs
│   │   └── ...
│   ├── output/
│   │   ├── dobryprivat-dívky.json             # 1005 profilů
│   │   ├── dobryprivat-erotické-masáže.json   # 304 profilů
│   │   ├── dobryprivat-podniky.json           # 248 profilů
│   │   ├── dobryprivat-bdsm.json              # ❌ CHYBÍ
│   │   ├── eroguide-test.json                 # 10 test profilů
│   │   └── banging-test.json                  # 5 map URLs (ne profily)
│   ├── analyze-html.ts               # Utility pro analýzu HTML
│   ├── merge-all.ts                  # Sloučení všech JSONů
│   ├── import-to-prisma.ts           # Import do databáze
│   ├── download-photos-web.ts        # Download fotek
│   └── package.json
├── prisma/
│   ├── dev.db                        # SQLite DB s 718 profily
│   └── schema.prisma
├── public/uploads/profiles/          # 1015 stažených fotek (58 MB)
├── SCRAPING-STATUS.md                # Aktuální status
├── INTEGRATION.md                    # Návod pro integraci do Erosko
├── DATA-STATUS.md                    # Status dat
└── AI-PROMPT.md                      # TENTO SOUBOR
```

---

## 🔧 Tech Stack

**Scrapery:**
- TypeScript + Axios + Cheerio
- Batch processing (auto-save po 100 profilech)
- 2-3 sekundy delay mezi požadavky (být gentle k serverům)

**Databáze:**
- Prisma ORM
- SQLite (dev)
- Profile + Photo modely

**Fotky:**
- Web download (axios streams)
- Lokální storage: `public/uploads/profiles/`
- Iterativní komprese garantuje < 1 MB

---

## 📊 Datový Formát

### Profile Model

```typescript
interface ScrapedProfile {
  name: string;
  slug: string;
  age?: number;
  description?: string;
  phone: string;              // ⚠️ Citlivé
  email?: string;             // ⚠️ Citlivé
  whatsapp?: string;          // ⚠️ Citlivé
  city: string;
  location: string;
  profileType: 'SOLO' | 'PRIVAT' | 'MASSAGE_SALON' | 'ESCORT_AGENCY';
  category: 'HOLKY_NA_SEX' | 'EROTICKE_MASERKY' | 'DOMINA' | 'DIGITALNI_SLUZBY' | 'EROTICKE_PODNIKY';
  offersEscort: boolean;
  travels: boolean;
  services?: string[];
  photos: Array<{
    url: string;
    alt?: string;
    order: number;
    isMain: boolean;
  }>;
  sourceUrl: string;
  sourceSite: 'dobryprivat.cz' | 'eroguide.cz' | 'banging.cz';
  scrapedAt: string;
}
```

---

## ⚠️ DŮLEŽITÉ PRAVIDLA

### 1. Respektuj Server Limity

**VŽDY použij delay mezi požadavky:**
```typescript
await new Promise(resolve => setTimeout(resolve, 2000));  // 2 sekundy
```

**NIKDY nescrapuj příliš rychle:**
- Min 2 sekundy mezi profily
- Min 1 sekunda mezi stránkami listingu
- Pokud dostaneš 429 nebo 503, zvyš delay na 5 sekund

### 2. Batch Processing & Auto-Save

**Vždy používej batch processing:**
```typescript
const BATCH_SIZE = 100;  // Uložit každých 100 profilů

if (batchProfiles.length >= BATCH_SIZE) {
  saveProgress(outputFile, allProfiles.concat(batchProfiles));
  batchProfiles = [];
}
```

**Proč:**
- Scraping může trvat hodiny
- Pokud crashne, neztrácíš vše
- Můžeš kdykoliv přerušit a pokračovat

### 3. Error Handling

**Vždy loguj chyby, ale pokračuj:**
```typescript
try {
  const profile = await scrapeProfile(url);
  if (profile) {
    profiles.push(profile);
  }
} catch (error) {
  console.error(`❌ ${url}:`, error.message);
  // Nepřerušuj celý scraping!
}
```

### 4. Deduplikace

**Vždy filtruj již stažené profily:**
```typescript
const alreadyScraped = new Set(allProfiles.map(p => p.sourceUrl));
const toScrape = profileListings.filter(p => !alreadyScraped.has(p.url));
```

---

## 🐛 Nejčastější Problémy & Řešení

### Problém 1: "Scraper nenašel žádné profily"

**Příčina:** Změnila se HTML struktura webu

**Řešení:**
```bash
cd scrapers
npx tsx analyze-html.ts  # Analyzuj aktuální strukturu
```

Pak uprav selektory v scraperu podle výstupu.

### Problém 2: "Fotky se nestahují"

**Příčina:** URL je špatně, nebo fotka už neexistuje

**Řešení:**
- Zkontroluj URL v browseru
- Log každou chybu, ale pokračuj dál
- Některé profily můžou mít 0 fotek - to je OK

### Problém 3: "Database import selhal"

**Příčina:** Duplicitní slugy nebo chybějící povinná pole

**Řešení:**
```bash
cd scrapers
npm run fix:all  # Opraví jména a slugy
npm run import   # Zkus znovu
```

### Problém 4: "Scraper běží moc pomalu"

**Odpověď:** **TO JE SPRÁVNĚ!**

2-3 sekundy delay je záměr. Nesnižuj to, aby ses nepřestal přistupovat.

**Odhadovaný čas:**
- 1000 profilů × 2s = ~33 minut scraping
- Plus čas na download fotek

---

## 📝 Běžné Tasky

### Task A: Dotáhnout BDSM kategorii

```bash
cd scrapers
npm run scrape:dobryprivat:batch
```

**Co se stane:**
1. Načte progress z `output/dobryprivat-bdsm.json` (nebo vytvoří nový)
2. Stáhne seznam profilů z `/bdsm/`
3. Odfiltruje už stažené
4. Scrapne zbývající po 100 (batch)
5. Auto-save každých 100 profilů
6. Dokončí a uloží finální JSON

**Čas:** ~30-60 minut (záleží na počtu profilů)

### Task B: Full scraping eroguide.cz

```bash
cd scrapers
npm run scrape:eroguide
```

**Co se stane:**
1. Projde kategorie: `/holky-na-sex`, `/eroticke-maserky`
2. Najde všechny profily (slug links)
3. Scrapne každý profil (2s delay)
4. Uloží do `output/eroguide-data.json`

**Čas:** ~4-5 hodin (odhadovaných ~800 profilů)

### Task C: Opravit banging.cz scraper

**Problém:** Našel jen map URLs, ne profily

**Kroky:**

1. Analyzuj HTML:
```bash
cd scrapers
npx tsx analyze-html.ts
```

2. Podívej se na výstup pro banging.cz

3. Najdi správné selektory pro jednotlivé profily

4. Uprav `banging/scraper.ts` a `banging/scraper-test.ts`:
```typescript
// Pravděpodobně potřebuje jít hlouběji:
// /cs/divky/-/praha-2/ → jednotlivé profily na této stránce
$('a').each((_, element) => {
  const href = $(element).attr('href');

  // Správný selektor?
  if (href && href.startsWith('/cs/profil/')) {  // NEBO jiný pattern
    profileUrls.push(BASE_URL + href);
  }
});
```

5. Otestuj:
```bash
npm run scrape:banging:test
```

6. Pokud funguje (10 profilů staženo), spusť full:
```bash
npm run scrape:banging
```

### Task D: Merge a Import

```bash
cd scrapers

# 1. Sloučit všechny JSONy
npm run merge
# Output: scrapers/output/dobryprivat-FINAL.json

# 2. Import do Prisma
npm run import
# Importuje do prisma/dev.db

# 3. Ověř v Prisma Studio
cd ..
npx prisma studio
# Otevře http://localhost:5555
```

---

## 🚀 Pokročilé Tipy

### 1. Monitoring Progress

Použij background job pro monitoring:

```bash
watch -n 60 'cat scrapers/output/dobryprivat-dívky.json | grep -c \"name\"'
```

### 2. Parallel Scraping (pokročilé)

**NIKDY nescrapuj stejný web paralelně!**

Ale můžeš scrapovat různé weby současně:

```bash
# Terminal 1
cd scrapers && npm run scrape:dobryprivat:batch

# Terminal 2 (jiný web)
cd scrapers && npm run scrape:eroguide
```

### 3. Custom Batch Size

Uprav `scraper-batch.ts`:
```typescript
const BATCH_SIZE = 50;  // Místo 100
const DELAY_MS = 5000;  // Pomalejší, ale bezpečnější
```

---

## 📞 Troubleshooting Checklist

- [ ] Máš nainstalované dependencies? (`npm install`)
- [ ] Je Prisma vygenerovaná? (`npx prisma generate`)
- [ ] Běží nějaký background process? (`ps aux | grep tsx`)
- [ ] Máš dost místa na disku? (`df -h`)
- [ ] Funguje internet? (`ping google.com`)
- [ ] Jsou výstupní složky vytvořené? (`ls -la scrapers/output/`)

---

## 🎯 Next Steps (podle priority)

1. ✅ **HIGH:** Dotáhnout BDSM kategorii dobryprivat (30-60 min)
2. ⚠️ **HIGH:** Opravit banging scraper (30 min)
3. 📊 **MEDIUM:** Full scraping eroguide.cz (4-5 hodin)
4. 📊 **MEDIUM:** Full scraping banging.cz (3-4 hodiny)
5. 🔄 **LOW:** Merge všech dat a re-import (5 min)
6. 📸 **LOW:** Re-download fotek pokud potřeba (15-20 min)

---

## ✅ Definition of Done

**Projekt je hotový když:**

- [ ] Všechny 4 kategorie dobryprivat scrapnuty (včetně BDSM)
- [ ] Eroguide.cz full scraping dokončen
- [ ] Banging.cz scraper opraven a full scraping dokončen
- [ ] Všechny JSONy sloučeny (`merge-all.ts`)
- [ ] Vše naimportováno do Prisma DB (`import-to-prisma.ts`)
- [ ] Fotky staženy pro všechny profily
- [ ] Databáze obsahuje 2000+ profilů z všech zdrojů
- [ ] README aktualizován s finálními statistikami

---

🤖 **PRO TIP pro AI:**

Pokud uživatel řekne "pokračuj", **AUTOMATICKY:**
1. Přečti `SCRAPING-STATUS.md`
2. Zkontroluj co chybí
3. Spusť nejvyšší prioritní task
4. Reportuj progress každých 100 profilů
5. Na konci updatuj `SCRAPING-STATUS.md`

**NIKDY se neptej "co mám udělat?" - rozhodni se podle priority!**

---

🤖 Generated with Claude Code
https://claude.com/claude-code
