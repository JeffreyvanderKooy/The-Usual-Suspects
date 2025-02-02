export const API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://usual-suspects.onrender.com';
export const HEADER_DELAY_MS = 1000;
