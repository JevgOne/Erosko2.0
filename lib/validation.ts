/**
 * Validation utilities for forms
 */

/**
 * Validates Czech phone number
 * Accepts formats: +420123456789, 420123456789, 123456789, +420 123 456 789
 * SIMPLIFIED for launch - accepts any non-empty number
 */
export function validatePhoneNumber(phone: string): { valid: boolean; message?: string } {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, message: 'Telefonní číslo je povinné' };
  }

  // SIMPLIFIED: Just check if it has at least 6 digits
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const hasDigits = /\d{6,}/.test(cleaned);

  if (!hasDigits) {
    return {
      valid: false,
      message: 'Zadejte platné telefonní číslo (min. 6 číslic)',
    };
  }

  return { valid: true };
}

/**
 * Validates email address
 * UPDATED: Email is now REQUIRED for login
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email je povinný' }; // Email is REQUIRED
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return {
      valid: false,
      message: 'Neplatná emailová adresa',
    };
  }

  return { valid: true };
}

/**
 * Validates password strength
 * SECURITY: Enforces strong password policy (min 12 chars, complexity required)
 */
export function validatePassword(password: string): { valid: boolean; message?: string; strength?: 'weak' | 'medium' | 'strong' } {
  if (!password || password.length === 0) {
    return { valid: false, message: 'Heslo je povinné' };
  }

  if (password.length < 12) {
    return {
      valid: false,
      message: 'Heslo musí mít alespoň 12 znaků',
      strength: 'weak',
    };
  }

  // Check password complexity
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  const complexityCount = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (complexityCount < 3) {
    return {
      valid: false,
      message: 'Heslo musí obsahovat alespoň 3 z následujících: malá písmena, velká písmena, čísla, speciální znaky (@$!%*?&)',
      strength: 'weak',
    };
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'medium';
  if (password.length >= 16 && complexityCount === 4) {
    strength = 'strong';
  } else if (password.length >= 12 && complexityCount >= 3) {
    strength = 'medium';
  }

  return { valid: true, strength };
}

/**
 * Validates age (must be 18+)
 */
export function validateAge(age: number | string): { valid: boolean; message?: string } {
  const ageNum = typeof age === 'string' ? parseInt(age) : age;

  if (isNaN(ageNum)) {
    return { valid: false, message: 'Zadejte platný věk' };
  }

  if (ageNum < 18) {
    return {
      valid: false,
      message: 'Musíte být starší 18 let',
    };
  }

  if (ageNum > 99) {
    return {
      valid: false,
      message: 'Zadejte platný věk',
    };
  }

  return { valid: true };
}

/**
 * Validates image file
 */
export function validateImageFile(file: File): { valid: boolean; message?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Neplatný formát. Použijte JPG, PNG nebo WEBP',
    };
  }

  // Check HEIC explicitly (sometimes has wrong MIME type)
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'heic' || extension === 'heif') {
    return {
      valid: false,
      message: 'HEIC formát není podporován. Na iPhone: Nastavení → Fotoaparát → Formáty → "Nejvíce kompatibilní"',
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      message: `Fotka je příliš velká (${sizeMB}MB). Maximum je 5MB`,
    };
  }

  return { valid: true };
}

/**
 * Validates business name (min 3 chars, max 50 chars)
 */
export function validateBusinessName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Název podniku je povinný' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 3) {
    return {
      valid: false,
      message: 'Název musí mít alespoň 3 znaky',
    };
  }

  if (trimmed.length > 50) {
    return {
      valid: false,
      message: 'Název může mít maximálně 50 znaků',
    };
  }

  return { valid: true };
}

/**
 * Validates profile name (min 2 chars, max 30 chars)
 */
export function validateProfileName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Jméno je povinné' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return {
      valid: false,
      message: 'Jméno musí mít alespoň 2 znaky',
    };
  }

  if (trimmed.length > 30) {
    return {
      valid: false,
      message: 'Jméno může mít maximálně 30 znaků',
    };
  }

  return { valid: true };
}
