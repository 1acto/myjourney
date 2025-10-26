import { IsEmail, IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  usr_id: number;

  @IsEmail()
  usr_email: string;

  @IsString()
  usr_firstName: string;

  @IsString()
  usr_lastName: string;

  @IsString()
  usr_googleId: string;

  @IsString()
  usr_avatar?: string | undefined;

  @IsString()
  usr_phone?: string;

  @IsString()
  usr_is_active?: boolean;

  @IsNumber()
  usr_del?: number;
}
