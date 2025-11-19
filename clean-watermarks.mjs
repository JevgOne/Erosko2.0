#!/usr/bin/env node

/**
 * Clean watermarks from already downloaded photos
 * Re-process all images in scraped-businesses/photos/
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHOTOS_DIR = path.join(__dirname, 'scraped-businesses', 'photos');

/**
 * Clean watermark from a single image
 */
async function cleanWatermark(filepath) {
  try {
    const image = sharp(filepath);
    const metadata = await image.metadata();

    console.log(`Processing: ${path.basename(filepath)} (${metadata.width}x${metadata.height})`);

    // Backup original
    const backupPath = filepath.replace('.jpg', '.original.jpg');
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filepath, backupPath);
    }

    // Remove watermark by cropping
    // dobryprivat.cz watermark is typically in bottom 10-15% and right 2-5%
    const cropHeight = Math.floor(metadata.height * 0.88); // Remove bottom 12%
    const cropWidth = Math.floor(metadata.width * 0.98); // Remove right 2%

    const tempPath = filepath.replace('.jpg', '-temp.jpg');

    await image
      .extract({
        left: 0,
        top: 0,
        width: cropWidth,
        height: cropHeight
      })
      // Very light blur to soften edges
      .blur(0.3)
      // Sharpen to restore detail
      .sharpen()
      // Enhance quality
      .jpeg({ quality: 95 })
      .toFile(tempPath);

    // Replace original with cleaned version
    fs.unlinkSync(filepath);
    fs.renameSync(tempPath, filepath);

    console.log(`✅ Cleaned: ${path.basename(filepath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error cleaning ${path.basename(filepath)}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🧹 Cleaning watermarks from photos...\n');

  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error('❌ Photos directory not found:', PHOTOS_DIR);
    console.error('   Run scraper first: node scrape-dobryprivat.mjs');
    process.exit(1);
  }

  // Get all .jpg files
  const files = fs.readdirSync(PHOTOS_DIR)
    .filter(f => f.endsWith('.jpg') && !f.includes('.original.'))
    .map(f => path.join(PHOTOS_DIR, f));

  console.log(`Found ${files.length} images to process\n`);

  if (files.length === 0) {
    console.log('No images to process!');
    process.exit(0);
  }

  // Process all images
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    console.log(`\n[${i + 1}/${files.length}]`);
    const success = await cleanWatermark(files[i]);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successfully cleaned: ${successCount} images`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount} images`);
  }
  console.log('💾 Originals backed up with .original.jpg extension');
  console.log('='.repeat(50));
}

main().catch(console.error);
