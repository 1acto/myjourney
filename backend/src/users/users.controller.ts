import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  // @Post('register')
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.createUser(createUserDto);
  // }

  @Get('/all')
  findAll() {
    return this.userService.findAllUsers();
  }

  @Get('/whoami')
  findMe(@Request() req: any) {
    return this.userService.findUserById(req.user.id);
  }

  @Post('/create')
  create(@Request() req: any) {
    return this.userService.createUser({
      email: req.user.email,
    });
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findUserById(+id);
  }

  @Patch('/edit/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser({
      where: { id: +id },
      data: updateUserDto,
    });
  }

  @Get('/get/supervisor')
  getSupervisors() {
    return this.userService.getSupervisors();
  }

  @Get('/get/sales')
  getSales() {
    return this.userService.getSales();
  }

  @Delete('/snap/:id')
  @HttpCode(200)
  async remove(@Param('id') id: string) {
    const snap = await this.userService.deleteUser({ id: +id });
    return { message: 'User with id: ' + id + ' has been snapped 🫰 ! ' };
  }
}
