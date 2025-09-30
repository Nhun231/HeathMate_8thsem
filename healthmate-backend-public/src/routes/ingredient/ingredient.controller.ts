import {Controller, Get, Param, Post, Query} from '@nestjs/common';
import {IngredientService} from "./ingredient.service";
import {Ingredient, IngredientDocument} from "./schema/ingredient.schema";
import {PaginateDto} from "../../shared/dtos/paginate.dto";
import {PaginatedResult} from "../../shared/interfaces/paginated-result.interface";

@Controller('v1/ingredients')
export class IngredientController {
    constructor(private readonly ingredientService: IngredientService) {}

    @Post('/import')
    async importIngredients(): Promise<Ingredient[]> {
        console.log('Import Ingredients');
        return this.ingredientService.importFromExcel()
    }

    // Get all ingredients
    @Get()
    async findAllIngredient(@Query() query: PaginateDto): Promise<PaginatedResult<IngredientDocument>> {
        return this.ingredientService.findAllPaginate(query);
    }
}
