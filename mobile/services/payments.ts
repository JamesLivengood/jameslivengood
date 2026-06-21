import api from './api';
import { Payment } from '../types';

export async function processPayment(payload: {
  amount: number;
  currency?: string;
  description?: string;
  mock_card_last4?: string;
}): Promise<Payment> {
  const { data } = await api.post('/payments/', payload);
  return data;
}

export async function getPayments(): Promise<Payment[]> {
  const { data } = await api.get('/payments/');
  return data;
}
