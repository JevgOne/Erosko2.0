# Erosko Photo and Service Management System - Complete Documentation

## Overview
This document details how photos and services are managed throughout the Erosko system, including database models, API endpoints, admin capabilities, and user interfaces.

---

## 1. DATABASE SCHEMA (Prisma)

### Photo Model
```prisma
model Photo {
  id              String  @id @default(cuid())
  url             String
  alt             String?
  altQualityScore Int?    // AI quality score 0-100
  order           Int     @default(0)
  isMain          Boolean @default(false)
  
  // Relations
  profileId  String?
  profile    Profile?  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  businessId String?
  business   Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
}
```

**Key Features:**
- Photos can be linked to both Profiles and Businesses
- Ordering system for photo galleries (order field)
- Main photo indicator for thumbnail display
- AI quality scoring for alt text
- Automatic cascade deletion when profile/business deleted

### Service Model
```prisma
model Service {
  id          String          @id @default(cuid())
  name        String          @unique
  description String?
  icon        String?         // Icon name from lucide-react
  category    ServiceCategory @default(PRAKTIKY)
  
  // Relations
  profiles ProfileService[]
}

enum ServiceCategory {
  PRAKTIKY          // Sex practices for escorts
  DRUHY_MASAZI      // Types of massage
  EXTRA_SLUZBY      // Extra services for masseuses
  BDSM_PRAKTIKY     // BDSM practices
}

model ProfileService {
  id String @id @default(cuid())
  
  // Relations
  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  serviceId String
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  
  @@unique([profileId, serviceId])
  @@index([profileId])
  @@index([serviceId])
}
```

**Key Features:**
- Many-to-many relationship between Profile and Service
- Service categories for filtering by type
- Icons for UI display
- Unique constraint prevents duplicate service assignments per profile

### Profile and Business Relations
```prisma
model Profile {
  // ... other fields ...
  photos         Photo[]           // One-to-many with photos
  services       ProfileService[]  // Many-to-many with services
}

model Business {
  // ... other fields ...
  photos         Photo[]           // One-to-many with photos
}
```

---

## 2. FILE UPLOAD SYSTEM

### Photo Upload Utility
**Location:** `/Users/zen/Erosko2.0/lib/photo-upload.ts`

```typescript
export async function saveBase64Photo(base64String: string, folder: string): Promise<string>
```

**Function Details:**
- **Input:** Base64 encoded image string (format: `data:image/jpeg;base64,...`)
- **Folder:** Either "profiles" or "businesses"
- **Max Size:** 10MB (15MB base64 string limit)
- **Output:** Relative URL path (e.g., `/uploads/profiles/123456-abc.jpg`)

**Process:**
1. Validates base64 format and size
2. Extracts MIME type (e.g., `image/jpeg`)
3. Determines file extension from MIME type
4. Generates unique filename: `{timestamp}-{randomString}.{extension}`
5. Creates directory structure: `public/uploads/{folder}/`
6. Converts base64 to buffer and saves to disk
7. Returns URL path for database storage

**Storage Location:** `public/uploads/{profiles|businesses}/`

---

## 3. API ENDPOINTS

### 3.1 Service Endpoints

#### GET `/api/services`
**Purpose:** Fetch all available services
**Authentication:** None required
**Query Parameters:**
- `category` (optional): Filter by ServiceCategory (PRAKTIKY, DRUHY_MASAZI, EXTRA_SLUZBY, BDSM_PRAKTIKY)

**Response:**
```json
{
  "services": [
    {
      "id": "cuid",
      "name": "Service Name",
      "description": "Service description",
      "icon": "iconName",
      "category": "PRAKTIKY"
    }
  ]
}
```

#### GET `/api/profiles/services`
**Purpose:** Fetch services for specific profile (legacy endpoint)
**Parameters:** 
- Appears to query database directly using Turso/LibSQL
- Returns `servicesJson` field from Profile table

#### GET `/api/profiles/[slug]/services`
**Purpose:** Fetch services by profile slug
**Parameters:**
- `slug`: Profile slug from URL

---

### 3.2 Profile Management Endpoints

