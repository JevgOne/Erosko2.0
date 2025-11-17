-- AlterTable
ALTER TABLE "Photo" ADD COLUMN "altQualityScore" INTEGER;

-- CreateTable
CREATE TABLE "StaticPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CUSTOM',
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "h1" TEXT NOT NULL,
    "content" TEXT DEFAULT '',
    "keywords" TEXT,
    "ogImageUrl" TEXT,
    "focusKeyword" TEXT,
    "secondaryKeywords" TEXT DEFAULT '',
    "seoScore" INTEGER DEFAULT 0,
    "schemaMarkup" TEXT,
    "lastAnalyzed" DATETIME,
    "contentScore" INTEGER DEFAULT 0,
    "readabilityScore" INTEGER DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 301,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "documentUrl" TEXT,
    "notes" TEXT,
    "profileId" TEXT,
    "businessId" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" DATETIME,
    "expiresAt" DATETIME,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Verification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Verification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Verification_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "filters" TEXT,
    "userId" TEXT,
    "resultCount" INTEGER NOT NULL,
    "clickedProfileId" TEXT,
    "sessionId" TEXT,
    "deviceType" TEXT,
    "referrer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PopularSearch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "displayText" TEXT NOT NULL,
    "category" TEXT,
    "city" TEXT,
    "serviceType" TEXT,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "lastSearched" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "linkedPageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "data" TEXT,
    "page" TEXT NOT NULL DEFAULT 'homepage',
    "section" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "profileType" TEXT NOT NULL,
    "equipment" JSONB,
    "openingHours" JSONB,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "seoQualityScore" INTEGER,
    "ogImageUrl" TEXT,
    "seoManualOverride" BOOLEAN NOT NULL DEFAULT false,
    "seoLastGenerated" DATETIME,
    "focusKeyword" TEXT,
    "secondaryKeywords" TEXT DEFAULT '',
    "seoScore" INTEGER DEFAULT 0,
    "schemaMarkup" TEXT,
    "lastAnalyzed" DATETIME,
    "contentScore" INTEGER DEFAULT 0,
    "readabilityScore" INTEGER DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Business" ("address", "approved", "city", "createdAt", "description", "email", "equipment", "id", "isNew", "isPopular", "name", "openingHours", "ownerId", "phone", "profileType", "rating", "reviewCount", "slug", "updatedAt", "verified", "viewCount", "website") SELECT "address", "approved", "city", "createdAt", "description", "email", "equipment", "id", "isNew", "isPopular", "name", "openingHours", "ownerId", "phone", "profileType", "rating", "reviewCount", "slug", "updatedAt", "verified", "viewCount", "website" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");
CREATE INDEX "Business_city_idx" ON "Business"("city");
CREATE INDEX "Business_profileType_idx" ON "Business"("profileType");
CREATE INDEX "Business_slug_idx" ON "Business"("slug");
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "description" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "location" TEXT NOT NULL,
    "profileType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "height" INTEGER,
    "weight" INTEGER,
    "bust" TEXT,
    "hairColor" TEXT,
    "hairLength" TEXT,
    "breastType" TEXT,
    "bodyType" TEXT,
    "ageCategory" TEXT,
    "pubicHair" TEXT,
    "role" TEXT,
    "nationality" TEXT,
    "languages" TEXT,
    "orientation" TEXT,
    "tattoos" TEXT,
    "piercing" TEXT,
    "offersEscort" BOOLEAN NOT NULL DEFAULT false,
    "travels" BOOLEAN NOT NULL DEFAULT false,
    "openingHours" JSONB,
    "privateContacts" JSONB,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoDescriptionA" TEXT,
    "seoDescriptionB" TEXT,
    "seoDescriptionC" TEXT,
    "seoKeywords" TEXT,
    "seoQualityScore" INTEGER,
    "ogImageUrl" TEXT,
    "seoManualOverride" BOOLEAN NOT NULL DEFAULT false,
    "seoLastGenerated" DATETIME,
    "seoLastReviewed" DATETIME,
    "seoActiveVariant" TEXT NOT NULL DEFAULT 'A',
    "seoVariantStats" JSONB,
    "focusKeyword" TEXT,
    "secondaryKeywords" TEXT DEFAULT '',
    "seoScore" INTEGER DEFAULT 0,
    "schemaMarkup" TEXT,
    "lastAnalyzed" DATETIME,
    "contentScore" INTEGER DEFAULT 0,
    "readabilityScore" INTEGER DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    "businessId" TEXT,
    CONSTRAINT "Profile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("address", "age", "approved", "breastType", "businessId", "bust", "category", "city", "createdAt", "description", "email", "hairColor", "height", "id", "isNew", "isOnline", "isPopular", "languages", "location", "name", "nationality", "offersEscort", "openingHours", "orientation", "ownerId", "phone", "piercing", "privateContacts", "profileType", "rating", "reviewCount", "role", "slug", "tattoos", "travels", "updatedAt", "verified", "viewCount", "weight") SELECT "address", "age", "approved", "breastType", "businessId", "bust", "category", "city", "createdAt", "description", "email", "hairColor", "height", "id", "isNew", "isOnline", "isPopular", "languages", "location", "name", "nationality", "offersEscort", "openingHours", "orientation", "ownerId", "phone", "piercing", "privateContacts", "profileType", "rating", "reviewCount", "role", "slug", "tattoos", "travels", "updatedAt", "verified", "viewCount", "weight" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_slug_key" ON "Profile"("slug");
