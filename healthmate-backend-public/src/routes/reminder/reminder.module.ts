import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios'; // import HttpModule
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { ReminderRepository } from './reminder.repo';
import { ExpoPushService } from '../../shared/services/expoPush.service';

import {
  WaterReminderSetting,
  WaterReminderSettingSchema,
} from './schema/reminder.schema';

@Module({
  imports: [
    HttpModule, 
    MongooseModule.forFeature([
      { name: WaterReminderSetting.name, schema: WaterReminderSettingSchema },
    ]),
  ],
  controllers: [ReminderController],
  providers: [ReminderService, ReminderRepository, ExpoPushService],
  exports: [ReminderService, ExpoPushService], 
})
export class ReminderModule {}
