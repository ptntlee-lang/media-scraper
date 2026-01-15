import { IsArray, IsUrl, ArrayMinSize } from 'class-validator';

export class ScrapeUrlsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  urls: string[];
}

export class GetMediaDto {
  page?: number = 1;
  limit?: number = 20;
  type?: 'image' | 'video';
  search?: string;
}
