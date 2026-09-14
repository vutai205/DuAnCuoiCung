import axios from 'axios';
import type {
  AuthUser,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  LoginPayload,
  RegisterPayload,
} from '../types/auth';

const api = axios.create({
  baseURL: '/api/auth',
  headers: { 'Content-Type': 'application/json' },
});

export const login = async (payload: LoginPayload): Promise<AuthUser> => {
  const { data } = await api.post<AuthUser>('/login', payload);
  return data;
};

export const register = async (payload: RegisterPayload): Promise<AuthUser> => {
  const { data } = await api.post<AuthUser>('/register', payload);
  return data;
};

export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>('/forgot-password', payload);
  return data;
};

export const resetPassword = async (
  payload: ResetPasswordPayload
): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>('/reset-password', payload);
  return data;
};

export const saveAuthUser = (user: AuthUser): void => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', user.token);
};

export const getAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const getToken = (): string => {
  return localStorage.getItem('token') || '';
};

export const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};
