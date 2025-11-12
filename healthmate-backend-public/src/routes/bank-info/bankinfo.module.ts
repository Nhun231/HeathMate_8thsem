import { Module } from '@nestjs/common';
import { BankInfoController } from './bankinfo.controller';
import { BankInfoService } from './bankinfo.service';
import { BankInfoRepo } from './bankinfo.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { BankInfo, BankInfoSchema } from './schema/bankinfo.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: BankInfo.name, schema: BankInfoSchema }]),
    ],
    controllers: [BankInfoController],
    providers: [BankInfoService, BankInfoRepo],
    exports: [BankInfoService, BankInfoRepo],
})
export class BankInfoModule {}
