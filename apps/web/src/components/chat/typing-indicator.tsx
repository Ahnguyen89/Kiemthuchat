'use client';

import React from 'react';
import type { TypingUser } from '@/types/chat';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserId: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, currentUserId }) => {
  const otherTypingUsers = typingUsers.filter(user => user.userId !== currentUserId);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].userName} đang nhập...`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0].userName} và ${otherTypingUsers[1].userName} đang nhập...`;
    } else {
      return `${otherTypingUsers[0].userName} và ${otherTypingUsers.length - 1} người khác đang nhập...`;
    }
  };

  return (
    <div className="px-4 py-1 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="flex gap-1">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
        </span>
        {getTypingText()}
      </div>
    </div>
  );
};