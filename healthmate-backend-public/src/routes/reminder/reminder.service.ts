import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { ReminderRepository } from './reminder.repo';
import { ExpoPushService } from '../../shared/services/expoPush.service';
import { generateSchedule } from './utils/generateSchedule';
import moment from 'moment-timezone';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UpdateReminderSettingType } from './schema/request/reminder.request.schema';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly reminderRepo: ReminderRepository,
    private readonly expoPushService: ExpoPushService,
  ) { }

  async updateSetting(userId: Types.ObjectId, data: UpdateReminderSettingType) {
    return this.reminderRepo.updateSetting(userId, data);
  }

  async updateExpoPushToken(userId: Types.ObjectId, expoPushToken: string) {
    if (!expoPushToken) {
      this.logger.warn(` Attempted to update empty expoPushToken for user ${userId.toString()}`);
      return null;
    }
    return this.reminderRepo.updateToken(userId, expoPushToken);
  }
  async getOrCreateSetting(userId: Types.ObjectId) {
    let setting = await this.reminderRepo.getSetting(userId);
    const isValidSetting =
      setting &&
      typeof setting.wakeUpTime === 'string' &&
      typeof setting.sleepTime === 'string' &&
      typeof setting.reminderGap === 'number';

    if (!isValidSetting) {
      const defaultWakeUp = '06:00';
      const defaultSleep = '23:00';
      const defaultGap = 90;
      const schedule = generateSchedule(defaultWakeUp, defaultSleep, defaultGap);

      if (!setting) {
        setting = await this.reminderRepo.createSetting({
          userId,
          wakeUpTime: defaultWakeUp,
          sleepTime: defaultSleep,
          reminderGap: defaultGap,
          schedule,
        });
      } else {
        setting = await this.reminderRepo.updateSetting(userId, {
          wakeUpTime: defaultWakeUp,
          sleepTime: defaultSleep,
          reminderGap: defaultGap,
          schedule,
        });
      }
    }

    return setting;
  }

  async clearExpoPushToken(userId: Types.ObjectId) {
    try {
      const result = await this.reminderRepo.clearToken(userId);
      if (result.modifiedCount > 0) {
        this.logger.log(` Cleared expoPushToken for user ${userId.toString()}`);
      } else {
        this.logger.warn(` No expoPushToken found to clear for user ${userId.toString()}`);
      }
      return { success: true, message: 'Token cleared successfully' };
    } catch (err) {
      this.logger.error(` Failed to clear expoPushToken for user ${userId.toString()}`, err);
      throw err;
    }
  }

  async clearExpoPushTokenByToken(expoPushToken: string) {
    if (!expoPushToken) return null;
    return this.reminderRepo.clearTokenByToken(expoPushToken);
  }
  // Cron job: chạy mỗi phút để check và gửi nhắc nhở
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      await this.sendReminders();
    } catch (err) {
      this.logger.error('Cron job failed', err);
    }
  }

  async sendReminders() {
    const timezone = 'Asia/Ho_Chi_Minh';
    const currentTimeStr = moment().tz(timezone).format('HH:mm');

    let settings: any[];
    try {
      settings = await this.reminderRepo.getAllSettings();
    } catch (err) {
      this.logger.error('Failed to fetch settings', err);
      return;
    }

    const sentTokens = new Set<string>();

    for (const setting of settings) {
      const userIdStr = setting.userId?.toString() || 'unknown';
      const { schedule, expoPushToken } = setting;

      if (sentTokens.has(expoPushToken)) continue;
      sentTokens.add(expoPushToken);

      // Chỉ lấy schedule khớp giờ hiện tại và có amount
      const match = schedule.find(item => item.time === currentTimeStr && item.amount);
      if (!match) continue;

      try {
        await this.expoPushService.sendPushNotification(
          expoPushToken,
          '💧 Nhắc nhở uống nước',
          `Đã đến lúc uống ${match.amount}ml nước!`,
          { type: 'water-reminder' },
        );
        this.logger.log(` Sent reminder to user ${userIdStr} for ${match.amount}ml`);
      } catch (err) {
        this.logger.error(` Failed push for user ${userIdStr}`, err);
      }
    }
  }
}
