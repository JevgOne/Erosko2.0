// Interactive script to download Firebase service account key
// Opens browser for manual login, then navigates to download the key

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🔥 FIREBASE SERVICE ACCOUNT KEY DOWNLOAD\n');
  console.log('📋 Instrukce:');
  console.log('1. Otevře se prohlížeč s Firebase Console');
  console.log('2. Přihlaš se Google účtem (pokud nejsi)');
  console.log('3. Vyber projekt "erosko-cz"');
  console.log('4. Stiskni ENTER až budeš na hlavní stránce projektu...\n');

  // Wait for user to press Enter
  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => resolve());
  });

  console.log('\n📂 Otevírám Firebase Console...');

  // Open Firebase Console in default browser
  const url = 'https://console.firebase.google.com/project/erosko-cz/settings/serviceaccounts/adminsdk';

  try {
    // macOS
    execSync(`open "${url}"`, { stdio: 'inherit' });
  } catch (error) {
    console.log(`\n🌐 Otevři tuto URL v prohlížeči:\n${url}`);
  }

  console.log('\n📋 Pokračuj v prohlížeči:');
  console.log('1. Na stránce "Service accounts" klikni na tlačítko "Generate new private key"');
  console.log('2. Potvrď stažení');
  console.log('3. JSON soubor se stáhne do složky Downloads');
  console.log('\n⏳ Stiskni ENTER až budeš mít soubor stažený...');

  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => resolve());
  });

  // Try to find the downloaded file in Downloads
  const downloadsDir = join(process.env.HOME || '', 'Downloads');
  const targetPath = join(__dirname, '../firebase-service-account.json');

  console.log('\n🔍 Hledám stažený soubor v Downloads...');

  // Look for files matching pattern
  const { readdirSync } = await import('fs');
  const files = readdirSync(downloadsDir)
    .filter(f => f.includes('erosko') && f.endsWith('.json'))
    .sort((a, b) => {
      const { statSync } = require('fs');
      const aTime = statSync(join(downloadsDir, a)).mtime.getTime();
      const bTime = statSync(join(downloadsDir, b)).mtime.getTime();
      return bTime - aTime; // Newest first
    });

  if (files.length === 0) {
    console.log('\n❌ Nenašel jsem soubor v Downloads.');
    console.log(`📋 Ručně přesuň stažený JSON soubor do:\n${targetPath}`);
    process.exit(1);
  }

  const sourceFile = join(downloadsDir, files[0]);
  console.log(`\n✅ Našel jsem: ${files[0]}`);

  // Copy to project directory
  const { copyFileSync } = await import('fs');
  copyFileSync(sourceFile, targetPath);

  console.log(`✅ Zkopírováno do: ${targetPath}`);

  // Read and display storage bucket name
  const { readFileSync } = await import('fs');
  const serviceAccount = JSON.parse(readFileSync(targetPath, 'utf-8'));
  const projectId = serviceAccount.project_id;
  const storageBucket = `${projectId}.firebasestorage.app`;

  console.log(`\n📊 Firebase konfigurace:`);
  console.log(`  Project ID: ${projectId}`);
  console.log(`  Storage Bucket: ${storageBucket}`);
  console.log(`  Email: ${serviceAccount.client_email}`);

  // Update .env file
  const envPath = join(__dirname, '../.env');
  let envContent = '';

  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
  }

  // Add Firebase config if not present
  if (!envContent.includes('FIREBASE_STORAGE_BUCKET')) {
    envContent += `\n# Firebase Admin SDK\n`;
    envContent += `FIREBASE_STORAGE_BUCKET="${storageBucket}"\n`;
    envContent += `FIREBASE_PROJECT_ID="${projectId}"\n`;

    const { writeFileSync } = await import('fs');
    writeFileSync(envPath, envContent);

    console.log(`\n✅ Přidáno do .env souboru!`);
  }

  console.log(`\n🎉 Hotovo! Můžeš spustit: npm run download:photos`);
}

main().catch(console.error);
