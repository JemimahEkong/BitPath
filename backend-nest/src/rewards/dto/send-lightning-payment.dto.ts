import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class SendLightningPaymentDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsString()
  paymentRequest: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  amountSats?: number;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  preferSpark?: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}
