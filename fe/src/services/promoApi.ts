import { apiClient } from './apiClient';
import type { PromoCode, PromoValidation } from '../types/promo';

export const getActivePromos = async (): Promise<PromoCode[]> => {
  const { data } = await apiClient.get<PromoCode[]>('/api/promos');
  return data;
};

export const validatePromo = async (code: string, orderTotal: number): Promise<PromoValidation> => {
  const { data } = await apiClient.post<PromoValidation>('/api/promos/validate', {
    code,
    orderTotal,
  });
  return data;
};
