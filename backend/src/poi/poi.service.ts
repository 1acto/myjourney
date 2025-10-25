import { CreateTagDto } from './dto/create-tag.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePoiDto } from './dto/create-poi.dto';
import { UpdatePoiDto } from './dto/update-poi.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LocationTypeEnum, Prisma } from '@prisma/client';

@Injectable()
export class PoiService {
  constructor(private prisma: PrismaService) {}
  async create(createPoiDto: CreatePoiDto) {
    try {
      console.log('CreatePoiDto:', createPoiDto);
      if (!createPoiDto.location.coordinates) {
        throw new BadRequestException('Location with coordinates is required.');
      }
      const poiLocation = {
        address: createPoiDto.address,
        zipCode: createPoiDto.zipCode,
        subDistrict: createPoiDto.subDistrict,
        district: createPoiDto.district,
        province: createPoiDto.province,
        type: LocationTypeEnum.POI,
        latitude: createPoiDto.location.coordinates[1],
        longitude: createPoiDto.location.coordinates[0],
        isDeleted: false,
        createdById: createPoiDto.createById || null,
      };

      const [location, poi] = await this.prisma.$transaction(
        async function (prisma) {
          const createdLocation = await prisma.location.create({
            data: poiLocation,
          });
          const createdPoi = await prisma.poi.create({
            data: {
              name: createPoiDto.name,
              tagId: createPoiDto.tagId,
              locationId: createdLocation.id,
              createdById: createPoiDto.createById || null,
              isDeleted: false,
            },
          });
          return [createdLocation, createdPoi];
        },
      );
      console.log('Created POI:', poi);
      return { message: `Create POI success, ${poi.name} with id ${poi.id}` };
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException({
          error: 'Prisma Error',
          code: e.code,
          meta: e.meta,
        });
      } else {
        console.error('Error creating POI:', e);
        throw new BadRequestException({
          message: e.message,
        });
      }
    }
  }

  findAll() {
    return this.prisma.poi.findMany({
      where: { isDeleted: false },
      include: {
        location: true,
        tag: true,
      },
    });
  }

  async findOne(id: number) {
    const find = await this.prisma.poi.findFirst({
      where: { id, isDeleted: false },
      include: {
        location: true,
        tag: true,
      },
    });
    if (!find) {
      throw new NotFoundException(`POI with ID ${id} not found.`);
    }
    return this.toGeoJSON(find);
  }

  remove(id: number) {
    return `This action removes a #${id} poi`;
  }

  async createTag(createTagDto: CreateTagDto) {
    const input = {
      name: createTagDto.name,
      point: Number(createTagDto.point),
      createdById: createTagDto.createdById,
    };
    const tag = await this.prisma.tag.create({
      data: input,
    });
    return `Create tag success, ${tag.name} with id ${tag.id}`;
  }

  async getAllTag() {
    return await this.prisma.tag.findMany();
  }

  toGeoJSON(poi: any): any {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [poi.location.longitude, poi.location.latitude],
      },
      properties: {
        id: poi.id,
        name: poi.name,
        tag: poi.tag,
        createdBy: poi.createdById,
        createdAt: poi.createdAt,
        updatedAt: poi.updatedAt,
        location: poi.location,
      },
    };
  }

  async get(id: number) {
    if (!id) throw new BadRequestException('Missing id');
    const row = await (this.prisma as any).pOI.findUnique({
      where: { poi_id: id },
    });
    if (!row) throw new NotFoundException('POI not found');
    return {
      id: row.poi_id,
      score: row.poi_score,
      tag: row.poi_type,
      title: row.poi_name,
      address: row.poi_address,
      code: row.poi_code,
      ownerName: row.owner_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestException('Missing id');

    // ถ้ามีคอลัมน์ poi_is_delete:
    try {
      await (this.prisma as any).pOI.update({
        where: { poi_id: id },
        data: { poi_is_delete: true },
        select: { poi_id: true },
      });
      return { id, ok: true };
    } catch (_e) {
      // ถ้าไม่มีคอลัมน์ดังกล่าว ให้ใช้ delete จริง
      const deleted = await (this.prisma as any).pOI.delete({
        where: { poi_id: id },
        select: { poi_id: true },
      });
      return { id: deleted.poi_id, ok: true };
    }
  }
}
