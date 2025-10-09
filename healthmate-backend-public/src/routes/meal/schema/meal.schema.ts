import mongoose, { HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type MealDocument = HydratedDocument<Meal>;

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch', 
  DINNER = 'dinner',
  SNACK = 'snack'
}

@Schema({ timestamps: true })
export class Meal {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, enum: MealType })
  mealType: MealType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Dish' })
  dishId?: mongoose.Types.ObjectId;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  calories: number;

  @Prop({ required: true, min: 0 })
  protein: number;

  @Prop({ required: true, min: 0 })
  fat: number;

  @Prop({ required: true, min: 0 })
  carbs: number;

  @Prop({ required: true, min: 0 })
  fiber: number;

  @Prop({ required: true, min: 0 })
  sugar: number;

  @Prop({ default: false })
  isIngredient: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' })
  ingredientId?: mongoose.Types.ObjectId;
}

export const MealSchema = SchemaFactory.createForClass(Meal);

MealSchema.index({ userId: 1, date: 1, mealType: 1 });
