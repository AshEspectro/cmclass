import { IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @IsInt()
  id!: number;

  @IsInt()
  order!: number;
}

export class ReorderCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items!: ReorderItemDto[];
}
