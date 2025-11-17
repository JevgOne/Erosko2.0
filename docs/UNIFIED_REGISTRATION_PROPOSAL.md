# Unified Registration System - Erosko.cz
## Návrh na základě analýzy konkurence a současného stavu

**Datum:** 2025-11-17
**Verze:** 1.0

---

## 1. EXECUTIVE SUMMARY

Na základě kompletní analýzy:
- ✅ Erosko.cz současného stavu (50+ stránek, PendingChange systém)
- ✅ DobryPrivat.cz (⭐⭐⭐⭐⭐ filtrace, dual system)
- ✅ CzEscort.com/SexyGuide.cz (verification, reviews, booking)

**Doporučujeme:**
1. **3-step registration** místo současných 2 kroků
2. **Type-aware flow** - jasné rozdělení SOLO vs BUSINESS vs AGENCY
3. **Hybrid approach** - co se dá upravit hned vs co potřebuje schválení
4. **Verification tiers** - postupné budování důvěry
5. **Dynamic popular searches** - místo statických

---

## 2. KLÍČOVÁ PRAVIDLA (NEMĚNNÁ)

### 2.1 Co NELZE měnit po registraci (jen přes PendingChange)

| Pole | Důvod |
|------|-------|
| **Telefon** | Primární identifikátor, ochrana proti podvodům |
| **Adresa** | Geolokační integrita, SEO |
| **Email** | Security, notifikace |
| **Jméno profilu** | SEO slug generování |
| **Město** | SEO categories |
| **Věk** | Legal compliance |
| **Fotky** | Anti-spam, qualita kontrola |
| **Služby** | Prevence keyword stuffing |

**Workflow:**
1. Uživatel požádá o změnu → **PendingChange** record
2. Admin vidí old vs new side-by-side
3. Admin schválí/zamítne
4. Pokud schváleno → změny se aplikují

### 2.2 Co LZE měnit přímo (real-time)

| Pole | Důvod |
|------|-------|
| **Popis** | Osobní branding, ne-kritické |
| **Opening hours** | Denní provoz |
| **isOnline status** | Live dostupnost |
| **Pricing** | Tržní flexibilita |
| **Social links** | Marketing |

---

## 3. REGISTRAČNÍ FLOW - NOVÝ NÁVRH

### 3.1 Type Selection Screen (Step 0)

```
┌─────────────────────────────────────────────┐
│  "Co chcete zaregistrovat?"                 │
├─────────────────────────────────────────────┤
│                                             │
│  👤 SOLO PROFIL                             │
│  ├─ Jsem samostatný poskytovatel            │
│  ├─ Pracuji nezávisle                       │
│  ├─ Mám vlastní fotky a služby              │
│  └─ Příklad: Nezávislá escort, domina       │
│                                             │
│  🏢 PODNIK (bez zaměstnanců)                │
│  ├─ Mám fixní místo (salon, privát)         │
│  ├─ Zatím nemám zaměstnance                 │
│  ├─ Chci ukázat vybavení, otevírací dobu    │
│  └─ Příklad: Masážní salon, BDSM studio     │
│                                             │
│  👥 PODNIK + TÝM                            │
│  ├─ Mám podnik s 2+ zaměstnanci             │
│  ├─ Centralizovaná správa                   │
│  ├─ Každý zaměstnanec má vlastní profil     │
│  └─ Příklad: Escort agentura, night club    │
│                                             │
└─────────────────────────────────────────────┘
```

**Klíčová inovace:**
- Jasné rozlišení 3 typů
- Vizuální příklady
- Inline help text

---

### 3.2 Registration Flow Chart

