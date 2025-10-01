import mongoose, { HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type DishDocument = HydratedDocument<Dish>;

@Schema({ timestamps: true })
export class Dish {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    type: string;

    @Prop({ required: true })
    servings: number;

    @Prop({ 
        type: [{
            ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
            amount: { type: Number, required: true },
            unit: { type: String, required: true, default: 'g' },
            deprecated: { type: Boolean, default: false }
        }],
        required: true,
        default: []
    })
    ingredients: Array<{
        ingredient: mongoose.Types.ObjectId;
        amount: number;
        unit: string;
        deprecated?: boolean;
    }>;

    // Calculated nutritional values per serving
    @Prop({ required: true, default: 0 })
    totalCalories: number;

    @Prop({ required: true, default: 0 })
    totalCarbs: number;

    @Prop({ required: true, default: 0 })
    totalProtein: number;

    @Prop({ required: true, default: 0 })
    totalFat: number;

    @Prop({ required: true, default: 0 })
    totalFiber: number;

    @Prop({ required: true, default: 0 })
    totalSugar: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
    belongsTo: mongoose.Types.ObjectId;
}

export const DishSchema = SchemaFactory.createForClass(Dish);
