# Integrace Scraped Dat do Erosko.cz

## 📊 Co je v databázi

### Profile (718 záznamů)
```typescript
{
  id: string              // Unique ID
  slug: string            // URL-friendly slug (např. "kristyna-fitness")
  name: string            // Jméno (např. "Kristýnka")
  bio: string            // Popis služeb
  location: string       // Město (např. "Praha 10")
  age: number            // Věk
  measurements: string   // Měření (např. "90-60-90")
  services: string[]     // Služby (array)
  pricePerHour: number  // Cena/hod v Kč
  workingHours: string  // Pracovní doba
  verified: boolean     // Ověřený profil
  createdAt: DateTime   // Datum vytvoření
  updatedAt: DateTime   // Datum aktualizace

  // Private kontakty (NEW!)
  phone: string?        // Telefon
  email: string?        // Email
  whatsapp: string?     // WhatsApp

  // Relations
  photos: Photo[]       // Fotky profilu
}
```

### Photo (1015 záznamů)
```typescript
{
  id: string           // Unique ID
  url: string          // URL fotky (dobryprivat.cz nebo lokální)
  order: number        // Pořadí (0, 1, 2...)
  profileId: string    // FK na Profile

  // Relation
  profile: Profile
}
```

---

## 🔗 Napojení na Erosko.cz

### 1. Database Migration

Erosko projekt pravděpodobně má vlastní Prisma schema. Potřebuješ:

**A) Merge Prisma schemas:**

```bash
# V Erosko projektu
cd ~/erosko-repo
cp ~/Projects/erosko.cz/prisma/schema.prisma ./prisma/schema-scraped.prisma
```

Porovnej a slož schémata:
- Zkontroluj jestli máš model `Profile` a `Photo`
- Přidej pole `phone`, `email`, `whatsapp` do `Profile` (pokud chybí)
- Vytvoř migraci:

```bash
npx prisma migrate dev --name add_scraped_data
```

**B) Import dat:**

```bash
# Zkopíruj SQLite databázi
cp ~/Projects/erosko.cz/prisma/dev.db ~/erosko-repo/prisma/scraped-data.db

# Import do production DB
node scripts/import-scraped-profiles.js
```

### 2. Script pro Import Dat

Vytvoř `scripts/import-scraped-profiles.js`:

```javascript
const { PrismaClient } = require('@prisma/client');

// Source DB (scraped data)
const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/scraped-data.db'
    }
  }
});

// Target DB (Erosko production)
const targetDb = new PrismaClient();

async function importProfiles() {
  console.log('🚀 Importing profiles...');

  const profiles = await sourceDb.profile.findMany({
    include: {
      photos: true
    }
  });

  for (const profile of profiles) {
    // Check if profile already exists (by slug or name)
    const existing = await targetDb.profile.findUnique({
      where: { slug: profile.slug }
    });

    if (existing) {
      console.log(`⏭️  Skipping ${profile.name} (already exists)`);
      continue;
    }

    // Create profile with photos
    await targetDb.profile.create({
      data: {
        slug: profile.slug,
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        age: profile.age,
        measurements: profile.measurements,
        services: profile.services,
        pricePerHour: profile.pricePerHour,
        workingHours: profile.workingHours,
        verified: profile.verified,
        phone: profile.phone,
        email: profile.email,
        whatsapp: profile.whatsapp,
        photos: {
          create: profile.photos.map(photo => ({
            url: photo.url,
            order: photo.order
          }))
        }
      }
    });

    console.log(`✅ Imported ${profile.name}`);
  }

  console.log('✅ Import complete!');
}

importProfiles()
  .catch(console.error)
  .finally(() => {
    sourceDb.$disconnect();
    targetDb.$disconnect();
  });
```

---

## 📸 Stažení Fotek

Fotky jsou aktuálně jako URL odkazy v databázi. Jsou 2 možnosti:

### Varianta A: Stáhnout fotky lokálně

Použij existující script z této repo:

```bash
cd ~/Projects/erosko.cz/scrapers
npm install
npm run download:photos
```

**Co to udělá:**
- Stáhne **1015 fotek** z dobryprivat.cz
- Uloží do `public/uploads/profiles/`
- Aktualizuje URL v databázi na `/uploads/profiles/filename.jpg`
- Trvá ~10-15 minut
- Výsledek: ~58 MB fotek

**Pak zkopíruj fotky do Erosko projektu:**

```bash
# Zkopíruj fotky
cp -r ~/Projects/erosko.cz/public/uploads/profiles/* \
      ~/erosko-repo/public/uploads/profiles/

# Zkontroluj
ls -lh ~/erosko-repo/public/uploads/profiles/ | wc -l
# Mělo by být 1015 souborů
```

### Varianta B: Upload na CDN (doporučeno pro produkci)

**1. Cloudflare Images** (5000 obrázků zdarma):

