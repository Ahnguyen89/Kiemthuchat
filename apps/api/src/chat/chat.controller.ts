import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateRoomDto, SendMessageDto } from '../auth/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  // Tạo phòng chat mới
  @Post('rooms')
  async createRoom(@Request() req, @Body() dto: CreateRoomDto) {
    return this.chatService.createRoom(req.user.userId, dto);
  }

  // Lấy danh sách phòng chat của user
  @Get('rooms')
  async getUserRooms(@Request() req) {
    return this.chatService.getUserRooms(req.user.userId);
  }

  // Lấy chi tiết phòng chat
  @Get('rooms/:roomId')
  async getRoomById(@Request() req, @Param('roomId') roomId: string) {
    return this.chatService.getRoomById(roomId, req.user.userId);
  }

  // Lấy tin nhắn trong phòng
  @Get('rooms/:roomId/messages')
  async getRoomMessages(
    @Request() req,
    @Param('roomId') roomId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.chatService.getRoomMessages(
      roomId,
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50
    );
  }

  // Gửi tin nhắn (REST API - backup cho WebSocket)
  @Post('messages')
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.userId, dto);
  }

  // Lấy danh sách users để chat
  @Get('users')
  async getAvailableUsers(@Request() req) {
    return this.chatService.getAvailableUsers(req.user.userId);
  }

  // Thêm thành viên vào phòng
  @Post('rooms/:roomId/members')
  async addRoomMembers(
    @Request() req,
    @Param('roomId') roomId: string,
    @Body() body: { userIds: string[] }
  ) {
    return this.chatService.addMembers(req.user.userId, roomId, body.userIds);
  }
}
