import { Module } from '@nestjs/common';
import { CalculationController } from './calculation.controller';
import { CalculationService } from './calculation.service';
import { CalculationRepo } from './calculation.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { Calculation, CalculationSchema } from './schema/calculation.schema';

@Module({
  controllers: [CalculationController],
  providers: [CalculationService, CalculationRepo],
  imports: [
    MongooseModule.forFeature([
      { name: Calculation.name, schema: CalculationSchema },
    ]),
  ],
  exports: [CalculationRepo],
})
export class CalculationModule {}
