import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePoiDto } from './dto/create-poi.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
              locationId: createdLocation.id,
              createdById: createPoiDto.createById || null,
              isDeleted: false, // <-- ต้องมี COMMA

              // **เพิ่ม: บันทึกข้อมูลวันที่ไปและความประทับใจ**
              visitDate: createPoiDto.visitDate
                ? new Date(createPoiDto.visitDate)
                : null,
              time: createPoiDto.time ? new Date(createPoiDto.time) : null,
              review: createPoiDto.review, // <-- ต้องมี COMMA
              images: {
                create:
                  createPoiDto.images?.map((image) => ({ url: image.url })) ||
                  [],
              },
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

  findAll(createdById?: number, orderBy?: string, order?: string) {
    const where: any = { isDeleted: false };
    if (createdById) {
      where.createdById = createdById;
    }

    const orderByClause: any = {};
    if (orderBy === 'createdAt') {
      orderByClause.createdAt = order === 'desc' ? 'desc' : 'asc';
    }

    return this.prisma.poi.findMany({
      where,
      orderBy: orderByClause,
      include: {
        location: true,
        images: true,
      },
    });
  }

  async findOne(id: number) {
    const find = await this.prisma.poi.findFirst({
      where: { id, isDeleted: false },
      include: {
        location: true,
        images: true,
      },
    });
    if (!find) {
      throw new NotFoundException(`POI with ID ${id} not found.`);
    }
    return this.toGeoJSON(find);
  }

  remove(id: number) {
    return this.prisma.poi.update({
      where: { id },
      data: { isDeleted: true },
    });
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
        createdBy: poi.createdById,
        createdAt: poi.createdAt,
        updatedAt: poi.updatedAt,
        location: poi.location,

        // **เพิ่ม: ข้อมูลใหม่**
        visitDate: poi.visitDate,
        time: poi.time,
        review: poi.review,
        images: poi.images,
      },
    };
  }

  async getGeoJson(createdById?: number) {
    const where: any = { isDeleted: false };
    if (createdById) {
      where.createdById = createdById;
    }

    const pois = await this.prisma.poi.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        location: true,
        images: true,
      },
    });

    const features = pois.map((poi) => this.toGeoJSON(poi));

    return {
      type: 'FeatureCollection',
      features: features,
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
