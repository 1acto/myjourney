import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [], // ไม่ต้องมี Service เพราะ Logic อยู่ใน Controller
  exports: []
})
export class UploadModule {}