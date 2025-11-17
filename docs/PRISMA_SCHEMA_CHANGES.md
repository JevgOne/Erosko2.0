# 🗄️ Prisma Schema Changes - Unified Registration System

> **Datum:** 2025-11-17
> **Status:** Proposal for Database Migration
> **Impact:** Medium (adds new models, no breaking changes to existing data)

---

## 📋 Overview

Tento dokument obsahuje **všechny potřebné změny** v Prisma schema pro implementaci Unified Registration System podle UNIFIED_REGISTRATION_PROPOSAL.

### ✅ Co JE dobře (zachováme):
- ✅ `User` model s phone/email login
- ✅ `PendingChange` model (hybrid approval system)
- ✅ `VerificationCode` model (SMS OTP)
- ✅ `Profile` a `Business` modely
- ✅ `ProfileType` enum (SOLO, PRIVAT, MASSAGE_SALON, atd.)

### ➕ Co PŘIDÁME (nové modely):
- ➕ `Verification` model (multi-tier badges)
- ➕ `SearchQuery` model (tracking vyhledávání)
- ➕ `PopularSearch` model (dynamické popular searches)
- ➕ Nové enums: `VerificationType`, `VerificationStatus`

### 🔧 Co UPRAVÍME (úpravy existujících):
- 🔧 `User` model - přidat `emailVerified`
- 🔧 `Profile` model - přidat relaci k `Verification`
- 🔧 `Business` model - přidat relaci k `Verification`

---

## 🚀 Migration Strategy

### Přístup: **Incremental Migration** (bezpečné, no downtime)

```bash
# 1. Přidáme nové modely (nebrklé změny)
npx prisma migrate dev --name add-verification-system

# 2. Přidáme nové pole (zpětně kompatibilní)
npx prisma migrate dev --name add-email-verified

# 3. Přidáme search tracking (nové modely)
npx prisma migrate dev --name add-search-tracking

# 4. Deploy to production
npx prisma migrate deploy
```

**Výhody:**
- ✅ Žádná data loss
- ✅ Zpětná kompatibilita
- ✅ Postupná implementace funkc

---

## 📝 Complete Schema Changes

### Změna #1: User Model - Add emailVerified

```prisma
model User {
  id            String   @id @default(cuid())
  phone         String   @unique
  email         String?  @unique
  passwordHash  String
  phoneVerified Boolean  @default(false)
  emailVerified Boolean  @default(false) // ➕ NEW FIELD

  role          UserRole @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  profiles              Profile[]
  businesses            Business[]
  reviews               Review[]
  favorites             Favorite[]
  requestedChanges      PendingChange[]    @relation("RequestedChanges")
  reviewedChanges       PendingChange[]    @relation("ReviewedChanges")
  verificationCodes     VerificationCode[]
  verifiedVerifications Verification[]     @relation("VerifiedVerifications") // ➕ NEW RELATION
  searchQueries         SearchQuery[]      // ➕ NEW RELATION

  @@index([phone])
}
```

**Migration SQL:**
```sql
-- SQLite (automatic)
ALTER TABLE User ADD COLUMN emailVerified BOOLEAN NOT NULL DEFAULT 0;
```

**Impact:** ✅ Safe - defaults to `false`, no data loss

---

### Změna #2: NEW Verification Model

```prisma
model Verification {
  id           String             @id @default(cuid())
  type         VerificationType
  status       VerificationStatus @default(PENDING)

  // Evidence
  documentUrl  String? // URL to uploaded photo/video/ID scan
  notes        String? // Admin notes during review

  // Relations
  profileId    String?
  profile      Profile?  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  businessId   String?
  business     Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)

  // Who verified it
  verifiedById String?
  verifiedBy   User?     @relation("VerifiedVerifications", fields: [verifiedById], references: [id])
  verifiedAt   DateTime?

  // Metadata
  expiresAt    DateTime? // For photo/video verifications (expire after 6 months)
  rejectionReason String?

  // Timestamps
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([profileId])
  @@index([businessId])
  @@index([status])
  @@index([type])
}

enum VerificationType {
  PHONE        // ✅ SMS verification (automatic)
  PHOTO        // 📸 Selfie with paper "Erosko.cz + date"
  VIDEO        // 🎥 10-second verification video
  ID_DOCUMENT  // 🆔 Passport/ID card scan
}

enum VerificationStatus {
  PENDING   // Waiting for admin review
  APPROVED  // Verified by admin
  REJECTED  // Rejected with reason
  EXPIRED   // Verification expired (photo/video only)
}
```

