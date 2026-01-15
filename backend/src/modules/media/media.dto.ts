import {
  IsArray,
  IsUrl,
  ArrayMinSize,
  IsOptional,
  IsIn,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ScrapeUrlsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  urls: string[];
}

export class GetMediaDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(['image', 'video'])
  type?: 'image' | 'video';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}
