import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query
} from '@nestjs/common';
import { DietPlanService } from './dietplan.service';
import {
  CreateDietPlanBodyDTO,
  UpdateDietPlanBodyDTO,
  GetDietPlanByDateQueryDTO,
} from './dietplan.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@Controller('v1/diet-plan')
export class DietPlanController {
  constructor(private readonly dietPlanService: DietPlanService) {}

  @Post()
  async generateDietPlan(
    @Body() body: CreateDietPlanBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.dietPlanService.generateDietPlan(body, userId);
  }

  @Put()
  async updateDietPlan(
    @Body() body: UpdateDietPlanBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.dietPlanService.updateDietPlan(body, userId);
  }

  @Get('current')
  async getCurrentDietPlan(@ActiveUser('userId') userId: string) {
    return this.dietPlanService.getCurrentDietPlan(userId);
  }

  @Get('by-date')
  async getDietPlanByDate(
    @ActiveUser('userId') userId: string,
    @Query() query: GetDietPlanByDateQueryDTO,
  ) {
    return this.dietPlanService.getDietPlanByDate(userId, query.date);
  }
}
