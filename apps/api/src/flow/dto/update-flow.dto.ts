import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class UpdateFlowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  nodes?: any[];

  @IsOptional()
  @IsArray()
  edges?: any[];

  @IsOptional()
  @IsBoolean()
  isManualSave?: boolean;
}
