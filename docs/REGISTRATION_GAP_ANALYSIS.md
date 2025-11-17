# 📊 Registration System - Gap Analysis

> **Datum:** 2025-11-17
> **Status:** Current State vs. Unified Proposal
> **Priorita:** HIGH - Foundation for entire platform

---

## 🔍 Executive Summary

Současný registrační systém má **základní funkčnost**, ale chybí mu **kritické bezpečnostní prvky** a **uživatelsky přívětivý workflow** navržený v UNIFIED_REGISTRATION_PROPOSAL.

### ⚠️ Hlavní problémy:
1. ❌ **Chybí verifikace telefonu** - Kdokoliv může zaregistrovat jakékoliv číslo
2. ❌ **Telefon/Adresa lze měnit přímo** - Porušuje pravidlo immutability
3. ❌ **Žádné "Oblíbené vyhledávání"** - Dynamické popular searches neexistují
4. ❌ **Chybí multi-tier ověřování** - Žádný Photo/Video/ID verification systém
5. ❌ **Agency dashboard neexistuje** - BUSINESS nemůže spravovat své SOLO profily

---

## 📋 Feature Comparison Matrix

| Funkce | Současný stav | UNIFIED Proposal | Gap | Priorita |
|--------|--------------|------------------|-----|----------|
| **3-Step Registration** | ❌ 2 steps (Basic + Profile) | ✅ 3 steps (Type → Basic → Profile) | MISSING: Type selection screen | 🔴 HIGH |
| **Phone Verification** | ❌ None | ✅ SMS OTP | CRITICAL GAP | 🔴 CRITICAL |
| **Email Verification** | ❌ None | ✅ Optional email verification | MISSING | 🟡 MEDIUM |
| **ProfileType Detection** | ⚠️ Partial (SOLO vs Others) | ✅ SOLO/BUSINESS/AGENCY | INCOMPLETE: No AGENCY logic | 🔴 HIGH |
| **Hybrid Approval System** | ✅ PendingChange exists | ✅ Hybrid real-time + approval | PARTIALLY IMPLEMENTED | 🟢 GOOD |
| **Phone Immutability** | ❌ Can change directly | ✅ Only via PendingChange | CRITICAL SECURITY GAP | 🔴 CRITICAL |
| **Address Immutability** | ❌ Can change directly | ✅ Only via PendingChange | CRITICAL SECURITY GAP | 🔴 CRITICAL |
| **Multi-Tier Verification** | ❌ None | ✅ 4 levels (Phone/Photo/Video/ID) | MISSING DATABASE MODEL | 🔴 HIGH |
| **Popular Searches** | ❌ None | ✅ Hybrid static + tracked | MISSING COMPLETELY | 🟡 MEDIUM |
| **Agency Dashboard** | ❌ None | ✅ Multi-profile management | MISSING COMPLETELY | 🟡 MEDIUM |
| **Business Profile Pages** | ✅ Exists | ✅ With sub-profiles | PARTIALLY - No sub-profiles display | 🟡 MEDIUM |
| **Services Management** | ✅ Basic | ✅ Category-aware | GOOD | 🟢 GOOD |
| **Photo Upload** | ✅ Base64 upload | ✅ With approval workflow | WORKS BUT DISABLED in frontend | 🟡 MEDIUM |
| **Opening Hours** | ✅ JSON format | ✅ Per-business + per-profile | GOOD | 🟢 GOOD |

---

## 🗂️ Current File Structure

### ✅ Existing Components

#### 1. **Registration Page** (`app/(auth)/registrace/page.tsx`)
- **Lines:** 1512 lines
- **Features:**
  - ✅ 2-step wizard (Basic info → Profile details)
  - ✅ Type selection: SOLO vs BUSINESS
  - ✅ Real-time availability check for `businessName` and `phone`
  - ✅ Category selection (HOLKY_NA_SEX, EROTICKE_MASERKY, DOMINA, DIGITALNI_SLUZBY)
  - ✅ Services checkboxes (category-aware)
  - ✅ Opening hours for BUSINESS
  - ✅ Physical attributes for SOLO
  - ⚠️ Photo upload DISABLED (comments: "přidáte později")

