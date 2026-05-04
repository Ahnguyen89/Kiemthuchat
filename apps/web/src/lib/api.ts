import type { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest, 
  VerifyEmailRequest,
  ResendVerificationRequest,
  AuthResponse,
  User,
  Flow,
  ApiKey,
  UserSettings,
  StreamRequest,
} from '@canvas-llm/shared';

class ApiClient {
  private baseURL: string;
  private getAuthToken: () => string | null;
  private isRefreshing: boolean;

  private normalizeApiBaseUrl(rawUrl?: string): string {
    const fallback = 'http://localhost:3001/api';
    const base = (rawUrl || fallback).replace(/\/$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }

  constructor() {
    this.baseURL = this.normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
    this.getAuthToken = () => {
      if (typeof window !== 'undefined') {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsed = JSON.parse(authData);
          return parsed.state?.accessToken || null;
        }
      }
      return null;
    };
    this.isRefreshing = false;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // If unauthorized, try refresh once then retry original request
      if (response.status === 401 && !this.isAuthEndpoint(endpoint)) {
        const retried = await this.tryHandleUnauthorizedAndRetry<T>(endpoint, options);
        return retried;
      }

      const data = await this.safeJson(response);
      if (!response.ok) {
        throw new Error((data as any)?.message || 'Request failed');
      }
      return data as ApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  private async safeJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  private readPersistedAuth(): any | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private writePersistedTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    const persisted = this.readPersistedAuth() || {};
    const state = {
      ...(persisted.state || {}),
      accessToken,
      refreshToken,
      isAuthenticated: true,
    };
    localStorage.setItem('auth-storage', JSON.stringify({ ...persisted, state }));
  }

