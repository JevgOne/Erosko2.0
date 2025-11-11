// Quick fix: Approve all imported profiles
import { createClient } from '@libsql/client';

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://erosko20-jevgone.aws-ap-south-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3OTM3Nzc2MTYsImlhdCI6MTc2MjI0MTYxNiwiaWQiOiI5MGFkNTVhOC1mMGFhLTRiN2ItOTUxMS03OTNmMjUwM2RiZTMiLCJyaWQiOiI4NzM4NGM0ZC04NmFmLTRiY2ItYTA1Yi0wNDhlYmYzNjc5NjkifQ.wkZTCd5lEu43JGXT-yha08LSaQkez_EuHd-DPJaSAZH25ayspPRkf5GvZPeC5Byeoi5E_Trd0FXUqqxCeLoeDA';

const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

async function approveAllProfiles() {
  console.log('🔧 Approving all profiles in Turso...\n');

  // Update all profiles to be approved
  const result = await turso.execute('UPDATE Profile SET approved = 1, verified = 1');

  console.log(`✅ Updated profiles: ${result.rowsAffected} rows\n`);

  // Check count of approved profiles
  const count = await turso.execute('SELECT COUNT(*) as count FROM Profile WHERE approved = 1');
  console.log(`📊 Total approved profiles: ${count.rows[0].count}\n`);
}

approveAllProfiles()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