**Missing:**
- ❌ Phone verification (SMS OTP)
- ❌ Type selection screen (SOLO/BUSINESS/AGENCY)
- ❌ Terms & conditions acceptance
- ❌ GDPR consent checkboxes

---

#### 2. **Registration API** (`app/api/register/route.ts`)
- **Lines:** 263 lines
- **Features:**
  - ✅ Creates User with hashed password
  - ✅ Normalizes phone number
  - ✅ Checks for existing phone/email
  - ✅ Creates Profile for SOLO
  - ✅ Creates Business for non-SOLO
  - ✅ Links services via ProfileService join table
  - ✅ Saves base64 photos (but disabled in frontend)
  - ✅ Generates SEO-friendly slug

**Missing:**
- ❌ Phone verification check before registration
- ❌ Email verification flow
- ❌ Verification model creation (Photo/Video/ID badges)
- ❌ Popular searches tracking
- ❌ Welcome email/SMS

---

#### 3. **Profile Creation** (`app/pridat-inzerat/page.tsx`)
- **Lines:** 305 lines
- **Purpose:** For logged-in users to create additional profiles
- **Features:**
  - ✅ Requires authentication
  - ✅ Simple form (name, age, city, phone, services)
  - ✅ Creates SOLO profiles via `/api/profiles` POST

**Missing:**
- ❌ No approval workflow integration
- ❌ No photo upload
- ❌ Very limited compared to registration

---

#### 4. **Business Creation** (`app/pridat-podnik/page.tsx`)
- **Lines:** 281 lines
- **Purpose:** For logged-in users to create additional businesses
- **Features:**
  - ✅ Requires authentication
  - ✅ Business type selection
  - ✅ Contact details (phone, email, website)
  - ✅ Location (city, address)
  - ✅ Creates business via `/api/businesses/create` POST

**Missing:**
- ❌ No sub-profiles management
- ❌ No opening hours setup
- ❌ No equipment/services selection
- ❌ Very basic compared to registration

---

### 🗄️ Database Schema (Prisma)

#### ✅ Existing Models

##### `User` Model
```prisma
model User {
  id            String   @id @default(cuid())
  phone         String   @unique // ✅ Primary login
  email         String?  @unique // ✅ Optional
  passwordHash  String
  phoneVerified Boolean  @default(false) // ⚠️ Never set to true!
  role          UserRole @default(USER)

  profiles          Profile[]
  businesses        Business[]
  requestedChanges  PendingChange[]
  verificationCodes VerificationCode[] // ✅ SMS codes model exists!
}
```

**Good:**
- ✅ `phoneVerified` field exists
- ✅ `VerificationCode` model exists for SMS OTP

**Bad:**
- ❌ No verification logic in registration flow
- ❌ No `emailVerified` field

---

##### `Profile` Model
```prisma
model Profile {
  id          String  @id @default(cuid())
  name        String
  slug        String  @unique
  age         Int
  phone       String  // ⚠️ Can be changed directly!
  address     String? // ⚠️ Can be changed directly!
  city        String  // ⚠️ Can be changed directly!

  profileType ProfileType
  category    Category

  approved  Boolean @default(false) // ✅ Admin approval
  verified  Boolean @default(false) // ⚠️ No multi-tier verification!

  businessId  String?
  business    Business?
}
```

**Good:**
- ✅ `approved` field for admin control
- ✅ `verified` badge exists
- ✅ Can belong to a Business

**Critical Issues:**
- 🔴 **phone/address/city CAN BE CHANGED DIRECTLY** - Violates immutability rule!
- 🔴 **verified is binary** - No multi-tier (phone/photo/video/ID) support
- 🔴 **No Verification model** - Can't track verification history

---

##### `Business` Model
```prisma
model Business {
  id          String      @id @default(cuid())
  name        String
  phone       String      // ⚠️ Can be changed directly!
  address     String?     // ⚠️ Can be changed directly!
  city        String      // ⚠️ Can be changed directly!

  profileType ProfileType
  equipment    Json?
  openingHours Json?

  approved  Boolean @default(false)
  verified  Boolean @default(false)

  profiles  Profile[] // ✅ Can have sub-profiles
}
```

**Same issues as Profile:**
- 🔴 **phone/address/city mutable**
- 🔴 **Single verified boolean**

---

