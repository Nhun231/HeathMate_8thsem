import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
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
  providers: [MealService],
  exports: [MealService],
})
export class MealModule {}
