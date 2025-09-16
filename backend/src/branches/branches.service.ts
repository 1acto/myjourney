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
    return 'Branch created with ID: ' + branch.br_id;
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
    return `This action returns all branches`;
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
