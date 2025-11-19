# DobryPrivat.cz Scraper

Kompletní scraper pro získání všech profilů z dobryprivat.cz

## Získaná data

Pro každý profil získává:

### Základní informace
- ✅ **URL profilu**
- ✅ **Telefonní čísla** (všechna dostupná)
- ✅ **WhatsApp** (pokud je k dispozici)
- ✅ **Adresa**
- ✅ **Město**
- ✅ **Věk**

### Fotografie
- ✅ **Všechny fotky** z galerie (ve full rozlišení)
- Automaticky odstraňuje duplikáty
- Získává původní obrázky (ne thumbnail)

### Pracovní informace
- ✅ **Pracovní doba** (pondělí-neděle)
- ✅ **Služby/Praktiky** (anál, GFE, escort, orál, atd.)

### Fyzické údaje
- ✅ **Velikost prsou**
- ✅ **Váha**
- ✅ **Výška**
- ✅ **Typ postavy**

### Další data
- ✅ **Jazyky**
- ✅ **Popis/Description**
- ✅ **Kategorie**
- ✅ **Role-play možnosti**
- ✅ **Datum scrapování**

## Použití

### Spuštění scraperu

```bash
cd /Users/zen/Erosko2.0/scrapers
node dobryprivat-simple.js
```

### Testování na jednom profilu

```bash
node test-simple.js
```

## Výstupy

- **Profilová data**: `./scraped-dobryprivat/profiles.json`
- **Error log**: `./scraped-dobryprivat/errors.log`

## Statistiky

- **Celkem profilů**: ~1120
- **Rychlost**: ~3 sekundy na profil
- **Předpokládaný čas**: ~1 hodina pro kompletní scraping
- **Automatické ukládání**: Každých 10 profilů

## Příklad výstupu

```json
{
  "url": "https://dobryprivat.cz/divka/emma-9/",
  "age": 23,
  "phone": ["734807789"],
  "whatsapp": "734807789",
  "address": "Praha 2, Náměstí I.P.Pavlova",
  "photos": [
    "https://dobryprivat.cz/wp-content/uploads/2024/06/emma-IMG_6878.png",
    "https://dobryprivat.cz/wp-content/uploads/2024/06/upload-68d247700222f-f0c23a7d.jpeg"
  ],
  "services": [
    "GFE",
    "escort",
    "Anální sex",
    "Klasika",
    "Orál"
  ],
  "measurements": {
    "breastSize": "3",
    "weight": 50,
    "height": 172
  },
  "categories": [
    "Escort Praha",
    "Luxusní společnice"
  ],
  "scrapedAt": "2025-11-19T16:57:37.238Z"
}
```

## Poznámky

- Scraper respektuje rate limiting (3s pauza mezi profily)
- Automaticky ukládá průběžné výsledky každých 10 profilů
- Všechny chyby se logují do error.log
- Získává full-size fotografie (odstraňuje -WxH suffixy)
- Deduplikace fotek pomocí Set
