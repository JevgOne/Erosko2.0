# Erosko Photo & Service Management - Implementation Summary

## Key Files and Locations

### Absolute File Paths

**Database Schema:**
- `/Users/zen/Erosko2.0/prisma/schema.prisma`

**Upload Utility:**
- `/Users/zen/Erosko2.0/lib/photo-upload.ts`

**API Routes:**
- `/Users/zen/Erosko2.0/app/api/admin/profiles/create/route.ts`
- `/Users/zen/Erosko2.0/app/api/admin/profiles/edit/route.ts`
- `/Users/zen/Erosko2.0/app/api/admin/profiles/delete/route.ts`
- `/Users/zen/Erosko2.0/app/api/admin/businesses/create/route.ts`
- `/Users/zen/Erosko2.0/app/api/admin/businesses/edit/route.ts`
- `/Users/zen/Erosko2.0/app/api/admin/businesses/delete/route.ts`
- `/Users/zen/Erosko2.0/app/api/admin/pending-changes/route.ts`
- `/Users/zen/Erosko2.0/app/api/profiles/route.ts`
- `/Users/zen/Erosko2.0/app/api/profiles/[slug]/route.ts`
- `/Users/zen/Erosko2.0/app/api/profiles/[slug]/services/route.ts`
- `/Users/zen/Erosko2.0/app/api/profiles/services/route.ts`
- `/Users/zen/Erosko2.0/app/api/profiles/edit/route.ts`
- `/Users/zen/Erosko2.0/app/api/services/route.ts`
- `/Users/zen/Erosko2.0/app/api/user/profiles/route.ts`

**UI Components:**
- `/Users/zen/Erosko2.0/app/inzerent_dashboard/page.tsx` (User Dashboard - 2500+ lines)
- `/Users/zen/Erosko2.0/app/admin_panel/page.tsx` (Admin Panel - 2500+ lines)

---

## Photo Management System - Complete Overview

### How Photos Are Uploaded
1. **User selects files** in browser (drag-drop or file input)
2. **Client-side conversion** to base64 (FileReader.readAsDataURL)
3. **Base64 sent in JSON** request body to API
4. **Server validation** in saveBase64Photo():
   - Check format: `data:image/type;base64,...`
   - Check size: max 15MB base64 string
5. **File processing**:
   - Extract MIME type (e.g., `image/jpeg`)
   - Generate filename: `{timestamp}-{randomString}.{extension}`
   - Create directory: `public/uploads/{folder}/`
   - Convert base64 to buffer
   - Write to disk using fs.writeFile()
6. **Database record created** with:
   - `url`: `/uploads/{folder}/{filename}`
   - `order`: Auto-calculated from existing photos
   - `isMain`: true only for order 0
   - `profileId` or `businessId`: Foreign key

### Where Photos Are Stored
- **Physical disk**: `public/uploads/profiles/` and `public/uploads/businesses/`
- **Database**: Photo table with file URL
- **No cloud storage**: All local filesystem
- **No compression**: Stored as-is after base64 decode

### Photo Deletion Process
1. **Mark for deletion** (admin clicks delete button)
2. **On save**, for each photo to delete:
   - Retrieve Photo record from database
   - Delete file from disk: `fs.unlinkSync(path)`
   - Delete database record: `prisma.photo.delete()`
3. **On cascade**: If profile/business deleted, all photos cascade delete (DB constraint)

### Photo Ordering System
- **Integer field**: 0, 1, 2, 3, ...
- **Query ordering**: All queries use `orderBy: { order: 'asc' }`
- **First photo**: isMain = true (order 0)
- **No reordering API**: Cannot change order after creation
- **Workaround**: Delete photo, re-upload in new position

### Main Photo Selection
- **Automatic**: First uploaded photo (order 0) is main
- **No user choice**: Cannot select different main photo
- **To change**: Delete all photos and re-upload in desired order

---

## Service Management System - Complete Overview

### How Services Are Added
1. **Services exist in database** (created by admin or via seed)
2. **User selects services** during profile creation (checkboxes)
3. **Services sent as array of IDs**: `["service-id-1", "service-id-2"]`
4. **Junction table created**: ProfileService links profile to services
5. **No photos during creation**: User can only select services, not upload photos yet

