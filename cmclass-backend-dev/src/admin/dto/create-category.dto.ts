import { IsString, IsOptional, IsBoolean, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SubCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;
  
  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreateCategoryDto {
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

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubCategoryDto)
  subcategories?: SubCategoryDto[];
}
