import {Body, Controller, Delete, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {IngredientService} from "./ingredient.service";
import {Ingredient, IngredientDocument} from "./schema/ingredient.schema";
import {PaginateDto} from "../../shared/dtos/paginate.dto";
import {PaginatedResult} from "../../shared/interfaces/paginated-result.interface";
import { ActiveUser } from '../../shared/decorators/active-user.decorator';
import { Types } from 'mongoose';
import { CreateIngredientBodyDTO, UpdateIngredientBodyDTO, IngredientParamsDTO } from './ingredient.dto';

@Controller('v1/ingredients')
export class IngredientController {
    constructor(private readonly ingredientService: IngredientService) {}

    @Post('/import')
    async importIngredients(): Promise<Ingredient[]> {
        console.log('Import Ingredients');
        return this.ingredientService.importFromExcel()
    }

    // Get user's custom ingredients only (must be before general GET route)
    @Get('/my-ingredients')
    async getMyIngredients(@Query() query: PaginateDto, @ActiveUser('userId') userId: Types.ObjectId): Promise<PaginatedResult<IngredientDocument>> {
        return this.ingredientService.findUserCustomIngredients(query, userId);
    }

    // Get all ingredients
    @Get()
    async findAllIngredient(@Query() query: PaginateDto, @ActiveUser('userId') userId?: Types.ObjectId, @ActiveUser('roleName') roleName?: string): Promise<PaginatedResult<IngredientDocument>> {
        return this.ingredientService.findAllPaginate(query, userId, roleName);
    }

    @Post()
    async createIngredient(
        @Body() body: CreateIngredientBodyDTO,
        @ActiveUser('userId') userId: Types.ObjectId,
        @ActiveUser('roleName') roleName: string,
    ): Promise<IngredientDocument> {
        return this.ingredientService.create(body, userId, roleName);
    }

    @Patch(':ingredientId')
    async updateIngredient(
        @Param() params: IngredientParamsDTO,
        @Body() body: UpdateIngredientBodyDTO,
        @ActiveUser('userId') userId: Types.ObjectId,
        @ActiveUser('roleName') roleName: string,
    ): Promise<IngredientDocument> {
        return this.ingredientService.update(params.ingredientId, body, userId, roleName);
    }

    @Delete(':ingredientId')
    async deleteIngredient(
        @Param() params: IngredientParamsDTO,
        @ActiveUser('userId') userId: Types.ObjectId,
        @ActiveUser('roleName') roleName: string,
    ): Promise<void> {
        await this.ingredientService.delete(params.ingredientId, userId, roleName);
    }
}
