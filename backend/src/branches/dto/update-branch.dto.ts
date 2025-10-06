import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateBranchDto } from './create-branch.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateLocationDto } from 'src/locations/dto/update-location.dto';

export class UpdateBranchDto extends PartialType(
  OmitType(CreateBranchDto, ['location'] as const),
) {
  @ValidateNested()
  @Type(() => UpdateLocationDto)
  location?: UpdateLocationDto;
}
