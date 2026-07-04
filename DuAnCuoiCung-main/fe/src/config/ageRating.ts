import type { AgeRating } from '../types/movie';
export interface AgeRatingInfo {
  code: AgeRating;
  label: string;
  description: string;
  color: string;
}
export const AGE_RATINGS: AgeRatingInfo[] = [
  { code: 'P', label: 'P', description: 'Pho bien den moi do tuoi', color: '#2e7d32' },
  { code: 'K', label: 'K', description: 'Duoi 13 tuoi xem cung cha me/nguoi giam ho', color: '#558b2f' },
  { code: 'T13', label: 'T13', description: 'Danh cho khan gia tu du 13 tuoi (13+)', color: '#f9a825' },
  { code: 'T16', label: 'T16', description: 'Danh cho khan gia tu du 16 tuoi (16+)', color: '#ef6c00' },
  { code: 'T18', label: 'T18', description: 'Danh cho khan gia tu du 18 tuoi (18+)', color: '#c62828' },
  { code: 'C', label: 'C', description: 'Phim khong duoc phep pho bien', color: '#424242' },
];
export const AGE_RATING_MAP: Record<AgeRating, AgeRatingInfo> = AGE_RATINGS.reduce(
  (acc, info) => {
    acc[info.code] = info;
    return acc;
  },
  {} as Record<AgeRating, AgeRatingInfo>
);
