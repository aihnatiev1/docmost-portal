import { IsArray, IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class BulkPublishPageDto {
  @IsArray()
  @IsString({ each: true })
  pageIds: string[];

  @IsBoolean()
  isDraft: boolean;

  @IsOptional()
  @IsDateString()
  publishAt?: string | null;
}
