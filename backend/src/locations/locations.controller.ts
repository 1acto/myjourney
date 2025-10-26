import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  /**
   * Create a location (Create Location)
   * สร้างข้อมูลตำแหน่งที่ตั้งใหม่
   * @param req ข้อมูลตำแหน่งที่ต้องการสร้าง
   */
  create(@Body() req) {
    console.log('Request Body:', req);
    return this.locationsService.create(req);
  }

  // เพิ่ม endpoint ดึง location ตาม id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const locationId = Number(id); // แปลงเป็น number
    return this.locationsService.findOne(locationId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.locationsService.updateById({ id: Number(id), body });
  }
}
