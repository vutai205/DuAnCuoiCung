export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  gender?: string;
  address?: string;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}
