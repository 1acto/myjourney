import { Controller } from '@nestjs/common';
import { MvtService } from './mvt.service';

@Controller('mvt')
export class MvtController {
  constructor(private readonly mvtService: MvtService) {}
}
