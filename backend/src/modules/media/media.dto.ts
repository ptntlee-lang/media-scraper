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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScrapeUrlsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  @ApiProperty({ type: [String], description: 'Array of URLs to scrape', minItems: 1 })
  urls: string[];
}

export class GetMediaDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({ type: Number, default: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ type: Number, default: 20 })
  limit?: number = 20;

  @IsOptional()
  @IsIn(['image', 'video'])
  @ApiPropertyOptional({ enum: ['image', 'video'] })
  type?: 'image' | 'video';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @ApiPropertyOptional({ type: String })
  search?: string;
}
