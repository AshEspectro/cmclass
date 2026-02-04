import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  name: string;

  @IsString()
  originalName: string;

  @IsString()
  type: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  size: number;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  folder?: string;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;
}
