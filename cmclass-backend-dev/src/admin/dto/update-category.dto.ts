import { IsString, IsOptional, IsBoolean, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SubCategoryUpdateDto {
  @IsInt()
  @IsOptional()
  id?: number;
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

export class UpdateCategoryDto {
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

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsInt()
  @IsOptional()
  parentId?: number | null;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubCategoryUpdateDto)
  subcategories?: SubCategoryUpdateDto[];
}
