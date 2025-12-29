import { IsOptional, IsIn, IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT', 'USER'])
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT' | 'USER';

  @IsOptional()
  isActive?: boolean;
}
