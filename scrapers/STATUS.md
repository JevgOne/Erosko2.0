# Status Scraperů - erosko.cz

**Datum:** 2025-11-09
**Status:** ✅ Základní implementace hotová, testování úspěšné

---

## 🎯 Co je hotovo

### 1. Struktura projektu ✅
```
scrapers/
├── dobryprivat/
│   ├── scraper.ts          # Plný scraper (124+ profilů)
│   └── scraper-quick.ts    # Testovací verze (10 profilů)
├── eroguide/
│   └── scraper.ts          # Připraveno
├── banging/
│   └── scraper.ts          # Připraveno
├── output/
│   └── dobryprivat-sample.json  # ✅ Testovací data
├── package.json
├── tsconfig.json
└── README.md
```

### 2. Technologie ✅
- **axios** - HTTP requests
- **cheerio** - HTML parsing
- **TypeScript** - type safety
- **ES modules** - moderní syntax

### 3. Testování ✅
- ✅ dobryprivat.cz - úspěšně staženo 10 testovacích profilů
- ⏳ eroguide.cz - připraveno, netestováno
- ⏳ banging.cz - připraveno, netestováno

---

## 📊 Výsledky testování

### dobryprivat.cz
- **Nalezeno:** 124 unikátních profilů (Praha, Brno, Ostrava, Plzeň, Liberec)
- **Testováno:** 10 profilů úspěšně staženo
- **Výstup:** `/scrapers/output/dobryprivat-sample.json`
- **Rychlost:** ~1 sekunda/profil
- **Status:** ✅ Funguje

**Extrahovaná data:**
- ✅ Telefonní čísla (9/10 profilů)
- ✅ Věk (10/10 profilů)
- ✅ Source URL (100%)
- ⚠️  Jména profilů - potřeba vylepšit HTML selektory
- ⚠️  Fotky - potřeba přidat
- ⚠️  Popis - potřeba přidat
- ⚠️  Služby - potřeba přidat

---

## 🔧 Co potřebuje vylepšení

### 1. HTML Selektory (dobryprivat.cz)
**Aktuální problém:** Všechny profily mají "Neznámé jméno"

**Řešení:** Použít Puppeteer pro zjištění správné HTML struktury:
```typescript
// Místo:
$('h1').first().text().trim()

// Potřebujeme najít správný selektor:
$('.profile-name') nebo $('.profil-nazev') nebo jiný
```

### 2. Fotky
Aktuálně nejsou extrahovány. Potřeba:
```typescript
$('img.gallery, .profile-photos img').each(...)
```

### 3. Služby a parametry
Extrahovat z tabulek na detailní stránce profilu.

---

## 📋 Další kroky

### Priorita 1 (DŮLEŽITÉ)
1. ✅ ~~Vytvořit quick verzi pro rychlé testování~~
2. ⏳ **Vylepšit HTML selektory** pro dobryprivat.cz
3. ⏳ Otestovat eroguide.cz scraper
4. ⏳ Otestovat banging.cz scraper

### Priorita 2
5. ⏳ Spustit full scraping všech 3 webů
6. ⏳ Ověřit kvalitu a kompletnost dat
7. ⏳ Vytvořit import script do erosko.cz databáze

### Priorita 3
8. ⏳ Firebase/Prisma integrace
9. ⏳ Validace dat před importem
10. ⏳ Dedupl ikace profilů

---

## 💻 Příkazy

### Testovací scraping (rychlé, 10 profilů):
```bash
cd scrapers
npm run scrape:dobryprivat:quick
```

### Plný scraping (pomalé, všechny profily):
```bash
cd scrapers
npm run scrape:dobryprivat  # ~124 profilů, ~4-5 minut
npm run scrape:eroguide     # TBD
npm run scrape:banging      # TBD
```

### Všechny najednou:
```bash
npm run scrape:all  # Spustí všechny 3 scrapery
```

---

## 📈 Odhady

| Web | Odhadovaný počet profilů | Čas scrapingu | Status |
|-----|-------------------------|---------------|---------|
| dobryprivat.cz | ~200-300 | 5-10 min | ✅ Funguje |
| eroguide.cz | ~500-1000 | 15-30 min | ⏳ Připraveno |
| banging.cz | ~400-600 | 10-20 min | ⏳ Připraveno |
| **CELKEM** | **~1100-1900** | **30-60 min** | |

---

## 🚨 Důležité poznámky

1. **Data jsou ODDĚLENÁ od produkce**
   - Uloženo v `scrapers/output/`
   - Není automaticky importováno do erosko.cz
   - Nejdříve kontrola → pak import

2. **Etické scraping**
   - 2 sekundové delay mezi požadavky
   - User-Agent header
   - Neoverloadíme cizí servery

3. **Source Attribution**
   - Každý profil obsahuje `sourceUrl`
   - Vidíme odkud data pocházejí
   - Respektujeme autorství

---

## 📧 Kontakt
radim@wikiporadce.cz
