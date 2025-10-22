import { Module } from '@nestjs/common';
import { WaterController } from './water.controller';
import { WaterService } from './water.service';
import { WaterRepository } from './water.repo';
import { CalculationRepo } from '../calculation/calculation.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { UserWaterData, UserWaterDataSchema } from './schema/water.schema';
import { Calculation, CalculationSchema } from '../calculation/schema/calculation.schema';

@Module({
    controllers: [WaterController],
    providers: [WaterService, WaterRepository, CalculationRepo],
    imports: [
        MongooseModule.forFeature([
            { name: UserWaterData.name, schema: UserWaterDataSchema },
        ]),
        MongooseModule.forFeature([{ name: Calculation.name, schema: CalculationSchema }]),

    ],
})
export class WaterModule { }
