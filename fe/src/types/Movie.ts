export interface Movie {
  _id?: string;
  title: string;
  description: string;
  duration: number;
  genre?: string;
  genres?: string[];
  format?: string;
  language?: string;
  releaseDate: string;
  poster: string;
  trailer?: string;
  status?: 'now_showing' | 'coming_soon' | 'ended' | boolean;
}
