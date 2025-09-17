import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  postcode?: string;

  @IsNumber()
  long: number;

  @IsNumber()
  lat: number;

  @IsString()
  @IsOptional()
  subdistrict?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsNumber()
  @IsOptional()
  salesId?: number;

  @IsNumber()
  @IsOptional()
  supervisorId?: number;
}
