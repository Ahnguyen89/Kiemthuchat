'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';

interface CanvasUser {
  userId: string;
  userName: string;
  color: string;
  cursor?: { x: number; y: number };
}

interface CanvasCursorsProps {
  users: CanvasUser[];
}

export default function CanvasCursors({ users }: CanvasCursorsProps) {
  const { user: currentUser } = useAuth();
  
  // Deduplicate users by userId and filter out current user
  const uniqueUsers = users.filter((user, index, self) =>
    index === self.findIndex((u) => u.userId === user.userId) &&
    user.userId !== currentUser?.id // Don't show own cursor
  );
  
  return (
    <>
      {uniqueUsers.map((user) => {
        if (!user.cursor) return null;

        return (
          <motion.div
            key={user.userId}
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: user.cursor.x,
              top: user.cursor.y,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Cursor SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
              }}
            >
              <path
                d="M5.65376 12.3673L2.68239 3.12258C2.37134 2.22554 3.22554 1.37134 4.12258 1.68239L13.3673 4.65376C14.3047 4.97626 14.6747 6.15214 14.0346 6.99111L10.1753 11.8529C9.98043 12.1047 9.9 12.4251 9.95314 12.7361L10.7522 16.9981C10.8854 17.6964 10.0999 18.2265 9.48681 17.8383L5.77308 15.5622C5.49789 15.3919 5.16343 15.3521 4.85614 15.4531L0.896532 16.7774C0.177955 17.0164 -0.309031 16.2226 0.107069 15.5911L3.85263 10.1544C4.0851 9.82175 4.15242 9.40032 4.03428 9.01047L2.60113 4.3695"
                fill={user.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>

            {/* User name label */}
            <div
              className="ml-5 mt-1 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
              style={{
                backgroundColor: user.color,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {user.userName}
            </div>
          </motion.div>
        );
      })}
    </>
  );
}