```
User visits /registrace
         ↓
┌────────────────────────────────────────┐
│ STEP 0: Type Selection                │
├────────────────────────────────────────┤
│ Vyberte typ:                           │
│ • SOLO (👤)                            │
│ • BUSINESS bez týmu (🏢)               │
│ • BUSINESS s týmem (👥)                │
└────────────┬───────────────────────────┘
             ↓
┌────────────────────────────────────────┐
│ STEP 1: Account & Contact              │
├────────────────────────────────────────┤
│ • Telefon (required, unique)           │
│ • Email (optional, notifications)      │
│ • Password (min 6 chars)               │
│ • Confirm password                     │
│                                        │
│ Real-time checks:                      │
│ ✓ Phone availability                   │
│ ✓ Email availability                   │
│ ✓ Password strength                    │
└────────────┬───────────────────────────┘
             ↓
┌────────────────────────────────────────┐
│ STEP 2: Basic Information              │
├────────────────────────────────────────┤
│ IF SOLO:                               │
│ • Jméno/Nickname (required)            │
│ • Věk (18+, required)                  │
│ • Město (autocomplete, required)       │
│ • Adresa (optional)                    │
│ • Kategorie (sex/massage/bdsm/online)  │
│                                        │
│ IF BUSINESS (bez týmu):                │
│ • Název podniku (required)             │
│ • Business typ (salon/privat/club)     │
│ • Město (required)                     │
│ • Adresa (required for business)       │
│ • Popis (optional)                     │
│                                        │
│ IF BUSINESS (s týmem):                 │
│ • Název podniku (required)             │
│ • Business typ (agency/salon/club)     │
│ • Město (required)                     │
│ • Adresa (required)                    │
│ • Počet zaměstnanců (informativní)     │
└────────────┬───────────────────────────┘
             ↓
┌────────────────────────────────────────┐
│ STEP 3: Details & Services             │
├────────────────────────────────────────┤
│ IF SOLO:                               │
│ • Služby (multi-select by category)    │
│ • Fyzické atributy (optional)          │
│   - Výška, váha, prsa, vlasy           │
│ • Popis (textarea, 200-500 chars)      │
│ • Opening hours (optional)             │
│ • Pricing (optional)                   │
│ • Fotky (SKIP - přidá se později)      │
│                                        │
│ IF BUSINESS:                           │
│ • Vybavení (multi-select)              │
│   - Sprcha, parkování, WiFi, sauna     │
│ • Otevírací doba (by day)              │
│ • Popis podniku (textarea)             │
│ • Fotky prostor (SKIP - později)       │
│                                        │
│ IF BUSINESS s týmem:                   │
│ • Vybavení (same as above)             │
│ • Otevírací doba                       │
│ • Popis firmy                          │
│ • "Přidám zaměstnance později" notice  │
└────────────┬───────────────────────────┘
             ↓
         SUBMIT to /api/register
             ↓
┌────────────────────────────────────────┐
│ Backend Processing                     │
├────────────────────────────────────────┤
│ 1. Validate all fields                 │
│ 2. Normalize phone (+420)              │
│ 3. Hash password (bcrypt)              │
│ 4. Create User record                  │
│ 5. IF SOLO:                            │
│    → Create Profile                    │
│    → Link services                     │
│ 6. IF BUSINESS:                        │
│    → Create Business                   │
│    → Set approved=false                │
│ 7. Generate slug                       │
│ 8. Auto-generate SEO (background)      │
│ 9. Send verification SMS               │
└────────────┬───────────────────────────┘
             ↓
┌────────────────────────────────────────┐
│ Success → Redirect to Onboarding       │
├────────────────────────────────────────┤
│ /prihlaseni?registered=true            │
│ → Login with credentials               │
│ → Onboarding wizard:                   │
│   Step 1: Přidat fotky (DŮLEŽITÉ!)     │
│   Step 2: Doplnit profil               │
│   Step 3: Verification (optional)      │
│   Step 4: Čekat na schválení adminem   │
└─────────────────────────────────────────┘
```

---

## 4. POST-REGISTRATION ONBOARDING

### 4.1 Onboarding Wizard (po prvním přihlášení)

