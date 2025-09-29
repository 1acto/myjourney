import { ConflictException, Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { LocationTypeEnum } from '@prisma/client';
import { LocationsService } from '../locations/locations.service';
import { NotFoundException } from '@nestjs/common';
import { skip } from 'node:test';

@Injectable()
export class BranchesService {
  constructor(
    private prisma: PrismaService,
    private locationsService: LocationsService,
  ) {}

  /**
   * Create a single branch (Create Branch)
   * สร้างสาขาใหม่และสร้างบันทึกตำแหน่งที่ตั้งสำหรับสาขานั้น
   * @param createBranchDto ข้อมูลสาขาและตำแหน่งที่จะสร้าง
   */
  async create(createBranchDto: CreateBranchDto) {
    console.log('CreateBranchDto:', createBranchDto);
    const isDuplicate = await this.prisma.branch.findUnique({
      where: {
        email: createBranchDto.email,
      },
    });
    if (isDuplicate) {
      throw new ConflictException('Branch with this email already exists.');
    }
    const branchLocation = {
      address: createBranchDto.address,
      zipCode: createBranchDto.zipCode,
      subDistrict: createBranchDto.subDistrict,
      district: createBranchDto.district,
      province: createBranchDto.province,
      type: LocationTypeEnum.BRANCH,
      latitude: createBranchDto.location.coordinates[1],
      longitude: createBranchDto.location.coordinates[0],
      isDeleted: false,
      createdById: createBranchDto.createById || null,
    };
    const location = await this.locationsService.create(branchLocation);
    const branch = await this.prisma.branch.create({
      data: {
        name: createBranchDto.name,
        email: createBranchDto.email,
        salesId: createBranchDto.salesId,
        salesSupervisorId: createBranchDto.supervisorId || null,
        locationId: location.id,
        createdById: createBranchDto.createById || null,
        isDeleted: false,
      },
    });
    // Return the created branch with location data
    return this.toGeoJSON(location, branch);
  }

  /**
   * Create multiple branches (Bulk Create Branches)
   * นำเข้าข้อมูลสาขาจำนวนมาก และสร้างตำแหน่งสำหรับแต่ละสาขา
   * @param createBranchDto อาร์เรย์ของสาขาที่จะสร้าง (CreateBranchDto[])
   */
  async createMany(createBranchDto: CreateBranchDto[]) {
    console.log('CreateBranchDto:', createBranchDto);
    for (const dto of createBranchDto) {
      const isDuplicate = await this.prisma.branch.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (isDuplicate) {
        console.log(
          'Branch with this email already exists. skipping: ' + dto.name,
        );
        continue;
      }
      const branchLocation = {
        address: dto.address,
        zipCode: dto.zipCode,
        subDistrict: dto.subDistrict,
        district: dto.district,
        province: dto.province,
        type: LocationTypeEnum.BRANCH,
        latitude: dto.location.coordinates[1],
        longitude: dto.location.coordinates[0],
        isDeleted: false,
        createdById: dto.createById || null,
      };

      const location = await this.locationsService.create(branchLocation);
      const branch = await this.prisma.branch.create({
        data: {
          name: dto.name,
          email: dto.email,
          salesId: dto.salesId,
          salesSupervisorId: dto.supervisorId || null,
          locationId: location.id,
          createdById: dto.createById || null,
          isDeleted: false,
        },
      });
      console.log('Created branch: ' + branch.name);
    }
  }
  /**
   * Find all branches (Get All Branches)
   * ดึงรายการสาขาทั้งหมดที่ยังไม่ถูกลบ
   */
  async findAll() {
    try {
      const branches = await this.prisma.branch.findMany({
        where: { isDeleted: false },
      });
      return branches;
    } catch (error) {
      throw new NotFoundException(`Branches not found.`);
    }
  }

  /**
   * Find branch by id (Get Branch By ID)
   * ดึงสาขาหนึ่งรายการตามรหัส หากไม่พบจะโยน NotFound
   * @param id รหัสของสาขาที่ต้องการ
   */
  async findOne(id: number) {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id: id, isDeleted: false },
        include: { location: true },
      });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${id} not found.`);
      }
      return branch;
    } catch (error) {
      throw new NotFoundException(`Error: ${error.message}`);
    }
  }

  /**
   * Update branch by id (Update Branch)
   * อัพเดตข้อมูลสาขาและตำแหน่ง (ถ้ามี) ตามรหัสสาขา
   * @param id รหัสของสาขาที่จะอัพเดต
   * @param updateBranchDto ข้อมูลที่ต้องการอัพเดตสำหรับสาขา
   */
  async update(id: number, updateBranchDto: UpdateBranchDto) {
    const locationData = updateBranchDto.location;
    try {
      if (locationData) {
        const location = await this.locationsService.updateById(locationData);
      }
      const branch = await this.prisma.branch.update({
        where: { id: id, isDeleted: false },
        data: {
          name: updateBranchDto.name,
          email: updateBranchDto.email,
          salesId: updateBranchDto.salesId,
          salesSupervisorId: updateBranchDto.supervisorId,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Branch with ID ${id} not found.`);
    }
  }

  /**
   * Find all branches as GeoJSON (Get All Branches GeoJSON)
   * ดึงสาขาทั้งหมดที่มีตำแหน่ง และแปลงเป็น GeoJSON
   */
  async findAllAsGeoJSON() {
    try {
      const branches = await this.prisma.branch.findMany({
        where: {
          isDeleted: false,
          location: {
            is: {
              latitude: { not: 0 },
              longitude: { not: 0 },
            },
          },
        },
        include: { location: true },
      });
      const geoJSON = {
        type: 'FeatureCollection',
        features: branches.map((branch) =>
          this.toGeoJSON(branch.location, branch),
        ),
      };
      return geoJSON;
    } catch (error) {
      throw new NotFoundException(`Branches not found.`);
    }
  }

  /**
   * Find branch by id as GeoJSON (Get Branch GeoJSON By ID)
   * ดึงสาขาเฉพาะตัวตามรหัสและแปลงเป็น GeoJSON
   * @param id รหัสของสาขาที่ต้องการ
   */
  async findByIdAsGeoJSON(id: number) {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id: id, isDeleted: false },
        include: { location: true },
      });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${id} not found.`);
      }
      return this.toGeoJSON(branch.location, branch);
    } catch (error) {
      throw new NotFoundException(`Error: ${error.message}`);
    }
  }

  /**
   * Remove branch by id (Delete Branch)
   * ทำเครื่องหมายสาขาว่าถูกลบและลบตำแหน่งที่เกี่ยวข้อง
   * @param id รหัสของสาขาที่จะลบ
   */
  async remove(id: number) {
    try {
      const branch = await this.prisma.branch.update({
        where: { id: id, isDeleted: false },
        data: { isDeleted: true },
      });
      const location = await this.locationsService.detele(branch.locationId);
      return { 'Deleted: ': branch.id };
    } catch (error) {
      throw new NotFoundException(`Branch with ID ${id} not found.`);
    }
  }

  /**
   * Make GeoJSON from branch and location data
   * สร้าง GeoJSON จากข้อมูลสาขาและตำแหน่ง
   * @param location ข้อมูลตำแหน่งที่ตั้ง
   * @param branch ข้อมูลสาขา
   */
  toGeoJSON(location: any, branch: any): any {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      properties: {
        id: branch.id,
        name: branch.name,
        ownderEmail: branch.ownerEmail,
        salesId: branch.salesId,
        salesSupervisorId: branch.salesSupervisorId,
        createdBy: branch.createdById,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
        //location info
        locationId: location.id,
        address: location.address,
        zipCode: location.zipCode,
        subDistrict: location.subDistrict,
        district: location.district,
        province: location.province,
        type: location.type,
        latitude: location.latitude,
        longtitude: location.longitude,
        createdById: location.createdById,
      },
    };
  }
}
