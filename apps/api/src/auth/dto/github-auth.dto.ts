import { IsString, IsEmail, IsOptional } from 'class-validator';

export class GithubAuthDto {
  @IsString()
  githubId: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}