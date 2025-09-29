import { Module } from '@nestjs/common';
import { DietPlanController } from './dietplan.controller';
import { DietPlanService } from './dietplan.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DietPlanRepo } from './dietplan.repo';
import { DietPlan, DietPlanSchema } from './schema/dietplan.schema';
import { CalculationModule } from '../calculation/calculation.module';

@Module({
  controllers: [DietPlanController],
  providers: [DietPlanService, DietPlanRepo],
  imports: [
    MongooseModule.forFeature([
      { name: DietPlan.name, schema: DietPlanSchema },
    ]),
    CalculationModule,
  ],
})
export class DietPlanModule {}
