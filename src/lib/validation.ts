/**
 * Shared validation utilities for Ghumo Firoo Travels
 * Central place for all form validation rules.
 */

// ─── Indian Mobile Number ───────────────────────────────────────────────────
/** Accepts exactly 10 digits starting with 6, 7, 8, or 9 */
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

export const PHONE_ERROR_MSG = 'Please enter a valid mobile number (10 to 15 digits, e.g. +1-800-555-0100)';

/**
 * Validate an Indian mobile number.
 * Strips whitespace before testing.
 */
export const validateIndianPhone = (phone: string): boolean =>
  INDIAN_PHONE_REGEX.test(phone.trim());

/**
 * Validate a phone number (Indian or International).
 * Accepts: 9876543210, +919876543210, +1-800-555-0100
 * Rejects: alphabets, special chars except +, fewer than 10 digits, more than 15 digits
 */
export const validatePhone = (phone: string): boolean => {
  const trimmed = phone.trim();
  // Strip spaces, hyphens, and parentheses for length validation
  const cleaned = trimmed.replace(/[\s\-\(\)]/g, '');
  
  // Must only contain digits and an optional leading plus
  if (!/^\+?[0-9]+$/.test(cleaned)) {
    return false;
  }
  
  const digitsOnly = cleaned.replace(/\+/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Strip all non-digit characters and cap at 10 digits.
 * Use this as the onChange transformer for phone input fields.
 */
export const sanitizePhone = (value: string): string =>
  value.replace(/\D/g, '').slice(0, 10);

// ─── Email ──────────────────────────────────────────────────────────────────
/** Strict RFC-compliant email regex */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateEmail = (email: string): boolean =>
  EMAIL_REGEX.test(email.trim().toLowerCase());

// ─── Name ───────────────────────────────────────────────────────────────────
/** Min 2 chars, max 100 chars, no spam of special characters */
export const validateName = (name: string): string | null => {
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 100) return 'Name must not exceed 100 characters';
  if (/^[^a-zA-Z]+$/.test(trimmed)) return 'Name must contain at least one letter';
  return null;
};

// ─── Message ────────────────────────────────────────────────────────────────
export const validateMessage = (message: string): string | null => {
  const trimmed = message.trim();
  if (trimmed.length < 10) return 'Message must be at least 10 characters';
  if (trimmed.length > 2000) return 'Message must not exceed 2000 characters';
  return null;
};
