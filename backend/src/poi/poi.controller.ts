import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PoiService } from './poi.service';
import { CreatePoiDto } from './dto/create-poi.dto';
import { UpdatePoiDto } from './dto/update-poi.dto';
import { CreateTagDto } from './dto/create-tag.dto';

// todo: ลบ
type ListQuery = {
  q?: string; // คำค้น: ชื่อ/ที่อยู่/โค้ด/เจ้าของ
  tag?: string; // เช่น "ร้านค้า" | "โรงเรียน" | ...
  sort?: 'title' | 'createdAt' | 'updatedAt' | 'score';
  order?: 'asc' | 'desc';
  page?: string | number; // รับเป็น string จาก query ได้
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

@Controller('poi')
export class PoiController {
  constructor(private readonly poiService: PoiService) {}

  @Post()
  create(@Body() createPoiDto: CreatePoiDto) {
    return this.poiService.create(createPoiDto);
  }

  @Get()
  findAll() {
    return this.poiService.findAll();
  }

  @Get('/get/:id')
  findOne(@Param('id') id: string) {
    return this.poiService.findOne(+id);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.poiService.remove(+id);
  }

  @Get('/tag')
  findTags() {
    return this.poiService.getAllTag();
  }
  // Tag
  @Post('/tag')
  createTag(@Body() createTagDto: CreateTagDto) { // **ปรับปรุง: กำหนด type เป็น CreateTagDto**
    return this.poiService.createTag(createTagDto);
  }
}
