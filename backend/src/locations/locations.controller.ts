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
  constructor(private readonly locationsService: LocationsService) { }

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
  async update(
    @Param('id') id: string,
    @Body() body: any
  ) {
    return this.locationsService.updateById({ id: Number(id), body });
  }
  /**
   * 🗺️ GET MAP TILE ENDPOINT
   * This handles requests from the map (like Mapbox) asking for location data
   *
   * URL pattern: /locations/mvt/{z}/{x}/{y}.pbf
   * Example: /locations/mvt/14/123/456.pbf
   *
   * The map automatically calls this when you zoom/pan to get location data for that area
   */
  // @Get('mvt/:z/:x/:y.pbf')
  // async getTile(
  //   @Param('z') z: string, // Zoom level from URL
  //   @Param('x') x: string, // Tile X coordinate from URL
  //   @Param('y') y: string, // Tile Y coordinate from URL
  //   @Res({ passthrough: true }) res: Response, // Response object to send data back
  // ): Promise<void> {
  //   try {
  //     // Ask our service to generate the tile data
  //     const buf = await this.locationsService.mvt(+z, +x, +y); // +z converts string to number

  //     // If there's no data for this tile area, return "no content"
  //     if (!buf || buf.length === 0) {
  //       res.status(204).end(); // 204 = No Content
  //       return;
  //     }

  //     // Set proper headers so the map knows this is vector tile data
  //     res.setHeader('Content-Type', 'application/vnd.mapbox-vector-tile'); // Tell browser it's map data
  //     res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600'); // Cache for 5-10 minutes

  //     // Send the tile data back to the map
  //     res.end(buf);
  //   } catch (e) {
  //     // If something goes wrong, clean up and let error handler deal with it
  //     res.removeHeader('Content-Type');
  //     throw e;
  //   }
  // }

  //bulk import geojson (must be feature collection)
  @Post('import')
  /**
   * Bulk import locations (Import Locations)
   * นำเข้าตำแหน่งจำนวนมากจาก GeoJSON FeatureCollection
   * @param req ข้อมูล GeoJSON ที่จะนำเข้า (ต้องเป็น FeatureCollection)
   */
  import(@Body() req: any) {
    console.log('Request Body:', req);
    return this.locationsService.createMany(req);
  }
}