```
┌─────────────────────────────────────────┐
│  Vítejte! Dokončete svůj profil (3/5)   │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Základní informace vyplněny         │
│  ⚠️  Přidejte fotky (DŮLEŽITÉ!)         │
│  ⚠️  Ověřte telefon                     │
│  ⚠️  Čekáme na schválení adminem        │
│  ⭕ Získejte Verified badge (optional)  │
│                                         │
│  [Přidat fotky nyní]  [Přeskočit]       │
└─────────────────────────────────────────┘
```

### 4.2 Photo Upload Screen

```
┌─────────────────────────────────────────┐
│  Přidejte fotky k profilu               │
├─────────────────────────────────────────┤
│  Doporučení:                            │
│  • Minimum 5 fotek                      │
│  • Různé pozy a outfity                 │
│  • Dobré osvětlení                      │
│  • Reálné fotky (ne filter)             │
│                                         │
│  Drag & Drop nebo [Vybrat soubory]     │
│                                         │
│  Preview:                               │
│  [thumb1] [thumb2] [thumb3] [+]         │
│                                         │
│  ⚠️ Fotky projdou schválením adminem    │
│                                         │
│  [Uložit fotky]  [Přidat později]       │
└─────────────────────────────────────────┘
```

**Backend:**
- Fotky se ukládají jako base64
- Vytvoří se PendingChange record typu PHOTO_UPDATE
- Admin musí schválit před zobrazením

### 4.3 Verification Flow (Optional)

```
┌─────────────────────────────────────────┐
│  Získejte Verified badge                │
├─────────────────────────────────────────┤
│  Zvyšte důvěryhodnost o 300%!           │
│                                         │
│  🟢 Basic (zdarma)                      │
│  ✓ Telefon ověřen SMS                   │
│                                         │
│  🔵 Photo Verified (€20)                │
│  ✓ Nahrát selfie s ID                   │
│  ✓ Admin potvrdí shodu                  │
│                                         │
│  🟣 Video Verified (€50)                │
│  ✓ Live video call s adminem            │
│  ✓ Nejvyšší důvěra                      │
│                                         │
│  [Začít verifikaci]  [Ne, děkuji]       │
└─────────────────────────────────────────┘
```

---

## 5. BUSINESS S TÝMEM - Speciální Flow

### 5.1 Agency Dashboard

Po registraci business s týmem:

```
/inzerent_dashboard → Agency Mode

┌─────────────────────────────────────────┐
│  Luxury Escort Agency                   │
│  📊 Dashboard                           │
├─────────────────────────────────────────┤
│  👥 Moje zaměstnanci (0)                │
│  [+ Přidat zaměstnance]                 │
│                                         │
│  📸 Fotky podniku (0)                   │
│  [+ Přidat fotky prostor]               │
│                                         │
│  📈 Statistiky                          │
│  • Celkové views: 0                     │
│  • Počet kliknutí: 0                    │
│                                         │
│  ⚙️ Nastavení podniku                   │
│  [Upravit vybavení]                     │
│  [Otevírací doba]                       │
└─────────────────────────────────────────┘
```

### 5.2 Přidání Zaměstnance

```
Kliknutí na [+ Přidat zaměstnance]
         ↓
┌─────────────────────────────────────────┐
│  Přidat nového zaměstnance              │
├─────────────────────────────────────────┤
│  Jméno: [________________]              │
│  Věk: [__]                              │
│  Kategorie: [Holky na sex ▼]            │
│  Město: Praha (z business)              │
│                                         │
│  Služby (multi-select):                 │
│  ☑ Klasika  ☑ Orál  ☐ Anální            │
│                                         │
│  Fyzické atributy:                      │
│  • Výška: [___] cm                      │
│  • Váha: [___] kg                       │
│  • Barva vlasů: [Blond ▼]               │
│  • Prsa: [2 ▼]                          │
│                                         │
│  Popis: [textarea]                      │
│                                         │
│  Fotky:                                 │
│  [Drag & Drop]                          │
│                                         │
│  [Uložit a odeslat ke schválení]        │
└─────────────────────────────────────────┘
```

