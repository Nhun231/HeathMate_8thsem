import { Body, Controller, Post } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import { CalculationRepo } from './calculation.repo';
import { CreateCalculationBodyDTO } from './calculation.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Types } from 'mongoose';

@Controller('v1/calculation')
export class CalculationController {
  constructor(
    private readonly calculationService: CalculationService,
    private readonly calculationRepo: CalculationRepo,
  ) {}

  @Post()
  async createCalculation(
    @Body() data: CreateCalculationBodyDTO,
    @ActiveUser('userId') userId: Types.ObjectId,
  ) {
    return this.calculationService.createCalculation({ data, userId });
  }
}
