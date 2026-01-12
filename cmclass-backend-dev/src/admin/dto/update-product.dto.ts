import { IsString, IsOptional, IsInt, IsPositive, IsArray } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @IsOptional()
  @IsPositive()
  priceCents?: number;

  @IsInt()
  @IsOptional()
  stock?: number;

  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  colors?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  sizes?: string[];
}