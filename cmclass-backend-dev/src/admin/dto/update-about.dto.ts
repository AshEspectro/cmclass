import { IsString, IsOptional, IsArray, IsBoolean, IsObject, MaxLength } from 'class-validator';

export class UpdateAboutDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  heroTitle?: string;

  @IsOptional()
  @IsString()
  heroImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  visionTitle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visionParagraphs?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  craftTitle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  craftParagraphs?: string[];

  @IsOptional()
  @IsString()
  craftImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  valuesTitle?: string;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  values?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ctaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ctaDescription?: string;

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
