import { IsString, IsOptional, Matches } from 'class-validator';

/**
 * DTO for registering a Lightning Address (LUD-16)
 * Format: user@domain.com
 */
export class RegisterLightningAddressDto {
  @IsString()
  userId: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Lightning address username must contain only alphanumeric characters, dots, underscores, and hyphens',
  })
  username: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateLightningAddressDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Lightning address username must contain only alphanumeric characters, dots, underscores, and hyphens',
  })
  username?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
