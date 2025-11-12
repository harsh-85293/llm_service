const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class APIClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const baseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const extraHeaders: Record<string, string> = options.headers
      ? Object.fromEntries(new Headers(options.headers as HeadersInit))
      : {};

    const headers: Record<string, string> = { ...baseHeaders, ...extraHeaders };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async signUp(email: string, password: string, name: string) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async signIn(email: string, password: string) {
    const data = await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async signOut() {
    await this.request('/auth/signout', { method: 'POST' });
    this.clearToken();
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async getTickets() {
    return this.request('/tickets');
  }

  async getTicket(id: string) {
    return this.request(`/tickets/${id}`);
  }

  async createTicket(data: { request_text: string; category?: string; priority?: string }) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTicket(id: string, data: Record<string, unknown>) {
    return this.request(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getTicketLogs(id: string) {
    return this.request(`/tickets/${id}/logs`);
  }

  async createLLMInteraction(ticketId: string, data: Record<string, unknown>) {
    return this.request(`/tickets/${ticketId}/llm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers() {
    return this.request('/users');
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }
}

export const api = new APIClient();
