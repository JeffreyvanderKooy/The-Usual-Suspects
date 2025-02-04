export const API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://usual-suspects.onrender.com';
export const HEADER_DELAY_MS = 1000;

export const RAID_DATA = {
  blackwing_lair: { banned: [] },
  emerald_sanctum: { banned: [] },
  molten_core: { banned: [] },
  ahn_qiraj: { banned: ["C'Thun"] },
};
