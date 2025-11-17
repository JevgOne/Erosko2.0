# 🗺️ Implementation Roadmap - Unified Registration System

> **Datum:** 2025-11-17
> **Trvání:** 4 týdny (20 pracovních dní)
> **Team Size:** 1-2 developers
> **Priority:** CRITICAL - Foundation for platform security

---

## 📊 Executive Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 42 |
| **Total Story Points** | 89 SP |
| **Estimated Duration** | 4 weeks |
| **Critical Path** | Phone Verification → Immutability → Multi-tier Verification |
| **Risk Level** | 🟡 MEDIUM (database migration + SMS integration) |

---

## 🎯 Success Criteria

**Must Have (MVP):**
- ✅ Phone verification via SMS OTP (100% coverage)
- ✅ Phone/address immutability enforced
- ✅ PendingChange workflow for critical fields
- ✅ Basic verification badges (phone ✅)

**Should Have:**
- ✅ Multi-tier verification (photo 📸, video 🎥, ID 🆔)
- ✅ Search tracking + popular searches
- ✅ Admin panel for verification review

**Nice to Have:**
- 🟢 Agency dashboard
- 🟢 Analytics tracking
- 🟢 Email verification

---

## 🏗️ Phase Breakdown

### 📅 Phase 1: CRITICAL SECURITY (Week 1)
**Goal:** Prevent fake accounts and enforce data integrity

| Task | SP | Priority | Owner | Status |
|------|----|----------|-------|--------|
| 1.1 Database Migration - Add Verification model | 3 | 🔴 | Backend | ⏳ TODO |
| 1.2 Database Migration - Add emailVerified field | 1 | 🟡 | Backend | ⏳ TODO |
| 1.3 SMS Provider Setup (Twilio/SMS.cz) | 5 | 🔴 | Backend | ⏳ TODO |
| 1.4 API: `/api/auth/send-verification` | 3 | 🔴 | Backend | ⏳ TODO |
| 1.5 API: `/api/auth/verify-code` | 3 | 🔴 | Backend | ⏳ TODO |
| 1.6 Update Registration UI - Add phone verification step | 5 | 🔴 | Frontend | ⏳ TODO |
| 1.7 API: Immutability validation - `/api/profiles/[slug]` PATCH | 2 | 🔴 | Backend | ⏳ TODO |
| 1.8 API: Immutability validation - `/api/businesses/[slug]` PATCH | 2 | 🔴 | Backend | ⏳ TODO |
| 1.9 API: `/api/profile/request-change` endpoint | 3 | 🔴 | Backend | ⏳ TODO |
| 1.10 API: `/api/business/request-change` endpoint | 3 | 🔴 | Backend | ⏳ TODO |
| 1.11 UI: PendingChange request form (profile) | 3 | 🟡 | Frontend | ⏳ TODO |
| 1.12 UI: PendingChange request form (business) | 3 | 🟡 | Frontend | ⏳ TODO |
| 1.13 Testing: End-to-end registration with SMS | 5 | 🔴 | QA | ⏳ TODO |

**Total:** 41 SP | **Duration:** 5 days | **Risk:** 🔴 HIGH (SMS integration)

---

### 📅 Phase 2: MULTI-TIER VERIFICATION (Week 2)
**Goal:** Verification badges for trust & safety

| Task | SP | Priority | Owner | Status |
|------|----|----------|-------|--------|
| 2.1 UI: Verification upload page (`/dashboard/verification`) | 5 | 🟡 | Frontend | ⏳ TODO |
| 2.2 API: `/api/verification/request` - Upload document | 3 | 🟡 | Backend | ⏳ TODO |
| 2.3 API: `/api/verification/status/:profileId` - Check status | 2 | 🟡 | Backend | ⏳ TODO |
| 2.4 Admin UI: Verification review dashboard | 5 | 🟡 | Frontend | ⏳ TODO |
| 2.5 API: `/api/admin/verification/approve/:id` | 2 | 🟡 | Backend | ⏳ TODO |
| 2.6 API: `/api/admin/verification/reject/:id` | 2 | 🟡 | Backend | ⏳ TODO |
| 2.7 Component: Verification badges display | 3 | 🟡 | Frontend | ⏳ TODO |
| 2.8 Update ProfileCard - Show badges | 2 | 🟡 | Frontend | ⏳ TODO |
| 2.9 Search filters - Add "verified only" filter | 2 | 🟢 | Frontend | ⏳ TODO |
| 2.10 Cron job: Expire old photo/video verifications (6 months) | 3 | 🟢 | Backend | ⏳ TODO |