**Backend:**
1. Vytvoří **Profile** record
2. Nastaví `businessId` = agency ID
3. Vytvoří **PendingChange** pro schválení
4. Admin schválí → profil se zobrazí
5. Profil má:
   - Vlastní URL: `/profil/lucie-23`
   - Link zpět na business: "Pracuje v Luxury Escort"
   - Cross-linking

---

## 6. EDIT SYSTÉM - Hybrid Approach

### 6.1 Co se dá měnit HNED (real-time)

```
/inzerent_dashboard → Upravit profil

Editovatelné bez schválení:
✅ Popis (textarea)
✅ Opening hours (JSON)
✅ Pricing (€/hod)
✅ Social links (OnlyFans, Instagram)
✅ isOnline status (toggle)

[Uložit změny] → okamžitě aplikováno
```

### 6.2 Co potřebuje SCHVÁLENÍ (PendingChange)

```
Editace vyžadující approval:
⚠️ Telefon
⚠️ Email
⚠️ Adresa
⚠️ Město
⚠️ Věk
⚠️ Fyzické atributy
⚠️ Služby
⚠️ Fotky (přidat/smazat)
⚠️ Jméno/Nickname

[Odeslat ke schválení] → PendingChange record
```

**UI Design:**
```
┌─────────────────────────────────────────┐
│  Upravit telefon                        │
├─────────────────────────────────────────┤
│  Současný: +420 777 888 999             │
│  Nový: [+420 ___________]               │
│                                         │
│  ⚠️ Změna telefonu vyžaduje schválení   │
│  adminem (2-24 hodin)                   │
│                                         │
│  [Odeslat žádost o změnu]               │
└─────────────────────────────────────────┘
```

---

## 7. ADMIN PANEL APPROVAL - Enhanced

### 7.1 Pending Changes Tab - Improved

```
/admin_panel → Pending Changes (15)

Filtry:
• Vše (15)
• Profile Updates (8)
• Photo Updates (5)
• Business Updates (2)

┌─────────────────────────────────────────┐
│  #234 - Photo Update - Lucie (24)       │
│  Požádáno: 17.11.2025 13:45             │
│  Typ: Profile                           │
├─────────────────────────────────────────┤
│  Změny:                                 │
│  📸 Fotky:                              │
│    Smazat: [thumb1] [thumb2]            │
│    Přidat: [NEW1] [NEW2] [NEW3]         │
│                                         │
│  [Schválit] [Zamítnout] [Detail]        │
└─────────────────────────────────────────┘

Kliknutí na [Detail] →

┌─────────────────────────────────────────┐
│  Detail změny #234                      │
├─────────────────────────────────────────┤
│  STARÉ HODNOTY     │  NOVÉ HODNOTY      │
│  ──────────────────┼────────────────────│
│  [thumb1: girl.jpg]│  ❌ SMAZAT         │
│  [thumb2: prof.jpg]│  ❌ SMAZAT         │
│                    │  ✅ [NEW1]         │
│                    │  ✅ [NEW2]         │
│                    │  ✅ [NEW3]         │
│  ──────────────────┴────────────────────│
│  Důvod požadavku: "Nové fotky, lepší   │
│  kvalita"                               │
│                                         │
│  [✓ Schválit vše]                       │
│  [Schválit jen některé fotky]           │
│  [❌ Zamítnout s poznámkou]             │
└─────────────────────────────────────────┘
```

**Selective Approval:**
- Admin může schválit jen některé fotky
- Může smazat specific items
- Poznámky k zamítnutí

---

## 8. OBLÍBENÉ VYHLEDÁVÁNÍ - Dynamic Generation

