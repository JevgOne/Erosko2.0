// Delete the auto-created admin user
import { createClient } from '@libsql/client';

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://erosko20-jevgone.aws-ap-south-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3OTM3Nzc2MTYsImlhdCI6MTc2MjI0MTYxNiwiaWQiOiI5MGFkNTVhOC1mMGFhLTRiN2ItOTUxMS03OTNmMjUwM2RiZTMiLCJyaWQiOiI4NzM4NGM0ZC04NmFmLTRiY2ItYTA1Yi0wNDhlYmYzNjc5NjkifQ.wkZTCd5lEu43JGXT-yha08LSaQkez_EuHd-DPJaSAZH25ayspPRkf5GvZPeC5Byeoi5E_Trd0FXUqqxCeLoeDA';

const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

async function deleteAutoAdmin() {
  console.log('🗑️  Deleting auto-created admin user...\n');

  // Delete admin with phone +420999999999
  const result = await turso.execute("DELETE FROM User WHERE phone = '+420999999999'");

  console.log(`✅ Deleted ${result.rowsAffected} user(s)\n`);

  // Show remaining users
  const users = await turso.execute("SELECT phone, email, role FROM User");
  console.log(`📊 Remaining users: ${users.rows.length}`);
  users.rows.forEach(user => {
    console.log(`  - ${user.phone} (${user.role})`);
  });
}

deleteAutoAdmin()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
