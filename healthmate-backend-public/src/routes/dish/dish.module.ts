import { Module } from '@nestjs/common';
import { DishController } from './dish.controller';
import { DishService } from './dish.service';
import { DishRepo } from './dish.repo';
import { MongooseModule } from "@nestjs/mongoose";
import { Dish, DishSchema } from "./schema/dish.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dish.name, schema: DishSchema },
    ]),
  ],
  controllers: [DishController],
  providers: [DishService, DishRepo],
  exports: [DishService, DishRepo],
})
export class DishModule {}