**Total:** 29 SP | **Duration:** 4 days | **Risk:** 🟡 MEDIUM

---

### 📅 Phase 3: POPULAR SEARCHES (Week 3)
**Goal:** Dynamic search suggestions for SEO & UX

| Task | SP | Priority | Owner | Status |
|------|----|----------|-------|--------|
| 3.1 Database Migration - Add SearchQuery model | 2 | 🟡 | Backend | ⏳ TODO |
| 3.2 Database Migration - Add PopularSearch model | 2 | 🟡 | Backend | ⏳ TODO |
| 3.3 API: `/api/search/track` - Track searches | 2 | 🟡 | Backend | ⏳ TODO |
| 3.4 Integrate tracking in search pages | 3 | 🟡 | Frontend | ⏳ TODO |
| 3.5 API: `/api/search/popular` - Get popular searches | 2 | 🟡 | Backend | ⏳ TODO |
| 3.6 Cron job: Daily aggregation SearchQuery → PopularSearch | 5 | 🟡 | Backend | ⏳ TODO |
| 3.7 Component: Popular searches widget (homepage) | 3 | 🟡 | Frontend | ⏳ TODO |
| 3.8 Admin UI: Manage popular searches (pin/unpin) | 3 | 🟢 | Frontend | ⏳ TODO |

**Total:** 22 SP | **Duration:** 3 days | **Risk:** 🟢 LOW

---

### 📅 Phase 4: AGENCY DASHBOARD (Week 4)
**Goal:** Multi-profile management for agencies

| Task | SP | Priority | Owner | Status |
|------|----|----------|-------|--------|
| 4.1 Page: `/app/agency-dashboard/page.tsx` | 5 | 🟢 | Frontend | ⏳ TODO |
| 4.2 Page: `/app/agency-dashboard/profiles/page.tsx` | 3 | 🟢 | Frontend | ⏳ TODO |
| 4.3 Page: `/app/agency-dashboard/profiles/create/page.tsx` | 5 | 🟢 | Frontend | ⏳ TODO |
| 4.4 API: `/api/agency/profiles` GET - List sub-profiles | 2 | 🟢 | Backend | ⏳ TODO |
| 4.5 API: `/api/agency/profiles` POST - Create sub-profile | 3 | 🟢 | Backend | ⏳ TODO |
| 4.6 API: `/api/agency/profiles/:id` PATCH - Edit sub-profile | 2 | 🟢 | Backend | ⏳ TODO |
| 4.7 API: `/api/agency/stats` - Analytics dashboard | 3 | 🟢 | Backend | ⏳ TODO |
| 4.8 Component: Sub-profile card | 2 | 🟢 | Frontend | ⏳ TODO |
| 4.9 Update Business detail page - Show sub-profiles list | 3 | 🟢 | Frontend | ⏳ TODO |

**Total:** 28 SP | **Duration:** 4 days | **Risk:** 🟢 LOW

---

## 📋 Detailed Task Breakdown

### 🔴 PHASE 1: CRITICAL SECURITY (Week 1)

---

#### Task 1.1: Database Migration - Add Verification Model
**Story Points:** 3 | **Priority:** 🔴 CRITICAL | **Owner:** Backend

**Description:**
Přidat nový `Verification` model do Prisma schema pro multi-tier verification badges.

**Acceptance Criteria:**
- [x] Přidán `Verification` model podle PRISMA_SCHEMA_CHANGES.md
- [x] Přidány enums `VerificationType` a `VerificationStatus`
- [x] Vytvořena migrace `npx prisma migrate dev --name add-verification-model`
- [x] Otestováno v Prisma Studio
- [x] Relations fungují (Profile → Verification, Business → Verification)

