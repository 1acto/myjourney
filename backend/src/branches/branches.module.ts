import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LocationsService } from 'src/locations/locations.service';

@Module({
  imports: [PrismaModule],
  controllers: [BranchesController],
  providers: [BranchesService, LocationsService],
})
export class BranchesModule {}
