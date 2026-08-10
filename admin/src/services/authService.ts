import apiClient from '../lib/apiClient';

export interface LoginResponse {
  token: string;
  role: string;
  email: string;
}

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/api/auth/login', { email, password });
  return res.data;
}
