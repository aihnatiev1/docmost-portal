import {
  IsAlphanumeric,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {Transform, TransformFnParams} from "class-transformer";

export class CreateSpaceDto {
  @MinLength(2)
  @MaxLength(100)
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @MinLength(2)
  @MaxLength(100)
  @IsAlphanumeric()
  slug: string;

  @IsOptional()
  @IsIn(['default', 'documentation'])
  type?: string;

  @IsOptional()
  @IsObject()
  portalSettings?: Record<string, any>;
}
