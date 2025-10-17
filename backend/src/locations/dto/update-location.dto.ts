import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address?: string;

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


  latitude?: number;


  longitude?: number;
}