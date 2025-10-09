import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DishService } from "./dish.service";
import { Dish, DishDocument } from "./schema/dish.schema";
import { PaginateDto } from "../../shared/dtos/paginate.dto";
import { PaginatedResult } from "../../shared/interfaces/paginated-result.interface";
import { ActiveUser } from '../../shared/decorators/active-user.decorator';
import { Types } from 'mongoose';
import { CreateDishBodyDTO, UpdateDishBodyDTO, DishParamsDTO } from './dish.dto';

@Controller('v1/dishes')
export class DishController {
    constructor(private readonly dishService: DishService) {}

    @Get()
    async findAllDish(
        @Query() query: PaginateDto, 
        @ActiveUser('userId') userId?: Types.ObjectId, 
        @ActiveUser('roleName') roleName?: string
    ): Promise<PaginatedResult<DishDocument>> {
        return this.dishService.findAllPaginate(query, userId, roleName);
    }

    @Get(':dishId')
    async findDishById(
        @Param() params: DishParamsDTO,
        @ActiveUser('userId') userId: Types.ObjectId,
        @ActiveUser('roleName') roleName: string,
    ): Promise<DishDocument> {
        return this.dishService.findById(params.dishId, userId, roleName);
    }

    @Post()
    async createDish(
        @Body() body: CreateDishBodyDTO,
        @ActiveUser('userId') userId: Types.ObjectId,
        @ActiveUser('roleName') roleName: string,
    ): Promise<DishDocument> {
        return this.dishService.create(body, userId, roleName);
    }

    @Patch(':dishId')
    async updateDish(
        @Param() params: DishParamsDTO,
        @Body() body: UpdateDishBodyDTO,
        @ActiveUser('userId') userId: Types.ObjectId,
        @ActiveUser('roleName') roleName: string,
    ): Promise<DishDocument> {
        return this.dishService.update(params.dishId, body, userId, roleName);
    }

    @Delete(':dishId')
    async deleteDish(
        @Param() params: DishParamsDTO,
        @ActiveUser('userId') userId: Types.ObjectId,
        @ActiveUser('roleName') roleName: string,
    ): Promise<void> {
        await this.dishService.delete(params.dishId, userId, roleName);
    }
}