**Files Changed:**
- `prisma/schema.prisma`
- `prisma/migrations/*_add-verification-model/migration.sql`

**Commands:**
```bash
# 1. Update schema.prisma (manual edit)
# 2. Generate migration
npx prisma migrate dev --name add-verification-model
# 3. Verify in Prisma Studio
npx prisma studio
```

**Testing:**
```typescript
// Create test verification
const verification = await prisma.verification.create({
  data: {
    type: 'PHONE',
    status: 'APPROVED',
    profileId: 'test-profile-id',
  }
});
console.log('✅ Verification created:', verification);
```

---

#### Task 1.2: Database Migration - Add emailVerified Field
**Story Points:** 1 | **Priority:** 🟡 MEDIUM | **Owner:** Backend

**Description:**
Přidat `emailVerified` boolean field do User modelu.

**Acceptance Criteria:**
- [x] Přidán `emailVerified Boolean @default(false)` do User model
- [x] Migrace vytvořena a aplikována
- [x] Existující users mají emailVerified=false

**Files Changed:**
- `prisma/schema.prisma`

**Commands:**
```bash
npx prisma migrate dev --name add-email-verified
```

---

#### Task 1.3: SMS Provider Setup (Twilio/SMS.cz)
**Story Points:** 5 | **Priority:** 🔴 CRITICAL | **Owner:** Backend

**Description:**
Integrace SMS providera pro odesílání OTP kódů při registraci.

**Acceptance Criteria:**
- [x] Vybrán SMS provider (Twilio nebo SMS.cz)
- [x] API credentials uloženy v `.env`
- [x] Vytvořena helper funkce `sendSMS(phone: string, message: string)`
- [x] Testovací SMS úspěšně odesláno
- [x] Rate limiting implementováno (max 3 SMS per 10 min)

**Files Created:**
- `lib/sms.ts` - SMS helper functions
- `.env.example` - Updated with SMS credentials

**Environment Variables:**
```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+420xxxxxx

# SMS.cz (alternative)
SMSCZ_API_KEY=xxxxx
SMSCZ_SENDER=Erosko
```

**Implementation:**
```typescript
// lib/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(phone: string, message: string) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

**Testing:**
```typescript
// Test SMS sending
const result = await sendSMS('+420123456789', 'Test zpráva z Erosko.cz');
console.log('SMS sent:', result);
```

---

#### Task 1.4: API: `/api/auth/send-verification`
**Story Points:** 3 | **Priority:** 🔴 CRITICAL | **Owner:** Backend

**Description:**
Endpoint pro odeslání SMS OTP kódu při registraci nebo změně telefonu.

**Acceptance Criteria:**
- [x] POST `/api/auth/send-verification` endpoint vytvořen
- [x] Generuje 6místný OTP kód
- [x] Uloží do `VerificationCode` tabulky (expiry 10 min)
- [x] Odešle SMS přes `sendSMS()`
- [x] Rate limiting: max 3 requests per 10 min per phone
- [x] Validace phone number formátu
- [x] Error handling (SMS fail, invalid phone, rate limit)

**Request:**
```json
POST /api/auth/send-verification
{
  "phone": "+420123456789",
  "type": "PHONE_VERIFICATION"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "SMS kód odeslán",
  "expiresAt": "2025-01-17T14:25:00Z"
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "error": "Příliš mnoho pokusů. Zkuste to za 8 minut."
}
```

**Implementation:**
```typescript
// app/api/auth/send-verification/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSMS, generateOTP } from '@/lib/sms';
import { normalizePhoneNumber } from '@/lib/phone-utils';