#### POST `/api/profiles`
**Purpose:** Create new profile (User endpoint)
**Authentication:** Required (NextAuth session)
**Access:** Profile owner or admin
**Request Body:**
```json
{
  "name": "string",
  "age": "number",
  "description": "string",
  "height": "number (cm)",
  "weight": "number (kg)",
  "bust": "string",
  "hairColor": "string",
  "breastType": "string",
  "role": "string",
  "nationality": "string",
  "languages": ["array"],
  "orientation": "string",
  "tattoos": "string",
  "piercing": "string",
  "offersEscort": "boolean",
  "travels": "boolean",
  "services": ["serviceId1", "serviceId2"],
  "businessId": "required - business ID"
}
```

**Response:**
- Auto-generates profile slug
- Auto-generates SEO metadata
- Creates ProfileService relationships for each service
- Photos can be added later

#### GET `/api/profiles`
**Purpose:** Fetch all approved profiles with pagination
**Query Parameters:**
- `category`: Filter by category
- `city`: Filter by city
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 18)

**Response:** Includes photos and services relationships

#### POST `/api/profiles/edit`
**Purpose:** Create pending change request (User update)
**Authentication:** Required
**Request Body:**
```json
{
  "profileId": "string",
  "changes": {
    // Only changed fields, no photos via this endpoint
    "name": "newName",
    "age": 25,
    "description": "new description"
  }
}
```

**Flow:**
1. Creates PendingChange record with PENDING status
2. Stores old and new data
3. User waits for admin approval
4. Does NOT support photo or service changes directly

#### GET `/api/profiles/[slug]`
**Purpose:** Get single profile with photos and services
**Authentication:** None required
**Response:** Full profile including:
- photos (ordered by order field)
- services (with service details)

---

### 3.3 User Profile Management

#### GET `/api/user/profiles`
**Purpose:** Fetch all profiles and businesses owned by logged-in user
**Authentication:** Required
**Response:**
```json
{
  "profiles": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "photos": []
    }
  ],
  "businesses": [
    {
      "id": "string",
      "name": "string",
      "photos": []
    }
  ]
}
```

---

### 3.4 Admin Profile Management

#### POST `/api/admin/profiles/create`
**Purpose:** Admin creates new profile directly
**Authentication:** Required (Admin only)
**Request Body:**
```json
{
  "data": {
    "name": "string",
    "age": "number",
    "phone": "string",
    "city": "string",
    "category": "HOLKY_NA_SEX|EROTICKE_MASERKY|DOMINA|DIGITALNI_SLUZBY|EROTICKE_PODNIKY",
    "description": "string",
    "businessId": "string (optional)",
    "services": ["serviceId1", "serviceId2"],
    "photos": ["base64string1", "base64string2"],
    "ownerId": "string (optional)"
  }
}
```

**Process:**
1. Validates admin role
2. Creates unique slug from name-city-timestamp
3. If no owner specified, creates new user account with phone
4. Creates Profile with approved=true (auto-approved from admin)
5. Saves photos using `saveBase64Photo()`
6. Creates ProfileService relationships
7. Generates SEO metadata in background

#### POST `/api/admin/profiles/edit`
**Purpose:** Admin edits profile and manages photos
**Authentication:** Required (Admin only)
**Request Body:**
```json
{
  "profileId": "string",
  "data": {
    "name": "string",
    "age": "number",
    "description": "string",
    // ... other profile fields ...
    "photoChanges": {
      "photosToDelete": ["photoId1", "photoId2"],
      "newPhotos": ["base64string1", "base64string2"]
    }
  }
}
```

**Photo Operations:**
1. Delete photos:
   - Finds photo records by ID
   - Deletes files from `public/uploads/{profiles|businesses}/` using fs.unlinkSync()
   - Removes database records
2. Add photos:
   - Saves base64 using `saveBase64Photo()`
   - Gets next order number from existing photos
   - Sets isMain=true for first photo
   - Creates Photo records

#### DELETE `/api/admin/profiles/delete`
**Purpose:** Completely remove profile
**Authentication:** Required (Admin only)
**Cascade:** Photos are automatically deleted via database constraint

---

### 3.5 Admin Business Management

