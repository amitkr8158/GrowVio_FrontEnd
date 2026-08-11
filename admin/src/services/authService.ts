import apiClient from '../lib/apiClient';

export type UserType = 'CONTENT_CREATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface LoginResponse {
  token: string;
  role: string;
  email: string;
}

export async function loginAdmin(email: string, password: string, userType: UserType): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/api/auth/login', { email, password, userType });
  return res.data;
}