export async function POST(request: Request) {
  try {
    const { phone, type } = await request.json();

    // Normalize phone
    const normalizedPhone = normalizePhoneNumber(phone);

    // Rate limiting: Check recent codes
    const recentCodes = await prisma.verificationCode.count({
      where: {
        phone: normalizedPhone,
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Last 10 min
        }
      }
    });

    if (recentCodes >= 3) {
      return NextResponse.json(
        { error: 'Příliš mnoho pokusů. Zkuste to později.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Save to database
    await prisma.verificationCode.create({
      data: {
        phone: normalizedPhone,
        code,
        type: type || 'PHONE_VERIFICATION',
        expiresAt
      }
    });

    // Send SMS
    const smsResult = await sendSMS(
      normalizedPhone,
      `Váš ověřovací kód pro Erosko.cz je: ${code}\nKód vyprší za 10 minut.`
    );

    if (!smsResult.success) {
      return NextResponse.json(
        { error: 'Chyba při odesílání SMS' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SMS kód odeslán',
      expiresAt
    });

  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Něco se pokazilo' },
      { status: 500 }
    );
  }
}
```

**Files Created:**
- `app/api/auth/send-verification/route.ts`

---

#### Task 1.5: API: `/api/auth/verify-code`
**Story Points:** 3 | **Priority:** 🔴 CRITICAL | **Owner:** Backend

**Description:**
Endpoint pro ověření OTP kódu zadaného uživatelem.

**Acceptance Criteria:**
- [x] POST `/api/auth/verify-code` endpoint vytvořen
- [x] Validuje kód proti databázi
- [x] Kontroluje expiraci (10 min)
- [x] Označí kód jako `verified: true`
- [x] Vrátí JWT token pro pokračování v registraci
- [x] Max 3 neúspěšné pokusy → invalidace kódu

**Request:**
```json
POST /api/auth/verify-code
{
  "phone": "+420123456789",
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Telefon ověřen",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // JWT token
}
```

**Response (Invalid):**
```json
{
  "success": false,
  "error": "Neplatný kód",
  "attemptsLeft": 2
}
```

**Implementation:**
```typescript
// app/api/auth/verify-code/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizePhoneNumber } from '@/lib/phone-utils';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();
    const normalizedPhone = normalizePhoneNumber(phone);

    // Find verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        phone: normalizedPhone,
        code,
        verified: false,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Neplatný nebo expirovaný kód' },
        { status: 400 }
      );
    }

    // Mark as verified
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { verified: true }
    });

    // Generate JWT token for Step 2 (profile creation)
    const token = jwt.sign(
      { phone: normalizedPhone, verified: true },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      success: true,
      message: 'Telefon ověřen',
      token
    });

  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Něco se pokazilo' },
      { status: 500 }
    );
  }
}
```

**Files Created:**
- `app/api/auth/verify-code/route.ts`

**Environment Variables:**
```env
JWT_SECRET=your-secret-key-here
```

---

#### Task 1.6: Update Registration UI - Add Phone Verification Step
**Story Points:** 5 | **Priority:** 🔴 CRITICAL | **Owner:** Frontend

**Description:**
Přidat nový step do registračního formuláře pro ověření telefonu přes SMS OTP.

**Acceptance Criteria:**
- [x] 3-step wizard: **Phone Verification** → Basic Info → Profile Details
- [x] Step 1: Phone input + "Odeslat kód" button
- [x] Zobrazení 6-digit OTP input po odeslání
- [x] Countdown timer (10 min)
- [x] "Odeslat znovu" button (po 60 sekundách)
- [x] Validace kódu voláním `/api/auth/verify-code`
- [x] JWT token uložen do sessionStorage
- [x] Přechod na Step 2 po úspěšném ověření

**UI Flow:**
```
┌─────────────────────────────────────┐
│ Step 1: Ověření telefonu            │
├─────────────────────────────────────┤
│ Telefonní číslo: [+420 ___________] │
│ [Odeslat ověřovací kód]             │
│                                     │
│ ↓ (po odeslání)                     │
│                                     │
│ Zadejte 6místný kód z SMS:          │
│ [_] [_] [_] [_] [_] [_]            │
│                                     │
│ Kód vyprší za: 09:23                │
│ [Odeslat kód znovu] (za 37s)        │
│                                     │
│ [Ověřit]                            │
└─────────────────────────────────────┘
```

**Files Changed:**
- `app/(auth)/registrace/page.tsx`

**Implementation Highlights:**
```typescript
// New step state
const [step, setStep] = useState(1); // 1=Phone, 2=Basic, 3=Profile
const [verificationSent, setVerificationSent] = useState(false);
const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
const [countdown, setCountdown] = useState(600); // 10 min in seconds
const [canResend, setCanResend] = useState(false);