### Service Categories
- **PRAKTIKY**: Sex practices for escorts
- **DRUHY_MASAZI**: Types of massage services
- **EXTRA_SLUZBY**: Extra services for masseuses
- **BDSM_PRAKTIKY**: BDSM practices

### Service Display UI
- **Checkboxes**: Multiple selection per category
- **Grouped tabs**: Shows services filtered by category
- **Icons**: Optional lucide-react icon for each service
- **Service name**: Displayed with checkbox

### Service Data Storage
- **Junction table**: ProfileService (many-to-many)
- **Indexes**: profileId and serviceId indexed for fast queries
- **Unique constraint**: Prevents duplicate service per profile
- **Cascade delete**: Removing profile removes all ProfileService records

### Service Modification
- **During creation**: User can select/deselect freely
- **After creation**: NO API to modify services
- **User workaround**: Must delete and recreate profile
- **Admin option**: Can add during edit (if supported)

---

## Admin Panel Capabilities

### What Admin Can Do

**With Photos:**
- Add new photos to any profile/business
- Delete any photo by ID
- View all photos for any entity
- Set photo order (via position in array)
- Change main photo (by deleting others)

**With Services:**
- Assign services when creating profile
- View services for any profile
- CANNOT: Modify services on existing profile
- CANNOT: Create new service definitions (DB only)

**With Profiles:**
- Create from scratch (auto-approves)
- Edit all fields (name, age, description, attributes)
- Delete completely
- View pending changes from users
- Approve/reject user change requests

**With Businesses:**
- Create from scratch (auto-approves)
- Edit all fields (name, address, hours, equipment)
- Delete completely
- Manage photos (same as profiles)

### Admin Panel UI Features
- Modal dialogs for create/edit
- Photo preview before save
- Checkbox selection for services
- Pending changes review with diff
- Search/filter for users, profiles, businesses
- Statistics dashboard

---

## User Dashboard Capabilities

### What Users Can Do

**Profile Creation:**
- Fill profile form
- Upload up to 10 photos
- Select services from checkboxes
- Photos converted to base64 automatically
- Submit for admin review

**Profile Editing:**
- Edit: name, age, description, height, weight, attributes, hours
- Send changes for admin approval
- CANNOT edit: photos or services
- Must wait for admin approval before changes visible

**Business Management:**
- Edit business name, address, phone, email, website
- Edit opening hours (per day)
- Add/remove business photos
- Changes apply immediately (no approval needed)

**Service Management:**
- Select services only when creating profile
- CANNOT change services after creation
- Only option: Delete profile and recreate

**Photo Management - What's Missing:**
- NO API to add photos after creation
- NO API to delete photos
- NO API to reorder photos
- NO API to change main photo
- Users stuck with initial uploads

---

## Pending Changes System

### How Pending Changes Work
1. **User requests change** (profile edit)
2. **PendingChange record created**:
   - `status`: PENDING
   - `oldData`: Current profile data
   - `newData`: Requested changes
   - `type`: PROFILE_UPDATE or BUSINESS_UPDATE
3. **Admin reviews** in `/admin_panel`
4. **Admin action**:
   - Approve: Apply newData to profile, mark APPROVED
   - Reject: Discard changes, mark REJECTED

### Photo Changes in Pending Changes
**If photos included in change request:**
```json
{
  "photoChanges": {
    "photosToDelete": ["photo-id-1"],
    "newPhotos": ["data:image/jpeg;base64,..."]
  }
}
```

**On approval:**
1. Delete marked photos from disk and DB
2. Save new photos to disk
3. Create Photo records
4. Mark change as APPROVED

**On rejection:**
- No file operations occur
- Mark change as REJECTED

---

## Database Design

### Photo Table
```
id              CUID (primary key)
url             String (file path)
alt             String (optional)
altQualityScore Int (0-100, optional)
order           Int (gallery position)
isMain          Boolean (thumbnail flag)
profileId       String (optional foreign key)
businessId      String (optional foreign key)
createdAt       DateTime (auto)
```

