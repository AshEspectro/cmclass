import { IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    phoneCountryCode?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsBoolean()
    marketingOptIn?: boolean;

    @IsOptional()
    @IsBoolean()
    marketingEmails?: boolean;

    @IsOptional()
    @IsBoolean()
    marketingSms?: boolean;

    @IsOptional()
    @IsBoolean()
    marketingTargetedAds?: boolean;
}
