import { IsInt } from 'class-validator';

export class MergeCategoriesDto {
  @IsInt()
  sourceId!: number;

  @IsInt()
  targetId!: number;

  // If true, reassign children from source to target and/or transfer products (not implemented)
  // For now, we reassign child categories to the target and then delete source
}
