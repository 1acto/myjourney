import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class CoordinatesDto {
  @IsString()
  type: string;

  @IsArray()
  @ArrayMinSize(2) // ต้องมีอย่างน้อย 2 ค่า [long, lat]
  @IsNumber({}, { each: true })
  coordinates: number[];
}

class ImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreatePoiDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  tagId: number;

  @IsNumber()
  @IsOptional()
  createById?: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  subDistrict?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  location: CoordinatesDto;

  @IsDateString()
  @IsOptional()
  visitDate?: string; // วันที่ไป

  @IsString()
  @IsOptional()
  review?: string; // ความประทับใจ

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];
}

