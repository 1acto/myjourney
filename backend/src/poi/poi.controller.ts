import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PoiService } from './poi.service';
import { CreatePoiDto } from './dto/create-poi.dto';

// todo: ลบ
type ListQuery = {
  q?: string; // คำค้น: ชื่อ/ที่อยู่/โค้ด/เจ้าของ
  sort?: 'title' | 'createdAt' | 'updatedAt' | 'score';
  order?: 'asc' | 'desc';
  page?: string | number; // รับเป็น string จาก query ได้
  pageSize?: string | number; // รับเป็น string จาก query ได้
};

type CreateBody = {
  title: string;
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
  findAll(
    @Query('createdById') createdById?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: string,
  ) {
    return this.poiService.findAll(
      createdById ? +createdById : undefined,
      orderBy,
      order,
    );
  }

  @Get('/geojson')
  getGeoJson(@Query('createdById') createdById?: string) {
    return this.poiService.getGeoJson(createdById ? +createdById : undefined);
  }

  @Get('/get/:id')
  findOne(@Param('id') id: string) {
    return this.poiService.findOne(+id);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.poiService.remove(+id);
  }
}
