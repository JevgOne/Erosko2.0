import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * Ukládá base64 fotku do souborového systému
 * @param base64String - Base64 string fotky (data:image/jpeg;base64,...)
 * @param folder - Složka kam uložit (např. 'profiles', 'businesses')
 * @returns URL cesta k fotce (např. '/uploads/profiles/xyz.jpg')
 */
export async function saveBase64Photo(base64String: string, folder: string): Promise<string> {
  try {
    // Kontrola, zda je base64String validní
    if (!base64String || typeof base64String !== 'string') {
      throw new Error('Invalid base64 string: empty or not a string');
    }

    // Kontrola velikosti (max 10MB base64 string)
    if (base64String.length > 15 * 1024 * 1024) {
      throw new Error('Base64 string too large (max 10MB)');
    }

    // Extrahovat mime type a base64 data
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Určit příponu souboru
    const extension = mimeType.split('/')[1] || 'jpg';

    // Vygenerovat unikátní název souboru
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Cesta k upload složce
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

    // Vytvořit složku pokud neexistuje
    await mkdir(uploadDir, { recursive: true });

    // Cesta k souboru
    const filePath = path.join(uploadDir, filename);

    // Převést base64 na buffer a uložit
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(filePath, buffer);

    // Vrátit URL cestu
    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    console.error('Error saving photo:', error);
    throw new Error('Failed to save photo');
  }
}
