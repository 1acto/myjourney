// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { PrismaModule } from './prisma/prisma.module';
import { BranchesModule } from './branches/branches.module';
import { MvtModule } from './mvt/mvt.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, LocationsModule, BranchesModule, MvtModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
