/**
 * Placeholder API client. Replace these methods with real backend calls.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = {
  baseUrl: API_BASE_URL,
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) throw new Error(`GET ${path} failed`);
    return response.json() as Promise<T>;
  },
  async post<T>(path: string, payload: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`POST ${path} failed`);
    return response.json() as Promise<T>;
  }
};
