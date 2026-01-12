import { IsString, IsOptional, IsInt, IsPositive, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

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
  @IsPositive()
  @IsOptional()
  priceCents?: number;

  @IsInt()
  @IsOptional()
  stock?: number;

  @IsInt()
  categoryId!: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  colors?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  sizes?: string[];
}