**Example Usage:**
```typescript
// Create photo verification request
const verification = await prisma.verification.create({
  data: {
    type: 'PHOTO',
    status: 'PENDING',
    documentUrl: 'https://erosko.cz/uploads/verification/photo-123.jpg',
    profileId: 'profile-id-xyz',
  }
});

// Admin approves it
await prisma.verification.update({
  where: { id: verification.id },
  data: {
    status: 'APPROVED',
    verifiedById: 'admin-user-id',
    verifiedAt: new Date(),
  }
});

// Check verification badges for profile
const badges = await prisma.verification.findMany({
  where: {
    profileId: 'profile-id-xyz',
    status: 'APPROVED',
  },
  select: { type: true }
});
// → Returns: [{ type: 'PHONE' }, { type: 'PHOTO' }]
```

**Impact:** ✅ New table, no impact on existing data

---

### Změna #3: Profile Model - Add Verification Relation

```prisma
model Profile {
  id          String  @id @default(cuid())
  name        String
  slug        String  @unique
  age         Int
  description String?
  phone       String  // ⚠️ IMMUTABLE - changes require PendingChange approval
  email       String?

  // Location
  city     String  // ⚠️ IMMUTABLE - changes require PendingChange approval
  address  String? // ⚠️ IMMUTABLE - changes require PendingChange approval
  location String

  // Profile type
  profileType ProfileType
  category    Category

  // Physical attributes (existing fields - no changes)
  height      Int?
  weight      Int?
  bust        String?
  hairColor   String?
  // ... (all existing fields)

  // Metadata
  approved  Boolean @default(false)
  verified  Boolean @default(false) // ⚠️ DEPRECATED - use verifications relation instead
  isNew     Boolean @default(true)
  isPopular Boolean @default(false)
  isOnline  Boolean @default(false)

  // Stats
  rating      Float @default(0)
  reviewCount Int   @default(0)
  viewCount   Int   @default(0)

  // ➕ NEW: Conversion tracking
  contactClicks  Int @default(0)
  phoneClicks    Int @default(0)
  whatsappClicks Int @default(0)
  websiteClicks  Int @default(0)

  // SEO Fields (existing - no changes)
  seoTitle        String?
  seoDescription  String?
  // ... (all existing SEO fields)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  ownerId        String
  owner          User             @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  businessId     String?
  business       Business?        @relation(fields: [businessId], references: [id], onDelete: SetNull)
  photos         Photo[]
  reviews        Review[]
  services       ProfileService[]
  favorites      Favorite[]
  pendingChanges PendingChange[]
  verifications  Verification[]   // ➕ NEW RELATION

  @@index([city])
  @@index([category])
  @@index([profileType])
  @@index([slug])
}
```

**Migration SQL:**
```sql
-- Add conversion tracking columns
ALTER TABLE Profile ADD COLUMN contactClicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Profile ADD COLUMN phoneClicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Profile ADD COLUMN whatsappClicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Profile ADD COLUMN websiteClicks INTEGER NOT NULL DEFAULT 0;
```

**Impact:** ✅ Safe - adds optional fields with defaults

---

### Změna #4: Business Model - Add Verification Relation

```prisma
model Business {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  description String?
  phone       String      // ⚠️ IMMUTABLE - changes require PendingChange approval
  email       String?
  website     String?
  address     String?     // ⚠️ IMMUTABLE - changes require PendingChange approval
  city        String      // ⚠️ IMMUTABLE - changes require PendingChange approval
  profileType ProfileType

  // Business-specific fields
  equipment    Json?
  openingHours Json?

  // Metadata
  approved  Boolean @default(false)
  verified  Boolean @default(false) // ⚠️ DEPRECATED - use verifications relation
  isNew     Boolean @default(true)
  isPopular Boolean @default(false)

  // Stats
  rating      Float @default(0)
  reviewCount Int   @default(0)
  viewCount   Int   @default(0)

  // ➕ NEW: Conversion tracking
  contactClicks  Int @default(0)
  phoneClicks    Int @default(0)
  websiteClicks  Int @default(0)

  // SEO Fields (existing - no changes)
  seoTitle          String?
  seoDescription    String?
  // ... (all existing SEO fields)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  ownerId        String
  owner          User            @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  profiles       Profile[]
  photos         Photo[]
  reviews        Review[]
  pendingChanges PendingChange[]
  verifications  Verification[]  // ➕ NEW RELATION

  @@index([city])
  @@index([profileType])
  @@index([slug])
}
```

