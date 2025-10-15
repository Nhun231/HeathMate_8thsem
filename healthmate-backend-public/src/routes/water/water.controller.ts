import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Put,
    Query
} from '@nestjs/common';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { WaterService } from './water.service';
import {
    AddWaterDto,
    GetWaterByDateDto,
    UpdateWaterHistoryDto,
    DeleteWaterHistoryDto
} from './water.dto';
import { Types } from 'mongoose';


@Controller('v1/water')
export class WaterController {
    constructor(private readonly waterService: WaterService) { }

    // Lấy dữ liệu nước uống theo ngày (hoặc hôm nay nếu không truyền date)
    @Get()
    async getWaterData(
        @ActiveUser('userId') userId: Types.ObjectId,
        @Query() query?: GetWaterByDateDto
    ) {
        return this.waterService.getWaterData(userId, query);
    }

    // Thêm lượng nước uống mới
    @Post()
    async addWaterIntake(
        @ActiveUser('userId') userId: Types.ObjectId,
        @Body() body: AddWaterDto
    ) {
        return this.waterService.addWaterIntake(userId, body);
    }

    // Cập nhật amount của history item theo recordId
    @Put()
    async updateWaterAmount(
        @ActiveUser('userId') userId: Types.ObjectId,
        @Body() body: UpdateWaterHistoryDto
    ) {
        return this.waterService.updateWaterAmount(userId, body);
    }

    // Xóa history item theo recordId
    @Delete()
    async deleteWaterRecord(
        @ActiveUser('userId') userId: Types.ObjectId,
        @Body() body: DeleteWaterHistoryDto
    ) {
        return this.waterService.deleteWaterRecord(userId, body);
    }
}
