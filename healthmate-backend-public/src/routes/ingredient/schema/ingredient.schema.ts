import mongoose, {HydratedDocument} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

export type IngredientDocument = HydratedDocument<Ingredient>

@Schema({ timestamps: true })
export class Ingredient {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true})
    type: string;

    @Prop({ required: true })
    caloPer100g: number;

    @Prop({ required: true })
    carbsPer100g: number;

    @Prop({ required: true })

    proteinPer100g: number;

    @Prop({ required: true })
    fatPer100g: number;

    @Prop({ required: true })
    fiberPer100g: number;

    @Prop({ required: true })
    sugarPer100g: number;

    @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } })
    belongsTo: mongoose.Types.ObjectId;
}
export const IngredientSchema = SchemaFactory.createForClass(Ingredient);
