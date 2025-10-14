import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


const MAP_SORT: Record<string, string> = {
  title: 'poi_name',
  score: 'poi_score',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

const UI_TO_DB: Record<string, string> = {
  title: 'poi_name',
  score: 'poi_score',
  tag: 'poi_type',
  address: 'poi_address',
  code: 'poi_code',
  ownerName: 'owner_name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

@Injectable()
export class PoiService {
  constructor(private prisma: PrismaService) {}

  
  async list(raw: any) {
    const q = (raw?.q ?? '').toString().trim();
    const tag = raw?.tag ? raw.tag.toString() : undefined;
    const sortUi: 'title' | 'createdAt' | 'updatedAt' | 'score' =
      ['title', 'createdAt', 'updatedAt', 'score'].includes(raw?.sort) ? raw.sort : 'title';
    const order: 'asc' | 'desc' = raw?.order === 'desc' ? 'desc' : 'asc';

    const page = Math.max(1, parseInt(raw?.page ?? '1', 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(raw?.pageSize ?? '10', 10) || 10));

    const sortDb = MAP_SORT[sortUi] || 'poi_name';

    // where
    const where: any = {};
 
    where['poi_is_delete'] = false;

    if (q) {
      where.OR = [
        { poi_name:    { contains: q, mode: 'insensitive' } },
        { poi_address: { contains: q, mode: 'insensitive' } },
        { poi_code:    { contains: q, mode: 'insensitive' } },
        { owner_name:  { contains: q, mode: 'insensitive' } },
      ];
    }
    if (tag) {
      where['poi_type'] = tag;
    }


    const [items, total] = await this.prisma.$transaction([
      (this.prisma as any).pOI.findMany({
        where,
        orderBy: { [sortDb]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          
          poi_id: true,
          poi_score: true,
          poi_type: true,
          poi_name: true,
          poi_address: true,
          poi_code: true,
          owner_name: true,
          created_at: true,
          updated_at: true,
        },
      }),
      (this.prisma as any).pOI.count({ where }),
    ]);

    // แปลง field -> UI schema
    const mapped = items.map((row: any) => ({
      id: row.poi_id,
      score: row.poi_score,
      tag: row.poi_type,
      title: row.poi_name,
      address: row.poi_address,
      code: row.poi_code,
      ownerName: row.owner_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return {
      items: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async get(id: number) {
    if (!id) throw new BadRequestException('Missing id');
    const row = await (this.prisma as any).pOI.findUnique({ where: { poi_id: id } });
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

  async create(body: any) {
    // ตรวจข้อมูลขั้นต่ำ
    if (!body?.title) throw new BadRequestException('title is required');
    if (!body?.tag) throw new BadRequestException('tag is required');

    
    const data: any = {};
    for (const [uiKey, dbKey] of Object.entries(UI_TO_DB)) {
      if (body[uiKey] !== undefined) data[dbKey] = body[uiKey];
    }
    if (data.poi_score === undefined) data.poi_score = 0;

    const created = await (this.prisma as any).pOI.create({ data });
    return { id: created.poi_id };
  }

  async update(id: number, body: any) {
    if (!id) throw new BadRequestException('Missing id');

    const data: any = {};
    for (const [uiKey, dbKey] of Object.entries(UI_TO_DB)) {
      if (body[uiKey] !== undefined) data[dbKey] = body[uiKey];
    }

    const updated = await (this.prisma as any).pOI.update({
      where: { poi_id: id },
      data,
      select: { poi_id: true },
    });
    return { id: updated.poi_id, ok: true };
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
