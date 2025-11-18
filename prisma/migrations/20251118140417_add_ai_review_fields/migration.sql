-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "authorName" TEXT,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "profileId" TEXT,
    "businessId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("authorId", "businessId", "comment", "createdAt", "id", "profileId", "rating", "updatedAt") SELECT "authorId", "businessId", "comment", "createdAt", "id", "profileId", "rating", "updatedAt" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_profileId_idx" ON "Review"("profileId");
CREATE INDEX "Review_businessId_idx" ON "Review"("businessId");
CREATE INDEX "Review_authorId_idx" ON "Review"("authorId");
CREATE INDEX "Review_rating_idx" ON "Review"("rating");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
