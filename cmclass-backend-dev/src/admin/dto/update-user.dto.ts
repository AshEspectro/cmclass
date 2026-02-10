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

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneCountryCode?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  marketingOptIn?: boolean;

  @IsOptional()
  marketingEmails?: boolean;

  @IsOptional()
  marketingSms?: boolean;

  @IsOptional()
  marketingTargetedAds?: boolean;
}