##### `PendingChange` Model ✅
```prisma
model PendingChange {
  id     String       @id @default(cuid())
  type   ChangeType   // PROFILE_UPDATE, PHOTO_UPDATE, BUSINESS_UPDATE
  status ChangeStatus // PENDING, APPROVED, REJECTED

  profileId  String?
  businessId String?

  oldData Json?
  newData Json

  requestedById String
  reviewedById  String?
  reviewedAt    DateTime?
}
```

**Excellent foundation!** This model exists but:
- ❌ **Not enforced in API** - Direct edits still allowed
- ❌ **No UI for users** to request changes
- ❌ **Admin panel** doesn't use it properly

---

##### `VerificationCode` Model ✅
```prisma
model VerificationCode {
  id        String   @id @default(cuid())
  phone     String
  code      String   // 6-digit
  type      VerificationCodeType // PHONE_VERIFICATION, PASSWORD_RESET
  expiresAt DateTime
  verified  Boolean  @default(false)
}
```

**Perfect!** But:
- ❌ **Never used in registration** - No SMS sending
- ❌ **No API endpoints** for verification

---

## 🚨 Critical Missing Features

### 1. 🔐 Phone Verification System (CRITICAL)

**What's missing:**
```typescript
// MISSING API: /api/auth/send-verification
POST /api/auth/send-verification
{
  phone: "+420123456789",
  type: "PHONE_VERIFICATION"
}
→ Sends SMS with 6-digit code
→ Creates VerificationCode record

// MISSING API: /api/auth/verify-code
POST /api/auth/verify-code
{
  phone: "+420123456789",
  code: "123456"
}
→ Marks code as verified
→ Returns JWT token for Step 2
```

**Impact:**
- 🔴 CRITICAL - Anyone can register fake phone numbers
- 🔴 CRITICAL - Spam/abuse vulnerability
- 🔴 CRITICAL - Cannot verify ownership

---

### 2. 🔒 Immutability Enforcement (CRITICAL)

**What's missing:**

Currently `/api/profiles/[slug]/route.ts` PATCH allows:
```typescript
// ❌ WRONG - Direct phone/address change
PATCH /api/profiles/jana-praha
{
  phone: "+420999999999",  // ❌ Should be REJECTED
  address: "New Street 123" // ❌ Should be REJECTED
}
```

**Should be:**
```typescript
// ✅ CORRECT - Must go through PendingChange
POST /api/profile/request-change
{
  profileId: "xxx",
  changes: {
    phone: "+420999999999",
    reason: "Lost my old SIM card"
  }
}
→ Creates PendingChange record
→ Admin must approve
```

**Required Changes:**
1. Add validation to PATCH `/api/profiles/[slug]`
2. Add validation to PATCH `/api/businesses/[slug]`
3. Add API endpoint `/api/profile/request-change`
4. Add API endpoint `/api/business/request-change`

---

### 3. 🏅 Multi-Tier Verification System (HIGH PRIORITY)

**What's missing:**

**New Database Model Needed:**
```prisma
model Verification {
  id        String           @id @default(cuid())
  type      VerificationType // PHONE, PHOTO, VIDEO, ID_DOCUMENT
  status    VerificationStatus // PENDING, APPROVED, REJECTED

  // Evidence
  documentUrl String? // For photo/video/ID uploads
  notes       String? // Admin notes

  profileId  String?
  businessId String?

  verifiedById String?
  verifiedAt   DateTime?

  createdAt DateTime @default(now())
}

enum VerificationType {
  PHONE
  PHOTO        // Selfie with paper "Erosko.cz + date"
  VIDEO        // 10-second verification video
  ID_DOCUMENT  // Passport/ID card
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}
```

**API Endpoints Needed:**
```typescript
POST /api/verification/request
GET  /api/verification/status/:profileId
POST /api/admin/verification/approve/:id
POST /api/admin/verification/reject/:id
```

---

### 4. 🔍 Popular Searches System (MEDIUM PRIORITY)

**What's missing:**

