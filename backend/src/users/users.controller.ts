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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  // @Post('register')
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.createUser(createUserDto);
  // }

  @Get('/all')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all users',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          usr_id: { type: 'number' },
          usr_email: { type: 'string' },
          usr_firstName: { type: 'string' },
          usr_lastName: { type: 'string' },
          usr_googleId: { type: 'string' },
          usr_avatar: { type: 'string' },
          usr_phone: { type: 'string' },
          usr_is_active: { type: 'boolean' },
          usr_role_name: { type: 'string', enum: ['USER', 'ADMIN'] },
          usr_del: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  findAll() {
    return this.userService.findAllUsers();
  }

  @Get('/whoami')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Retrieve information about the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved current user information',
    schema: {
      type: 'object',
      properties: {
        usr_id: { type: 'number' },
        usr_email: { type: 'string' },
        usr_firstName: { type: 'string' },
        usr_lastName: { type: 'string' },
        usr_googleId: { type: 'string' },
        usr_avatar: { type: 'string' },
        usr_phone: { type: 'string' },
        usr_is_active: { type: 'boolean' },
        usr_role_name: { type: 'string', enum: ['USER', 'ADMIN'] },
        usr_del: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findMe(@Request() req: any) {
    return this.userService.findUserById(req.user.id);
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the user',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user',
    schema: {
      type: 'object',
      properties: {
        usr_id: { type: 'number' },
        usr_email: { type: 'string' },
        usr_firstName: { type: 'string' },
        usr_lastName: { type: 'string' },
        usr_googleId: { type: 'string' },
        usr_avatar: { type: 'string' },
        usr_phone: { type: 'string' },
        usr_is_active: { type: 'boolean' },
        usr_role_name: { type: 'string', enum: ['USER', 'ADMIN'] },
        usr_del: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid user ID format',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findUserById(+id);
  }

  @Patch('/edit/:id')
  @ApiOperation({
    summary: 'Update user',
    description: "Update a user's information by their ID",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the user to update',
    example: '123',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User data to update',
    examples: {
      example1: {
        summary: 'Update user name and phone',
        value: {
          usr_firstName: 'John',
          usr_lastName: 'Doe',
          usr_phone: '+1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated user',
    schema: {
      type: 'object',
      properties: {
        usr_id: { type: 'number' },
        usr_email: { type: 'string' },
        usr_firstName: { type: 'string' },
        usr_lastName: { type: 'string' },
        usr_googleId: { type: 'string' },
        usr_avatar: { type: 'string' },
        usr_phone: { type: 'string' },
        usr_is_active: { type: 'boolean' },
        usr_role_name: { type: 'string', enum: ['USER', 'ADMIN'] },
        usr_del: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or user ID format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
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
  @ApiOperation({
    summary: 'Delete user',
    description:
      'Delete a user by their ID (permanently removes the user from the system)',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the user to delete',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted user',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User with id: 123 has been snapped 🫰 !',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid user ID format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id') id: string) {
    const snap = await this.userService.deleteUser({ id: +id });
    return { message: 'User with id: ' + id + ' has been snapped 🫰 ! ' };
  }
}