### 8.1 Současný stav (statický)

```javascript
// /app/oblibene-vyhledavani/page.tsx
const categories = [
  {
    title: 'Podle věku',
    items: [
      { label: 'Studentky', url: '/holky-na-sex?age=student' },
      // ... hardcoded
    ]
  }
];
```

### 8.2 Nový systém (dynamický + hybrid)

**Database Model:**
```prisma
model PopularSearch {
  id          String   @id @default(cuid())
  label       String   // "Studentky na sex"
  url         String   // "/holky-na-sex?age=student"
  category    String   // "age"
  searchCount Int      @default(0)  // Počet vyhledání
  clickCount  Int      @default(0)  // Počet kliknutí
  isManual    Boolean  @default(false)  // Ručně přidáno adminem
  priority    Int      @default(0)  // Pro ruční řazení
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([searchCount])
}
```

**Tracking Searches:**
```typescript
// /app/api/track-search/route.ts
export async function POST(req: Request) {
  const { query, filters } = await req.json();

  // Log search
  await prisma.searchQuery.create({
    data: {
      query,
      filters: JSON.stringify(filters),
      timestamp: new Date()
    }
  });

  // Update popular search count
  const searchString = generateSearchString(query, filters);
  await prisma.popularSearch.upsert({
    where: { url: searchString },
    update: { searchCount: { increment: 1 } },
    create: {
      label: generateLabel(query, filters),
      url: searchString,
      category: detectCategory(filters)
    }
  });
}
```

**Display Logic:**
```typescript
// /app/oblibene-vyhledavani/page.tsx
const popularSearches = await prisma.popularSearch.findMany({
  where: {
    OR: [
      { isManual: true },  // Ručně přidané
      { searchCount: { gte: 100 } }  // Automaticky populární
    ]
  },
  orderBy: [
    { priority: 'desc' },  // Priority first
    { searchCount: 'desc' }  // Then by popularity
  ],
  take: 50
});
```

**Admin Panel Control:**
```
/admin_panel → SEO Master → Popular Searches

┌─────────────────────────────────────────┐
│  Populární vyhledávání                  │
├─────────────────────────────────────────┤
│  Auto-generované (250):                 │
│  [x] Zobrazit top 50                    │
│                                         │
│  Top searches (14 days):                │
│  1. Studentky Praha (2,451 searches)    │
│  2. MILF Brno (1,892 searches)          │
│  3. Blondýnky escort (1,654 searches)   │
│  ...                                    │
│                                         │
│  Ručně přidané (12):                    │
│  • VIP Escort Praha [Edit] [Delete]     │
│  • Tantra masáž Ostrava [Edit]          │
│                                         │
│  [+ Přidat nové vyhledávání]            │
└─────────────────────────────────────────┘
```

---

## 9. VERIFICATION TIERS - Implementation

### 9.1 Verification Levels

```prisma
model Profile {
  // ... existing fields

  // Verification fields
  phoneVerified     Boolean  @default(false)
  photoVerified     Boolean  @default(false)
  videoVerified     Boolean  @default(false)
  idVerified        Boolean  @default(false)

  verificationLevel Int      @default(0)  // 0-4
  verifiedAt        DateTime?
  verifiedBy        String?  // Admin ID

  // Trust score (auto-calculated)
  trustScore        Int      @default(0)  // 0-100
}
```

**Trust Score Calculation:**
```typescript
function calculateTrustScore(profile: Profile): number {
  let score = 0;

  if (profile.phoneVerified) score += 20;
  if (profile.photoVerified) score += 30;
  if (profile.videoVerified) score += 30;
  if (profile.idVerified) score += 20;

  // Bonus points
  if (profile.reviewCount > 5) score += 10;
  if (profile.rating >= 4.5) score += 10;
  if (profile.photos.length >= 10) score += 5;

  return Math.min(score, 100);
}
```

