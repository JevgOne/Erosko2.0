# Erosko Photo & Service Management - Quick Reference Guide

## API Endpoint Quick Map

### Photo Management Endpoints

| Endpoint | Method | Auth | Purpose | Special Notes |
|----------|--------|------|---------|---------------|
| `/api/admin/profiles/create` | POST | Admin | Create profile + photos | Auto-approves, photos must be base64 |
| `/api/admin/profiles/edit` | POST | Admin | Update profile + photos | Direct disk operations via fs module |
| `/api/admin/profiles/delete` | POST | Admin | Delete profile + all photos | Cascade delete from DB |
| `/api/admin/businesses/create` | POST | Admin | Create business + photos | Auto-approves, creates owner account if needed |
| `/api/admin/businesses/edit` | POST | Admin | Update business + photos | Same photo operations as profiles |
| `/api/admin/businesses/delete` | POST | Admin | Delete business + all photos | Cascade delete from DB |
| `/api/profiles` | POST | User | Create profile | No photo upload - must add later (limitation) |
| `/api/profiles/[slug]` | GET | Public | Get profile details | Includes photos ordered by order field |
| `/api/user/profiles` | GET | User | Get user's profiles + businesses | Includes photos array |

### Service Management Endpoints

| Endpoint | Method | Auth | Purpose | Special Notes |
|----------|--------|------|---------|---------------|
| `/api/services` | GET | Public | Fetch all services | Optional category filter |
| `/api/profiles/services` | GET | Public | Get profile services (legacy) | Returns servicesJson field |
| `/api/profiles/[slug]/services` | GET | Public | Get services by slug | Alternative to full profile fetch |
| `/api/profiles` | POST | User | Create + link services | Services as array of IDs |
| `/api/admin/profiles/create` | POST | Admin | Create + assign services | Services array in request |

### Change Approval Endpoints

| Endpoint | Method | Auth | Purpose | Photo Support |
|----------|--------|------|---------|-----------------|
| `/api/admin/pending-changes` | GET | Admin | List all pending changes | Shows photoChanges in newData |
| `/api/admin/pending-changes` | POST | Admin | Approve/reject change | Applies photos on approval |

---

## Storage & File Locations

### Photo Storage
```
Physical Location: public/uploads/{folder}/*.{extension}
Database URL: /uploads/{folder}/timestamp-random.ext

Examples:
- /uploads/profiles/1731840000000-abc123.jpg
- /uploads/businesses/1731840000000-xyz789.png
```

### Size Limits
- Max per image: 10MB (15MB base64 string)
- Max per profile: 10 photos
- Max per business: No hard limit documented

### Supported Formats
- Any MIME type accepted
- Extension auto-detected from MIME type
- Stored as-is (no compression/optimization)

---

## User Workflows

### User Creating Profile
```
1. Visit /inzerent_dashboard
2. Click "Přidat profil"
3. Fill form:
   - Name, age, city (required)
   - Physical attributes, description
   - Select services (checkbox by category)
   - Upload up to 10 photos
4. Click save
5. POST /api/profiles
   - Photos converted to base64 on client
   - Services array sent as IDs
6. Profile created with:
   - approved: false (pending admin review)
   - photos saved to disk
   - services linked via ProfileService table
```

### User Editing Profile
```
1. Click "Upravit" on profile
2. Change fields (name, description, etc.)
3. Click save
4. POST /api/profiles/edit
5. Creates PendingChange (PENDING status)
6. User sees: "Změny odeslány ke schválení"
7. Admin must approve in pending-changes panel
8. CANNOT change:
   - Photos (no API support)
   - Services (no API support)
   - Must recreate profile to change these
```

### User Managing Business
```
1. Click "Upravit podnik"
2. Edit fields, photos, hours
3. Mark photos to delete
4. Add new photos
5. Convert photos to base64
6. POST /api/admin/businesses/edit
7. Changes applied immediately
   - Photos deleted from disk
   - New photos saved to disk
```

---

## Admin Workflows

### Admin Creating Profile
```
1. Go to /admin_panel → Profiles → "Přidat profil"
2. Fill all fields
3. Select services (checkboxes)
4. Upload photos with preview
5. Click save
6. POST /api/admin/profiles/create
7. Auto-created:
   - User account if no owner
   - Unique slug from name-city-timestamp
   - approved: true
   - Profile stored
   - Photos saved to disk via saveBase64Photo()
   - Services linked
   - SEO generated in background
```