#### POST `/api/admin/businesses/create`
**Purpose:** Admin creates new business
**Authentication:** Required (Admin only)
**Request Body:**
```json
{
  "data": {
    "name": "string",
    "phone": "string",
    "city": "string",
    "profileType": "PRIVAT|MASSAGE_SALON|ESCORT_AGENCY|DIGITAL_AGENCY|SWINGERS_CLUB|NIGHT_CLUB|STRIP_CLUB",
    "description": "string",
    "email": "string",
    "website": "string",
    "address": "string",
    "equipment": ["string"],
    "openingHours": { "monday": "9:00-22:00", ... },
    "photos": ["base64string1", "base64string2"],
    "ownerId": "string (optional)"
  }
}
```

**Process:**
1. Validates admin role
2. Creates unique slug
3. Creates or links user account
4. Creates Business with approved=true
5. Saves photos with order and isMain fields

#### POST `/api/admin/businesses/edit`
**Purpose:** Admin edits business and manages photos
**Authentication:** Required (Admin only)
**Request Body:** Same structure as profiles/edit with photoChanges

#### DELETE `/api/admin/businesses/delete`
**Purpose:** Completely remove business
**Authentication:** Required (Admin only)

---

### 3.6 Pending Changes Approval System

#### GET `/api/admin/pending-changes`
**Purpose:** Fetch all pending profile/business change requests
**Authentication:** Required (Admin only)
**Response:** All pending, approved, and rejected changes

#### POST `/api/admin/pending-changes`
**Purpose:** Approve or reject pending change
**Authentication:** Required (Admin only)
**Request Body:**
```json
{
  "changeId": "string",
  "action": "approve|reject",
  "notes": "string (optional)"
}
```

**Approval Process:**
1. Retrieves PendingChange with newData
2. If action is "approve":
   - Applies all changes from newData to profile/business
   - Handles photoChanges if included
   - Updates profile's updatedAt timestamp
3. Marks change as APPROVED with admin ID and timestamp
4. If action is "reject":
   - Marks change as REJECTED
   - No data changes applied

**Photo Handling in Approvals:**
- Photos can be included in pending changes
- Same delete/add logic as admin edit
- Files are only saved to disk when change is approved

---

## 4. USER INTERFACE COMPONENTS

### 4.1 User Dashboard (`/app/inzerent_dashboard/page.tsx`)

#### Profile Management Section
**Features:**
- View all owned profiles and businesses
- Add new profile (if under limit of 10)
- Edit profile (creates approval request)
- Upload photos (max 10 per profile)
- Select services by category
- View profile statistics

**Photo Upload UI:**
```typescript
// State management
const [formData, setFormData] = useState({
  photos: [] as File[],
  services: [] as string[],
  // ... other fields
});

// File handler
const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  setFormData(prev => ({
    ...prev,
    photos: [...prev.photos, ...files].slice(0, 10) // Max 10
  }));
};

// Remove photo
const removePhoto = (index: number) => {
  setFormData(prev => ({
    ...prev,
    photos: prev.photos.filter((_, i) => i !== index)
  }));
};
```

#### Service Selection UI
- Tabs based on business type (escort, massage, bdsm, online)
- Checkboxes for selecting multiple services
- Services loaded from `/api/services` endpoint
- Filtered by ServiceCategory

#### Business Management Section
**Features:**
- Edit business details
- Manage business photos
- Set opening hours
- List equipment/amenities

**Photo Management:**
```typescript
const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
const [businessPhotos, setBusinessPhotos] = useState<File[]>([]);

// Mark photo for deletion
if (photosToDelete.includes(photo.id)) {
  // Visual indicator (opacity, strikethrough)
} else {
  setPhotosToDelete([...photosToDelete, photo.id]);
}
```

**Update Flow:**
1. User makes changes to business form
2. Prepares photoChanges object with deletions and additions
3. Converts new photos to base64
4. Sends to `/api/admin/businesses/edit` (or user endpoint if available)
5. Changes are applied immediately (admin created businesses)

---

### 4.2 Admin Panel (`/app/admin_panel/page.tsx`)

#### Dashboard Statistics
- Total profiles, businesses, users
- Average photo quality scores
- Review counts and ratings

#### Profile Management
**Create Profile Modal:**
- Form fields for all profile attributes
- Service selection (checkboxes by category)
- Photo upload with preview
- Auto-assigns business owner as profile owner
- Auto-approves on creation

