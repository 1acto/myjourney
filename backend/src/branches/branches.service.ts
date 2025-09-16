import { Location } from './../../node_modules/.prisma/client/index.d';
import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationTypeEnum } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { LocationsService } from '../locations/locations.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class BranchesService {
  constructor(
    private prisma: PrismaService,
    private locationsService: LocationsService,
  ) {}
  async create(createBranchDto: CreateBranchDto) {
    console.log('CreateBranchDto:', createBranchDto);
    const data = {
      name: createBranchDto.name,
      address: createBranchDto.address,
      postcode: createBranchDto.postcode || null,
      Long: createBranchDto.long,
      Lat: createBranchDto.lat,
      subdistrict: createBranchDto.subdistrict || null,
      district: createBranchDto.district || null,
      province: createBranchDto.province || null,
      type: LocationTypeEnum.BRANCH,
      is_delete: false,
    };
    const location = await this.locationsService.create(this.toGeoJSON(data));
    const branch = await this.prisma.branch.create({
      data: {
        br_name: createBranchDto.name,
        br_is_delete: false,
        br_location_id: location.locationID,
      },
    });

    // Return the created branch with location data
    return {
      branch: {
        br_id: branch.br_id,
        br_name: branch.br_name,
        br_is_delete: branch.br_is_delete,
        br_location_id: branch.br_location_id,
        created_at: branch.created_at,
      },
      location: {
        loc_id: location.locationID,
        loc_address: data.address,
        loc_postcode: data.postcode,
        loc_lat: data.Lat,
        loc_long: data.Long,
        loc_subdistrict: data.subdistrict,
        loc_district: data.district,
        loc_province: data.province,
      },
    };
  }

  toGeoJSON(branch: any): any {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [branch.Long, branch.Lat],
      },
      properties: {
        name: branch.name,
        address: branch.address,
        postcode: branch.postcode,
        subdistrict: branch.subdistrict,
        district: branch.district,
        province: branch.province,
        type: branch.type,
        is_delete: branch.is_delete,
      },
    };
  }

  findAll() {
    return this.prisma.branch.findMany({
      where: {
        br_is_delete: false,
      },
      include: {
        loc_id: true,
        sales_id: {
          select: {
            usr_id: true,
            usr_firstname: true,
            usr_lastname: true,
            usr_email: true,
          },
        },
        sales_supervisor_id: {
          select: {
            usr_id: true,
            usr_firstname: true,
            usr_lastname: true,
            usr_email: true,
          },
        },
        usr_id: {
          select: {
            usr_id: true,
            usr_firstname: true,
            usr_lastname: true,
            usr_email: true,
          },
        },
      },
      orderBy: {
        br_id: 'asc',
      },
    });
  }

  async findLatestId() {
    return await this.prisma.branch.findFirst({
      orderBy: {
        br_id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    let branchInfo = await this.prisma.branch.findUnique({
      where: {
        br_id: id,
        br_is_delete: false,
      },
    });
    if (!branchInfo) {
      throw new NotFoundException();
    }
    const data = {
      branch: branchInfo,
      location: await this.locationsService.findOne(branchInfo.br_location_id),
    };
    return data;
  }

  update(id: number, updateBranchDto: UpdateBranchDto) {
    return `This action updates a #${id} branch`;
  }

  remove(id: number) {
    return `This action removes a #${id} branch`;
  }
}