**Relationships:**
- Can be linked to Profile OR Business (not both typically)
- Cascade delete: Removes photo if profile/business deleted
- Indexes: profileId, businessId for fast queries

### Service Table
```
id          CUID (primary key)
name        String (unique)
description String (optional)
icon        String (optional)
category    ServiceCategory (enum)
```

**Relationships:**
- One-to-many with ProfileService (via junction)

### ProfileService Table (Junction)
```
id        CUID (primary key)
profileId String (foreign key)
serviceId String (foreign key)
```

**Constraints:**
- Unique: [profileId, serviceId]
- Cascade delete both sides
- Indexes: profileId, serviceId

---

## API Endpoint Summary

### Photo Endpoints
- `POST /api/admin/profiles/create` - Create profile with photos
- `POST /api/admin/profiles/edit` - Edit profile and manage photos
- `POST /api/admin/businesses/create` - Create business with photos
- `POST /api/admin/businesses/edit` - Edit business and manage photos
- `POST /api/profiles` - User creates profile (NO photos)
- `GET /api/profiles/[slug]` - Get profile with ordered photos
- `GET /api/user/profiles` - Get user's profiles with photos

### Service Endpoints
- `GET /api/services` - Get all services (optional category filter)
- `POST /api/profiles` - Create profile with services
- `GET /api/profiles/[slug]` - Get profile with services
- `GET /api/profiles/services` - Legacy endpoint
- `GET /api/profiles/[slug]/services` - Services by slug

### Change Approval Endpoints
- `GET /api/admin/pending-changes` - List all pending changes
- `POST /api/admin/pending-changes` - Approve/reject change

---

## Real-World Flow Examples

### Scenario 1: User Creates Profile with Photos
```
1. User goes to /inzerent_dashboard
2. Clicks "Přidat profil"
3. Fills form: name, age, description, services
4. Selects 5 photos (clicks file input)
5. Client converts photos to base64
6. Clicks submit
7. POST /api/profiles sent with:
   - Profile data
   - services: ["id1", "id2", "id3"]
   - photos: converted to client (not sent here)
8. Server creates profile with approved: false
9. User sees profile pending admin review

Note: Photos are NOT sent in POST /api/profiles!
They would need to be added separately (current limitation).
```

### Scenario 2: User Edits Profile Description
```
1. User clicks edit on profile
2. Changes description, age
3. Clicks save
4. POST /api/profiles/edit sent with:
   - profileId
   - changes: { age: 26, description: "new text" }
5. Server creates PendingChange record
6. User sees: "Změny odeslány ke schválení"
7. Admin approves in pending-changes panel
8. Profile updated with new data
9. User sees changes on profile
```

### Scenario 3: Admin Adds Photos to Profile
```
1. Admin goes to /admin_panel → Profiles
2. Finds profile, clicks edit
3. Scrolls to photos section
4. Clicks existing photos to mark for deletion
5. Uploads new photos (file input)
6. Photos preview shown
7. Clicks save
8. POST /api/admin/profiles/edit sent with:
   - profileId
   - data: { photoChanges: { ... } }
9. Server:
   - Deletes marked photos from disk
   - Saves new photos to disk
   - Updates Photo records
10. Profile updated immediately (no approval needed)
```

### Scenario 4: Admin Creates Business with Photos
```
1. Admin clicks "Přidat podnik"
2. Fills all business fields
3. Selects profile type (PRIVAT, MASSAGE_SALON, etc.)
4. Uploads photos
5. Clicks save
6. POST /api/admin/businesses/create sent
7. Server:
   - Creates Business record (approved: true)
   - Creates User account if needed
   - Saves photos to disk
   - Creates Photo records
8. Business available immediately
```

---

## Key Limitations and Gaps

### Critical Gaps
1. **No user photo upload after creation**
   - Users can only upload during initial profile creation
   - Cannot add/remove photos later without admin
   - Current workaround: Contact admin

2. **No photo reordering**
   - Photos fixed in upload order
   - Cannot change main photo without delete + re-upload
   - No API endpoint for reordering

