import api from './api';

export async function submitSuggestion(text: string): Promise<{ success: boolean }> {
  const res = await api.post('/suggestions', { text });
  return res?.data ?? { success: false };
}