### 9.2 Verification UI

**Profile Display:**
```
/profil/lucie-23

┌─────────────────────────────────────────┐
│  [Photo] Lucie, 23                      │
│  ✓ Verified Profile                     │
│  Trust Score: 85/100 🟢                  │
├─────────────────────────────────────────┤
│  Verification badges:                   │
│  ✓ Phone verified                       │
│  ✓ Photo verified                       │
│  ✓ Video verified                       │
│  ✓ ID verified                          │
│                                         │
│  Reviews: ⭐⭐⭐⭐⭐ (4.8) • 23 reviews     │
└─────────────────────────────────────────┘
```

**Verification Process:**
```
User Dashboard → Get Verified

┌─────────────────────────────────────────┐
│  Verification Center                    │
├─────────────────────────────────────────┤
│  🟢 Phone Verified ✓                    │
│  Completed: 15.11.2025                  │
│                                         │
│  🔵 Photo Verification                  │
│  Status: Not started                    │
│  [Start verification] €20               │
│                                         │
│  🟣 Video Verification                  │
│  Status: Not started                    │
│  [Start verification] €50               │
│  Requires: Photo verification first     │
│                                         │
│  ⭐ ID Verification                     │
│  Status: Not started                    │
│  [Start verification] €50               │
│                                         │
│  Current Trust Score: 20/100            │
│  With all verifications: 100/100        │
└─────────────────────────────────────────┘
```

---

## 10. IMPLEMENTATION PHASES

### Phase 1: Core Registration (2-3 weeks)
- ✅ Type selection screen
- ✅ 3-step registration flow
- ✅ SOLO vs BUSINESS differentiation
- ✅ Basic PendingChange integration
- ✅ Photo upload (with approval)
- ✅ SMS verification

### Phase 2: Business Features (2 weeks)
- ✅ Agency dashboard
- ✅ Add employee flow
- ✅ Cross-linking profiles ↔ business
- ✅ Business photo galleries
- ✅ Equipment/opening hours management

### Phase 3: Verification System (2 weeks)
- ✅ Photo verification flow
- ✅ Video verification (live call)
- ✅ ID verification
- ✅ Trust score calculation
- ✅ Verification badges display

### Phase 4: Dynamic Searches (1 week)
- ✅ SearchQuery model
- ✅ PopularSearch model
- ✅ Tracking API endpoint
- ✅ Admin panel control
- ✅ Hybrid static + dynamic display

### Phase 5: Reviews & Ratings (2 weeks)
- ✅ Review model
- ✅ Submit review flow
- ✅ Admin moderation
- ✅ Star ratings
- ✅ Verified booking badges

### Phase 6: Booking System (3 weeks)
- ✅ Calendar integration
- ✅ Real-time availability
- ✅ Booking requests
- ✅ Confirmation emails
- ✅ Deposit/prepayment

---

## 11. DATABASE CHANGES REQUIRED

### 11.1 New Models

```prisma
// Popular searches tracking
model SearchQuery {
  id        String   @id @default(cuid())
  query     String?
  filters   String   // JSON
  userId    String?
  timestamp DateTime @default(now())

  @@index([timestamp])
}

model PopularSearch {
  id          String   @id @default(cuid())
  label       String
  url         String   @unique
  category    String
  searchCount Int      @default(0)
  clickCount  Int      @default(0)
  isManual    Boolean  @default(false)
  priority    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([searchCount])
}

// Verification system
model Verification {
  id            String   @id @default(cuid())
  profileId     String
  profile       Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  type          VerificationType  // PHONE, PHOTO, VIDEO, ID
  status        VerificationStatus @default(PENDING)
  submittedAt   DateTime @default(now())
  reviewedAt    DateTime?
  reviewedBy    String?  // Admin ID
  reviewNotes   String?
  data          String?  // JSON with verification data

  @@index([profileId])
  @@index([status])
}

enum VerificationType {
  PHONE
  PHOTO
  VIDEO
  ID
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}

// Reviews (future)
model Review {
  id         String   @id @default(cuid())
  profileId  String
  profile    Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  userId     String?
  rating     Int      // 1-5
  comment    String?
  isVerified Boolean  @default(false)
  createdAt  DateTime @default(now())
  approved   Boolean  @default(false)

  @@index([profileId])
  @@index([approved])
}
```

