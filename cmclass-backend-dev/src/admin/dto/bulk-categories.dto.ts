import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';

export class BulkCategoriesDto {
  @IsArray()
  ids!: number[];

  @IsString()
  action!: 'activate' | 'deactivate' | 'delete' | 'export';

  @IsOptional()
  @IsString()
  exportFormat?: 'csv' | 'json';
}
