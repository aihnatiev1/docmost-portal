import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class FeedbackDto {
  @IsString()
  @IsNotEmpty()
  pageId: string;

  @IsBoolean()
  isHelpful: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
