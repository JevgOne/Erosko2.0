# AI Watermark Remover

Automatické odstranění vodoznaků z fotek pomocí AI.

## Funkce

- ✅ **AI-powered removal** - automatická detekce a odstranění vodoznaků
- ✅ **Batch processing** - zpracuje všechny fotky z profiles.json
- ✅ **Flexible positioning** - funguje pro vodoznaky v rohu i uprostřed
- ✅ **Progress tracking** - průběžné sledování procesu
- ✅ **Auto download** - automaticky stahuje fotky před zpracováním

## Možnosti

### 1. Replicate API (doporučeno) 🌟

**Výhody:**
- Nejlepší kvalita
- Automatická detekce vodoznaků
- Žádná instalace
- Pay-per-use (~$0.001 per image)

**Setup:**
```bash
# Získej API key z replicate.com
export REPLICATE_API_TOKEN="r8_xxx..."

# Nainstaluj dependencies
npm install replicate

# Spusť
node watermark-remover.js ./scraped-dobryprivat/profiles.json
```

### 2. Lokální processing (fallback)

**Výhody:**
- Zdarma
- Offline
- Rychlé

**Nevýhody:**
- Horší kvalita než AI
- Nedetekuje vodoznaky automaticky

**Setup:**
```bash
npm install sharp

# Spusť bez API tokenu
node watermark-remover.js ./scraped-dobryprivat/profiles.json
```

## Použití

### Zpracování všech fotek

```bash
# S Replicate API (nejlepší kvalita)
REPLICATE_API_TOKEN=r8_xxx node watermark-remover.js ./scraped-dobryprivat/profiles.json

# Nebo bez API (základní processing)
node watermark-remover.js ./scraped-dobryprivat/profiles.json
```

### Test na jedné fotce

```bash
node watermark-remover.js --test "https://dobryprivat.cz/wp-content/uploads/2024/06/emma-IMG_6878.png"
```

## Výstupy

- **Cleaned images**: `./cleaned-images/`
- **Downloaded originals**: `./downloaded-images/` (dočasné, automaticky se mažou)

## Alternativní řešení

### 1. Lama Cleaner (lokální, open-source)

```bash
# Instalace
pip install lama-cleaner

# Spuštění
lama-cleaner --model lama --device cpu

# Otevři v prohlížeči a zpracuj fotky
```

### 2. BRIA AI API

```bash
# Vyžaduje BRIA API key
# Velmi dobrá kvalita, ale dražší
```

### 3. Photoshop Batch Processing

- Manuální, ale nejvyšší kvalita
- Content-Aware Fill

## Statistiky

S **1119 profily** a průměrně **15 fotek** na profil:

- **Celkem fotek**: ~16,785
- **Čas s Replicate**: ~4-5 hodin
- **Cena s Replicate**: ~$17-20
- **Čas lokálně**: ~2-3 hodiny
- **Cena lokálně**: Zdarma

## Tips

1. **Testuj nejdřív na pár fotkách** pomocí `--test`
2. **Replicate API** je best choice pro kvalitu
3. **Lokální** je dobré pro rychlý test
4. **Rate limiting** - scraper má 1s pauzu mezi fotkami
5. **Backup** - originály se stahují do `downloaded-images/`

## Troubleshooting

### "API token not found"
```bash
export REPLICATE_API_TOKEN="your-token"
```

### "Module not found: replicate"
```bash
npm install replicate sharp
```

### Vysoká cena
- Použij lokální processing
- Nebo filtruj jen některé profily
- Nebo použij Lama Cleaner (zdarma)
