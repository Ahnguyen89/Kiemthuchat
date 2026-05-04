import type { ChatRoom, Message, User } from '../types/chat';

class ChatApiClient {
  private baseURL: string;
  private getAuthToken: () => string | null;

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
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Tạo phòng chat
  async createRoom(data: { name?: string; type: 'DIRECT' | 'GROUP'; memberIds: string[] }) {
    return this.request<ChatRoom>('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Lấy danh sách phòng chat
  async getRooms() {
    return this.request<ChatRoom[]>('/chat/rooms');
  }

  // Lấy chi tiết phòng
  async getRoom(roomId: string) {
    return this.request<ChatRoom>(`/chat/rooms/${roomId}`);
  }

  // Lấy tin nhắn trong phòng
  async getRoomMessages(roomId: string, page = 1, limit = 50) {
    return this.request<Message[]>(`/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
  }

  // Gửi tin nhắn (REST fallback)
  async sendMessage(data: {
    chatRoomId: string;
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) {
    return this.request<Message>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Lấy danh sách users
  async getAvailableUsers() {
    return this.request<User[]>('/chat/users');
  }

  // Thêm thành viên vào phòng (REST)
  async addRoomMembers(roomId: string, userIds: string[]) {
    return this.request<ChatRoom>(`/chat/rooms/${roomId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  }
}

export const chatApi = new ChatApiClient();
