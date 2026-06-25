/**
 * API base URL for the price-tracker backend.
 *
 * Reads from the Vite build-time env var VITE_API_BASE_URL.
 * Set this in `.env` (dev) and your CI/CD environment (production).
 * Defaults to localhost for local development.
 */
export const API_BASE_URL =
  typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3001'
    : 'http://localhost:3001';
