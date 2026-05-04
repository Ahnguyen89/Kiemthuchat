import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from '../auth/dto/create-room.dto';
import { SendMessageDto } from '../auth/dto/send-message.dto';
import { UpdateMessageStatusDto } from '../auth/dto/update-message-status.dto';
import { ChatRoomType, MessageStatusType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Tạo phòng chat mới
  async createRoom(userId: string, dto: CreateRoomDto) {
    const { name, type, memberIds } = dto;

    // Kiểm tra nếu là DIRECT chat và đã tồn tại
    if (type === ChatRoomType.DIRECT && memberIds.length === 1) {
      const existingRoom = await this.findDirectRoom(userId, memberIds[0]);
      if (existingRoom) {
        return existingRoom;
      }
    }

    // Tạo phòng mới
    const room = await this.prisma.chatRoom.create({
      data: {
        name,
        type,
        members: {
          create: [
            { userId, role: 'ADMIN' },
            ...memberIds.map((id) => ({ userId: id, role: 'MEMBER' as const })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return room;
  }

  // Tìm phòng chat trực tiếp giữa 2 user
  async findDirectRoom(userId1: string, userId2: string) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        type: ChatRoomType.DIRECT,
        members: {
          every: {
            userId: {
              in: [userId1, userId2],
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return rooms.find((room) => room.members.length === 2);
  }

  // Lấy thông tin user
  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Tham gia phòng chat
  async joinRoom(userId: string, roomId: string) {
    // Kiểm tra phòng tồn tại
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Kiểm tra user đã trong phòng chưa
    const existingMember = room.members.find((m) => m.userId === userId);
    if (existingMember) {
      return room;
    }

    // Thêm user vào phòng
    await this.prisma.chatMember.create({
      data: {
        userId,
        chatRoomId: roomId,
        role: 'MEMBER',
      },
    });

    return this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  // Rời phòng chat
  async leaveRoom(userId: string, roomId: string) {
    // Kiểm tra phòng tồn tại
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        members: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Kiểm tra user có trong phòng không
    const member = room.members.find((m) => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('User is not a member of this room');
    }

    // Nếu là phòng direct chat, không cho phép rời
    if (room.type === ChatRoomType.DIRECT) {
      throw new ForbiddenException('Cannot leave direct chat room');
    }

    // Nếu là admin duy nhất, không cho phép rời
    const adminCount = room.members.filter((m) => m.role === 'ADMIN').length;
    if (member.role === 'ADMIN' && adminCount === 1) {
      throw new ForbiddenException('Last admin cannot leave the room');
    }

    // Xóa user khỏi phòng
    await this.prisma.chatMember.delete({
      where: {
        id: member.id,
      },
    });
  }

  // Lấy danh sách phòng chat của user
  async getUserRooms(userId: string) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return rooms;
  }

  // Lấy chi tiết phòng chat
  async getRoomById(roomId: string, userId: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chat');
    }

    // Kiểm tra user có trong phòng không
    const isMember = room.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền truy cập phòng này');
    }

    return room;
  }

  // Gửi tin nhắn
  async sendMessage(userId: string, dto: SendMessageDto) {
    const { chatRoomId, content, type, fileUrl, fileName, fileSize } = dto;

    // Kiểm tra user có trong phòng không
    const member = await this.prisma.chatMember.findFirst({
      where: {
        userId,
        chatRoomId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Bạn không có quyền gửi tin nhắn trong phòng này');
    }

    // Tạo tin nhắn
    const message = await this.prisma.message.create({
      data: {
        chatRoomId,
        senderId: userId,
        content,
        type: type || 'TEXT',
        fileUrl,
        fileName,
        fileSize,
        statuses: {
          create: {
            userId,
            status: MessageStatusType.SENT,
          },
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        statuses: true,
      },
    });

    // Cập nhật thời gian phòng chat
    await this.prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  // Lấy tin nhắn trong phòng
  async getRoomMessages(roomId: string, userId: string, page = 1, limit = 50) {
    // Kiểm tra quyền truy cập
    await this.getRoomById(roomId, userId);

    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: {
        chatRoomId: roomId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        statuses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    return messages.reverse();
  }

  // Cập nhật trạng thái tin nhắn
  async updateMessageStatus(userId: string, dto: UpdateMessageStatusDto) {
    const { messageId, status } = dto;

    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { chatRoom: { include: { members: true } } },
    });

    if (!message) {
      throw new NotFoundException('Không tìm thấy tin nhắn');
    }

    // Kiểm tra user có trong phòng không
    const isMember = message.chatRoom.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền cập nhật trạng thái');
    }

    // Cập nhật hoặc tạo mới status
    const messageStatus = await this.prisma.messageStatus.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        status,
        timestamp: new Date(),
      },
      create: {
        messageId,
        userId,
        status,
      },
      include: {
        // include the related message so callers can access message.chatRoomId
        message: {
          select: {
            id: true,
            chatRoomId: true,
          },
        },
      },
    });

    return messageStatus;
  }

  // Lấy message đơn lẻ (dùng khi upsert không trả về message)
  // Thêm method này vào ChatService class
  async getMessageById(messageId: string) {
    return this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chatRoom: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        statuses: true,
      },
    });
  }

  // Cập nhật trạng thái online/offline
  async updateOnlineStatus(userId: string, chatRoomId: string, isOnline: boolean) {
    await this.prisma.chatMember.updateMany({
      where: {
        userId,
        chatRoomId,
      },
      data: {
        isOnline,
        lastSeenAt: new Date(),
      },
    });
  }

  // Lấy danh sách users để chat
  async getAvailableUsers(userId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          not: userId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    return users;
  }

  // Thêm nhiều thành viên vào phòng
  async addMembers(requesterId: string, roomId: string, userIds: string[]) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Kiểm tra requester có quyền (phải là thành viên)
    const requesterMember = room.members.find((m) => m.userId === requesterId);
    if (!requesterMember) {
      throw new ForbiddenException('Bạn không có quyền thêm thành viên');
    }

    // Không cho thêm vào direct room
    if (room.type === ChatRoomType.DIRECT) {
      throw new ForbiddenException('Cannot add members to direct chat');
    }

    const addedMembers = [] as any[];

    for (const id of userIds) {
      const exists = room.members.some((m) => m.userId === id);
      if (exists) continue;

      const member = await this.prisma.chatMember.create({
        data: {
          userId: id,
          chatRoomId: roomId,
          role: 'MEMBER',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      addedMembers.push(member);
    }

    // Trả về phòng cập nhật
    return this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
  }
}
