'use client';

import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers?: Array<{ userName: string }>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  typingUsers = [],
}) => {
  // viewport ref so we can control the scrollable area inside ScrollArea
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // ✅ Auto scroll xuống cuối khi có tin nhắn mới
  // Trigger on messages.length and wait a tick so layout finishes.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const id = window.setTimeout(() => {
      try {
        vp.scrollTo({ top: vp.scrollHeight, behavior: 'smooth' });
      } catch (e) {
        // fallback: set scrollTop directly
        // @ts-ignore
        vp.scrollTop = vp.scrollHeight;
      }
    }, 30);

    return () => window.clearTimeout(id);
  }, [messages.length]);

  const getMessageStatus = (message: Message) => {
    if (message.senderId !== currentUserId) return null;

    const statuses = message.statuses || [];
    const hasSeen = statuses.some((s) => s.status === 'SEEN' && s.userId !== currentUserId);
    const hasDelivered = statuses.some((s) => s.status === 'DELIVERED' && s.userId !== currentUserId);

    if (hasSeen) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    }
    if (hasDelivered) {
      return <CheckCheck className="w-4 h-4 text-muted-foreground" />;
    }
    return <Check className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.senderId === currentUserId;
          const showAvatar =
            index === 0 || messages[index - 1].senderId !== message.senderId;

          return (
            <div
              key={message.id}
              className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}
            >
              {!isOwn && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                  <AvatarFallback>{message.sender.name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  'flex flex-col gap-1 max-w-[70%]',
                  isOwn ? 'items-end' : 'items-start'
                )}
              >
                {!isOwn && showAvatar && (
                  <span className="text-xs text-muted-foreground px-2">
                    {message.sender.name}
                  </span>
                )}

                <div
                  className={cn(
                    'rounded-lg px-4 py-2',
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                <div className="flex items-center gap-1 px-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </span>
                  {getMessageStatus(message)}
                </div>
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
            </div>
            <span>{typingUsers[0].userName} đang nhập...</span>
          </div>
        )}

        {/* anchor kept for layout stability (not used for scrolling now) */}
        <div />
      </div>
    </ScrollArea>
  );
};
