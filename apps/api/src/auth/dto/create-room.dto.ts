import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ChatRoomType } from '@prisma/client';

export class CreateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(ChatRoomType)
  type: ChatRoomType;

  @IsArray()
  @IsString({ each: true })
  memberIds: string[];
}