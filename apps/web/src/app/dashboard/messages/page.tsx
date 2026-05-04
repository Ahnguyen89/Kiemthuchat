'use client';

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { useChatStore } from '@/stores/chat-store';
import { chatApi } from '@/lib/chat-api';
import { useAuth } from '@/hooks/use-auth';
import { ChatList } from '@/components/chat/chat-list';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Users, Loader2 } from 'lucide-react';
import type { User } from '@/types/chat';

export default function ChatPage() {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const {
    rooms,
    currentRoom,
    messages,
    typingUsers,
    setRooms,
    setCurrentRoom,
    addMessage,
    setMessages,
    addTypingUser,
    removeTypingUser,
    setUserOnline,
    setUserOffline,
    updateMessageStatus,
    moveRoomToTop
  } = useChatStore();

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);

  // Load danh sách phòng chat
  useEffect(() => {
    if (user) {
      loadRooms();
      loadAvailableUsers();
    }
  }, [user]);

  // Setup WebSocket listeners
  useEffect(() => {
    if (!socket || !user) return;

    // Nhận tin nhắn mới
    socket.on('message:new', (message) => {
      addMessage(message.chatRoomId, message);
        // Đẩy phòng chat lên đầu danh sách khi có tin nhắn mới
        moveRoomToTop(message.chatRoomId, message);
    });

    // Cập nhật trạng thái tin nhắn
    socket.on('message:status:update', ({ messageId, userId, status }) => {
      updateMessageStatus(messageId, userId, status);
    });

    // User online/offline
    socket.on('user:online', ({ userId }) => {
      setUserOnline(userId);
    });

    socket.on('user:offline', ({ userId }) => {
      setUserOffline(userId);
    });

    // Typing indicators
    socket.on('typing:start', ({ userId, userName, chatRoomId }) => {
      if (userId !== user.id) {
        addTypingUser({ userId, userName, chatRoomId });
      }
    });

    socket.on('typing:stop', ({ userId, chatRoomId }) => {
      removeTypingUser(userId, chatRoomId);
    });

    return () => {
      socket.off('message:new');
      socket.off('message:status:update');
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('typing:start');
      socket.off('typing:stop');
    };
  }, [socket, user]);

  // Load messages khi chọn phòng
  useEffect(() => {
    if (currentRoom && user) {
      loadMessages(currentRoom.id);
      
      // Join room qua WebSocket
      if (socket) {
        socket.emit('room:join', { chatRoomId: currentRoom.id });
      }
    }
  }, [currentRoom?.id, socket]);

  const loadRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const data = await chatApi.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      setIsLoadingMessages(true);
      const data = await chatApi.getRoomMessages(roomId);
      setMessages(roomId, data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const data = await chatApi.getAvailableUsers();
      setAvailableUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!currentRoom || !socket || !user) return;

    socket.emit('message:send', {
      chatRoomId: currentRoom.id,
      content,
      type: 'TEXT',
    });
  };

  const handleTypingStart = () => {
    if (!currentRoom || !socket || !user) return;

    socket.emit('typing:start', {
      chatRoomId: currentRoom.id,
      userName: user.name,
    });
  };

  const handleTypingStop = () => {
    if (!currentRoom || !socket) return;

    socket.emit('typing:stop', {
      chatRoomId: currentRoom.id,
    });
  };

  const handleCreateDirectChat = async (otherUser: User) => {
    try {
      const room = await chatApi.createRoom({
        type: 'DIRECT',
        memberIds: [otherUser.id],
      });
      
      setRooms([room, ...rooms]);
      setCurrentRoom(room);
      setIsNewChatDialogOpen(false);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const currentRoomMessages = currentRoom ? messages[currentRoom.id] || [] : [];
  const currentRoomTypingUsers = typingUsers.filter(
    (t) => t.chatRoomId === currentRoom?.id
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Vui lòng đăng nhập để sử dụng chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar - Danh sách phòng chat */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Tin nhắn</h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Plus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo cuộc trò chuyện mới</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {availableUsers.map((availableUser) => (
                      <button
                        key={availableUser.id}
                        onClick={() => handleCreateDirectChat(availableUser)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <Avatar>
                          <AvatarImage src={availableUser.avatar} alt={availableUser.name} />
                          <AvatarFallback>
                            {availableUser.name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-medium">{availableUser.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {availableUser.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoadingRooms ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <ChatList
            rooms={rooms}
            currentRoomId={currentRoom?.id}
            onSelectRoom={setCurrentRoom}
            currentUserId={user.id}
          />
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={
                    currentRoom.type === 'DIRECT'
                      ? currentRoom.members.find((m) => m.userId !== user.id)?.user.avatar
                      : undefined
                  }
                  alt={currentRoom.name || ''}
                />
                <AvatarFallback>
                  {currentRoom.type === 'DIRECT'
                    ? currentRoom.members.find((m) => m.userId !== user.id)?.user.name[0]?.toUpperCase()
                    : <Users className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {currentRoom.type === 'DIRECT'
                    ? currentRoom.members.find((m) => m.userId !== user.id)?.user.name
                    : currentRoom.name || 'Nhóm chat'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentRoom.members.length} thành viên
                </p>
              </div>
            </div>

            {/* Messages */}
            {isLoadingMessages ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <MessageList
                messages={currentRoomMessages}
                currentUserId={user.id}
                typingUsers={currentRoomTypingUsers}
              />
            )}

            {/* Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
              disabled={!isConnected}
            />
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
              <p className="text-muted-foreground">
                Chọn một cuộc trò chuyện từ danh sách hoặc tạo mới
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
