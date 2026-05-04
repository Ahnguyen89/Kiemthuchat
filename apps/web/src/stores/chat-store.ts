import { create } from 'zustand';
import type { ChatRoom, Message, TypingUser } from '@/types/chat';

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Record<string, Message[]>;
  typingUsers: TypingUser[];
  onlineUsers: Set<string>;

  // Actions
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (room: ChatRoom | null) => void;
  addMessage: (roomId: string, message: Message) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  addTypingUser: (user: TypingUser) => void;
  removeTypingUser: (userId: string, roomId: string) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  updateMessageStatus: (
    messageId: string,
    userId: string,
    status: 'SENT' | 'DELIVERED' | 'SEEN'
  ) => void;
  moveRoomToTop: (roomId: string, lastMessage?: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  currentRoom: null,
  messages: {},
  typingUsers: [],
  onlineUsers: new Set(),

  setRooms: (rooms) => set({ rooms }),

  setCurrentRoom: (room) => set({ currentRoom: room }),

  addMessage: (roomId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), message],
      },
    })),

  setMessages: (roomId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: messages,
      },
    })),

  addTypingUser: (user) =>
    set((state) => ({
      typingUsers: [...state.typingUsers.filter((u) => u.userId !== user.userId), user],
    })),

  removeTypingUser: (userId, roomId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter(
        (u) => u.userId !== userId || u.chatRoomId !== roomId
      ),
    })),

  setUserOnline: (userId) =>
    set((state) => ({
      onlineUsers: (() => {
        const s = new Set(state.onlineUsers);
        s.add(userId);
        return s;
      })(),
    })),

  setUserOffline: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    }),

  updateMessageStatus: (messageId, userId, status) =>
    set((state) => {
      const newMessages = { ...state.messages };
      Object.keys(newMessages).forEach((roomId) => {
        newMessages[roomId] = newMessages[roomId].map((msg) => {
          if (msg.id === messageId) {
            const existingStatus = msg.statuses.find((s) => s.userId === userId);
            if (existingStatus) {
              return {
                ...msg,
                statuses: msg.statuses.map((s) =>
                  s.userId === userId ? { ...s, status, timestamp: new Date() } : s
                ),
              };
            } else {
              return {
                ...msg,
                statuses: [
                  ...msg.statuses,
                  { id: '', messageId, userId, status, timestamp: new Date() },
                ],
              };
            }
          }
          return msg;
        });
      });
      return { messages: newMessages };
    }),

  //  push chat into top when new message arrives
  moveRoomToTop: (roomId, lastMessage) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex((r) => r.id === roomId);
      if (roomIndex === -1) return state;

      const updatedRoom = {
        ...state.rooms[roomIndex],
        messages: lastMessage
          ? [lastMessage, ...(state.rooms[roomIndex].messages || [])]
          : state.rooms[roomIndex].messages,
      };

      const newRooms = [updatedRoom, ...state.rooms.filter((r) => r.id !== roomId)];

      return { rooms: newRooms };
    }),
}));
