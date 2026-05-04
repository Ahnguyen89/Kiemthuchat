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
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UpdateMessageStatusDto } from '../auth/dto/update-message-status.dto';
import { SendMessageDto } from '../auth/dto/send-message.dto';

// WebSocket Auth Guard
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
  // Route Socket.IO under /api so existing reverse proxy forwards it
  path: '/api/chat/socket.io',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  // Xử lý khi client kết nối
  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.auth.userId;

      if (!userId) {
        client.disconnect();
        return;
      }

      console.log(`Client connected: ${client.id}, userId: ${userId}`);

      // Join user vào các phòng của họ
      const rooms = await this.chatService.getUserRooms(userId);
      rooms.forEach((room) => {
        client.join(room.id);
        // Cập nhật trạng thái online
        this.chatService.updateOnlineStatus(userId, room.id, true);
      });

      // Thông báo user online
      this.server.emit('user:online', { userId });
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  // Xử lý khi client ngắt kết nối
  async handleDisconnect(client: Socket) {
    try {
      const userId = client.handshake.auth.userId;

      if (userId) {
        console.log(`Client disconnected: ${client.id}, userId: ${userId}`);

        // Cập nhật trạng thái offline
        const rooms = await this.chatService.getUserRooms(userId);
        rooms.forEach((room) => {
          this.chatService.updateOnlineStatus(userId, room.id, false);
        });

        // Thông báo user offline
        this.server.emit('user:offline', { userId });
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  // Gửi tin nhắn
  @SubscribeMessage('message:send')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: SendMessageDto) {
    try {
      const userId = client.handshake.auth.userId;

      if (!userId) {
        return { error: 'Unauthorized' };
      }

      const message = await this.chatService.sendMessage(userId, data);

      // Gửi tin nhắn đến tất cả members trong phòng
      this.server.to(data.chatRoomId).emit('message:new', message);

      // Thông báo typing đã dừng
      this.server.to(data.chatRoomId).emit('typing:stop', { userId, chatRoomId: data.chatRoomId });

      return { success: true, message };
    } catch (error) {
      console.error('Send message error:', error);
      return { error: error.message };
    }
  }

  // Xử lý typing
  @SubscribeMessage('typing:start')
  async handleStartTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: string }
  ) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) return;

      const user = await this.chatService.getUser(userId);
      this.server.to(data.chatRoomId).emit('typing:update', {
        userId,
        userName: user.name,
        chatRoomId: data.chatRoomId,
      });
    } catch (error) {
      console.error('Typing start error:', error);
    }
  }

  @SubscribeMessage('typing:stop')
  async handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: string }
  ) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) return;

      this.server.to(data.chatRoomId).emit('typing:stop', {
        userId,
        chatRoomId: data.chatRoomId,
      });
    } catch (error) {
      console.error('Typing stop error:', error);
    }
  }

  // Tham gia phòng chat
  @SubscribeMessage('room:join')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) return { error: 'Unauthorized' };

      const room = await this.chatService.joinRoom(userId, data.roomId);
      client.join(data.roomId);

      // Thông báo cho các thành viên khác
      this.server.to(data.roomId).emit('room:member_joined', {
        roomId: data.roomId,
        userId,
        member: room.members.find((m) => m.userId === userId),
      });

      return { success: true, room };
    } catch (error) {
      console.error('Join room error:', error);
      return { error: error.message };
    }
  }

  // Rời phòng chat
  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) return { error: 'Unauthorized' };

      await this.chatService.leaveRoom(userId, data.roomId);
      client.leave(data.roomId);

      // Thông báo cho các thành viên khác
      this.server.to(data.roomId).emit('room:member_left', {
        roomId: data.roomId,
        userId,
      });

      return { success: true };
    } catch (error) {
      console.error('Leave room error:', error);
      return { error: error.message };
    }
  }

  // Thêm thành viên vào phòng (WebSocket)
  @SubscribeMessage('room:add_members')
  async handleAddMembers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userIds: string[] }
  ) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) return { error: 'Unauthorized' };

      const updatedRoom = await this.chatService.addMembers(userId, data.roomId, data.userIds);

      // Emit event for each added member (so clients can update UI)
      // Find newly added members by comparing
      const added = updatedRoom.members.filter((m) => data.userIds.includes(m.userId));

      added.forEach((member) => {
        this.server.to(data.roomId).emit('room:member_joined', {
          roomId: data.roomId,
          userId: member.userId,
          member,
        });
      });

      return { success: true, room: updatedRoom };
    } catch (error) {
      console.error('Add members error:', error);
      return { error: error.message };
    }
  }

  // Cập nhật trạng thái tin nhắn (delivered/seen)
  @SubscribeMessage('message:status')
  async handleMessageStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateMessageStatusDto
  ) {
    try {
      const userId = client.handshake.auth.userId;

      if (!userId) {
        return { error: 'Unauthorized' };
      }

      const status = await this.chatService.updateMessageStatus(userId, data);
      // xác định chatRoomId: dùng message include từ updateMessageStatus nếu có,
      // nếu không có thì fallback lấy message theo id
      const statusAny = status as any;
      let chatRoomId: string | undefined = statusAny?.message?.chatRoomId;
      if (!chatRoomId) {
        const msg = await this.chatService.getMessageById(data.messageId);
        chatRoomId = msg?.chatRoomId;
      }

      if (!chatRoomId) {
        return { error: 'Chat room not found for message' };
      }

      // Thông báo cập nhật status đến phòng
      this.server.to(chatRoomId).emit('message:status:update', {
        messageId: data.messageId,
        userId,
        status: data.status,
      });

      return { success: true, status };
    } catch (error) {
      console.error('Update status error:', error);
      return { error: error.message };
    }
  }

  // User đang typing
  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: string; userName: string }
  ) {
    const userId = client.handshake.auth.userId;

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // Gửi thông báo typing đến các user khác trong phòng
    client.to(data.chatRoomId).emit('typing:start', {
      userId,
      userName: data.userName,
      chatRoomId: data.chatRoomId,
    });

    return { success: true };
  }

  // User ngừng typing
  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: string }
  ) {
    const userId = client.handshake.auth.userId;

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    client.to(data.chatRoomId).emit('typing:stop', {
      userId,
      chatRoomId: data.chatRoomId,
    });

    return { success: true };
  }

  // Join vào phòng chat
  // @SubscribeMessage('room:join')
  // async handleJoinRoom(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { chatRoomId: string }
  // ) {
  //   try {
  //     const userId = client.handshake.auth.userId;

  //     if (!userId) {
  //       return { error: 'Unauthorized' };
  //     }

  //     // Kiểm tra quyền truy cập phòng
  //     await this.chatService.getRoomById(data.chatRoomId, userId);

  //     client.join(data.chatRoomId);

  //     // Cập nhật trạng thái online
  //     await this.chatService.updateOnlineStatus(userId, data.chatRoomId, true);

  //     // Thông báo user join
  //     this.server.to(data.chatRoomId).emit('room:user:joined', {
  //       userId,
  //       chatRoomId: data.chatRoomId,
  //     });

  //     return { success: true };
  //   } catch (error) {
  //     console.error('Join room error:', error);
  //     return { error: error.message };
  //   }
  // }

  // Leave khỏi phòng chat
  // @SubscribeMessage('room:leave')
  // async handleLeaveRoom(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { chatRoomId: string }
  // ) {
  //   try {
  //     const userId = client.handshake.auth.userId;

  //     if (!userId) {
  //       return { error: 'Unauthorized' };
  //     }

  //     client.leave(data.chatRoomId);

  //     // Cập nhật trạng thái offline
  //     await this.chatService.updateOnlineStatus(userId, data.chatRoomId, false);

  //     // Thông báo user left
  //     this.server.to(data.chatRoomId).emit('room:user:left', {
  //       userId,
  //       chatRoomId: data.chatRoomId,
  //     });

  //     return { success: true };
  //   } catch (error) {
  //     console.error('Leave room error:', error);
  //     return { error: error.message };
  //   }
  // }
}
