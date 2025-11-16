// Delete all profiles and related data
import prisma from '../lib/prisma';

async function deleteAllProfiles() {
  console.log('🗑️  Deleting all profiles and related data...\n');

  try {
    // Delete in order (child tables first, then parent)

    // 1. Delete ProfileService connections
    const deletedServices = await prisma.profileService.deleteMany({});
    console.log(`✅ Deleted ${deletedServices.count} profile-service connections`);

    // 2. Delete Favorites
    const deletedFavorites = await prisma.favorite.deleteMany({});
    console.log(`✅ Deleted ${deletedFavorites.count} favorites`);

    // 3. Delete Reviews for profiles
    const deletedReviews = await prisma.review.deleteMany({
      where: { profileId: { not: null } }
    });
    console.log(`✅ Deleted ${deletedReviews.count} reviews`);

    // 4. Delete Pending Changes for profiles
    const deletedPendingChanges = await prisma.pendingChange.deleteMany({
      where: { profileId: { not: null } }
    });
    console.log(`✅ Deleted ${deletedPendingChanges.count} pending changes`);

    // 5. Delete Photos for profiles
    const deletedPhotos = await prisma.photo.deleteMany({
      where: { profileId: { not: null } }
    });
    console.log(`✅ Deleted ${deletedPhotos.count} photos`);

    // 6. Finally delete all Profiles
    const deletedProfiles = await prisma.profile.deleteMany({});
    console.log(`✅ Deleted ${deletedProfiles.count} profiles`);

    console.log('\n📊 Database cleaned successfully!');
    console.log('\n✅ All profiles and related data have been removed.');

  } catch (error) {
    console.error('❌ Error deleting profiles:', error);
    throw error;
  }
}

deleteAllProfiles()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
