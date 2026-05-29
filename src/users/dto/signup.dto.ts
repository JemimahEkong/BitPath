/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsStrongPassword} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// V1 Simplified - No complex business configuration needed

export class EmailSignupDto {

  @ApiProperty({ description: 'Business email address', example: 'john@company.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ description: 'Strong password', example: 'SecurePass123!' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }, { message: 'Password must be at least 8 characters long and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol' })
  password: string;
}