### Admin Editing Profile
```
1. Click profile row → edit button
2. Update fields
3. Manage photos:
   - Click delete on existing → mark for deletion
   - Upload new photos → preview shown
4. Click save
5. POST /api/admin/profiles/edit
6. Operations:
   - Marked photos deleted from disk + DB
   - New photos saved via saveBase64Photo()
   - Photo order auto-calculated
   - First new photo set isMain: true
   - Profile updated
```

### Admin Approving User Changes
```
1. Go to /admin_panel → Pending Changes
2. Review change:
   - Show oldData vs newData
   - If photos included, show deletions/additions
3. Click approve/reject
4. POST /api/admin/pending-changes
   - action: "approve" or "reject"
5. If approved:
   - Apply all newData fields
   - Save photos to disk if included
   - Mark APPROVED with timestamp + admin ID
6. If rejected:
   - No changes applied
   - Mark REJECTED
```

---

## Data Models

### Photo Record
```json
{
  "id": "cuid",
  "url": "/uploads/profiles/timestamp-random.jpg",
  "alt": "Optional alt text",
  "altQualityScore": 85,
  "order": 0,
  "isMain": true,
  "profileId": "profile-id-or-null",
  "businessId": "business-id-or-null",
  "createdAt": "2024-11-17T14:30:00Z"
}
```

### Service Record
```json
{
  "id": "cuid",
  "name": "Fellatio",
  "description": "Service description",
  "icon": "icon-name",
  "category": "PRAKTIKY"
}
```

### ProfileService (Junction)
```json
{
  "id": "cuid",
  "profileId": "profile-id",
  "serviceId": "service-id"
}
```

---

## Photo Operations Reference

### Supported Operations
- ✅ Create photo (with profile/business)
- ✅ Delete photo (admin)
- ✅ View photo (public URL)
- ✅ List photos (ordered)
- ❌ Reorder photos
- ❌ Change main photo
- ❌ Edit photo metadata

### When Photos Are Deleted
```
From Disk:
- Admin manually deletes via edit modal
- fs.unlinkSync(path.join(cwd, 'public', photo.url))
- Only if file exists (try/catch silently fails)

From Database:
- prisma.photo.delete({ where: { id: photoId } })
- Via pending changes approval
- Via profile/business cascade delete
```

### Photo Ordering Logic
```javascript
// Getting next order when adding photos
const existingPhotos = await prisma.photo.findMany({
  where: { profileId },
  orderBy: { order: 'desc' },
  take: 1
});
let nextOrder = existingPhotos.length > 0 
  ? existingPhotos[0].order + 1 
  : 0;

// Multiple photos: 0, 1, 2, 3...
// isMain only true for order: 0
```

---

## Service Operations Reference

### Supported Operations
- ✅ Create service (DB only, no API)
- ✅ Assign service to profile
- ✅ Get all services
- ✅ Get services by category
- ✅ Remove service from profile (by deleting profile)
- ❌ Edit service on existing profile
- ❌ Bulk assign services

### Service Assignment
```javascript
// Only during profile creation
if (services && services.length > 0) {
  for (const serviceId of services) {
    await prisma.profileService.create({
      data: {
        profileId: profile.id,
        serviceId: serviceId
      }
    });
  }
}
```

### Service Retrieval
```javascript
// Via profile with relations
const profile = await prisma.profile.findUnique({
  where: { slug },
  include: {
    services: {
      include: { service: true }
    }
  }
});
```

---

## File Upload Function

### `saveBase64Photo(base64String, folder)`

**Input:**
- `base64String`: `data:image/jpeg;base64,...`
- `folder`: `"profiles"` or `"businesses"`

**Process:**
1. Validate format and size (max 10MB)
2. Extract MIME type and base64 data
3. Get extension from MIME type
4. Generate filename: `{timestamp}-{randomString}.{ext}`
5. Create directory: `public/uploads/{folder}`
6. Save buffer to disk
7. Return URL: `/uploads/{folder}/{filename}`

