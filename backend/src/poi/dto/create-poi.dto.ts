import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  ArrayMinSize,
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
}
