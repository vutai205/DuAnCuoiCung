export type AgeRating = 'P' | 'K' | 'T13' | 'T16' | 'T18' | 'C';
export interface Movie {
  _id: string;
  title: string;
  description: string;
  duration: number;
  poster?: string;
  genre: string;
  releaseDate: string;
  ageRating: AgeRating;
}
export interface MovieFilters {
  ageRating?: AgeRating | '';
  viewerAge?: number | '';
}
