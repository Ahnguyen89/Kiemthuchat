'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';

interface CanvasUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  selectedNodeId?: string;
}

interface CanvasCollaborationContextType {
  socket: Socket | null;
  isConnected: boolean;
  users: CanvasUser[];
  joinCanvas: (canvasId: string) => void;
  leaveCanvas: () => void;
  emitCursorMove: (x: number, y: number) => void;
  emitNodeUpdate: (nodeId: string, changes: any) => void;
  emitNodeSelect: (nodeId: string | null) => void;
  emitNodesChanged: (nodes: any[], edges: any[]) => void;
}

const CanvasCollaborationContext = createContext<CanvasCollaborationContextType>({
  socket: null,
  isConnected: false,
  users: [],
  joinCanvas: () => {},
  leaveCanvas: () => {},
  emitCursorMove: () => {},
  emitNodeUpdate: () => {},
  emitNodeSelect: () => {},
  emitNodesChanged: () => {},
});

export const useCanvasCollaboration = () => {
  const context = useContext(CanvasCollaborationContext);
  if (!context) {
    throw new Error('useCanvasCollaboration must be used within CanvasCollaborationProvider');
  }
  return context;
};

export const CanvasCollaborationProvider: React.FC<{ 
  children: React.ReactNode;
}> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<CanvasUser[]>([]);
  const [currentCanvasId, setCurrentCanvasId] = useState<string | null>(null);
  const { user } = useAuth();

  const joinCanvas = useCallback((canvasId: string) => {
    // Require authenticated user
    if (!user?.id || currentCanvasId === canvasId || socket?.connected) return;

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    
    const newSocket = io(`${socketUrl}/canvas`, {
      auth: { 
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        canvasId 
      },
      path: '/api/canvas/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    setSocket(newSocket);
    setCurrentCanvasId(canvasId);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Canvas socket connection error:', error);
      setIsConnected(false);
    });

    // Handle canvas events
    newSocket.on('canvas:users', (currentUsers: CanvasUser[]) => {
      // Deduplicate users by userId
      const uniqueUsers = currentUsers.filter((user, index, self) =>
        index === self.findIndex((u) => u.userId === user.userId)
      );
      setUsers(uniqueUsers);
    });

    newSocket.on('canvas:user-joined', (newUser: CanvasUser) => {
      setUsers((prev) => {
        // Remove any existing entries for this user first, then add
        const filtered = prev.filter((u) => u.userId !== newUser.userId);
        return [...filtered, newUser];
      });
    });

    newSocket.on('canvas:user-left', ({ userId }: { userId: string }) => {
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    newSocket.on('canvas:cursor-update', (data: any) => {
      setUsers((prev) => {
        // Only update if user exists in the list
        const userExists = prev.some((u) => u.userId === data.userId);
        if (!userExists) return prev;
        
        return prev.map((u) =>
          u.userId === data.userId
            ? { ...u, cursor: data.cursor }
            : u
        );
      });
    });

    newSocket.on('canvas:node-selected', (data: any) => {
      setUsers((prev) => {
        // Only update if user exists in the list
        const userExists = prev.some((u) => u.userId === data.userId);
        if (!userExists) return prev;
        
        return prev.map((u) =>
          u.userId === data.userId
            ? { ...u, selectedNodeId: data.nodeId }
            : u
        );
      });
    });

  }, [user, currentCanvasId, socket]);

  const leaveCanvas = useCallback(() => {
    if (socket) {
      socket.removeAllListeners(); // Clean up all event listeners
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setUsers([]);
      setCurrentCanvasId(null);
    }
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, [socket]);

  const emitCursorMove = useCallback((x: number, y: number) => {
    if (socket && isConnected) {
      socket.emit('canvas:cursor-move', { x, y });
    }
  }, [socket, isConnected]);

  const emitNodeUpdate = useCallback((nodeId: string, changes: any) => {
    if (socket && isConnected) {
      socket.emit('canvas:node-update', { nodeId, changes });
    }
  }, [socket, isConnected]);

  const emitNodeSelect = useCallback((nodeId: string | null) => {
    if (socket && isConnected) {
      socket.emit('canvas:node-select', { nodeId });
    }
  }, [socket, isConnected]);

  const emitNodesChanged = useCallback((nodes: any[], edges: any[]) => {
    if (socket && isConnected) {
      socket.emit('canvas:nodes-changed', { nodes, edges });
    }
  }, [socket, isConnected]);

  useEffect(() => {
    return () => {
      leaveCanvas();
    };
  }, [leaveCanvas]);

  return (
    <CanvasCollaborationContext.Provider
      value={{
        socket,
        isConnected,
        users,
        joinCanvas,
        leaveCanvas,
        emitCursorMove,
        emitNodeUpdate,
        emitNodeSelect,
        emitNodesChanged,
      }}
    >
      {children}
    </CanvasCollaborationContext.Provider>
  );
};