CREATE INDEX "Profile_city_idx" ON "Profile"("city");
CREATE INDEX "Profile_category_idx" ON "Profile"("category");
CREATE INDEX "Profile_profileType_idx" ON "Profile"("profileType");
CREATE INDEX "Profile_slug_idx" ON "Profile"("slug");
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "category" TEXT NOT NULL DEFAULT 'PRAKTIKY'
);
INSERT INTO "new_Service" ("description", "icon", "id", "name") SELECT "description", "icon", "id", "name" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "passwordHash", "phone", "phoneVerified", "role", "updatedAt") SELECT "createdAt", "email", "id", "passwordHash", "phone", "phoneVerified", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_phone_idx" ON "User"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "StaticPage_path_key" ON "StaticPage"("path");

-- CreateIndex
CREATE INDEX "StaticPage_path_idx" ON "StaticPage"("path");

-- CreateIndex
CREATE INDEX "StaticPage_type_idx" ON "StaticPage"("type");

-- CreateIndex
CREATE INDEX "StaticPage_published_idx" ON "StaticPage"("published");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_from_key" ON "Redirect"("from");

-- CreateIndex
CREATE INDEX "Redirect_from_idx" ON "Redirect"("from");

-- CreateIndex
CREATE INDEX "Redirect_enabled_idx" ON "Redirect"("enabled");

-- CreateIndex
CREATE INDEX "Verification_profileId_idx" ON "Verification"("profileId");

-- CreateIndex
CREATE INDEX "Verification_businessId_idx" ON "Verification"("businessId");

-- CreateIndex
CREATE INDEX "Verification_status_idx" ON "Verification"("status");

-- CreateIndex
CREATE INDEX "Verification_type_idx" ON "Verification"("type");

-- CreateIndex
CREATE INDEX "SearchQuery_query_idx" ON "SearchQuery"("query");

-- CreateIndex
CREATE INDEX "SearchQuery_userId_idx" ON "SearchQuery"("userId");

-- CreateIndex
CREATE INDEX "SearchQuery_createdAt_idx" ON "SearchQuery"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PopularSearch_keyword_key" ON "PopularSearch"("keyword");

-- CreateIndex
CREATE INDEX "PopularSearch_searchCount_idx" ON "PopularSearch"("searchCount");

-- CreateIndex
CREATE INDEX "PopularSearch_lastSearched_idx" ON "PopularSearch"("lastSearched");

-- CreateIndex
CREATE INDEX "PopularSearch_isPinned_idx" ON "PopularSearch"("isPinned");

-- CreateIndex
CREATE INDEX "PopularSearch_category_idx" ON "PopularSearch"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_identifier_key" ON "ContentBlock"("identifier");

-- CreateIndex
CREATE INDEX "ContentBlock_identifier_idx" ON "ContentBlock"("identifier");

-- CreateIndex
CREATE INDEX "ContentBlock_page_idx" ON "ContentBlock"("page");

-- CreateIndex
CREATE INDEX "ContentBlock_section_idx" ON "ContentBlock"("section");

-- CreateIndex
CREATE INDEX "ContentBlock_published_idx" ON "ContentBlock"("published");
