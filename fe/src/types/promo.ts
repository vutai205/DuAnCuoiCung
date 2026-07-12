export interface PromoCode {
  _id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface PromoValidation {
  valid: boolean;
  discount: number;
  finalPrice: number;
  promo: {
    code: string;
    title: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
  };
}
