'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Users } from 'lucide-react';

interface CanvasUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  color: string;
}

interface CanvasUsersListProps {
  users: CanvasUser[];
  currentUserId: string;
}

export default function CanvasUsersList({ users, currentUserId }: CanvasUsersListProps) {
  // Deduplicate users by userId
  const uniqueUsers = users.filter((user, index, self) =>
    index === self.findIndex((u) => u.userId === user.userId)
  );
  
  const otherUsers = uniqueUsers.filter((u) => u.userId !== currentUserId);

  if (otherUsers.length === 0) return null;

  return (
    <Card className="fixed top-20 right-6 p-2 shadow-lg z-40 bg-background/95 backdrop-blur-sm">
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            {otherUsers.slice(0, 5).map((user) => (
              <Tooltip key={user.userId}>
                <TooltipTrigger>
                  <Avatar
                    className="h-8 w-8 border-2 border-background hover:z-10 transition-transform hover:scale-110"
                    style={{ borderColor: user.color }}
                  >
                    <AvatarImage src={user.userAvatar || `https://avatar.vercel.sh/${user.userId}`} />
                    <AvatarFallback
                      className="text-white text-xs font-medium"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.userName}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {otherUsers.length > 5 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                +{otherUsers.length - 5}
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </Card>
  );
}

