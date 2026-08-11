import apiClient from '../lib/apiClient';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'CONTENT_CREATOR' | 'USER';
  plan?: 'FREE' | 'STARTER' | 'PREMIUM' | 'PRO';
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/api/auth/login', { email, password });
  return res.data;
}
