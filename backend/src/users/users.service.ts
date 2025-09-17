import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('User with this email already exists.');
      }
      throw error;
    }
  }

  async getSupervisors(): Promise<
    Pick<User, 'usr_id' | 'usr_firstname' | 'usr_lastname' | 'usr_avatar'>[]
  > {
    return this.prisma.user.findMany({
      where: { usr_role_name: 'SALES_SUPERVISOR' },
      orderBy: { usr_id: 'asc' },
      select: {
        usr_id: true,
        usr_firstname: true,
        usr_lastname: true,
        usr_avatar: true,
      },
    });
  }

  async getSales(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { usr_role_name: 'SALES' },
      orderBy: { usr_firstname: 'asc' },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    if (!params.where.usr_id || !params.data) {
      throw new BadRequestException('Bad Request.');
    }
    const { where, data } = params;
    try {
      return await this.prisma.user.update({
        data,
        where,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${where.usr_id} not found.`);
      }
      throw error;
    }
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    if (!where.usr_id) {
      throw new BadRequestException('No user ID provided.');
    }
    try {
      return await this.prisma.user.delete({
        where,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${where.usr_id} not found.`);
      }
      throw error;
    }
  }

  async findUserById(usr_id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { usr_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