// Send verification SMS
const handleSendVerification = async () => {
  const res = await fetch('/api/auth/send-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, type: 'PHONE_VERIFICATION' })
  });

  if (res.ok) {
    setVerificationSent(true);
    startCountdown();
  }
};

// Verify OTP code
const handleVerifyCode = async () => {
  const code = otpCode.join('');
  const res = await fetch('/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code })
  });

  const data = await res.json();
  if (data.success) {
    sessionStorage.setItem('verificationToken', data.token);
    setStep(2); // Go to Step 2
  } else {
    setError(data.error);
  }
};
```

---

#### Task 1.7-1.8: Immutability Validation - Profile & Business PATCH
**Story Points:** 2 each (4 total) | **Priority:** 🔴 CRITICAL | **Owner:** Backend

**Description:**
Přidat validaci do PATCH endpointů, která zabrání přímé změně `phone`, `address`, `city`.

**Acceptance Criteria:**
- [x] PATCH `/api/profiles/[slug]` odmítne změny phone/address/city
- [x] PATCH `/api/businesses/[slug]` odmítne změny phone/address/city
- [x] Vrací error s instrukcemi pro PendingChange
- [x] Ostatní pole lze měnit normálně

**Implementation:**
```typescript
// app/api/profiles/[slug]/route.ts (PATCH)
export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  const body = await request.json();

  // ⚠️ IMMUTABILITY CHECK
  const immutableFields = ['phone', 'address', 'city'];
  const attemptedChanges = Object.keys(body);
  const blockedFields = attemptedChanges.filter(f => immutableFields.includes(f));

  if (blockedFields.length > 0) {
    return NextResponse.json({
      error: `Pole ${blockedFields.join(', ')} nelze měnit přímo. Použijte žádost o změnu.`,
      immutableFields: blockedFields,
      howToChange: 'POST /api/profile/request-change'
    }, { status: 403 });
  }

  // ... continue with normal update logic for allowed fields
  const updated = await prisma.profile.update({
    where: { slug: params.slug },
    data: body
  });

  return NextResponse.json({ success: true, profile: updated });
}
```

**Files Changed:**
- `app/api/profiles/[slug]/route.ts`
- `app/api/businesses/[slug]/route.ts`

---

#### Task 1.9-1.10: API: `/api/profile/request-change` & `/api/business/request-change`
**Story Points:** 3 each (6 total) | **Priority:** 🔴 CRITICAL | **Owner:** Backend

**Description:**
Nové endpointy pro vytvoření `PendingChange` záznamu pro schválení změn adminem.

**Acceptance Criteria:**
- [x] POST `/api/profile/request-change` endpoint
- [x] POST `/api/business/request-change` endpoint
- [x] Vytvoří `PendingChange` record s `type: 'PROFILE_UPDATE' nebo 'BUSINESS_UPDATE'`
- [x] `oldData` = current values
- [x] `newData` = requested changes
- [x] `status: 'PENDING'`
- [x] Email notifikace adminovi (optional)

**Request:**
```json
POST /api/profile/request-change
{
  "profileId": "profile-id-xyz",
  "changes": {
    "phone": "+420999888777",
    "reason": "Ztratil jsem SIM kartu"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Žádost o změnu odeslána ke schválení",
  "pendingChangeId": "change-id-abc",
  "estimatedReviewTime": "Do 24 hodin"
}
```

**Implementation:**
```typescript
// app/api/profile/request-change/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { profileId, changes } = await request.json();

  // Get current profile data
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { phone: true, address: true, city: true }
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profil nenalezen' }, { status: 404 });
  }

  // Create PendingChange
  const pendingChange = await prisma.pendingChange.create({
    data: {
      type: 'PROFILE_UPDATE',
      status: 'PENDING',
      profileId,
      oldData: profile, // Current values
      newData: changes, // Requested changes
      requestedById: session.user.id
    }
  });

  // TODO: Send email notification to admin

  return NextResponse.json({
    success: true,
    message: 'Žádost o změnu odeslána ke schválení',
    pendingChangeId: pendingChange.id,
    estimatedReviewTime: 'Do 24 hodin'
  });
}
```

**Files Created:**
- `app/api/profile/request-change/route.ts`
- `app/api/business/request-change/route.ts`

---

### 🟡 PHASE 2-4 Tasks (Abbreviated)

**Poznámka:** Detailní breakdown pro Phase 2-4 je obsažen v UNIFIED_REGISTRATION_PROPOSAL.md.
Pro účely tohoto roadmapu jsou zde hlavní milestones:

**Phase 2 Deliverables:**
- ✅ Verification upload UI
- ✅ Admin verification review dashboard
- ✅ Verification badges on profile cards
- ✅ Expiration cron job

**Phase 3 Deliverables:**
- ✅ Search tracking API
- ✅ Popular searches widget
- ✅ Daily aggregation cron job
- ✅ Admin management UI

**Phase 4 Deliverables:**
- ✅ Agency dashboard pages
- ✅ Sub-profile management APIs
- ✅ Analytics dashboard
- ✅ Business detail page updates

---

## 📊 Gantt Chart (4 Weeks)

```
Week 1: CRITICAL SECURITY
├─ Day 1: Database migrations + SMS setup
├─ Day 2: Verification APIs
├─ Day 3: Registration UI update
├─ Day 4: Immutability enforcement
└─ Day 5: Testing & bug fixes

