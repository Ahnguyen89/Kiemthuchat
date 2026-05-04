import { IsString, IsOptional } from 'class-validator';

export class CreateVersionDto {
  @IsOptional()
  @IsString()
  description?: string;
}
