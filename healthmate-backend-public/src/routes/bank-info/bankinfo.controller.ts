import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BankInfoService } from './bankinfo.service';
import { ActiveUser } from '../../shared/decorators/active-user.decorator';
import { Types } from 'mongoose';
import { CreateBankInfoDTO, UpdateBankInfoDTO, BankInfoParamsDTO } from './bankinfo.dto';
import { BankInfoDocument } from './schema/bankinfo.schema';

@Controller('v1/bankinfo')
export class BankInfoController {
    constructor(private readonly bankInfoService: BankInfoService) {}

    @Get()
  async findByUserId(@ActiveUser('userId') userId: Types.ObjectId): Promise<BankInfoDocument | null> {
    return this.bankInfoService.findByUserId(userId);
  }

    @Post()
    async create(
        @Body() body: CreateBankInfoDTO,
        @ActiveUser('userId') userId: Types.ObjectId,
    ): Promise<BankInfoDocument> {
        return this.bankInfoService.create(body, userId);
    }

    @Patch(':bankInfoId')
    async update(
        @Param() params: BankInfoParamsDTO,
        @Body() body: UpdateBankInfoDTO,
        @ActiveUser('userId') userId: Types.ObjectId,
    ): Promise<BankInfoDocument> {
        return this.bankInfoService.update(params.bankInfoId, body, userId);
    }

    @Delete(':bankInfoId')
    async delete(
        @Param() params: BankInfoParamsDTO,
        @ActiveUser('userId') userId: Types.ObjectId,
    ): Promise<void> {
        return this.bankInfoService.delete(params.bankInfoId, userId);
    }
}
