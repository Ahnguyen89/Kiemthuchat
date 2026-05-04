'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ChatRoom } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { CreateGroupModal } from './create-group-modal';

interface ChatListProps {
  rooms: ChatRoom[];
  currentRoomId?: string;
  onSelectRoom: (room: ChatRoom) => void;
  currentUserId: string;
  onRoomCreated?: (room: ChatRoom) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  rooms,
  currentRoomId,
  onSelectRoom,
  currentUserId,
  onRoomCreated,
}) => {
  const getRoomName = (room: ChatRoom) => {
    if (room.type === 'GROUP') {
      return room.name || 'Nhóm chat';
    }
    // Direct chat - lấy tên của user kia
    const otherMember = room.members.find((m) => m.userId !== currentUserId);
    return otherMember?.user.name || 'Unknown';
  };

  const getRoomAvatar = (room: ChatRoom) => {
    if (room.type === 'GROUP') {
      return undefined;
    }
    const otherMember = room.members.find((m) => m.userId !== currentUserId);
    return otherMember?.user.avatar;
  };

  const getLastMessage = (room: ChatRoom) => {
    if (room.messages && room.messages.length > 0) {
      return room.messages[0];
    }
    return null;
  };

  const isOnline = (room: ChatRoom) => {
    if (room.type === 'GROUP') return false;
    const otherMember = room.members.find((m) => m.userId !== currentUserId);
    return otherMember?.isOnline || false;
  };

  const [createOpen, setCreateOpen] = useState(false);
  const handleCreated = (room: ChatRoom) => {
    if (onRoomCreated) {
      onRoomCreated(room);
    } else {
      onSelectRoom(room);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        <button
          className="w-full mb-2 px-3 py-2 bg-primary text-white rounded hover:bg-primary/90"
          onClick={() => setCreateOpen(true)}
        >
          + Tạo nhóm
        </button>
        <CreateGroupModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
          currentUserId={currentUserId}
        />
  {rooms.map((room) => {
          const lastMessage = getLastMessage(room);
          const roomName = getRoomName(room);
          const roomAvatar = getRoomAvatar(room);
          const online = isOnline(room);

          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left',
                currentRoomId === room.id && 'bg-accent'
              )}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={roomAvatar} alt={roomName} />
                  <AvatarFallback>{roomName[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                {online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">{roomName}</h3>
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(lastMessage.createdAt), {
                        addSuffix: false,
                      })}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage.sender.name}: {lastMessage.content}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};