### 11.2 Profile Model Updates

```prisma
model Profile {
  // ... existing fields

  // Verification fields (add these)
  phoneVerified     Boolean  @default(false)
  photoVerified     Boolean  @default(false)
  videoVerified     Boolean  @default(false)
  idVerified        Boolean  @default(false)
  verificationLevel Int      @default(0)
  verifiedAt        DateTime?
  verifiedBy        String?
  trustScore        Int      @default(0)

  // Relations (add these)
  verifications Verification[]
  reviews       Review[]
}
```

---

## 12. API ENDPOINTS - New/Modified

### 12.1 Registration

```typescript
// UPDATED
POST /api/register
Body: {
  accountType: 'SOLO' | 'BUSINESS' | 'AGENCY'
  phone: string
  email?: string
  password: string
  profile?: { ... }  // If SOLO
  business?: { ... } // If BUSINESS/AGENCY
}

// NEW
POST /api/register/verify-phone
Body: { phone: string, code: string }

POST /api/register/check-availability
Body: { type: 'phone' | 'email' | 'businessName', value: string }
```

### 12.2 Verification

```typescript
// NEW
POST /api/verification/photo
Body: { profileId: string, selfieWithId: base64 }

POST /api/verification/video
Body: { profileId: string, scheduledTime: DateTime }

POST /api/verification/id
Body: { profileId: string, idDocument: base64 }

GET /api/verification/status/:profileId
Returns: { phoneVerified, photoVerified, videoVerified, idVerified, trustScore }
```

### 12.3 Popular Searches

```typescript
// NEW
POST /api/track-search
Body: { query?: string, filters: object }

GET /api/popular-searches
Query: { category?: string, limit?: number }
Returns: PopularSearch[]

// Admin only
POST /api/admin/popular-searches
Body: { label, url, category, isManual: true, priority }

DELETE /api/admin/popular-searches/:id
```

### 12.4 Agency Management

```typescript
// NEW
POST /api/businesses/add-employee
Body: { businessId, profileData }

GET /api/businesses/:id/employees
Returns: Profile[]

DELETE /api/businesses/:businessId/employees/:profileId
```

---

## 13. UI/UX IMPROVEMENTS

### 13.1 Registration Progress Indicator

```
Step 1/3: Account        [●○○]
Step 2/3: Information    [●●○]
Step 3/3: Details        [●●●]
```

### 13.2 Smart Form Validation

```typescript
// Real-time field validation
const validatePhone = debounce(async (phone) => {
  const isAvailable = await checkAvailability('phone', phone);
  if (!isAvailable) {
    setError('phone', 'Toto číslo je již registrováno');
  }
}, 800);
```

### 13.3 Contextual Help

```
[ℹ️ Proč potřebujeme telefon?]
→ Tooltip: "Telefon je hlavní způsob, jak vás budou
klienti kontaktovat. Musí být unikátní pro každý profil."
```

### 13.4 Mobile-First Design

```css
/* Registration form mobile optimization */
@media (max-width: 768px) {
  .registration-step {
    padding: 1rem;
  }

  .form-field {
    width: 100%;
    margin-bottom: 1.5rem;
  }

  .cta-button {
    width: 100%;
    min-height: 44px; /* Touch target */
  }
}
```

---

## 14. SUCCESS METRICS

### 14.1 Registration Conversion

**Current (estimated):**
- Visit /registrace: 100%
- Complete Step 1: 60%
- Complete Step 2: 40%
- Submit registration: 25%