**New Database Models:**
```prisma
model SearchQuery {
  id        String   @id @default(cuid())
  query     String   // "escort praha", "masáže brno"
  filters   Json?    // { city: "Praha", service: "tantric" }

  userId    String?  // null for anonymous
  resultCount Int

  createdAt DateTime @default(now())

  @@index([query])
  @@index([createdAt])
}

model PopularSearch {
  id           String   @id @default(cuid())
  keyword      String   @unique
  displayText  String   // "Escort Praha"
  category     String?  // "city", "service", "combined"

  searchCount  Int      @default(0)
  clickCount   Int      @default(0)
  lastSearched DateTime @default(now())

  isPinned     Boolean  @default(false) // Admin can pin certain searches
  isActive     Boolean  @default(true)

  @@index([searchCount])
  @@index([lastSearched])
}
```

**API Endpoints Needed:**
```typescript
POST /api/search/track            // Track user searches
GET  /api/search/popular           // Get popular searches
POST /api/admin/popular-search     // Pin/manage popular searches
```

**Cron Job Needed:**
```typescript
// runs daily at 3 AM
// aggregates SearchQuery → updates PopularSearch
```

---

### 5. 🏢 Agency Dashboard (MEDIUM PRIORITY)

**What's missing:**

**UI Components:**
- `/app/agency-dashboard/page.tsx` - Main dashboard
- `/app/agency-dashboard/profiles/page.tsx` - List sub-profiles
- `/app/agency-dashboard/profiles/create/page.tsx` - Add new girl

**API Endpoints:**
```typescript
GET  /api/agency/profiles              // List all sub-profiles
POST /api/agency/profiles              // Create sub-profile
PATCH /api/agency/profiles/:id         // Edit sub-profile
DELETE /api/agency/profiles/:id        // Deactivate sub-profile
GET  /api/agency/stats                 // Analytics dashboard
```

**Required Logic:**
- Business with profileType=ESCORT_AGENCY can have multiple Profile children
- Each Profile.businessId links to parent Business
- Agency dashboard shows all linked profiles
- Approval workflow for new profiles

---

## 📊 Database Schema Changes Required

### Priority 1: CRITICAL (Security & Core Functionality)

#### 1. Add `emailVerified` to User
```prisma
model User {
  phoneVerified Boolean @default(false)
  emailVerified Boolean @default(false) // ➕ ADD THIS
}
```

#### 2. Create `Verification` Model
```prisma
model Verification {
  id           String             @id @default(cuid())
  type         VerificationType
  status       VerificationStatus @default(PENDING)
  documentUrl  String?
  notes        String?

  profileId    String?
  profile      Profile?  @relation(fields: [profileId], references: [id])
  businessId   String?
  business     Business? @relation(fields: [businessId], references: [id])

  verifiedById String?
  verifiedBy   User?     @relation("VerifiedVerifications", fields: [verifiedById], references: [id])
  verifiedAt   DateTime?

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([profileId])
  @@index([businessId])
  @@index([status])
}

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
```

#### 3. Update Profile Model - Remove direct mutability
```prisma
model Profile {
  // Current fields...

  // CHANGE: Make these immutable via app logic, not database
  // Add comments to indicate they need PendingChange
  phone       String // ⚠️ Immutable - changes require PendingChange approval
  address     String? // ⚠️ Immutable - changes require PendingChange approval
  city        String // ⚠️ Immutable - changes require PendingChange approval

  // ADD: Verification relation
  verifications Verification[]
}
```

---

### Priority 2: MEDIUM (Popular Searches)

#### 4. Create Search Tracking Models
```prisma
model SearchQuery {
  id          String   @id @default(cuid())
  query       String
  filters     Json?
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  resultCount Int
  createdAt   DateTime @default(now())

  @@index([query])
  @@index([createdAt])
}

model PopularSearch {
  id           String   @id @default(cuid())
  keyword      String   @unique
  displayText  String
  category     String?
  searchCount  Int      @default(0)
  clickCount   Int      @default(0)
  lastSearched DateTime @default(now())
  isPinned     Boolean  @default(false)
  isActive     Boolean  @default(true)

  @@index([searchCount])
  @@index([lastSearched])
}
```

---

### Priority 3: LOW (Nice-to-have)

#### 5. Add Analytics Fields
```prisma
model Profile {
  // ADD: Conversion tracking
  contactClicks Int @default(0)
  phoneClicks   Int @default(0)
  whatsappClicks Int @default(0)
  websiteClicks  Int @default(0)
}
```

---

## 🛠️ Implementation Plan