**Migration SQL:**
```sql
-- Add conversion tracking columns
ALTER TABLE Business ADD COLUMN contactClicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Business ADD COLUMN phoneClicks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Business ADD COLUMN websiteClicks INTEGER NOT NULL DEFAULT 0;
```

**Impact:** ✅ Safe - adds optional fields with defaults

---

### Změna #5: NEW SearchQuery Model

```prisma
model SearchQuery {
  id          String   @id @default(cuid())
  query       String   // Raw search query (e.g., "escort praha")
  filters     Json?    // Applied filters: { city: "Praha", service: "tantric", priceMax: 5000 }

  // User tracking
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Metadata
  resultCount Int      // How many results were shown
  clickedProfileId String? // If user clicked on a profile
  sessionId   String?  // Anonymous session tracking

  // Analytics
  deviceType  String?  // "mobile", "desktop", "tablet"
  referrer    String?  // Where did user come from

  createdAt   DateTime @default(now())

  @@index([query])
  @@index([userId])
  @@index([createdAt])
}
```

**Example Usage:**
```typescript
// Track search when user searches
await prisma.searchQuery.create({
  data: {
    query: 'escort praha',
    filters: { city: 'Praha', priceMax: 5000 },
    resultCount: 42,
    userId: session?.user?.id,
    sessionId: req.cookies.sessionId,
    deviceType: req.headers['user-agent'].includes('Mobile') ? 'mobile' : 'desktop',
  }
});

// Daily aggregation to PopularSearch
const topSearches = await prisma.searchQuery.groupBy({
  by: ['query'],
  _count: { query: true },
  where: {
    createdAt: { gte: last7Days }
  },
  orderBy: {
    _count: { query: 'desc' }
  },
  take: 50
});
```

**Impact:** ✅ New table, no impact on existing data

---

### Změna #6: NEW PopularSearch Model

```prisma
model PopularSearch {
  id           String   @id @default(cuid())
  keyword      String   @unique     // Normalized keyword (e.g., "escort-praha")
  displayText  String               // User-friendly text (e.g., "Escort Praha")

  // Categorization
  category     String?              // "city", "service", "city-service", "custom"
  city         String?              // For filtering by location
  serviceType  String?              // For filtering by service

  // Stats
  searchCount  Int      @default(0) // Total searches in last 30 days
  clickCount   Int      @default(0) // How many times users clicked it
  lastSearched DateTime @default(now())

  // Admin control
  isPinned     Boolean  @default(false) // Admin can pin important searches
  isActive     Boolean  @default(true)  // Hide inactive searches
  order        Int      @default(0)     // Manual ordering (pinned first, then by searchCount)

  // SEO
  linkedPageUrl String? // Link to landing page (e.g., "/holky-na-sex/praha")

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([searchCount])
  @@index([lastSearched])
  @@index([isPinned])
  @@index([category])
}
```

**Example Data:**
```typescript
// Automatically created by daily cron job
await prisma.popularSearch.upsert({
  where: { keyword: 'escort-praha' },
  create: {
    keyword: 'escort-praha',
    displayText: 'Escort Praha',
    category: 'city-service',
    city: 'Praha',
    serviceType: 'escort',
    searchCount: 1247,
    clickCount: 342,
    linkedPageUrl: '/holky-na-sex/praha'
  },
  update: {
    searchCount: { increment: 42 }, // Today's searches
    lastSearched: new Date()
  }
});

// Admin pins important search
await prisma.popularSearch.update({
  where: { keyword: 'masaze-brno' },
  data: { isPinned: true, order: 1 }
});
```

**Homepage Display Logic:**
```typescript
// Get popular searches for homepage
const popularSearches = await prisma.popularSearch.findMany({
  where: { isActive: true },
  orderBy: [
    { isPinned: 'desc' },    // Pinned first
    { order: 'asc' },        // Then manual order
    { searchCount: 'desc' }, // Then by popularity
  ],
  take: 12
});
```

