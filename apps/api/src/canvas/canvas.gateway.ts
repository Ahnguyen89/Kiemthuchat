import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FlowAuditService, AuditAction } from '../flow/flow-audit.service';

interface CanvasUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  selectedNodeId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/canvas',
  path: '/api/canvas/socket.io',
})
export class CanvasGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Store active users per canvas
  private canvasUsers = new Map<string, Map<string, CanvasUser>>();

  // User colors pool
  private colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];

  constructor(private auditService: FlowAuditService) {}

  async handleConnection(client: Socket) {
    try {
      const { userId, userName, userAvatar, canvasId } = client.handshake.auth;

      if (!userId || !canvasId) {
        client.disconnect();
        return;
      }

      // Remove console.log for cleaner output

      // Join canvas room
      client.join(canvasId);

      // Get or create canvas users map
      if (!this.canvasUsers.has(canvasId)) {
        this.canvasUsers.set(canvasId, new Map());
      }

      const canvasUserMap = this.canvasUsers.get(canvasId);
      const existingUsers = Array.from(canvasUserMap.values());
      
      // Assign color (reuse if user was here before, otherwise get new one)
      const existingUser = existingUsers.find(u => u.userId === userId);
      const userColor = existingUser?.color || this.colors[existingUsers.length % this.colors.length];

      // Add user to canvas
      const canvasUser: CanvasUser = {
        userId,
        userName,
        userAvatar,
        color: userColor,
      };

      canvasUserMap.set(client.id, canvasUser);

      // Notify others about new user
      client.to(canvasId).emit('canvas:user-joined', canvasUser);

      // Send current users to new client
      const currentUsers = Array.from(canvasUserMap.values()).filter(
        (u) => u.userId !== userId
      );
      client.emit('canvas:users', currentUsers);

    } catch (error) {
      console.error('Canvas connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const { canvasId } = client.handshake.auth;

      if (!canvasId) return;

      const canvasUserMap = this.canvasUsers.get(canvasId);
      if (!canvasUserMap) return;

      const user = canvasUserMap.get(client.id);
      if (user) {
        canvasUserMap.delete(client.id);

        // Notify others about user leaving
        client.to(canvasId).emit('canvas:user-left', { userId: user.userId });

        // User disconnected
      }

      // Clean up empty canvas rooms
      if (canvasUserMap.size === 0) {
        this.canvasUsers.delete(canvasId);
      }

    } catch (error) {
      console.error('Canvas disconnect error:', error);
    }
  }

  @SubscribeMessage('canvas:cursor-move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { x: number; y: number },
  ) {
    const { canvasId } = client.handshake.auth;
    const canvasUserMap = this.canvasUsers.get(canvasId);
    
    if (!canvasUserMap) return;

    const user = canvasUserMap.get(client.id);
    if (user) {
      user.cursor = { x: data.x, y: data.y };

      // Broadcast cursor position to others
      client.to(canvasId).emit('canvas:cursor-update', {
        userId: user.userId,
        cursor: user.cursor,
        color: user.color,
        userName: user.userName,
      });
    }
  }

  @SubscribeMessage('canvas:node-update')
  async handleNodeUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { nodeId: string; changes: any },
  ) {
    const { canvasId } = client.handshake.auth;
    const canvasUserMap = this.canvasUsers.get(canvasId);
    
    if (!canvasUserMap) return;

    const user = canvasUserMap.get(client.id);
    if (user) {
      // Log the node update
      try {
        await this.auditService.logChange(canvasId, user.userId, AuditAction.NODE_UPDATED, {
          nodeId: data.nodeId,
          changes: data.changes,
          message: `Updated node ${data.nodeId}`,
        });
      } catch (error) {
        // Silently fail - don't disrupt collaboration
        console.error('Failed to log node update:', error);
      }

      // Broadcast node update to others
      client.to(canvasId).emit('canvas:node-updated', {
        nodeId: data.nodeId,
        changes: data.changes,
        userId: user.userId,
        userName: user.userName,
      });
    }
  }

  @SubscribeMessage('canvas:node-select')
  handleNodeSelect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { nodeId: string | null },
  ) {
    const { canvasId } = client.handshake.auth;
    const canvasUserMap = this.canvasUsers.get(canvasId);
    
    if (!canvasUserMap) return;

    const user = canvasUserMap.get(client.id);
    if (user) {
      user.selectedNodeId = data.nodeId || undefined;

      // Broadcast selection to others
      client.to(canvasId).emit('canvas:node-selected', {
        userId: user.userId,
        userName: user.userName,
        nodeId: data.nodeId,
        color: user.color,
      });
    }
  }

  @SubscribeMessage('canvas:nodes-changed')
  handleNodesChanged(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { nodes: any[]; edges: any[] },
  ) {
    const { canvasId } = client.handshake.auth;
    const canvasUserMap = this.canvasUsers.get(canvasId);
    
    if (!canvasUserMap) return;

    const user = canvasUserMap.get(client.id);
    if (user) {
      // Broadcast full canvas state to others
      client.to(canvasId).emit('canvas:sync', {
        nodes: data.nodes,
        edges: data.edges,
        userId: user.userId,
      });
    }
  }

  /**
   * Notify all users in a canvas room that the canvas was saved
   * Used when a collaborator saves via shared link
   */
  notifyCanvasSaved(canvasId: string, userId: string, userName: string, versionNumber: number) {
    this.server.to(canvasId).emit('canvas:saved', {
      userId,
      userName,
      versionNumber,
      timestamp: new Date().toISOString(),
    });
  }
}

