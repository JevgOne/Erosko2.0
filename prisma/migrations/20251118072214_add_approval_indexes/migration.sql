-- CreateIndex
CREATE INDEX "Business_approved_idx" ON "Business"("approved");

-- CreateIndex
CREATE INDEX "Business_verified_idx" ON "Business"("verified");

-- CreateIndex
CREATE INDEX "Business_approved_verified_idx" ON "Business"("approved", "verified");

-- CreateIndex
CREATE INDEX "Business_ownerId_idx" ON "Business"("ownerId");

-- CreateIndex
CREATE INDEX "Profile_approved_idx" ON "Profile"("approved");

-- CreateIndex
CREATE INDEX "Profile_verified_idx" ON "Profile"("verified");

-- CreateIndex
CREATE INDEX "Profile_approved_verified_idx" ON "Profile"("approved", "verified");

-- CreateIndex
CREATE INDEX "Profile_ownerId_idx" ON "Profile"("ownerId");
