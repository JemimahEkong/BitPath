/* eslint-disable prettier/prettier */
 
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    sessionToken?: string;
    user?: {
      id: string;
      email: string;
      isEmailVerified:boolean
    };
  };
}
