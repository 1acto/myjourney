import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { UserRoleEnum } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNumber()
  id: number;

  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  googleId: string;

  @IsString()
  avatar?: string | undefined;

  @IsString()
  phone?: string;

  @IsBoolean()
  isDeleted?: boolean;

  @IsEnum(UserRoleEnum)
  roleName?: UserRoleEnum;
}
