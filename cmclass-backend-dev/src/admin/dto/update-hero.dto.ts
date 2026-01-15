import { IsString, IsOptional, IsBoolean, MaxLength, IsIn } from 'class-validator';

export class UpdateHeroDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  mainText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtext?: string;

  @IsOptional()
  @IsString()
  backgroundImageUrl?: string;

  @IsOptional()
  @IsString()
  backgroundVideoUrl?: string;

  @IsOptional()
  @IsIn(['image', 'video'])
  mediaType?: 'image' | 'video';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaButtonText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ctaButtonUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
