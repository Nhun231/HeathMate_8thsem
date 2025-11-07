import { Controller, Get, Post, Patch, Body } from '@nestjs/common';
import { Types } from 'mongoose';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ReminderService } from './reminder.service';
import {
  UpdateReminderSettingDto,
} from './reminder.dto';
import { IsPublic } from 'src/shared/decorators/auth.decorator';

@Controller('v1/water-reminder')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) { }

  @Post('/reminder-setting')
  async updateReminderSetting(
    @ActiveUser('userId') userId: Types.ObjectId,
    @Body() body: UpdateReminderSettingDto
  ) {
    return this.reminderService.updateSetting(userId, body);
  }

  @Patch('update-token')
  async updateToken(@ActiveUser('userId') userId: Types.ObjectId, @Body('expoPushToken') token: string) {
    return this.reminderService.updateExpoPushToken(userId, token);
  }

  @Get('/reminder-schedule')
  async getReminderSchedule(
    @ActiveUser('userId') userId: Types.ObjectId
  ) {
    return this.reminderService.getOrCreateSetting(userId);
  }

  @Patch('clear-token')
  async clearExpoPushToken(@ActiveUser('userId') userId: Types.ObjectId) {
    return this.reminderService.clearExpoPushToken(userId);
  }

  @Post('/clear-token')
  @IsPublic()
  async clearToken(@Body('expoPushToken') expoPushToken: string) {
    if (!expoPushToken) {
      return { success: false, message: 'Missing expoPushToken' };
    }
    await this.reminderService.clearExpoPushTokenByToken(expoPushToken);
    return { success: true, message: 'Token cleared' };
  }
  
  @Post('send-reminders')
  @IsPublic()
  async sendReminders() {
    try {
      await this.reminderService.sendReminders();
      return { success: true, message: 'Reminders sent' };
    } catch (err) {
      console.error('sendReminders failed:', err);
      throw err; // hoặc: throw new InternalServerErrorException(err.message)
    }
  }


}
