import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class WithdrawDto {
  @IsString()
  userId: string;

  @IsInt()
  @Min(1)
  @Max(10_000_000)
  amountSats: number;

  @IsString()
  lightningInvoice: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
