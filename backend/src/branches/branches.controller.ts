import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  /**
   * * Create a single branch (Create Branch)
   * สร้างสาขาใหม่จากข้อมูลที่ส่งมา
   * @param createBranchDto รายละเอียดสาขาใหม่
   */
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  @Post('import')
  /**
   * * Create multiple branches (Bulk Import)
   * นำเข้าข้อมูลสาขาจำนวนมากจาก payload
   * @param req.body.data อาร์เรย์ของสาขาที่จะนำเข้า (CreateBranchDto[])
   */
  createMany(@Body() req) {
    const data = req.data as CreateBranchDto[];
    return this.branchesService.createMany(data);
  }

  @Get('/get')
  @Get()
  getBranches(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.branchesService.getBranches(
      Number(page) || 1,
      Number(limit) || 10,
      orderBy || 'id',
      order || 'asc',
    );
  }

  @Get('get/latest-id')
  /**
   * * Find latest branches id
   * ดึงรหัสสาขาล่าสุด
   */
  getLatestID() {
    return this.branchesService.findLatestID();
  }

  @Get()
  /**
   * * Find all branches (List Branches)
   * ดึงข้อมูลสาขาทั้งหมด
   */
  findAll() {
    return this.branchesService.findAll();
  }

  @Get('geojson')
  /**
   * * Find all branches as GeoJSON (List Branches GeoJSON)
   * ดึงข้อมูลสาขาทั้งหมดในรูปแบบ GeoJSON
   */
  findAllAsGeoJSON() {
    return this.branchesService.findAllAsGeoJSON();
  }

  @Get('geojson/:id')
  /**
   * * Find branch by id as GeoJSON (Get Branch GeoJSON)
   * ดึงข้อมูลสาขาเฉพาะตัวในรูปแบบ GeoJSON
   * @param id รหัสสาขาที่ต้องการดึง
   */
  findByIdAsGeojson(@Param('id') id: string) {
    return this.branchesService.findByIdAsGeoJSON(+id);
  }

  @Get(':id')
  /**
   * * Find branch by id (Get Branch)
   * ดึงข้อมูลสาขาโดยใช้รหัส
   * @param id รหัสสาขาที่ต้องการดึง
   */
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(+id);
  }

  @Patch(':id')
  /**
   * * Update branch by id (Update Branch)
   * ปรับปรุงข้อมูลสาขาที่มีอยู่ตามรหัสที่ระบุ
   * @param id รหัสสาขาที่ต้องการปรับปรุง
   * @param updateBranchDto ข้อมูลที่ต้องการอัพเดต
   */
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchesService.update(+id, updateBranchDto);
  }

  @Delete(':id')
  /**
   * * Remove branch by id (Delete Branch)
   * ลบสาขาตามรหัสดังกล่าว
   * @param id รหัสสาขาที่จะลบ
   */
  remove(@Param('id') id: string) {
    return this.branchesService.remove(+id);
  }
}
