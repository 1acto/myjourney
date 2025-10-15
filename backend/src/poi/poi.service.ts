import { CreateTagDto } from './dto/create-tag.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePoiDto } from './dto/create-poi.dto';
import { UpdatePoiDto } from './dto/update-poi.dto';
import { PrismaService } from 'src/prisma/prisma.service';
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

  update(id: number, updatePoiDto: UpdatePoiDto) {
    return `This action updates a #${id} poi`;
  }

  remove(id: number) {
    return `This action removes a #${id} poi`;
  }

  async createTag(createTagDto: CreateTagDto) {
    const input = {
      name: CreateTagDto.name,
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
}
