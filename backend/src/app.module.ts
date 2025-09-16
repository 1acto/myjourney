// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { PrismaModule } from './prisma/prisma.module'; // คุณต้องสร้าง PrismaModule ด้วย
import { BranchesModule } from './branches/branches.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, LocationsModule, BranchesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
