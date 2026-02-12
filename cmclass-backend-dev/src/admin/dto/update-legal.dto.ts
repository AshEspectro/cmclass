import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateLegalDto {
    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}

export class GetLegalDto {
    @IsString()
    @IsNotEmpty()
    type: string;
}
