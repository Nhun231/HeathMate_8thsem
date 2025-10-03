import { Controller, Get, Query } from '@nestjs/common';
import { FoodDiaryService } from './diary.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@Controller('v1/food-diary')
export class FoodDiaryController {
    constructor(private readonly foodDiaryService: FoodDiaryService) { }

    /**
     * Lấy nhật ký ăn uống hôm nay
     * GET /v1/food-diary/today
     */
    @Get('today')
    async getTodayDiary(@ActiveUser('userId') userId: string) {
        return this.foodDiaryService.getDiaryByDate(userId);
    }

    @Get()
    async getDiaryByDate(
        @ActiveUser('userId') userId: string,
        @Query('date') date?: string,
    ) {
        return this.foodDiaryService.getDiaryByDate(userId, date);
    }

}
