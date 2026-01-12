import { IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class OAuthDto {
  @IsIn(['google'])
  provider: 'google';

  @IsNotEmpty()
  token: string; // For Google this is the ID token (id_token)

  @IsOptional()
  remember?: boolean;
}
