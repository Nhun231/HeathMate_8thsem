import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import {
  CreateCalculationBodyDTO,
  DeleteCalculationParamsDTO,
  GetCalculationParamsDTO,
  UpdateNutrientDto,
} from './calculation.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { DeleteResult, Types } from 'mongoose';
import {IsPublic} from "../../shared/decorators/auth.decorator";


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
  async deleteCalculationById(
    @Param() params: DeleteCalculationParamsDTO,
  ): Promise<DeleteResult> {
    return this.calculationService.delete(params.calculationId);
  }

  @Get('user/latest')

  async findLatestByUserId(
    @ActiveUser('userId') userId: Types.ObjectId,
  ) {
    return this.calculationService.findLatestByUserId(userId);
  }

  @Patch('/update/nutrient')
  async updateNutrients(
    @ActiveUser('userId') userId: Types.ObjectId,
    @Body() dto: UpdateNutrientDto,
  ) {
    return this.calculationService.updateNutrient(userId, dto);
  }
  @Get('user/latest/:userId')
  @IsPublic()
  async findLatestByUserIdPublic(@Param('userId') userId: string) {
    const objectId = new Types.ObjectId(userId);
    return this.calculationService.findLatestByUserId(objectId);
  }

  @Get('user/list/:userId')
  @IsPublic()
  async findAllCalculationByUserId(@Param('userId') userId: string) {
    const objectId = new Types.ObjectId(userId);
    return this.calculationService.findByUserId(objectId);
  }
}