```bash
# Install Cloudflare CLI
npm install -g wrangler

# Authenticate
wrangler login

# Upload images
cd ~/Projects/erosko.cz/public/uploads/profiles
for img in *.{jpg,jpeg,png,webp}; do
  curl -X POST \
    "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/images/v1" \
    -H "Authorization: Bearer YOUR_API_TOKEN" \
    -F "file=@$img"
done
```

**2. Firebase Storage:**

Použij připravený script:

```bash
cd ~/Projects/erosko.cz/scrapers

# Stáhni service account z Firebase Console
# (viz FIREBASE-SETUP.md)

npm run upload:firebase
```

**3. ImgIX / Cloudinary / atd.**

Podobný postup - bulk upload přes API.

---

## 🔄 Update Photo URLs v DB

Po uploadu fotek na CDN aktualizuj URLs:

```typescript
// scripts/update-photo-urls.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUrls() {
  const photos = await prisma.photo.findMany();

  for (const photo of photos) {
    // Pokud je URL lokální, změň na CDN
    if (photo.url.startsWith('/uploads/profiles/')) {
      const filename = photo.url.split('/').pop();
      const cdnUrl = `https://your-cdn.com/profiles/${filename}`;

      await prisma.photo.update({
        where: { id: photo.id },
        data: { url: cdnUrl }
      });

      console.log(`✅ Updated: ${photo.id}`);
    }
  }
}

updateUrls();
```

---

## 🎯 Kompletní Workflow

### Krok 1: Stáhni tuto branch

```bash
cd ~/erosko-repo
git fetch origin
git checkout scraped-data-dobryprivat
```

### Krok 2: Zkopíruj databázi

```bash
cp prisma/dev.db prisma/scraped-data.db
```

### Krok 3: Merge Prisma schema

```bash
# Zkontroluj rozdíly
diff prisma/schema.prisma ~/Projects/erosko.cz/prisma/schema.prisma

# Přidej chybějící pole (phone, email, whatsapp)
# Vytvoř migraci
npx prisma migrate dev --name add_private_contacts
```

### Krok 4: Stáhni fotky

```bash
cd ~/Projects/erosko.cz/scrapers
npm install
npm run download:photos

# Zkopíruj do Erosko projektu
mkdir -p ~/erosko-repo/public/uploads/profiles
cp -r ~/Projects/erosko.cz/public/uploads/profiles/* \
      ~/erosko-repo/public/uploads/profiles/
```

### Krok 5: Import dat

```bash
cd ~/erosko-repo
node scripts/import-scraped-profiles.js
```

### Krok 6: Verify

```bash
# Check profiles count
npx prisma studio
# Otevře DB browser na http://localhost:5555

# Check photos
ls public/uploads/profiles/ | wc -l
# Mělo by být 1015
```

---

## 📁 Struktura Souborů po Integraci

```
erosko-repo/
├── prisma/
│   ├── schema.prisma          # Merged schema s private contacts
│   ├── migrations/
│   │   └── .../add_private_contacts/
│   └── dev.db                 # Production DB s naimportovanými daty
├── public/
│   └── uploads/
│       └── profiles/          # 1015 fotek (58 MB)
│           ├── kristyna-0-xxx.jpg
│           ├── kristyna-1-xxx.jpg
│           └── ...
├── scripts/
│   ├── import-scraped-profiles.js
│   └── update-photo-urls.ts
└── app/
    └── ...                    # Erosko app code
```

---

## 🚨 Důležité Poznámky

### Deduplikace

Pokud Erosko už má některé profily z dobryprivat.cz:

```typescript
// V import scriptu
const existing = await targetDb.profile.findFirst({
  where: {
    OR: [
      { slug: profile.slug },
      { name: profile.name, location: profile.location }
    ]
  }
});

if (existing) {
  console.log(`⚠️  Duplicate: ${profile.name} - skipping or merging`);
  // Rozhodnutí: Skip nebo merge data?
  continue;
}
```

### Private Kontakty

Pole `phone`, `email`, `whatsapp` jsou **citlivá data**:
- Zobrazuj JEN přihlášeným uživatelům
- Nebo skrývej za paywall
- Nebo zobrazuj jen částečně (např. "777 *** ***")

### SEO

Pro SEO je důležité:
- Každý profil má unique `slug`
- Bio obsahuje klíčová slova (lokace, služby)
- Fotky mají optimální velikost (~57 KB průměr)

---

## ❓ Troubleshooting

### "Duplicate key error"
→ Profil už existuje. Změň slug nebo přeskoč.

### "Photos not loading"
→ Zkontroluj že fotky jsou v `public/uploads/profiles/`
→ URL v DB musí být `/uploads/profiles/filename.jpg`

### "Too slow import"
→ Použij batch insert místo jednotlivých creates:

```typescript
await targetDb.profile.createMany({
  data: profiles,
  skipDuplicates: true
});
```

---

🤖 Generated with Claude Code
https://claude.com/claude-code
