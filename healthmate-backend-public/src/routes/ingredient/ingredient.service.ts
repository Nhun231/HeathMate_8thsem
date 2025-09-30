import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Ingredient, IngredientDocument} from "./schema/ingredient.schema";
import {Model, Types} from "mongoose";
import {readExcelFile} from "./utils/excel.util";
import {PaginateDto} from "../../shared/dtos/paginate.dto";
import {PaginatedResult} from "../../shared/interfaces/paginated-result.interface";


@Injectable()
export class IngredientService {
    constructor(
        @InjectModel(Ingredient.name) private ingredientModel: Model<IngredientDocument>
    ) {}

    async importFromExcel(): Promise<Ingredient[]>{
        const data = readExcelFile();
        console.log("Service",data.at(0));
        const ingredients = data.map((row: any)=>({
            name: row['Name'],
            type: row['Type'],
            caloPer100g: row['Calo'],
            carbsPer100g: row['Carb'],
            proteinPer100g: row['Protein'],
            fatPer100g: row['Lipid'],
            fiberPer100g: row['Fiber'],
            sugarPer100g: row['Sugar'],
        }))
        console.log("Service",ingredients.at(0));
        await this.ingredientModel.deleteMany({})
        return this.ingredientModel.insertMany(ingredients);
    }

    async findAllPaginate(dto: PaginateDto): Promise<PaginatedResult<IngredientDocument>> {
        const { page = 1, limit = 20, type} = dto;

        const filter: any = {};
        if (type) {
            filter.type = type; // match by type
        }
        
        // 1. Count total docs
        const total = await this.ingredientModel.countDocuments().exec();

        // 2. Compute skip
        const skip = (page - 1) * limit;

        // 3. Query with skip + limit
        const items = await this.ingredientModel
            .find(filter)
            .sort({ _id: 1 }) // consistent ordering
            .skip(skip)
            .limit(limit)
            .exec();

        // 4. Build result with pagination meta
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        } as any;
    }


}
