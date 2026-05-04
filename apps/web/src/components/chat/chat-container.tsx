'use client';

import React, { useEffect, useState } from 'react';
import { ChatList } from './chat-list';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';
import { InviteMembersModal } from './invite-members-modal';
import { useChatRoom } from '@/hooks/use-chat-room';
import type { ChatRoom, Message } from '@/types/chat';
import { chatApi } from '@/lib/chat-api';

interface ChatContainerProps {
  rooms: ChatRoom[];
  currentUserId: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ rooms, currentUserId }) => {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roomList, setRoomList] = useState<ChatRoom[]>(rooms);
  const [messages, setMessages] = useState<Message[]>([]);
  const { typingUsers, sendMessage, startTyping, stopTyping } = useChatRoom(selectedRoom?.id ?? null);

  // Refetch rooms after creating a new room
  const refetchRooms = async () => {
    const updatedRooms = await chatApi.getRooms();
    setRoomList(updatedRooms);
  };

  // When a room is selected, fetch its messages
  const handleSelectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    const msgs = await chatApi.getRoomMessages(room.id);
    setMessages(msgs);
  };

  // After creating a new room, refetch rooms and select the new room
  const handleRoomCreated = async (room: ChatRoom) => {
    await refetchRooms();
    await handleSelectRoom(room);
  };

  useEffect(() => {
    setRoomList(rooms);
  }, [rooms]);

  useEffect(() => {
    if (selectedRoom) {
      (async () => {
        const msgs = await chatApi.getRoomMessages(selectedRoom.id);
        setMessages(msgs);
      })();
    }
  }, [selectedRoom]);

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
          rooms={roomList}
          currentRoomId={selectedRoom?.id}
          onSelectRoom={handleSelectRoom}
          currentUserId={currentUserId}
          onRoomCreated={handleRoomCreated}
        />
      </div>

      {/* Khu vực chat */}
      <div className="flex-1 flex flex-col h-full">
        {selectedRoom ? (
          <>
            {/* Tiêu đề phòng */}
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold">
                {selectedRoom.type === 'GROUP'
                  ? selectedRoom.name
                  : selectedRoom.members.find((m) => m.userId !== currentUserId)?.user.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedRoom.members.length} thành viên
              </p>
              <div>
                <button className="ml-4 px-3 py-1 bg-primary text-white rounded" onClick={() => setInviteOpen(true)}>
                  Mời
                </button>
              </div>
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
              <InviteMembersModal roomId={selectedRoom.id} open={inviteOpen} onClose={() => setInviteOpen(false)} />
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

