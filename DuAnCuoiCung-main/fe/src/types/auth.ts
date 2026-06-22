export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
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
