-- CreateIndex
CREATE INDEX "Business_rating_idx" ON "Business"("rating");

-- CreateIndex
CREATE INDEX "Business_viewCount_idx" ON "Business"("viewCount");

-- CreateIndex
CREATE INDEX "Business_createdAt_idx" ON "Business"("createdAt");

-- CreateIndex
CREATE INDEX "Profile_rating_idx" ON "Profile"("rating");

-- CreateIndex
CREATE INDEX "Profile_viewCount_idx" ON "Profile"("viewCount");

-- CreateIndex
CREATE INDEX "Profile_createdAt_idx" ON "Profile"("createdAt");