**Impact:** ✅ New table, no impact on existing data

---

## 🔄 Complete Updated schema.prisma

Zde je **kompletní nový schema.prisma** se všemi změnami:

```prisma
// Erosko.cz - Escort Portal Database Schema (UPDATED)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum ProfileType {
  SOLO
  PRIVAT
  MASSAGE_SALON
  ESCORT_AGENCY
  DIGITAL_AGENCY
  SWINGERS_CLUB
  NIGHT_CLUB
  STRIP_CLUB
}

enum Category {
  HOLKY_NA_SEX
  EROTICKE_MASERKY
  DOMINA
  DIGITALNI_SLUZBY
  EROTICKE_PODNIKY
}

enum UserRole {
  USER
  PROVIDER
  ADMIN
}

enum ServiceCategory {
  PRAKTIKY
  DRUHY_MASAZI
  EXTRA_SLUZBY
  BDSM_PRAKTIKY
}

enum PageType {
  CATEGORY
  CITY
  CATEGORY_CITY
  CUSTOM
}

enum ChangeStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ChangeType {
  PROFILE_UPDATE
  PHOTO_UPDATE
  BUSINESS_UPDATE
}

enum VerificationCodeType {
  PHONE_VERIFICATION
  PASSWORD_RESET
}

enum ContentBlockType {
  TEXT
  RICH_TEXT
  JSON
  IMAGE
  VIDEO
}

// ➕ NEW ENUMS
enum VerificationType {
  PHONE
  PHOTO
  VIDEO
  ID_DOCUMENT
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}

// ==================== MODELS ====================

// 🔧 UPDATED: User Model
model User {
  id            String   @id @default(cuid())
  phone         String   @unique
  email         String?  @unique
  passwordHash  String
  phoneVerified Boolean  @default(false)
  emailVerified Boolean  @default(false) // ➕ NEW
  role          UserRole @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  profiles              Profile[]
  businesses            Business[]
  reviews               Review[]
  favorites             Favorite[]
  requestedChanges      PendingChange[]    @relation("RequestedChanges")
  reviewedChanges       PendingChange[]    @relation("ReviewedChanges")
  verificationCodes     VerificationCode[]
  verifiedVerifications Verification[]     @relation("VerifiedVerifications") // ➕ NEW
  searchQueries         SearchQuery[]      // ➕ NEW

  @@index([phone])
}

// ✅ UNCHANGED: VerificationCode Model
model VerificationCode {
  id        String               @id @default(cuid())
  phone     String
  code      String
  type      VerificationCodeType
  expiresAt DateTime
  verified  Boolean              @default(false)
  createdAt DateTime             @default(now())

  userId String?
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([phone])
  @@index([code])
}

// 🔧 UPDATED: Business Model
model Business {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  description String?
  phone       String
  email       String?
  website     String?
  address     String?
  city        String
  profileType ProfileType

  equipment    Json?
  openingHours Json?

  approved  Boolean @default(false)
  verified  Boolean @default(false)
  isNew     Boolean @default(true)
  isPopular Boolean @default(false)

  rating      Float @default(0)
  reviewCount Int   @default(0)
  viewCount   Int   @default(0)

  // ➕ NEW: Conversion tracking
  contactClicks  Int @default(0)
  phoneClicks    Int @default(0)
  websiteClicks  Int @default(0)

  seoTitle          String?
  seoDescription    String?
  seoKeywords       String?
  seoQualityScore   Int?
  ogImageUrl        String?
  seoManualOverride Boolean   @default(false)
  seoLastGenerated  DateTime?

  focusKeyword      String?
  secondaryKeywords String?   @default("")
  seoScore          Int?      @default(0)
  schemaMarkup      String?
  lastAnalyzed      DateTime?
  contentScore      Int?      @default(0)
  readabilityScore  Int?      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  ownerId        String
  owner          User            @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  profiles       Profile[]
  photos         Photo[]
  reviews        Review[]
  pendingChanges PendingChange[]
  verifications  Verification[]  // ➕ NEW

  @@index([city])
  @@index([profileType])
  @@index([slug])
}

// 🔧 UPDATED: Profile Model
model Profile {
  id          String  @id @default(cuid())
  name        String
  slug        String  @unique
  age         Int
  description String?
  phone       String
  email       String?

  city     String
  address  String?
  location String

  profileType ProfileType
  category    Category

  height      Int?
  weight      Int?
  bust        String?
  hairColor   String?
  hairLength  String?
  breastType  String?
  bodyType    String?
  ageCategory String?
  pubicHair   String?

  role        String?
  nationality String?
  languages   String?
  orientation String?
  tattoos     String?
  piercing    String?

  offersEscort Boolean @default(false)
  travels      Boolean @default(false)

  openingHours    Json?
  privateContacts Json?

  approved  Boolean @default(false)
  verified  Boolean @default(false)
  isNew     Boolean @default(true)
  isPopular Boolean @default(false)
  isOnline  Boolean @default(false)

  rating      Float @default(0)
  reviewCount Int   @default(0)
  viewCount   Int   @default(0)

  // ➕ NEW: Conversion tracking
  contactClicks  Int @default(0)
  phoneClicks    Int @default(0)
  whatsappClicks Int @default(0)
  websiteClicks  Int @default(0)

  seoTitle          String?
  seoDescription    String?
  seoDescriptionA   String?
  seoDescriptionB   String?
  seoDescriptionC   String?
  seoKeywords       String?
  seoQualityScore   Int?
  ogImageUrl        String?
  seoManualOverride Boolean   @default(false)
  seoLastGenerated  DateTime?
  seoLastReviewed   DateTime?

  seoActiveVariant String @default("A")
  seoVariantStats  Json?

  focusKeyword      String?
  secondaryKeywords String?   @default("")
  seoScore          Int?      @default(0)
  schemaMarkup      String?
  lastAnalyzed      DateTime?
  contentScore      Int?      @default(0)
  readabilityScore  Int?      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  ownerId        String
  owner          User             @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  businessId     String?
  business       Business?        @relation(fields: [businessId], references: [id], onDelete: SetNull)
  photos         Photo[]
  reviews        Review[]
  services       ProfileService[]
  favorites      Favorite[]
  pendingChanges PendingChange[]
  verifications  Verification[]   // ➕ NEW

  @@index([city])
  @@index([category])
  @@index([profileType])
  @@index([slug])
}

// ➕ NEW: Verification Model
model Verification {
  id           String             @id @default(cuid())
  type         VerificationType
  status       VerificationStatus @default(PENDING)

  documentUrl  String?
  notes        String?

  profileId    String?
  profile      Profile?  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  businessId   String?
  business     Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)

  verifiedById String?
  verifiedBy   User?     @relation("VerifiedVerifications", fields: [verifiedById], references: [id])
  verifiedAt   DateTime?

  expiresAt       DateTime?
  rejectionReason String?

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([profileId])
  @@index([businessId])
  @@index([status])
  @@index([type])
}

// ➕ NEW: SearchQuery Model
model SearchQuery {
  id          String   @id @default(cuid())
  query       String
  filters     Json?

  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  resultCount      Int
  clickedProfileId String?
  sessionId        String?

  deviceType  String?
  referrer    String?

  createdAt   DateTime @default(now())

  @@index([query])
  @@index([userId])
  @@index([createdAt])
}

// ➕ NEW: PopularSearch Model
model PopularSearch {
  id           String   @id @default(cuid())
  keyword      String   @unique
  displayText  String

  category     String?
  city         String?
  serviceType  String?

  searchCount  Int      @default(0)
  clickCount   Int      @default(0)
  lastSearched DateTime @default(now())

  isPinned     Boolean  @default(false)
  isActive     Boolean  @default(true)
  order        Int      @default(0)

  linkedPageUrl String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([searchCount])
  @@index([lastSearched])
  @@index([isPinned])
  @@index([category])
}

// ✅ UNCHANGED MODELS (no changes)
model Photo {
  id              String  @id @default(cuid())
  url             String
  alt             String?
  altQualityScore Int?
  order           Int     @default(0)
  isMain          Boolean @default(false)

  profileId  String?
  profile    Profile?  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  businessId String?
  business   Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([profileId])
  @@index([businessId])
}

model Service {
  id          String          @id @default(cuid())
  name        String          @unique
  description String?
  icon        String?
  category    ServiceCategory @default(PRAKTIKY)

  profiles ProfileService[]
}

model ProfileService {
  id String @id @default(cuid())

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  serviceId String
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([profileId, serviceId])
  @@index([profileId])
  @@index([serviceId])
}

model Review {
  id         String    @id @default(cuid())
  rating     Int
  comment    String?
  authorId   String
  author     User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  profileId  String?
  profile    Profile?  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  businessId String?
  business   Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([profileId])
  @@index([businessId])
  @@index([authorId])
}

model Favorite {
  id String @id @default(cuid())

  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, profileId])
  @@index([userId])
  @@index([profileId])
}

model PendingChange {
  id     String       @id @default(cuid())
  type   ChangeType
  status ChangeStatus @default(PENDING)

  profileId  String?
  profile    Profile?  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  businessId String?
  business   Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)

  oldData Json?
  newData Json

  requestedById String
  requestedBy   User   @relation("RequestedChanges", fields: [requestedById], references: [id], onDelete: Cascade)

  reviewedById String?
  reviewedBy   User?     @relation("ReviewedChanges", fields: [reviewedById], references: [id])
  reviewedAt   DateTime?
  reviewNotes  String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([profileId])
  @@index([businessId])
  @@index([status])
  @@index([requestedById])
}

model StaticPage {
  id   String   @id @default(cuid())
  path String   @unique
  type PageType @default(CUSTOM)

  seoTitle       String
  seoDescription String
  h1             String
  content        String? @default("")
  keywords       String?
  ogImageUrl     String?

  focusKeyword      String?
  secondaryKeywords String?   @default("")
  seoScore          Int?      @default(0)
  schemaMarkup      String?
  lastAnalyzed      DateTime?
  contentScore      Int?      @default(0)
  readabilityScore  Int?      @default(0)

  published Boolean @default(true)
  viewCount Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([path])
  @@index([type])
  @@index([published])
}

model Redirect {
  id        String   @id @default(cuid())
  from      String   @unique
  to        String
  type      Int      @default(301)
  hits      Int      @default(0)
  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([from])
  @@index([enabled])
}

model ContentBlock {
  id          String           @id @default(cuid())
  identifier  String           @unique
  type        ContentBlockType
  title       String?

  content     String?
  data        String?

  page        String  @default("homepage")
  section     String?
  published   Boolean @default(true)
  order       Int     @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([identifier])
  @@index([page])
  @@index([section])
  @@index([published])
}
```