Week 2: MULTI-TIER VERIFICATION
├─ Day 6: Verification upload UI
├─ Day 7: Admin review dashboard
├─ Day 8: Badge display components
├─ Day 9: Search filters + expiration cron
└─ Day 10: Testing & bug fixes

Week 3: POPULAR SEARCHES
├─ Day 11: Search tracking integration
├─ Day 12: Aggregation cron job
├─ Day 13: Popular searches widget
├─ Day 14: Admin management UI
└─ Day 15: Testing & bug fixes

Week 4: AGENCY DASHBOARD
├─ Day 16: Agency dashboard UI
├─ Day 17: Sub-profile management APIs
├─ Day 18: Analytics dashboard
├─ Day 19: Business page updates
└─ Day 20: Final testing & deployment
```

---

## 🎯 Definition of Done

**Task-level DOD:**
- [ ] Code written and peer-reviewed
- [ ] Unit tests pass (if applicable)
- [ ] TypeScript types correct
- [ ] Prisma schema updated (if DB changes)
- [ ] API endpoints documented
- [ ] UI components responsive
- [ ] Error handling implemented
- [ ] Git commit with clear message

**Phase-level DOD:**
- [ ] All tasks completed
- [ ] Integration tests pass
- [ ] QA sign-off
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] User acceptance testing passed
- [ ] Deployed to production

---

## 🚨 Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| SMS provider downtime | MEDIUM | HIGH | Fallback to email verification |
| Twilio account suspended | LOW | CRITICAL | Setup SMS.cz as backup provider |
| Database migration fails | LOW | CRITICAL | Test migrations on staging, maintain backups |
| Performance issues (search tracking) | MEDIUM | MEDIUM | Use indexed queries, cron job offloading |
| User complaints (immutability) | HIGH | LOW | Clear error messages + FAQ page |

---

## 📈 Success Metrics (3 Months Post-Launch)

| Metric | Baseline | Target |
|--------|----------|--------|
| Phone verification completion rate | 0% | 95% |
| Fake/spam accounts | Unknown | <2% |
| PendingChange approval time | N/A | <12 hours |
| User complaints (immutability) | 0 | <5/month |
| Verification badges earned | 0 | 50% of profiles |
| Popular searches CTR | N/A | >15% |

---

## 🎬 Next Steps

1. ✅ Review this roadmap with team
2. ✅ Prioritize Phase 1 tasks
3. ✅ Setup development environment:
   - Twilio account
   - SMS.cz backup account
   - JWT secret generation
4. ✅ Create GitHub issues for each task
5. ✅ Start Sprint 1 (Phase 1 - Week 1)

---

**Roadmap Version:** 1.0
**Last Updated:** 2025-11-17
**Next Review:** After Phase 1 completion
