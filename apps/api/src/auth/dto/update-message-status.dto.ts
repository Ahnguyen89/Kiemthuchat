import { IsString, IsEnum } from 'class-validator';
import { MessageStatusType } from '@prisma/client';

export class UpdateMessageStatusDto {
  @IsString()
  messageId: string;

  @IsEnum(MessageStatusType)
  status: MessageStatusType;
}