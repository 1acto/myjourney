import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new location (Create Location)
   * สร้างข้อมูลตำแหน่งที่ตั้งใหม่ในตาราง Location และตั้งค่า geom
   * @param CreateLocationDto ข้อมูลตำแหน่งที่จะสร้าง
   */
  async create(CreateLocationDto: CreateLocationDto) {
    //Validation
    console.log('Creating Locaiton:', CreateLocationDto);

    try {
      // ข้อมูลทั่วไป
      const location = await this.prisma.location.create({
        data: {
          address: CreateLocationDto.address,
          zipCode: CreateLocationDto.zipCode,
          subDistrict: CreateLocationDto.subDistrict,
          district: CreateLocationDto.district,
          province: CreateLocationDto.province,
          latitude: CreateLocationDto.latitude,
          longitude: CreateLocationDto.longitude,
          isDeleted: false,
          createdById: CreateLocationDto.createById || null,
        },
      });
      await this.verifyLocationTable();
      await this.prisma.$executeRaw`
        UPDATE "Location"
        SET geom = ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)
        WHERE id = ${location.id}
        `;
      return location;
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }

  /**
   * Ensure geometry column and index exist (Verify Location Table)
   * ตรวจสอบและสร้างคอลัมน์ geom และดัชนี GIST สำหรับตาราง Location ถ้ายังไม่มี
   */
  async verifyLocationTable() {
    try {
      // Ensure geometry column exists (only once)
      await this.prisma.$executeRaw`
          ALTER TABLE "Location"
          ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326)
        `;
      // สร้าง GIST index สำหรับ spatial queries
      await this.prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS idx_location_geom_gist
          ON "Location" USING GIST (geom)
        `;
    } catch (error) {
      throw new NotFoundException(`Error: ${error.message}`);
    }
  }

  /**
   * Get all locations (Get All Locations)
   * ดึงรายการตำแหน่งทั้งหมดที่ยังไม่ถูกลบ
   */
  async findAll() {
    try {
      const locations = await this.prisma.location.findMany({
        where: { isDeleted: false },
      });
      return locations;
    } catch (error) {
      throw new NotFoundException(`Locations not found.`);
    }
  }

  /**
   * Get location by ID (Get Location By ID)
   * ดึงตำแหน่งตามรหัส หากไม่พบจะโยน NotFoundException
   * @param id รหัสของตำแหน่งที่ต้องการ
   */
  async findOne(id: number) {
    try {
      const location = await this.prisma.location.findUnique({
        where: { id: id, isDeleted: false },
      });
      if (!location) {
        throw new NotFoundException(`Location with ID ${id} not found.`);
      }
      return location;
    } catch (error) {
      throw new NotFoundException(`Error: ${error.message}`);
    }
  }

  /**
   * Update a location by ID (Update Location)
   * อัพเดตข้อมูลตำแหน่งตามรหัสและอัพเดต geom ตามพิกัดใหม่
   * @param req วัตถุที่ต้องมีฟิลด์ id และฟิลด์ที่จะอัพเดต
   */
  async updateById(req: any) {
    if (!req || !req.id) {
      throw new Error('Error: The request must contain an id.');
    }
    try {
      const update = await this.prisma.location.update({
        where: { id: req.id },
        data: { ...req },
      });
      await this.prisma.$executeRaw`
        UPDATE "Location"
        SET geom = ST_SetSRID(ST_MakePoint(${update.longitude}, ${update.latitude}), 4326)
        WHERE id = ${update.id}
        `;
      return update;
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }

  /**
   * Soft delete a location (Delete Location)
   * ทำเครื่องหมายตำแหน่งว่าเป็นการลบ (isDeleted = true)
   * @param id รหัสของตำแหน่งที่จะลบ
   */
  async detele(id: number) {
    try {
      const deleteLocation = await this.prisma.location.update({
        where: { id },
        data: { isDeleted: true },
      });
      console.log('Deleted Location:', deleteLocation);
      return deleteLocation;
    } catch (error) {
      throw new Error(`Failed: ${error.message}`);
    }
  }
}
