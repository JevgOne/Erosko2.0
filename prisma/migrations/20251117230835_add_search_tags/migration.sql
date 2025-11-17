-- CreateTable
CREATE TABLE "SearchTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProfileSearchTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileSearchTag_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfileSearchTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "SearchTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchTag_slug_key" ON "SearchTag"("slug");

-- CreateIndex
CREATE INDEX "SearchTag_category_idx" ON "SearchTag"("category");

-- CreateIndex
CREATE INDEX "SearchTag_slug_idx" ON "SearchTag"("slug");

-- CreateIndex
CREATE INDEX "ProfileSearchTag_profileId_idx" ON "ProfileSearchTag"("profileId");

-- CreateIndex
CREATE INDEX "ProfileSearchTag_tagId_idx" ON "ProfileSearchTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSearchTag_profileId_tagId_key" ON "ProfileSearchTag"("profileId", "tagId");