**Throws:**
- Error if invalid base64
- Error if too large
- Error if save fails

---

## Error Scenarios & Fixes

### Photo Won't Delete
**Problem:** User clicks delete, photo still appears
**Cause:** Photo deletion from frontend marks for deletion but doesn't update UI
**Fix:** Refresh page or reload profiles list

### Photos Upload but Don't Show
**Problem:** Photo file exists but not visible
**Possible Causes:**
1. Photo not in database (check Photo table)
2. Wrong URL format
3. File permissions issue on disk
4. Profile not approved (user profiles need approval)

### Service Won't Save
**Problem:** Service selected but not linked to profile
**Cause:** Services only assignable during creation
**Fix:** Delete profile and recreate, or admin must manually add via edit

### Pending Change Won't Approve
**Problem:** Admin clicks approve, photo still missing
**Cause:** Photos in pending changes are saved on approval
**Fix:** Check admin logs for saveBase64Photo errors

---

## Authorization Rules

### User Can
- Create own profiles (up to 10)
- Edit own profiles (basic fields only)
- Delete own profiles
- Upload photos during creation
- Select services during creation
- View own profile list

### User Cannot
- Edit photos after creation
- Edit services after creation
- View/approve pending changes
- Manage other users' profiles
- Create/edit businesses

### Admin Can
- Create/edit/delete all profiles
- Create/edit/delete all businesses
- Add/remove photos for any profile
- Approve/reject user changes
- Assign services during creation
- Edit all fields

### Admin Cannot
- Automatically reorder photos (no API)
- Bulk edit services
- Bulk photo operations

---

## Common Request Formats

### Create Profile (User)
```json
POST /api/profiles
{
  "name": "Anna",
  "age": 25,
  "city": "Praha",
  "businessId": "bus-123",
  "description": "Friendly",
  "services": ["svc-1", "svc-2"],
  "languages": ["Czech", "English"],
  "offersEscort": true
}
```

### Edit Profile (User)
```json
POST /api/profiles/edit
{
  "profileId": "prof-123",
  "changes": {
    "name": "Anna Updated",
    "description": "Very friendly"
  }
}
```

### Create Profile (Admin)
```json
POST /api/admin/profiles/create
{
  "data": {
    "name": "Bella",
    "age": 24,
    "city": "Brno",
    "category": "HOLKY_NA_SEX",
    "phone": "721000000",
    "services": ["svc-1", "svc-2"],
    "photos": ["data:image/jpeg;base64,/9j/4AAQSk..."],
    "ownerId": "optional"
  }
}
```

### Edit Profile with Photos (Admin)
```json
POST /api/admin/profiles/edit
{
  "profileId": "prof-123",
  "data": {
    "name": "Updated Name",
    "description": "New description",
    "photoChanges": {
      "photosToDelete": ["photo-1", "photo-2"],
      "newPhotos": ["data:image/jpeg;base64,/9j/4AAQSk..."]
    }
  }
}
```

### Approve Pending Change
```json
POST /api/admin/pending-changes
{
  "changeId": "change-123",
  "action": "approve",
  "notes": "Looks good"
}
```

---

## Debugging Tips

### Check Photo Existence
```bash
ls -la public/uploads/profiles/
ls -la public/uploads/businesses/
```

### Check Database Records
```sql
SELECT * FROM "Photo" WHERE profileId = 'prof-id' ORDER BY "order";
SELECT * FROM "ProfileService" WHERE profileId = 'prof-id';
```

### View Pending Changes
```
POST /api/admin/pending-changes
Includes old and new data for comparison
```

### Check Upload Permissions
```bash
chmod 755 public/uploads/
chmod 755 public/uploads/profiles/
chmod 755 public/uploads/businesses/
```

---

## Performance Considerations

### Photo Uploads
- Base64 encoding happens on client
- Each photo save: file I/O + DB insert
- No compression before storage
- Consider adding image optimization

### Service Queries
- Services cacheable (rarely change)
- ProfileService indexed by profileId
- Use include: { service: true } for joined data

### Photo Ordering
- Order field allows O(1) lookup
- Recommend auto-calculation instead of manual
- No need for migration if changing logic

### Pending Changes
- Indexed by status and profileId
- Consider archiving old changes
- photos in JSON can get large