---

## 🚀 Migration Commands

### Step 1: Backup Database
```bash
# Create backup before migration
cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d)
```

### Step 2: Create Migration
```bash
# Generate migration SQL
npx prisma migrate dev --name unified-registration-system

# This will create: prisma/migrations/20250117_unified-registration-system/migration.sql
```

### Step 3: Review Migration
```bash
# Check generated SQL
cat prisma/migrations/*/migration.sql
```

### Step 4: Apply to Production
```bash
# Deploy to Turso (LibSQL)
npx prisma migrate deploy

# Regenerate Prisma Client
npx prisma generate
```

---

## ✅ Post-Migration Checklist

- [ ] Run `npx prisma studio` to verify new models exist
- [ ] Test creating a Verification record
- [ ] Test creating a SearchQuery record
- [ ] Test creating a PopularSearch record
- [ ] Verify existing Profile/Business data is intact
- [ ] Check that verifications relation works
- [ ] Update TypeScript types (`npx prisma generate`)
- [ ] Test in development environment
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production

---

## 📊 Expected Database Size Impact

| Model | Estimated Rows (Year 1) | Storage Impact |
|-------|------------------------|----------------|
| `Verification` | ~10,000 (5 per profile × 2,000 profiles) | +5 MB |
| `SearchQuery` | ~500,000 (1,500/day) | +50 MB |
| `PopularSearch` | ~500 (curated list) | <1 MB |
| **TOTAL** | | **~56 MB** |

**Impact:** Minimal - SQLite handles this easily

---

## 🎯 Next Steps After Migration

1. ✅ Implement phone verification API (`/api/auth/send-verification`)
2. ✅ Update registration flow to use verification
3. ✅ Create verification upload UI
4. ✅ Create admin panel for verification review
5. ✅ Implement search tracking
6. ✅ Create popular searches aggregation cron job
7. ✅ Display popular searches on homepage

---

**Migration Version:** 1.0
**Last Updated:** 2025-11-17
**Safety Level:** ✅ HIGH (No breaking changes)
