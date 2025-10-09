import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { MealRepo } from './meal.repo';
import { Meal, MealSchema } from './schema/meal.schema';
import { Dish, DishSchema } from '../dish/schema/dish.schema';
import { Ingredient, IngredientSchema } from '../ingredient/schema/ingredient.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meal.name, schema: MealSchema },
      { name: Dish.name, schema: DishSchema },
      { name: Ingredient.name, schema: IngredientSchema },
    ]),
  ],
  controllers: [MealController],
  providers: [MealService, MealRepo],
  exports: [MealService, MealRepo],
})
export class MealModule {}
