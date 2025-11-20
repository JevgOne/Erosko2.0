-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT NOT NULL DEFAULT 'erosko.cz',
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
INSERT INTO "new_Business" ("address", "approved", "city", "contentScore", "createdAt", "description", "email", "equipment", "focusKeyword", "id", "isNew", "isPopular", "lastAnalyzed", "name", "ogImageUrl", "openingHours", "ownerId", "phone", "profileType", "rating", "readabilityScore", "reviewCount", "schemaMarkup", "secondaryKeywords", "seoDescription", "seoKeywords", "seoLastGenerated", "seoManualOverride", "seoQualityScore", "seoScore", "seoTitle", "slug", "updatedAt", "verified", "viewCount", "website") SELECT "address", "approved", "city", "contentScore", "createdAt", "description", "email", "equipment", "focusKeyword", "id", "isNew", "isPopular", "lastAnalyzed", "name", "ogImageUrl", "openingHours", "ownerId", "phone", "profileType", "rating", "readabilityScore", "reviewCount", "schemaMarkup", "secondaryKeywords", "seoDescription", "seoKeywords", "seoLastGenerated", "seoManualOverride", "seoQualityScore", "seoScore", "seoTitle", "slug", "updatedAt", "verified", "viewCount", "website" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE INDEX "Business_domain_idx" ON "Business"("domain");
CREATE INDEX "Business_domain_approved_idx" ON "Business"("domain", "approved");
CREATE INDEX "Business_city_idx" ON "Business"("city");
CREATE INDEX "Business_profileType_idx" ON "Business"("profileType");
CREATE INDEX "Business_slug_idx" ON "Business"("slug");
CREATE INDEX "Business_approved_idx" ON "Business"("approved");
CREATE INDEX "Business_verified_idx" ON "Business"("verified");
CREATE INDEX "Business_approved_verified_idx" ON "Business"("approved", "verified");
CREATE INDEX "Business_ownerId_idx" ON "Business"("ownerId");
CREATE INDEX "Business_rating_idx" ON "Business"("rating");
CREATE INDEX "Business_viewCount_idx" ON "Business"("viewCount");
CREATE INDEX "Business_createdAt_idx" ON "Business"("createdAt");
CREATE UNIQUE INDEX "Business_slug_domain_key" ON "Business"("slug", "domain");
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT NOT NULL DEFAULT 'erosko.cz',
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
    "waist" INTEGER,
    "hips" INTEGER,
    "hairColor" TEXT,
    "hairLength" TEXT,
    "eyeColor" TEXT,
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
INSERT INTO "new_Profile" ("address", "age", "ageCategory", "approved", "bodyType", "breastType", "businessId", "bust", "category", "city", "contentScore", "createdAt", "description", "email", "eyeColor", "focusKeyword", "hairColor", "hairLength", "height", "hips", "id", "isNew", "isOnline", "isPopular", "languages", "lastAnalyzed", "location", "name", "nationality", "offersEscort", "ogImageUrl", "openingHours", "orientation", "ownerId", "phone", "piercing", "privateContacts", "profileType", "pubicHair", "rating", "readabilityScore", "reviewCount", "role", "schemaMarkup", "secondaryKeywords", "seoActiveVariant", "seoDescription", "seoDescriptionA", "seoDescriptionB", "seoDescriptionC", "seoKeywords", "seoLastGenerated", "seoLastReviewed", "seoManualOverride", "seoQualityScore", "seoScore", "seoTitle", "seoVariantStats", "slug", "tattoos", "travels", "updatedAt", "verified", "viewCount", "waist", "weight") SELECT "address", "age", "ageCategory", "approved", "bodyType", "breastType", "businessId", "bust", "category", "city", "contentScore", "createdAt", "description", "email", "eyeColor", "focusKeyword", "hairColor", "hairLength", "height", "hips", "id", "isNew", "isOnline", "isPopular", "languages", "lastAnalyzed", "location", "name", "nationality", "offersEscort", "ogImageUrl", "openingHours", "orientation", "ownerId", "phone", "piercing", "privateContacts", "profileType", "pubicHair", "rating", "readabilityScore", "reviewCount", "role", "schemaMarkup", "secondaryKeywords", "seoActiveVariant", "seoDescription", "seoDescriptionA", "seoDescriptionB", "seoDescriptionC", "seoKeywords", "seoLastGenerated", "seoLastReviewed", "seoManualOverride", "seoQualityScore", "seoScore", "seoTitle", "seoVariantStats", "slug", "tattoos", "travels", "updatedAt", "verified", "viewCount", "waist", "weight" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE INDEX "Profile_domain_idx" ON "Profile"("domain");
CREATE INDEX "Profile_domain_approved_idx" ON "Profile"("domain", "approved");
CREATE INDEX "Profile_city_idx" ON "Profile"("city");
CREATE INDEX "Profile_category_idx" ON "Profile"("category");
CREATE INDEX "Profile_profileType_idx" ON "Profile"("profileType");
CREATE INDEX "Profile_slug_idx" ON "Profile"("slug");
CREATE INDEX "Profile_approved_idx" ON "Profile"("approved");
CREATE INDEX "Profile_verified_idx" ON "Profile"("verified");
CREATE INDEX "Profile_approved_verified_idx" ON "Profile"("approved", "verified");
CREATE INDEX "Profile_ownerId_idx" ON "Profile"("ownerId");
CREATE INDEX "Profile_rating_idx" ON "Profile"("rating");
CREATE INDEX "Profile_viewCount_idx" ON "Profile"("viewCount");
CREATE INDEX "Profile_createdAt_idx" ON "Profile"("createdAt");
CREATE UNIQUE INDEX "Profile_slug_domain_key" ON "Profile"("slug", "domain");
CREATE TABLE "new_StaticPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "domain" TEXT NOT NULL DEFAULT 'erosko.cz',
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
INSERT INTO "new_StaticPage" ("content", "contentScore", "createdAt", "focusKeyword", "h1", "id", "keywords", "lastAnalyzed", "ogImageUrl", "path", "published", "readabilityScore", "schemaMarkup", "secondaryKeywords", "seoDescription", "seoScore", "seoTitle", "type", "updatedAt", "viewCount") SELECT "content", "contentScore", "createdAt", "focusKeyword", "h1", "id", "keywords", "lastAnalyzed", "ogImageUrl", "path", "published", "readabilityScore", "schemaMarkup", "secondaryKeywords", "seoDescription", "seoScore", "seoTitle", "type", "updatedAt", "viewCount" FROM "StaticPage";
DROP TABLE "StaticPage";
ALTER TABLE "new_StaticPage" RENAME TO "StaticPage";
CREATE INDEX "StaticPage_domain_idx" ON "StaticPage"("domain");
CREATE INDEX "StaticPage_path_idx" ON "StaticPage"("path");
CREATE INDEX "StaticPage_type_idx" ON "StaticPage"("type");
CREATE INDEX "StaticPage_published_idx" ON "StaticPage"("published");
CREATE UNIQUE INDEX "StaticPage_path_domain_key" ON "StaticPage"("path", "domain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