**Edit Profile Modal:**
- Update profile fields
- Manage existing photos (delete with visual confirmation)
- Add new photos
- No direct service editing in edit modal

**Photo Management UI:**
```typescript
// Existing photos shown with:
// - Preview image
// - Delete button
// - Visual feedback when marked for deletion

// New photos:
// - File input with preview
// - Remove from selection before saving
```

#### Business Management
**Create Business Modal:**
- All business fields
- Profile type selection
- Equipment/amenities as array
- Opening hours by day
- Photo upload

**Edit Business Modal:**
- Same fields as create
- Manage existing photos
- Add new photos

#### Service Selection Interface
```typescript
// Services loaded from /api/services
const [allServices, setAllServices] = useState<any[]>([]);

// Grouped by category for display
const categoryServices = allServices.filter(s => s.category === 'PRAKTIKY');

// Checkbox implementation
{categoryServices.map(service => (
  <label key={service.id}>
    <input
      type="checkbox"
      checked={newProfileFormData.services.includes(service.id)}
      onChange={e => {
        if (e.target.checked) {
          setNewProfileFormData({
            ...newProfileFormData,
            services: [...newProfileFormData.services, service.id]
          });
        } else {
          setNewProfileFormData({
            ...newProfileFormData,
            services: newProfileFormData.services.filter(id => id !== service.id)
          });
        }
      }}
    />
    <span>{service.name}</span>
  </label>
))}
```

#### Pending Changes Review
**Features:**
- View all pending change requests from users
- Compare old vs. new data
- Approve/reject with optional notes
- Visual diff display
- Photo changes shown (deletions and additions)

---

## 5. WORKFLOW COMPARISON

### User Photo/Service Management Flow

```
User Dashboard (inzerent_dashboard)
├─ Add Profile
│  ├─ POST /api/profiles
│  ├─ Photos: Converted to base64 in request
│  ├─ Services: Array of service IDs
│  └─ Response: Profile created, photos saved, services linked
│
├─ Edit Profile
│  ├─ POST /api/profiles/edit
│  ├─ Creates PendingChange (PENDING status)
│  ├─ NO photo changes allowed
│  ├─ NO service changes allowed
│  ├─ Admin must approve before changes visible
│  └─ User sees "Změny odeslány ke schválení"
│
└─ Edit Business
   ├─ Photo delete: Mark in state
   ├─ Photo add: Convert to base64
   ├─ Send to /api/admin/businesses/edit
   └─ Changes applied immediately
```

### Admin Photo/Service Management Flow

```
Admin Panel (admin_panel)
├─ Create Profile
│  ├─ POST /api/admin/profiles/create
│  ├─ Photos: Base64 conversion
│  ├─ Services: Array of service IDs
│  ├─ Auto-approves
│  ├─ Auto-generates SEO
│  └─ Creates new user if needed
│
├─ Edit Profile
│  ├─ POST /api/admin/profiles/edit
│  ├─ photoChanges.photosToDelete: Delete from disk + DB
│  ├─ photoChanges.newPhotos: Save and create Photo records
│  ├─ Order numbers auto-calculated
│  ├─ isMain set to first photo only
│  └─ Changes applied immediately
│
├─ Create Business
│  ├─ POST /api/admin/businesses/create
│  ├─ Photos: Base64 conversion
│  ├─ Same auto-approval process
│  └─ Auto-generates owner account if needed
│
├─ Edit Business
│  ├─ POST /api/admin/businesses/edit
│  ├─ Same photo handling as profiles
│  └─ Changes applied immediately
│
└─ Review Pending Changes
   ├─ GET /api/admin/pending-changes
   ├─ Shows user-requested changes
   ├─ POST /api/admin/pending-changes (action: approve/reject)
   ├─ If approved: Apply all changes including photos
   ├─ If rejected: No changes applied
   └─ Both actions require admin review
```

---

## 6. PHOTO ORDERING AND MAIN PHOTO

### Photo Order System
- **Order Field:** Integer (0, 1, 2, ...)
- **Main Photo:** isMain=true indicates thumbnail/profile picture
- **Display:** Photos ordered by `order ASC` in queries
- **Auto-calculation:** When adding photos, gets max order + 1

