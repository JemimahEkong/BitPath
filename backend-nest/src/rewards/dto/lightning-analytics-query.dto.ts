import { IsString, IsOptional, IsDateString } from 'class-validator';

export class LightningAnalyticsQueryDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsDateString()
  startDate?: string; // ISO date YYYY-MM-DD

  @IsOptional()
  @IsDateString()
  endDate?: string; // ISO date YYYY-MM-DD

  @IsOptional()
  @IsString()
  period?: 'daily' | 'weekly' | 'monthly'; // Defaults to daily
}
