import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { MessageRole, MessageType } from 'generated/prisma/enums';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MessageRole)
  @IsNotEmpty()
  role: MessageRole;

  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;
}
