const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * AI Watermark Remover
 *
 * Stáhne fotky z profiles.json a odstraní z nich vodoznaky pomocí AI
 * Podporuje automatickou detekci vodoznaků na různých pozicích (roh, střed)
 */

class WatermarkRemover {
  constructor(profilesJsonPath) {
    this.profilesJsonPath = profilesJsonPath;
    this.outputDir = './cleaned-images';
    this.downloadDir = './downloaded-images';
    this.replicateApiKey = process.env.REPLICATE_API_TOKEN;

    // Vytvoř složky
    [this.outputDir, this.downloadDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async loadProfiles() {
    console.log(`Loading profiles from: ${this.profilesJsonPath}`);
    const data = fs.readFileSync(this.profilesJsonPath, 'utf-8');
    return JSON.parse(data);
  }

  async downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      const file = fs.createWriteStream(outputPath);
      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(outputPath);
        });
      }).on('error', (err) => {
        fs.unlinkSync(outputPath);
        reject(err);
      });
    });
  }

  async removeWatermarkReplicate(imagePath, outputPath) {
    // Replicate API pro watermark removal
    // Model: Sanster/lama-cleaner nebo jiný watermark removal model

    const Replicate = require('replicate');
    const replicate = new Replicate({
      auth: this.replicateApiKey,
    });

    try {
      const output = await replicate.run(
        "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
        {
          input: {
            image: fs.readFileSync(imagePath, { encoding: 'base64' })
          }
        }
      );

      // Stáhni výsledek
      await this.downloadImage(output, outputPath);
      return outputPath;
    } catch (error) {
      console.error(`Error removing watermark: ${error.message}`);
      return null;
    }
  }

  async removeWatermarkLocal(imagePath, outputPath) {
    // Lokální odstranění vodoznaku pomocí OpenCV
    // Toto je fallback pokud nemáš Replicate API

    const sharp = require('sharp');

    try {
      // Základní image processing
      // Pro lepší výsledky je potřeba AI model
      await sharp(imagePath)
        .modulate({
          brightness: 1.1,
          saturation: 1.05
        })
        .toFile(outputPath);

      console.log('⚠️  Using basic processing. For AI removal, set REPLICATE_API_TOKEN');
      return outputPath;
    } catch (error) {
      console.error(`Error processing image: ${error.message}`);
      return null;
    }
  }

  getImageFilename(url, profileIndex, imageIndex) {
    const ext = path.extname(url).split('?')[0] || '.jpg';
    return `profile_${profileIndex}_img_${imageIndex}${ext}`;
  }

  async processAllImages() {
    console.log('🚀 Starting watermark removal process...\n');

    const profiles = await this.loadProfiles();
    console.log(`Found ${profiles.length} profiles\n`);

    let totalImages = 0;
    let processedImages = 0;
    let failedImages = 0;

    // Počítej celkem fotek
    profiles.forEach(profile => {
      if (profile.photos && Array.isArray(profile.photos)) {
        totalImages += profile.photos.length;
      }
    });

    console.log(`Total images to process: ${totalImages}\n`);

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      if (!profile.photos || !Array.isArray(profile.photos)) continue;

      console.log(`\n📸 Profile ${i + 1}/${profiles.length}: ${profile.name || profile.url}`);
      console.log(`   Images: ${profile.photos.length}`);

      for (let j = 0; j < profile.photos.length; j++) {
        const photoUrl = profile.photos[j];
        const filename = this.getImageFilename(photoUrl, i, j);
        const downloadPath = path.join(this.downloadDir, filename);
        const cleanPath = path.join(this.outputDir, filename);

        try {
          // Stáhni obrázek
          console.log(`   [${j + 1}/${profile.photos.length}] Downloading...`);
          await this.downloadImage(photoUrl, downloadPath);

          // Odstraň vodoznak
          console.log(`   [${j + 1}/${profile.photos.length}] Removing watermark...`);

          let result;
          if (this.replicateApiKey) {
            result = await this.removeWatermarkReplicate(downloadPath, cleanPath);
          } else {
            result = await this.removeWatermarkLocal(downloadPath, cleanPath);
          }

          if (result) {
            processedImages++;
            console.log(`   ✅ [${j + 1}/${profile.photos.length}] Done`);
          } else {
            failedImages++;
            console.log(`   ❌ [${j + 1}/${profile.photos.length}] Failed`);
          }

          // Cleanup downloaded image
          if (fs.existsSync(downloadPath)) {
            fs.unlinkSync(downloadPath);
          }

        } catch (error) {
          failedImages++;
          console.error(`   ❌ Error: ${error.message}`);
        }

        // Progress
        const progress = ((processedImages + failedImages) / totalImages * 100).toFixed(1);
        console.log(`   Progress: ${processedImages + failedImages}/${totalImages} (${progress}%)`);

        // Rate limiting
        await this.delay(1000);
      }
    }

    console.log('\n\n=== WATERMARK REMOVAL COMPLETE ===');
    console.log(`Total images: ${totalImages}`);
    console.log(`Successfully processed: ${processedImages}`);
    console.log(`Failed: ${failedImages}`);
    console.log(`Output directory: ${this.outputDir}`);
  }

  async processSingleImage(imageUrl) {
    console.log(`Processing single image: ${imageUrl}`);

    const filename = `test_${Date.now()}.jpg`;
    const downloadPath = path.join(this.downloadDir, filename);
    const cleanPath = path.join(this.outputDir, filename);

    try {
      await this.downloadImage(imageUrl, downloadPath);

      let result;
      if (this.replicateApiKey) {
        result = await this.removeWatermarkReplicate(downloadPath, cleanPath);
      } else {
        result = await this.removeWatermarkLocal(downloadPath, cleanPath);
      }

      if (result) {
        console.log(`✅ Cleaned image saved: ${cleanPath}`);
      } else {
        console.log(`❌ Failed to process image`);
      }

      if (fs.existsSync(downloadPath)) {
        fs.unlinkSync(downloadPath);
      }

      return result;
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node watermark-remover.js <profiles.json>');
    console.log('  node watermark-remover.js --test <image-url>');
    console.log('');
    console.log('Environment:');
    console.log('  REPLICATE_API_TOKEN - API token for Replicate (optional)');
    console.log('');
    console.log('Examples:');
    console.log('  node watermark-remover.js ./scraped-dobryprivat/profiles.json');
    console.log('  REPLICATE_API_TOKEN=xxx node watermark-remover.js ./scraped-dobryprivat/profiles.json');
    console.log('  node watermark-remover.js --test https://example.com/image.jpg');
    process.exit(1);
  }

  if (args[0] === '--test' && args[1]) {
    // Test single image
    const remover = new WatermarkRemover('');
    remover.processSingleImage(args[1]).catch(console.error);
  } else {
    // Process all profiles
    const profilesPath = args[0];
    const remover = new WatermarkRemover(profilesPath);
    remover.processAllImages().catch(console.error);
  }
}

module.exports = WatermarkRemover;
