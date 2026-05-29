import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, IsUUID } from 'class-validator';

export class CreateLightningInvoiceDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  amountSats?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  xpEarned?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(604_800)
  expirySecs?: number;
}