3. **No service modification**
   - Services locked after profile creation
   - Must delete and recreate profile to change services
   - No service update endpoint exists

4. **No photo editing**
   - Cannot rotate, crop, or resize
   - Cannot edit alt text
   - ALT score is AI-generated only

### Minor Gaps
- No image compression or optimization
- No bulk photo operations
- No bulk service assignment
- No service creation UI (DB only)

---

## Future Improvements

### High Priority
1. **User photo management API**
   ```
   PATCH /api/profiles/[id]/photos/reorder
   DELETE /api/profiles/[id]/photos/[photoId]
   POST /api/profiles/[id]/photos
   ```

2. **Service modification API**
   ```
   PUT /api/profiles/[id]/services
   PATCH /api/profiles/[id]/services
   ```

3. **Photo metadata editing**
   ```
   PATCH /api/profiles/[id]/photos/[photoId]
   - alt text (user-editable)
   - order (reordering)
   - isMain (set main photo)
   ```

### Medium Priority
- Image optimization (compression, resizing)
- Thumbnail generation
- MIME type validation
- File size validation
- Progressive upload feedback

### Low Priority
- Advanced photo editing (crop, rotate)
- Bulk operations
- Service creation UI
- Photo tagging system

---

## Security Considerations

### Current Implementation
- **Authentication**: NextAuth.js session required
- **Authorization**: Role-based (USER, ADMIN)
- **File validation**: Minimal (base64 format check only)
- **File permissions**: Standard filesystem permissions

### Security Gaps
- No MIME type validation (accepts any type)
- No virus scanning
- No image content validation
- No rate limiting on uploads
- No file size limit enforcement (only base64 string limit)
- No authentication check for file serving

### Recommendations
- Add MIME type whitelist validation
- Add image dimension limits
- Add user upload quota
- Serve files through authenticated endpoint
- Consider cloud storage (S3, etc.)
- Add virus scanning for production

---

## Performance Notes

### Photo Handling
- Base64 encoding: ~130% size increase
- File I/O: Synchronous fs operations (could be optimized)
- No image caching headers set
- No CDN integration

### Service Queries
- Services cacheable (rarely change)
- Indexed queries for ProfileService
- Can load with include: { service: true }

### Recommendations
- Implement image compression
- Add caching headers
- Consider async file operations
- Add pagination for photo lists
- Consider database denormalization for frequently joined data

---

## Testing Checklist

- [ ] Create profile with 10 photos
- [ ] Try to add photo after creation (should fail)
- [ ] Delete photo in admin panel
- [ ] Reorder photos (should not be possible without recreation)
- [ ] Change main photo (must delete others)
- [ ] Assign services during creation
- [ ] Try to change services after creation (should fail)
- [ ] Admin approves user profile changes
- [ ] Admin rejects user profile changes
- [ ] Create business with photos
- [ ] Edit business photos (delete + add)
- [ ] Check photos exist in public/uploads/
- [ ] Verify database records exist
- [ ] Check cascading deletes when profile removed

---

## Deployment Notes

### Required Directories
```bash
mkdir -p public/uploads/profiles
mkdir -p public/uploads/businesses
chmod 755 public/uploads
```

### Environment Variables
- `DATABASE_URL`: Turso/LibSQL database URL
- `TURSO_AUTH_TOKEN`: Database auth token
- Session secrets for NextAuth

### File Permissions
- `public/uploads/` must be writable by Node process
- Photos must be readable by web server
- Consider SELinux/AppArmor policies

### Database Migrations
- Run `prisma migrate deploy` to create tables
- Seed services via script if needed
- Check `/scripts/` for migration scripts

---

## Conclusion

The Erosko photo and service management system provides a functional, if somewhat limited, interface for managing profile and business content. Photos are stored locally with database tracking, and services use proper relational design. The main limitation is the lack of user-facing APIs for modifying content after initial creation, requiring admin intervention for photo or service changes.

The system is well-organized with clear separation of concerns between user and admin capabilities, proper authentication and authorization, and reasonable database design. However, it would benefit from implementing user photo management APIs and more flexible service modification options.

