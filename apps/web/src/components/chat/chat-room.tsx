'use client';

import React from 'react';
import { ChatList } from './chat-list';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';
import { useChatRoom } from '@/hooks/use-chat-room';
import type { ChatRoom as ChatRoomType, Message } from '@/types/chat';

interface ChatRoomProps {
  rooms: ChatRoomType[];
  currentUserId: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ rooms, currentUserId }) => {
  const [selectedRoom, setSelectedRoom] = React.useState<ChatRoomType | null>(null);
  const { messages, typingUsers, sendMessage, startTyping, stopTyping } = useChatRoom(
    selectedRoom?.id ?? null
  );

  const handleSelectRoom = (room: ChatRoomType) => {
    setSelectedRoom(room);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedRoom) return;
    sendMessage(content);
  };

  const handleTypingStart = () => {
    if (!selectedRoom) return;
    startTyping();
  };

  const handleTypingStop = () => {
    if (!selectedRoom) return;
    stopTyping();
  };

  return (
    <div className="flex h-full">
      {/* Danh sách phòng chat */}
      <div className="w-80 border-r">
        <ChatList
          rooms={rooms}
          currentRoomId={selectedRoom?.id}
          onSelectRoom={handleSelectRoom}
          currentUserId={currentUserId}
        />
      </div>

      {/* Khu vực chat */}
      <div className="flex-1 flex flex-col h-full">
        {selectedRoom ? (
          <>
            {/* Tiêu đề phòng */}
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold">
                {selectedRoom.type === 'GROUP'
                  ? selectedRoom.name
                  : selectedRoom.members.find((m) => m.userId !== currentUserId)?.user.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedRoom.members.length} thành viên
              </p>
            </div>

            {/* Danh sách tin nhắn */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
              />
            </div>

            {/* Typing indicator */}
            <TypingIndicator
              typingUsers={typingUsers}
              currentUserId={currentUserId}
            />

            {/* Input nhắn tin */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Chọn một phòng chat để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
};