### Phase 1: CRITICAL SECURITY (Week 1) 🔴

**Goal:** Make platform secure and prevent abuse

#### Tasks:
1. ✅ Create `Verification` model in Prisma schema
2. ✅ Run `npx prisma migrate dev`
3. ✅ Create `/api/auth/send-verification` endpoint
4. ✅ Create `/api/auth/verify-code` endpoint
5. ✅ Integrate Twilio/SMS.cz for SMS sending
6. ✅ Update registration flow:
   - Add phone verification step BEFORE account creation
   - Show 6-digit code input
   - Validate code before proceeding
7. ✅ Add immutability validation:
   - Update `/api/profiles/[slug]/route.ts` PATCH
   - Update `/api/businesses/[slug]/route.ts` PATCH
   - Reject phone/address/city changes with error message
8. ✅ Create `/api/profile/request-change` endpoint
9. ✅ Create `/api/business/request-change` endpoint

**Deliverables:**
- ✅ Phone verification works in registration
- ✅ Phone/address immutable (must go through approval)
- ✅ PendingChange API endpoints functional

---

### Phase 2: VERIFICATION SYSTEM (Week 2) 🟡

**Goal:** Multi-tier verification badges

#### Tasks:
1. ✅ Create verification upload UI
2. ✅ Create `/api/verification/request` endpoint
3. ✅ Create admin panel verification review UI
4. ✅ Create `/api/admin/verification/approve` endpoint
5. ✅ Create `/api/admin/verification/reject` endpoint
6. ✅ Add verification badges to profile cards
7. ✅ Add verification filters to search

**Deliverables:**
- ✅ Users can upload verification documents
- ✅ Admin can approve/reject verifications
- ✅ Badges display on profiles (✅ Phone, 📸 Photo, 🎥 Video, 🆔 ID)

---

### Phase 3: POPULAR SEARCHES (Week 3) 🟢

**Goal:** Dynamic popular searches

#### Tasks:
1. ✅ Create `SearchQuery` and `PopularSearch` models
2. ✅ Run migration
3. ✅ Create `/api/search/track` endpoint
4. ✅ Integrate tracking into search pages
5. ✅ Create cron job for aggregation
6. ✅ Create `/api/search/popular` endpoint
7. ✅ Display popular searches on homepage

**Deliverables:**
- ✅ Search tracking works
- ✅ Popular searches display on homepage
- ✅ Admin can pin important searches

---

### Phase 4: AGENCY DASHBOARD (Week 4) 🟢

**Goal:** Multi-profile management for agencies

#### Tasks:
1. ✅ Create `/app/agency-dashboard` pages
2. ✅ Create `/api/agency/*` endpoints
3. ✅ Add sub-profile creation flow
4. ✅ Add sub-profile analytics
5. ✅ Link profiles to parent business

**Deliverables:**
- ✅ Agencies can manage multiple profiles
- ✅ Dashboard shows analytics
- ✅ Approval workflow for sub-profiles

---

## 📈 Success Metrics

| Metric | Current | Target (3 months) |
|--------|---------|-------------------|
| Phone verification rate | 0% | 100% |
| Fake/spam profiles | Unknown | <5% |
| Profile approval time | Manual | <24 hours |
| User complaints (immutability) | Unknown | <1% |
| Popular searches accuracy | N/A | >80% relevance |
| Agency adoption | 0 | 20+ agencies |

---

## 🎯 Recommendations

### DO FIRST (Week 1):
1. 🔴 **Phone verification** - Critical security hole
2. 🔴 **Immutability enforcement** - Prevents fraud
3. 🔴 **PendingChange integration** - Already built, just needs UI

### DO SOON (Weeks 2-3):
1. 🟡 **Multi-tier verification** - Competitive advantage
2. 🟡 **Popular searches** - SEO + UX improvement

### DO LATER (Week 4+):
1. 🟢 **Agency dashboard** - Nice-to-have for growth
2. 🟢 **Analytics tracking** - Long-term optimization

---

## 📞 Next Steps

1. **Review this analysis** with team
2. **Prioritize features** based on business goals
3. **Start Phase 1** implementation immediately
4. **Set up SMS provider** (Twilio/SMS.cz)
5. **Test phone verification** on staging

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Author:** Claude (AI Analysis)
