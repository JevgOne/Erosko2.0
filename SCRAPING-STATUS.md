# Scraping Status - Erosko.cz

**Datum:** 2025-11-09
**Celkem profilů:** 1557 (dobryprivat) + test data (eroguide 10, banging 5)

---

## ✅ Hotové Scrapery

### 1. dobryprivat.cz - **1557 profilů**

**Status:** ✅ 3/4 kategorie kompletně scrápnuty

| Kategorie | Profilů | Soubor | Status |
|-----------|---------|--------|--------|
| Dívky | 1005 | `output/dobryprivat-dívky.json` | ✅ Done |
| Erotické masáže | 304 | `output/dobryprivat-erotické-masáže.json` | ✅ Done |
| Podniky | 248 | `output/dobryprivat-podniky.json` | ✅ Done |
| BDSM | ❓ ? | `output/dobryprivat-bdsm.json` | ❌ CHYBÍ |

**Jak spustit zbývající kategorie:**

```bash
cd scrapers
npm run scrape:dobryprivat:batch
```

Scraper automaticky pokračuje od posledního stavu a doscrapuje BDSM kategorii.

**Import do databáze:**

Z těchto 1557 profilů je v Prisma DB pouze **718** (importováno z `dobryprivat-FINAL.json`).

Pro import ALL kategorií:

```bash
cd scrapers
npm run merge     # Sloučí všechny kategorie
npm run import    # Importuje do Prisma
```

---

## 🔧 Rozpracované Scrapery

### 2. eroguide.cz - **Test: 10/83 profilů**

**Status:** ✅ Scraper funguje, test úspěšný

**Test výsledky:**
- Nalezeno: 83 profilů na homepage
- Otestováno: 10 profilů
- S fotkami: 10/10 (100%)
- S telefonem: 10/10 (100%)
- Output: `output/eroguide-test.json`

**Jak spustit full scraping:**

```bash
cd scrapers
npm run scrape:eroguide  # Všechny kategorie
```

Odhadovaný čas: ~4-5 hodin (při 2s delay mezi profily)

---

### 3. banging.cz - **Test: 0 profilů**

**Status:** ⚠️ Scraper potřebuje opravu

**Problém:**
Scraper našel pouze mapové odkazy na kategorie, ne jednotlivé profily:
```
/cs/divky/-/praha-2/?display=map&lon1=...
/cs/divky/-/praha-3/?display=map&lon1=...
```

Potřebuje:
- Zjistit URL strukturu pro jednotlivé profily
- Upravit selector pro profile listings

**Jak opravit:**

1. Analyzuj HTML strukturu listingu profilů
2. Updatuj `scrapers/banging/scraper-test.ts`
3. Test: `npm run scrape:banging:test`

---

## 📊 Celková Statistika

| Zdroj | Scrapováno | V Databázi | Fotky |
|-------|-----------|------------|-------|
| dobryprivat.cz | 1557 | 718 | 1015 (✅ staženo) |
| eroguide.cz | 10 (test) | 0 | 10 |
| banging.cz | 5 (test) | 0 | 0 |
| **CELKEM** | **1572** | **718** | **1025** |

---

## 🚀 Návod: Jak nasc napovat další weby

### Krok 1: Dotáhnout BDSM kategorii dobryprivat

```bash
cd scrapers
npm run scrape:dobryprivat:batch
```

Scraper automaticky pokračuje, kde skončil. BDSM kategorie se doscrapuje.

### Krok 2: Full scraping eroguide.cz

```bash
cd scrapers
npm run scrape:eroguide
```

**Co to udělá:**
- Scrapne všechny kategorie: `/holky-na-sex`, `/eroticke-maserky`
- Delay: 2 sekundy mezi profily
- Output: `output/eroguide-data.json`
- Čas: ~4-5 hodin (záleží na počtu profilů)

### Krok 3: Opravit a spustit banging.cz

**Nejdřív oprav scraper:**

```bash
cd scrapers
# Analyzuj HTML
npx tsx analyze-html.ts

# Uprav banging/scraper.ts podle skutečné struktury
# Otestuj
npm run scrape:banging:test
```

**Pak spusť full scraping:**

```bash
npm run scrape:banging
```

### Krok 4: Merge a Import

Po dokončení všech scraperů:

```bash
cd scrapers

# Sloučí data ze všech zdrojů
npm run merge

# Importuje do Prisma DB
npm run import

# Stáhne fotky (pokud nejsou stažené)
npm run download:photos
```

---

## 📁 Důležité Soubory

### Scrapery
- `scrapers/dobryprivat/scraper-batch.ts` - Batch scraper (auto-save po 100 profilech)
- `scrapers/eroguide/scraper.ts` - Full scraper
- `scrapers/eroguide/scraper-test.ts` - Test (10 profilů)
- `scrapers/banging/scraper.ts` - Full scraper (potřebuje opravu)
- `scrapers/banging/scraper-test.ts` - Test (10 profilů)

### Output
- `scrapers/output/dobryprivat-dívky.json` - 1005 profilů
- `scrapers/output/dobryprivat-erotické-masáže.json` - 304 profilů
- `scrapers/output/dobryprivat-podniky.json` - 248 profilů
- `scrapers/output/dobryprivat-bdsm.json` - ❌ K dokončení
- `scrapers/output/eroguide-test.json` - 10 testovacích profilů
- `scrapers/output/banging-test.json` - 5 map URLs (ne profily)

### Databáze
- `prisma/dev.db` - SQLite databáze s 718 importovanými profily
- `public/uploads/profiles/` - 1015 stažených fotek (58 MB)

---

## ⏱️ Časové Odhady

| Úkol | Čas | Poznámka |
|------|-----|----------|
| BDSM kategorie dobryprivat | ~30-60 min | Záleží na počtu profilů |
| Full eroguide scraping | ~4-5 hodin | 2s delay × odhadovaných ~800 profilů |
| Oprava banging scraperu | ~30 min | HTML analýza + selector fix |
| Full banging scraping | ~3-4 hodiny | Záleží na počtu profilů |
| Download fotek | ~15-20 min | Pro každých ~1000 fotek |
| Merge + Import | ~5 min | Rychlé zpracování JSON |

**Celkem:** ~8-10 hodin na kompletní scraping všech webů

---

## 🤖 Scripts Reference

```bash
# Dobryprivat
npm run scrape:dobryprivat         # Full scraping
npm run scrape:dobryprivat:batch   # Batch (doporučeno)
npm run scrape:dobryprivat:quick   # Quick test

# Eroguide
npm run scrape:eroguide            # Full scraping
npm run scrape:eroguide:test       # Test 10 profilů

# Banging
npm run scrape:banging             # Full scraping
npm run scrape:banging:test        # Test 10 profilů

# Utility
npm run merge                      # Sloučit všechny JSONy
npm run import                     # Import do Prisma
npm run download:photos            # Stáhnout fotky
npm run fix:names                  # Fix jmen v datech
npm run fix:all                    # Fix všech profilů
```

---

## 🔐 Poznámky k Private Kontaktům

Všechny profily obsahují citlivé údaje:
- `phone` - Telefonní číslo
- `email` - Email
- `whatsapp` - WhatsApp

**V produkci:**
- Zobrazovat JEN přihlášeným uživatelům
- Nebo skrývat za paywall
- Nebo částečně maskovat (např. "777 *** ***")

---

🤖 Generated with Claude Code
https://claude.com/claude-code
