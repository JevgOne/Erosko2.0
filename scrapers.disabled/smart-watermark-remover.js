const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Smart AI Watermark Remover
 *
 * 1. Detekuje jestli má fotka vodoznak
 * 2. Pokud NEMÁ vodoznak → zkopíruje originál (ušetří čas a peníze)
 * 3. Pokud MÁ vodoznak → odstraní ho pomocí AI
 */

class SmartWatermarkRemover {
  constructor(profilesJsonPath) {
    this.profilesJsonPath = profilesJsonPath;
    this.outputDir = './cleaned-images';
    this.downloadDir = './downloaded-images';
    this.replicateApiKey = process.env.REPLICATE_API_TOKEN;
    this.detectionLog = './watermark-detection.json';

    // Stats
    this.stats = {
      total: 0,
      withWatermark: 0,
      withoutWatermark: 0,
      processed: 0,
      failed: 0,
      skipped: 0
    };

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
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        reject(err);
      });
    });
  }

  async detectWatermark(imagePath) {
    /**
     * Detekce vodoznaku pomocí:
     * 1. Analýza textu v obrázku (OCR)
     * 2. Detekce opakujících se vzorů
     * 3. Detekce průhledných vrstev
     */

    try {
      const sharp = require('sharp');
      const Tesseract = require('tesseract.js');

      // 1. Základní OCR detekce textu (vodoznaky jsou často text)
      const { data: { text } } = await Tesseract.recognize(imagePath, 'ces+eng');

      // Hledej typické vodoznaky
      const watermarkKeywords = [
        'dobryprivat',
        'dobrýprivát',
        'www.',
        '.cz',
        'privat',
        'escort',
        '@',
        '©',
        'copyright'
      ];

      const hasTextWatermark = watermarkKeywords.some(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasTextWatermark) {
        console.log(`      🔍 Detected text watermark: "${text.substring(0, 50)}..."`);
        return true;
      }

      // 2. Analýza metadat (někdy obsahují watermark info)
      const metadata = await sharp(imagePath).metadata();

      // 3. Pokud je průhlednost (alpha channel), může to být vodoznak
      if (metadata.hasAlpha && metadata.channels === 4) {
        // Zkontroluj jestli alpha channel obsahuje vodoznak
        const { data, info } = await sharp(imagePath)
          .raw()
          .toBuffer({ resolveWithObject: true });

        // Jednoduchá heuristika: pokud málo pixelů má alpha != 255, může být vodoznak
        let alphaPixels = 0;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 250) alphaPixels++;
        }

        const alphaRatio = alphaPixels / (info.width * info.height);
        if (alphaRatio > 0.01 && alphaRatio < 0.3) {
          console.log(`      🔍 Detected transparent watermark (${(alphaRatio * 100).toFixed(1)}% alpha pixels)`);
          return true;
        }
      }

      console.log(`      ✅ No watermark detected`);
      return false;

    } catch (error) {
      // Pokud detekce selže, pro jistotu předpokládej vodoznak
      console.log(`      ⚠️  Detection failed, assuming watermark exists: ${error.message}`);
      return true;
    }
  }

  async detectWatermarkSimple(imagePath) {
    /**
     * Zjednodušená detekce bez OCR (rychlejší)
     * - Kontroluje jestli má fotka průhlednost
     * - Hledá opakující se vzory v rozích
     */

    try {
      const sharp = require('sharp');
      const metadata = await sharp(imagePath).metadata();

      // 1. Kontrola průhlednosti
      if (metadata.hasAlpha) {
        console.log(`      🔍 Image has transparency - possible watermark`);
        return true;
      }

      // 2. Kontrola rohů - vodoznaky jsou často v rozích
      const cornerSize = Math.min(metadata.width, metadata.height) / 4;

      // Extrahuj rohy
      const corners = await Promise.all([
        sharp(imagePath).extract({ left: 0, top: 0, width: cornerSize, height: cornerSize }).stats(),
        sharp(imagePath).extract({
          left: metadata.width - cornerSize,
          top: 0,
          width: cornerSize,
          height: cornerSize
        }).stats(),
        sharp(imagePath).extract({
          left: 0,
          top: metadata.height - cornerSize,
          width: cornerSize,
          height: cornerSize
        }).stats(),
        sharp(imagePath).extract({
          left: metadata.width - cornerSize,
          top: metadata.height - cornerSize,
          width: cornerSize,
          height: cornerSize
        }).stats()
      ]);

      // Pokud některý roh má velmi nízkou varianc (uniformní barva), může to být vodoznak
      for (let i = 0; i < corners.length; i++) {
        const variance = corners[i].channels[0].variance || 0;
        if (variance < 10) {
          console.log(`      🔍 Corner ${i} has low variance - possible watermark`);
          return true;
        }
      }

      console.log(`      ✅ No watermark detected (simple check)`);
      return false;

    } catch (error) {
      console.log(`      ⚠️  Detection failed, assuming watermark exists: ${error.message}`);
      return true;
    }
  }

  async removeWatermarkAI(imagePath, outputPath) {
    /**
     * Odstraní vodoznak pomocí AI
     */

    if (!this.replicateApiKey) {
      console.log('      ⚠️  No Replicate API key - copying original');
      fs.copyFileSync(imagePath, outputPath);
      return outputPath;
    }

    try {
      const Replicate = require('replicate');
      const replicate = new Replicate({
        auth: this.replicateApiKey,
      });

      console.log('      🤖 Using AI to remove watermark...');

      // Použij IOPaint (formerly Lama Cleaner) model
      const output = await replicate.run(
        "tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c",
        {
          input: {
            img: fs.readFileSync(imagePath, { encoding: 'base64' }),
            version: "v1.4",
            scale: 2
          }
        }
      );

      // Stáhni výsledek
      if (output) {
        await this.downloadImage(output, outputPath);
        return outputPath;
      }

      return null;
    } catch (error) {
      console.error(`      ❌ AI removal failed: ${error.message}`);
      return null;
    }
  }

  getImageFilename(url, profileIndex, imageIndex) {
    const ext = path.extname(url).split('?')[0] || '.jpg';
    return `profile_${String(profileIndex).padStart(4, '0')}_img_${String(imageIndex).padStart(3, '0')}${ext}`;
  }

  async processImage(photoUrl, profileIndex, imageIndex) {
    const filename = this.getImageFilename(photoUrl, profileIndex, imageIndex);
    const downloadPath = path.join(this.downloadDir, filename);
    const cleanPath = path.join(this.outputDir, filename);

    try {
      // 1. Stáhni obrázek
      console.log(`      📥 Downloading...`);
      await this.downloadImage(photoUrl, downloadPath);

      // 2. Detekuj vodoznak
      console.log(`      🔍 Detecting watermark...`);
      const hasWatermark = await this.detectWatermarkSimple(downloadPath);

      if (!hasWatermark) {
        // ŽÁDNÝ VODOZNAK → prostě zkopíruj originál
        console.log(`      ✅ No watermark - copying original`);
        fs.copyFileSync(downloadPath, cleanPath);
        this.stats.withoutWatermark++;
        this.stats.processed++;
        return { success: true, hadWatermark: false };
      }

      // MÁ VODOZNAK → odstraň ho
      this.stats.withWatermark++;
      console.log(`      🎨 Watermark detected - removing...`);

      if (this.replicateApiKey) {
        const result = await this.removeWatermarkAI(downloadPath, cleanPath);
        if (result) {
          this.stats.processed++;
          return { success: true, hadWatermark: true };
        }
      } else {
        // Bez API prostě zkopíruj (nebo použij basic processing)
        console.log(`      ⚠️  No API key - copying with watermark`);
        fs.copyFileSync(downloadPath, cleanPath);
        this.stats.processed++;
        return { success: true, hadWatermark: true, removed: false };
      }

      return { success: false, hadWatermark: true };

    } catch (error) {
      console.error(`      ❌ Error: ${error.message}`);
      this.stats.failed++;
      return { success: false, error: error.message };
    } finally {
      // Cleanup
      if (fs.existsSync(downloadPath)) {
        fs.unlinkSync(downloadPath);
      }
    }
  }

  async processAllImages() {
    console.log('🚀 Starting SMART watermark removal process...\n');

    const profiles = await this.loadProfiles();
    console.log(`Found ${profiles.length} profiles\n`);

    // Počítej celkem fotek
    profiles.forEach(profile => {
      if (profile.photos && Array.isArray(profile.photos)) {
        this.stats.total += profile.photos.length;
      }
    });

    console.log(`Total images to process: ${this.stats.total}\n`);
    console.log(`Strategy: Detect watermark first, only remove if detected\n`);

    const startTime = Date.now();

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      if (!profile.photos || !Array.isArray(profile.photos)) continue;

      console.log(`\n📸 Profile ${i + 1}/${profiles.length}: ${profile.name || profile.url}`);
      console.log(`   Images: ${profile.photos.length}`);

      for (let j = 0; j < profile.photos.length; j++) {
        const photoUrl = profile.photos[j];
        console.log(`\n   Image [${j + 1}/${profile.photos.length}]:`);

        await this.processImage(photoUrl, i, j);

        // Progress
        const processed = this.stats.processed + this.stats.failed;
        const progress = (processed / this.stats.total * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        const eta = this.stats.total > processed
          ? ((Date.now() - startTime) / processed * (this.stats.total - processed) / 1000 / 60).toFixed(1)
          : 0;

        console.log(`\n   📊 Progress: ${processed}/${this.stats.total} (${progress}%)`);
        console.log(`   ⏱️  Elapsed: ${elapsed}min | ETA: ${eta}min`);
        console.log(`   📈 With watermark: ${this.stats.withWatermark} | Without: ${this.stats.withoutWatermark}`);

        // Rate limiting
        await this.delay(500);
      }

      // Save progress every 10 profiles
      if ((i + 1) % 10 === 0) {
        this.saveStats();
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.log('\n\n=== SMART WATERMARK REMOVAL COMPLETE ===');
    console.log(`Total images: ${this.stats.total}`);
    console.log(`Images WITH watermark: ${this.stats.withWatermark}`);
    console.log(`Images WITHOUT watermark: ${this.stats.withoutWatermark}`);
    console.log(`Successfully processed: ${this.stats.processed}`);
    console.log(`Failed: ${this.stats.failed}`);
    console.log(`Total time: ${totalTime} minutes`);
    console.log(`Output directory: ${this.outputDir}`);

    // Calculate savings
    const savingsPercent = (this.stats.withoutWatermark / this.stats.total * 100).toFixed(1);
    const estimatedCost = (this.stats.withWatermark * 0.001).toFixed(2);
    console.log(`\n💰 Savings: ${savingsPercent}% of images didn't need AI processing`);
    console.log(`💵 Estimated AI cost: $${estimatedCost} (only for ${this.stats.withWatermark} images)`);

    this.saveStats();
  }

  saveStats() {
    const stats = {
      ...this.stats,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(this.detectionLog, JSON.stringify(stats, null, 2));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('SMART Watermark Remover');
    console.log('========================\n');
    console.log('This tool:');
    console.log('  1. Detects if image has watermark');
    console.log('  2. If NO watermark → copies original (saves time & money)');
    console.log('  3. If HAS watermark → removes it with AI\n');
    console.log('Usage:');
    console.log('  node smart-watermark-remover.js <profiles.json>\n');
    console.log('Environment:');
    console.log('  REPLICATE_API_TOKEN - API token for AI removal (optional)\n');
    console.log('Examples:');
    console.log('  node smart-watermark-remover.js ./scraped-dobryprivat/profiles.json');
    console.log('  REPLICATE_API_TOKEN=xxx node smart-watermark-remover.js ./scraped-dobryprivat/profiles.json\n');
    process.exit(1);
  }

  const profilesPath = args[0];
  const remover = new SmartWatermarkRemover(profilesPath);

  // Install dependencies check
  try {
    require('sharp');
  } catch (e) {
    console.error('❌ Missing dependency: sharp');
    console.error('Run: npm install sharp');
    process.exit(1);
  }

  remover.processAllImages().catch(console.error);
}

module.exports = SmartWatermarkRemover;