### Reordering
**Current Status:** NO reordering API endpoint exists
- Photos cannot be reordered after creation
- Cannot change which photo is main
- Workaround: Delete photo and re-upload in desired position

**Implications:**
- Users must upload photos in desired gallery order
- First uploaded becomes main photo
- No drag-and-drop or manual ordering in current system

---

## 7. SERVICE MANAGEMENT

### Service Assignment
- **Junction Table:** ProfileService (many-to-many)
- **Admin Can:** Add services when creating profile via form
- **User Can:** Add services when creating profile
- **Changes:** NOT supported in edit endpoint (profile/edit)

### Current Service Update Limitation
```
User Edit Profile Flow:
├─ Allowed: name, age, description, physical attributes, hours
├─ NOT Allowed: services (would need separate endpoint)
├─ NOT Allowed: photos (would need separate endpoint)
└─ Status: Profile/edit only handles basic data fields
```

### Service Data Storage
**Implementation 1:** ProfileService junction table (current)
- Proper relational design
- Easy to query and manage
- Normalized data

**Implementation 2:** servicesJson (Turso/LibSQL specific)
- Legacy field in Profile table
- JSON array format
- Used in some routes

---

## 8. ADMIN CAPABILITIES SUMMARY

### Direct Management
- ✅ Add/remove photos for any profile
- ✅ Change services (only during profile creation)
- ✅ Edit all profile fields
- ✅ Edit all business fields
- ✅ Add/remove photos for businesses
- ✅ Bulk operations: View all, filter, bulk approve

### Bulk Operations
**Available:**
- Get all pending changes (with filters)
- Approve/reject changes in batch (one at a time via API)
- Delete multiple profiles/businesses
- Search/filter users, businesses, profiles

**Not Available:**
- Bulk photo operations
- Bulk service changes

### Photo-Specific Capabilities
- ✅ Delete any photo from any profile/business
- ✅ Add new photos (up to 10MB each)
- ✅ Change main photo (by deleting others)
- ❌ Reorder photos
- ❌ Rotate/crop/resize
- ❌ Edit photo metadata/alt text

### Service-Specific Capabilities
- ✅ Assign services when creating profile
- ❌ Modify services in existing profile
- ❌ Create new service definitions (admin might need to do in database)
- ❌ Bulk service assignment

---

## 9. APPROVAL AND VERIFICATION SYSTEM

### PendingChange Model
```typescript
model PendingChange {
  id     String       @id
  type   ChangeType   // PROFILE_UPDATE, PHOTO_UPDATE, BUSINESS_UPDATE
  status ChangeStatus // PENDING, APPROVED, REJECTED
  
  // Change tracking
  oldData Json?
  newData Json
  
  // Admin review
  requestedById String
  requestedBy   User
  reviewedById String?
  reviewedBy   User?
  reviewedAt DateTime?
  reviewNotes String?
  
  // Relations
  profileId String?
  businessId String?
}
```

### Photo Changes in Pending Changes
**Structure:**
```json
{
  "photoChanges": {
    "photosToDelete": ["photo_id_1", "photo_id_2"],
    "newPhotos": ["base64_string_1", "base64_string_2"]
  }
}
```

**Approval Process:**
1. Admin reviews change request
2. If approved:
   - Photos in `photosToDelete` are deleted from disk
   - Photos in `newPhotos` are saved to disk
   - Photo records created in database
   - Changes marked APPROVED with timestamp
3. If rejected:
   - No files deleted or created
   - Changes marked REJECTED

---

## 10. LIMITATIONS AND GAPS

### Identified Gaps

1. **No User Photo Management API**
   - Users cannot add/remove photos after profile creation
   - Users cannot change main photo
   - Users cannot reorder photos
   - Only workaround: Admin intervention

2. **No Bulk Photo Operations**
   - Cannot delete multiple photos at once
   - Cannot reorder multiple photos
   - No batch photo operations for admin

3. **No Photo Reordering System**
   - No endpoint to change photo order
   - No endpoint to set different main photo
   - Requires delete + re-upload workflow

