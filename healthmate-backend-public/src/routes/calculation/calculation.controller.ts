import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import {
  CreateCalculationBodyDTO,
  DeleteCalculationParamsDTO,
  GetCalculationParamsDTO,
} from './calculation.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Types } from 'mongoose';

@Controller('v1/calculation')
export class CalculationController {
  constructor(private readonly calculationService: CalculationService) { }

  @Post()
  async createCalculation(
    @Body() data: CreateCalculationBodyDTO,
    @ActiveUser('userId') userId: Types.ObjectId,
  ) {
    return this.calculationService.createCalculation({ data, userId });
  }

  @Get('/details/:calculationId')
  async findCalculationById(@Param() params: GetCalculationParamsDTO) {
    return this.calculationService.findById(params.calculationId);
  }

  @Get('user/list')
  async findCalculationByUserId(@ActiveUser('userId') userId: Types.ObjectId) {
    return this.calculationService.findByUserId(userId);
  }

  @Delete('/details/:calculationId')
  async deleteCalculationById(@Param() params: DeleteCalculationParamsDTO) {
    return this.calculationService.delete(params.calculationId);
  }

  @Get('user/latest')
  async findLatestByUserId(
    @ActiveUser('userId') userId: Types.ObjectId,
  ) {
    return this.calculationService.findLatestByUserId(userId);
  }

}
