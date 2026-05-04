import { IsString } from 'class-validator';

export class RevertVersionDto {
  @IsString()
  versionId: string;
}
