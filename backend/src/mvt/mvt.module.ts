import { Module } from '@nestjs/common';
import { MvtService } from './mvt.service';
import { MvtController } from './mvt.controller';

@Module({
  controllers: [MvtController],
  providers: [MvtService],
})
export class MvtModule {}
