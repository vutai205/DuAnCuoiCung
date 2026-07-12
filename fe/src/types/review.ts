export interface Review {
  _id: string;
  movie: string;
  user: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewStats {
  total: number;
  average: number;
  distribution: Record<number, number>;
}

export interface MovieReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
}