4. **Limited Service Editing**
   - Cannot add/remove services after profile creation
   - Services only selectable during creation
   - No service update endpoint for users
   - Admin can only modify during edit (if endpoint supported)

5. **No Photo Editing/Processing**
   - No image resizing/optimization
   - No rotation or cropping
   - No quality validation
   - ALT text only AI-scored, not user-editable

6. **No Direct Service Upload Endpoint**
   - Must be sent with profile creation
   - No separate service management API

---

## 11. FILE STRUCTURE SUMMARY

### Key Files

**Database:**
- `/Users/zen/Erosko2.0/prisma/schema.prisma` - Full schema

**Upload Utility:**
- `/Users/zen/Erosko2.0/lib/photo-upload.ts` - saveBase64Photo()

**API Routes:**
```
/app/api/
├─ admin/
│  ├─ profiles/
│  │  ├─ create/route.ts
│  │  ├─ edit/route.ts
│  │  └─ delete/route.ts
│  ├─ businesses/
│  │  ├─ create/route.ts
│  │  ├─ edit/route.ts
│  │  └─ delete/route.ts
│  └─ pending-changes/route.ts
├─ profiles/
│  ├─ route.ts (GET list, POST create)
│  ├─ [slug]/
│  │  ├─ route.ts (GET single)
│  │  └─ services/
│  │     └─ route.ts (GET services by slug)
│  ├─ edit/route.ts (POST update request)
│  └─ services/route.ts (POST/PUT?)
├─ services/
│  └─ route.ts (GET all)
└─ user/
   └─ profiles/route.ts (GET user's profiles)
```

**UI Components:**
- `/app/inzerent_dashboard/page.tsx` - User dashboard
- `/app/admin_panel/page.tsx` - Admin panel
- `/components/ServiceFilters.tsx` - Service filter component

---

## 12. AUTHENTICATION & AUTHORIZATION

### Session-Based Auth
- Uses NextAuth.js
- Phone-based authentication
- User roles: USER, PROVIDER, ADMIN

### Authorization Checks

**User Endpoints:**
```typescript
const session = await auth();
if (!session || !session.user) return 401;

// For profile edit: verify owns profile
const profile = await prisma.profile.findFirst({
  where: {
    id: profileId,
    ownerId: session.user.id  // Must be owner
  }
});
```

**Admin Endpoints:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: session.user.id }
});

if (!user || user.role !== UserRole.ADMIN) {
  return 403; // Forbidden
}
```

---

## 13. ERROR HANDLING

### Common Error Responses

**Authentication/Authorization:**
- 401: Nepřihlášen (Not logged in)
- 403: Nemáte oprávnění (No permission)

**Validation:**
- 400: Chybí data (Missing data)
- 400: Vyplňte všechny povinné údaje (Fill required fields)

**Not Found:**
- 404: Profil nenalezen (Profile not found)
- 404: Podnik nenalezen (Business not found)

**Server Errors:**
- 500: Chyba při... (Error during operation)

---

## 14. FUTURE ENHANCEMENT RECOMMENDATIONS

### High Priority
1. **Add user photo management API**
   - Reorder photos
   - Delete photos
   - Change main photo
   
2. **Add service update endpoint**
   - Allow users to modify services
   - Support in pending changes system
   
3. **Add photo reordering API**
   - PATCH /api/profiles/[id]/photos/reorder
   - Update order fields in bulk

### Medium Priority
1. **Image optimization**
   - Resize/compress on upload
   - Generate thumbnails
   - WebP conversion

2. **Photo metadata**
   - User-editable alt text
   - Photo captions
   - Upload dates display

3. **Bulk operations**
   - Bulk delete photos
   - Bulk reorder
   - Bulk service assignment

### Low Priority
1. **Advanced photo editing**
   - Rotation/cropping
   - Filters
   - Watermarking

2. **AI integration**
   - Automatic tagging
   - Quality assessment
   - NSFW detection

---

## Conclusion

The Erosko system implements a functional photo and service management system with clear separation between user and admin capabilities. Photos are stored locally in the filesystem with database records for tracking. Services use a proper relational many-to-many design. The main limitation is the lack of user-facing APIs for modifying photos and services after initial creation, which requires admin intervention or recreation of profiles.

