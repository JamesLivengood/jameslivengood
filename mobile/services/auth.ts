import * as storage from './storage';
import api from './api';
import { User } from '../types';

async function saveToken(token: string) {
  await storage.setItem('auth_token', token);
}

export async function createGuestAccount(): Promise<{ user: User; token: string }> {
  const { data } = await api.post('/auth/guest');
  await saveToken(data.access_token);
  return { user: data.user, token: data.access_token };
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const form = new FormData();
  form.append('username', email);
  form.append('password', password);
  const { data } = await api.post('/auth/login', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  await saveToken(data.access_token);
  return { user: data.user, token: data.access_token };
}

export async function register(payload: {
  email: string;
  username: string;
  full_name: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const { data } = await api.post('/auth/register', payload);
  await saveToken(data.access_token);
  return { user: data.user, token: data.access_token };
}

export async function claimGuestAccount(payload: {
  email: string;
  username: string;
  full_name: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const { data } = await api.post('/auth/claim', payload);
  await saveToken(data.access_token);
  return { user: data.user, token: data.access_token };
}

export async function logout(): Promise<void> {
  await storage.deleteItem('auth_token');
}

export async function getStoredToken(): Promise<string | null> {
  return storage.getItem('auth_token');
}
