# Data Status - Scraped Profiles

## ✅ Hotovo

### Database (718 profilů)
- ✅ Prisma schema s private contacts
- ✅ SQLite database (`prisma/dev.db`) - **58 MB**
- ✅ Migration pro private kontakty (telefon, email, WhatsApp)
- ✅ Plně funkční scrapers pro dobryprivat.cz

### Scraped Data
- **718 profilů** z dobryprivat.cz
- **1015 photo URLs** (odkazy na fotky)
- Bio, popis služeb, ceny, lokace
- Private kontakty (telefon, email, WhatsApp)
- Pracovní doba, věk, měření

## ⏳ K Dokončení

### Fotky (58 MB, 1015 souborů)
- ⚠️ **NEDOKONČENO** - fotky nejsou součástí tohoto commitu
- 📸 Máme URL odkazy na všechny fotky v DB
- 📂 Budou se postahovat později do `public/uploads/profiles/`
- 💾 Aktuálně stažené lokálně, ale ne v repo (příliš velké pro git)

**Plán:**
1. Setup CDN nebo image hosting (Cloudflare Images, ImgIX, nebo Firebase Storage)
2. Hromadný upload fotek
3. Update URL v databázi na CDN odkazy

## 🔧 Tech Stack

- **Scraping:** TypeScript + Axios + Cheerio
- **Database:** Prisma ORM + SQLite
- **Processing:** Batch processing (10 profilů najednou)
- **Quality:** Iterativní komprese obrázků (garantuje < 1 MB)

## 📊 Stats

```
Profiles: 718
Photos:   1015 URLs (fotky k postažení)
Size:     ~58 MB (jen fotky, když budou stažené)
DB Size:  ~5 MB (metadata bez fotek)
```

## ⚠️ DŮLEŽITÉ

**Tato branch je WIP (Work In Progress)!**
- NE merge do main bez review
- Database je ready
- Scrapers jsou funkční
- Fotky se dodělají později

---

🤖 Generated with Claude Code
https://claude.com/claude-code