  private clearAllStorageAndRedirect() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    // Hard redirect to ensure full app reset
    window.location.assign('/login');
  }

  private async performRefresh(): Promise<boolean> {
    if (this.isRefreshing) return false;
    this.isRefreshing = true;
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;
      const url = `${this.baseURL}/auth/refresh`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await this.safeJson(response);
      if (!response.ok) return false;
      const auth = data as any; // expecting AuthResponse shape
      if (auth?.data?.accessToken && auth?.data?.refreshToken) {
        this.writePersistedTokens(auth.data.accessToken, auth.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  private async tryHandleUnauthorizedAndRetry<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    // Attempt token refresh
    const refreshed = await this.performRefresh();
    if (!refreshed) {
      this.clearAllStorageAndRedirect();
      throw new Error('Unauthorized');
    }

    // Retry original request with new token
    const retryUrl = `${this.baseURL}${endpoint}`;
    const newToken = this.getAuthToken();
    const retryConfig: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(newToken && { Authorization: `Bearer ${newToken}` }),
        ...(options.headers || {}),
      },
    };
    const retryResponse = await fetch(retryUrl, retryConfig);
    if (retryResponse.status === 401) {
      this.clearAllStorageAndRedirect();
      throw new Error('Unauthorized');
    }
    const retryData = await this.safeJson(retryResponse);
    if (!retryResponse.ok) {
      throw new Error((retryData as any)?.message || 'Request failed');
    }
    return retryData as ApiResponse<T>;
  }

  private isAuthEndpoint(endpoint: string): boolean {
    return endpoint.startsWith('/auth/');
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const refreshToken = this.getRefreshToken();
    return this.request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.refreshToken || null;
      }
    }
    return null;
  }

  async verifyEmail(verifyData: VerifyEmailRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(verifyData),
    });
  }

  async resendVerification(
    resendData: ResendVerificationRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(resendData),
    });
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile');
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Settings endpoints
  async getSettings(): Promise<ApiResponse<UserSettings>> {
    return this.request<UserSettings>('/settings');
  }

  async addApiKey(apiKeyData: {
    provider: string;
    name: string;
    apiKey: string;
  }): Promise<ApiResponse<ApiKey>> {
    return this.request<ApiKey>('/settings/api-keys', {
      method: 'POST',
      body: JSON.stringify(apiKeyData),
    });
  }

  async updateApiKey(keyId: string, updates: Partial<ApiKey>): Promise<ApiResponse<ApiKey>> {
    return this.request<ApiKey>(`/settings/api-keys/${keyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteApiKey(keyId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/settings/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // Flow endpoints
  async getFlows(): Promise<ApiResponse<Flow[]>> {
    return this.request<Flow[]>('/flows');
  }

  async getFlow(flowId: string): Promise<ApiResponse<Flow>> {
    return this.request<Flow>(`/flows/${flowId}`);
  }

  async createFlow(flowData: { name: string; description?: string }): Promise<ApiResponse<Flow>> {
    return this.request<Flow>('/flows', {
      method: 'POST',
      body: JSON.stringify(flowData),
    });
  }

  async updateFlow(flowId: string, updates: Partial<Flow> & { isManualSave?: boolean }): Promise<ApiResponse<Flow>> {
    return this.request<Flow>(`/flows/${flowId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteFlow(flowId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/flows/${flowId}`, {
      method: 'DELETE',
    });
  }

  async generateShareLink(flowId: string, permission: 'VIEW' | 'EDIT' = 'EDIT'): Promise<ApiResponse<Flow>> {
    return this.request<Flow>(`/flows/${flowId}/share`, {
      method: 'POST',
      body: JSON.stringify({ permission }),
    });
  }

  async revokeShareLink(flowId: string): Promise<ApiResponse<Flow>> {
    return this.request<Flow>(`/flows/${flowId}/share`, {
      method: 'DELETE',
    });
  }

  async getSharedFlow(shareToken: string): Promise<ApiResponse<Flow>> {
    return this.request<Flow>(`/flows/shared/${shareToken}`, {
      method: 'GET',
    });
  }

  async updateSharedFlow(shareToken: string, updates: Partial<Flow> & { isManualSave?: boolean }): Promise<ApiResponse<Flow>> {
    return this.request<Flow>(`/flows/shared/${shareToken}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async generateText(
    provider: string,
    prompt: string,
    model?: string
  ): Promise<ApiResponse<{ success: boolean; data: string }>> {
    return await this.request<{ success: boolean; data: string }>('/llm/generate-text', {
      method: 'POST',
      body: JSON.stringify({ provider, prompt, model }),
    });
  }

  async streamText(
    provider: string,
    prompt: string,
    model?: string,
    onToken?: (token: string) => void,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    const url = `${this.baseURL}/llm/stream-text`;
    const token = this.getAuthToken();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ provider, prompt, model, history }),
    });
    if (!response.ok || !response.body) {
      throw new Error('Stream request failed');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onToken?.(chunk);
    }
    return full;
  }

  // Canvas Analysis endpoints
  async summarizeCanvas(flowId: string): Promise<ApiResponse<{ summary: string }>> {
    return this.request<{ summary: string }>(`/flows/${flowId}/summarize`, {
      method: 'POST',
    });
  }

  async askCanvasQuestion(flowId: string, question: string): Promise<ApiResponse<{ answer: string }>> {
    return this.request<{ answer: string }>(`/flows/${flowId}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  async generateCanvasEmbeddings(flowId: string): Promise<ApiResponse<{ embeddings: number[]; dimension: number }>> {
    return this.request<{ embeddings: number[]; dimension: number }>(`/flows/${flowId}/embeddings`, {
      method: 'POST',
    });
  }

  // Template Generation endpoints
  async generateTemplate(
    description: string,
    category?: string,
    nodeCount?: number
  ): Promise<ApiResponse<{ nodes: any[]; edges: any[] }>> {
    return this.request<{ nodes: any[]; edges: any[] }>('/flows/templates/generate', {
      method: 'POST',
      body: JSON.stringify({ description, category, nodeCount }),
    });
  }

  async generateTemplateSuggestions(description: string): Promise<ApiResponse<{ suggestions: string[] }>> {
    return this.request<{ suggestions: string[] }>('/flows/templates/suggestions', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  // Version Control endpoints
  async getFlowVersions(flowId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/flows/${flowId}/versions`);
  }

  async getFlowVersion(flowId: string, versionId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/flows/${flowId}/versions/${versionId}`);
  }

  async revertToVersion(flowId: string, versionId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/flows/${flowId}/revert/${versionId}`, {
      method: 'POST',
    });
  }

  async compareVersionWithCurrent(flowId: string, versionId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/flows/${flowId}/versions/${versionId}/compare`);
  }

  async compareVersions(flowId: string, versionId1: string, versionId2: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/flows/${flowId}/compare/${versionId1}/${versionId2}`);
  }

  async getFlowAuditLog(flowId: string, limit?: number, offset?: number): Promise<ApiResponse<{ logs: any[]; total: number }>> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ logs: any[]; total: number }>(`/flows/${flowId}/audit-log${query}`);
  }
}

export const apiClient = new ApiClient();
