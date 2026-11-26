import { Language } from '../types';

export interface RegisterValidationInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  existingEmails: string[];
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
  acceptedPrivacy?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FULL_NAME_ALLOWED_REGEX = /^[\p{L}\s'-]+$/u;
const HAS_LETTER_REGEX = /\p{L}/u;

export function validateFullName(name: string, lang: Language = 'en'): string | undefined {
  const trimmedName = name.trim();
  if (trimmedName.length < 3) {
    return lang === 'id'
      ? 'Nama lengkap minimal 3 karakter.'
      : 'Full name must be at least 3 characters.';
  }
  if (trimmedName.length > 100) {
    return lang === 'id'
      ? 'Nama lengkap maksimal 100 karakter.'
      : 'Full name must be 100 characters or fewer.';
  }
  if (!FULL_NAME_ALLOWED_REGEX.test(trimmedName) || !HAS_LETTER_REGEX.test(trimmedName)) {
    return lang === 'id'
      ? 'Nama hanya boleh berisi huruf, spasi, tanda hubung (-), atau apostrof (\').'
      : 'Name may only contain letters, spaces, hyphens, or apostrophes.';
  }
  return undefined;
}

export function validateEmailAddress(
  email: string,
  existingEmails: string[] = [],
  lang: Language = 'en'
): string | undefined {
  const trimmed = email.trim();
  const normalizedEmail = trimmed.toLowerCase();
  if (!trimmed || /\s/.test(trimmed) || !EMAIL_REGEX.test(normalizedEmail)) {
    return lang === 'id'
      ? 'Masukkan alamat email yang valid tanpa spasi.'
      : 'Please enter a valid email address without spaces.';
  }
  if (existingEmails.some((e) => e.toLowerCase() === normalizedEmail)) {
    return lang === 'id'
      ? 'Email ini sudah terdaftar pada akun lain.'
      : 'This email is already registered.';
  }
  return undefined;
}

export function validatePasswordRule(password: string, lang: Language = 'en'): string | undefined {
  if (/\s/.test(password)) {
    return lang === 'id'
      ? 'Kata sandi tidak boleh mengandung spasi.'
      : 'Password must not contain spaces.';
  }
  if (password.length > 128) {
    return lang === 'id'
      ? 'Kata sandi maksimal 128 karakter.'
      : 'Password must be 128 characters or fewer.';
  }
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  if (password.length < 8 || !hasLowercase || !hasDigit) {
    return lang === 'id'
      ? 'Kata sandi minimal 8 karakter dan mengandung huruf kecil serta angka.'
      : 'Password must be at least 8 characters with at least one lowercase letter and one digit.';
  }
  return undefined;
}

export function validateRegistration(
  input: RegisterValidationInput,
  lang: Language = 'en'
): ValidationErrors {
  const errors: ValidationErrors = {};

  const nameError = validateFullName(input.name, lang);
  if (nameError) errors.name = nameError;

  const emailError = validateEmailAddress(input.email, input.existingEmails, lang);
  if (emailError) errors.email = emailError;

  const passwordError = validatePasswordRule(input.password, lang);
  if (passwordError) errors.password = passwordError;

  if (!input.confirmPassword || input.confirmPassword !== input.password) {
    errors.confirmPassword =
      lang === 'id' ? 'Konfirmasi kata sandi tidak cocok.' : 'Passwords do not match.';
  }

  if (!input.acceptedTerms) {
    errors.acceptedTerms =
      lang === 'id'
        ? 'Anda wajib menyetujui Ketentuan Layanan.'
        : 'You must accept the Terms and Conditions.';
  }

  if (!input.acceptedPrivacy) {
    errors.acceptedPrivacy =
      lang === 'id'
        ? 'Anda wajib memahami Kebijakan Privasi.'
        : 'You must acknowledge the Privacy Policy.';
  }

  return errors;
}

export function validateLogin(
  email: string,
  password: string,
  lang: Language = 'en'
): { email?: string; password?: string } {
  const errors: { email?: string; password?: string } = {};
  const emailError = validateEmailAddress(email, [], lang);
  if (emailError) errors.email = emailError;

  if (!password || password.length < 8 || /\s/.test(password)) {
    errors.password =
      lang === 'id'
        ? 'Kata sandi minimal 8 karakter tanpa spasi.'
        : 'Password must be at least 8 characters with no spaces.';
  }
  return errors;
}
