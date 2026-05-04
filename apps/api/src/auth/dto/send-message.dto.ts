import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
  @IsString()
  chatRoomId: string;

  @IsString()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;
}