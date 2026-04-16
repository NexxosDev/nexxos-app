import api from './api';
import type { AuthResponse, User } from '../types';

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/auth/login', { email, password });
  return res?.data;
}

export async function signupApi(data: {
  email: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  documentId: string;
  role: string;
  vendor?: {
    businessName: string;
    rif: string;
    country?: string;
    city?: string;
    state?: string;
    municipality?: string;
    parish?: string;
    street?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    fullAddress?: string;
    referencePoint?: string;
    vehicleModelIds: string[];
    partSubcategoryIds: string[];
    documentImagePath?: string;
    logoPath?: string;
  };
}): Promise<AuthResponse> {
  const res = await api.post('/signup', data);
  return res?.data;
}

export async function getMeApi(): Promise<{ user: User }> {
  const res = await api.get('/auth/me');
  return res?.data;
}

export async function forgotPasswordApi(email: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post('/auth/forgot-password', { email });
  return res?.data;
}
