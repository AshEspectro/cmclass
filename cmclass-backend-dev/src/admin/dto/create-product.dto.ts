import { IsString, IsOptional, IsInt, Min, IsArray, IsBoolean } from 'class-validator';

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
  productImage?: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsString()
  @IsOptional()
  longDescription?: string;

  @IsString()
  @IsOptional()
  mannequinImage?: string;

  @IsOptional()
  colors?: any; // JSON array of { name: string; hex: string; images: string[] }

  @IsArray()
  @IsOptional()
  sizes?: string[]; // Array of available sizes (e.g., ["S", "M", "L", "XL"])

  @IsInt()
  @Min(0)
  @IsOptional()
  priceCents?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsInt()
  categoryId!: number;
}