import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { CreateLocationDto } from '../../locations/dto/create-location.dto';
import { Type } from 'class-transformer';

class CoordinatesDto {
  @IsString()
  type: string;

  @IsArray()
  @ArrayMinSize(2) // ต้องมีอย่างน้อย 2 ค่า [long, lat]
  @IsNumber({}, { each: true })
  coordinates: number[];
}
export class CreateBranchDto {
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  tel?: string;

  @IsNumber()
  @IsOptional()
  salesId?: number;

  @IsNumber()
  @IsOptional()
  supervisorId?: number;

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
