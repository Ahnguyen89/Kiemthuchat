import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/socket-context';
import type { Message, ChatRoom, TypingUser } from '@/types/chat';

export function useChatRoom(roomId: string | null) {
  const {socket} = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Xử lý tin nhắn mới
    const handleNewMessage = (message: Message) => {
      if (message.chatRoomId === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    // Xử lý typing
    const handleTypingUpdate = (user: TypingUser) => {
      if (user.chatRoomId === roomId) {
        setTypingUsers((prev) => {
          const exists = prev.some((u) => u.userId === user.userId);
          if (!exists) {
            return [...prev, user];
          }
          return prev;
        });
      }
    };

    const handleTypingStop = ({ userId, chatRoomId }: { userId: string; chatRoomId: string }) => {
      if (chatRoomId === roomId) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
      }
    };

    // Xử lý thành viên mới tham gia
    const handleMemberJoined = ({
      roomId: updatedRoomId,
      member,
    }: {
      roomId: string;
      member: any;
    }) => {
      if (updatedRoomId === roomId) {
        // TODO: Update room members list
        console.log('Member joined:', member);
      }
    };

    // Xử lý thành viên rời phòng
    const handleMemberLeft = ({
      roomId: updatedRoomId,
      userId,
    }: {
      roomId: string;
      userId: string;
    }) => {
      if (updatedRoomId === roomId) {
        // TODO: Update room members list
        console.log('Member left:', userId);
      }
    };

    // Subscribe to events
    socket.on('message:new', handleNewMessage);
    socket.on('typing:update', handleTypingUpdate);
    socket.on('typing:stop', handleTypingStop);
    socket.on('room:member_joined', handleMemberJoined);
    socket.on('room:member_left', handleMemberLeft);

    // Join room
    socket.emit('room:join', { roomId }, (response: any) => {
      if (response.error) {
        setError(response.error);
      }
    });

    // Cleanup
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:update', handleTypingUpdate);
      socket.off('typing:stop', handleTypingStop);
      socket.off('room:member_joined', handleMemberJoined);
      socket.off('room:member_left', handleMemberLeft);

      // Leave room
      socket.emit('room:leave', { roomId });
    };
  }, [socket, roomId]);

  const sendMessage = (content: string) => {
    if (!socket || !roomId) return;
    socket.emit('message:send', { chatRoomId: roomId, content });
  };

  const startTyping = () => {
    if (!socket || !roomId) return;
    socket.emit('typing:start', { chatRoomId: roomId });
  };

  const stopTyping = () => {
    if (!socket || !roomId) return;
    socket.emit('typing:stop', { chatRoomId: roomId });
  };

  return {
    messages,
    typingUsers,
    error,
    sendMessage,
    startTyping,
    stopTyping,
  };
}
