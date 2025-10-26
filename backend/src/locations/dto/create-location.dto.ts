import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateLocationDto {
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

  @IsNumber()
  @IsOptional()
  longitude: number;

  @IsNumber()
  @IsOptional()
  latitude: number;

  @IsNumber()
  @IsOptional()
  createById?: number;
}