**Target with new flow:**
- Visit /registrace: 100%
- Select type: 85%
- Complete Step 1: 70%
- Complete Step 2: 60%
- Complete Step 3: 50%
- Submit registration: 45%

**Goal:** Increase conversion by 20% (25% → 45%)

### 14.2 Profile Quality

**Current:**
- Profiles with photos: 60%
- Average photos per profile: 3.2
- Verified profiles: 5%

**Target:**
- Profiles with photos: 90%
- Average photos per profile: 8+
- Verified profiles: 40%

### 14.3 User Engagement

**Current:**
- Monthly active profiles: Unknown
- Average edits per month: Unknown
- Pending changes: 15-20

**Target:**
- Monthly active profiles: Track & grow
- Real-time edits (instant): 80%
- Pending changes: <50 (better UX = fewer changes)

---

## 15. COMPETITIVE ADVANTAGES

Po implementaci budeme mít:

| Feature | Erosko | DobryPrivat | CzEscort |
|---------|--------|-------------|----------|
| **Type Selection** | ✅ 3 types | ⚠️ Unclear | ✅ 2 types |
| **AJAX Filters** | ✅ Yes | ✅ Excellent | ✅ Yes |
| **Verification** | ✅ 4 levels | ❌ No | ✅ 3 levels |
| **Reviews** | 🔄 Planned | ❌ No | ✅ Yes |
| **Agency Dashboard** | ✅ Yes | ✅ Basic | ✅ Advanced |
| **Real-time Edits** | ✅ Hybrid | ❌ No | ⚠️ Limited |
| **Dynamic Searches** | ✅ Hybrid | ❌ Static | ✅ Yes |
| **Photo Approval** | ✅ Admin | ⚠️ Unknown | ✅ Auto |
| **Booking System** | 🔄 Future | ❌ No | ✅ Yes |
| **Mobile App** | 🔄 Future | ❌ No | ⚠️ PWA |

**Náš klíčový diferenciátor:**
- 🎯 **Hybrid real-time + approval** (nejlepší z obou světů)
- 🎯 **4-level verification** (nejvyšší trust)
- 🎯 **Clear type selection** (user-friendly)
- 🎯 **Dynamic + manual popular searches** (SEO + UX)

---

## 16. RISK MITIGATION

### 16.1 Potential Issues

1. **Komplexnost registrace** - 3 kroky mohou odradit
   - **Solution:** Progress indicator, možnost uložit draft

2. **Foto approval delay** - frustrace uživatelů
   - **Solution:** SLA 24h, notifikace, priority queue

3. **Spam/fake profiles** - abuse systému
   - **Solution:** SMS verification, reCAPTCHA, rate limiting

4. **Admin overload** - příliš mnoho pending changes
   - **Solution:** Bulk approval, auto-approval pro trusted users

### 16.2 Rollback Plan

**Phase 1 failure:**
- Vrátit starý 2-step registration
- Zachovat data v DB (forward compatible)

**Phase 2+ failure:**
- Disable new features via feature flags
- Keep old endpoints active
- Gradual rollout to 10% → 50% → 100%

---

## ZÁVĚR

Tento unified registration system kombinuje:

✅ **Best practices z konkurence** (DobryPrivat filtrace, CzEscort verification)
✅ **Naše unikátní features** (PendingChange hybrid, SEO Master)
✅ **User-centric design** (clear flow, contextual help)
✅ **Admin efficiency** (bulk operations, smart approval)
✅ **Future-proof architecture** (reviews, booking ready)

**Next Steps:**
1. ✅ Review tohoto návrhu
2. ⏳ Schválení features priority
3. ⏳ Design mockups UI
4. ⏳ API endpoints specification
5. ⏳ Development Phase 1 start

---

**Připraveno:** Claude Code
**Datum:** 17.11.2025
**Status:** ✅ Ready for Review
