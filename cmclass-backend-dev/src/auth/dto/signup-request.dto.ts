import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class SignupRequestDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  roleRequested: string;

  @IsOptional()
  message?: string;

  @IsOptional()
  @MinLength(8)
  password?: string; // Optional: collected on signup form; backend will NOT store raw passwords — admin will generate or set final password on approval.
}