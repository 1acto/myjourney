import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { PoiService } from './poi.service';

// สำหรับเริ่มต้น: ใช้ type ภายในไฟล์ก่อน (จะย้ายเป็น DTO ทีหลังก็ได้)
type ListQuery = {
  q?: string;                 // คำค้น: ชื่อ/ที่อยู่/โค้ด/เจ้าของ
  tag?: string;               // เช่น "ร้านค้า" | "โรงเรียน" | ...
  sort?: 'title' | 'createdAt' | 'updatedAt' | 'score';
  order?: 'asc' | 'desc';
  page?: string | number;     // รับเป็น string จาก query ได้
  pageSize?: string | number; // รับเป็น string จาก query ได้
};

type CreateBody = {
  title: string;
  tag: string;
  score?: number;
  address?: string;
  code?: string;
  ownerName?: string;
  // ถ้ามีเพิ่มฟิลด์ก็ขยายได้ เช่น location_id ฯลฯ
};

type UpdateBody = Partial<CreateBody>;

@Controller('api/pois')
export class PoiController {
  constructor(private readonly service: PoiService) {}

  @Get()
  list(@Query() q: ListQuery) {
    return this.service.list(q);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: CreateBody) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateBody) {
    return this.service.update(id, body);
  }

  // ลบแบบ soft (ถ้ามีคอลัมน์ poi_is_delete)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
