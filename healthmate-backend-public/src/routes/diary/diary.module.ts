import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodDiaryController } from './diary.controller';
import { FoodDiaryService } from './diary.service';
import { Meal, MealSchema } from '../meal/schema/meal.schema';
import { MealRepo } from '../meal/meal.repo';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Meal.name, schema: MealSchema },
        ]),
    ],
    controllers: [FoodDiaryController],
    providers: [FoodDiaryService, MealRepo],
    exports: [FoodDiaryService],
})
export class FoodDiaryModule { }
