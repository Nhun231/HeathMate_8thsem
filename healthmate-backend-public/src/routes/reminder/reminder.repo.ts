import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  WaterReminderSetting,
  WaterReminderSettingDocument,
} from './schema/reminder.schema';

@Injectable()
export class ReminderRepository {
  private readonly logger = new Logger(ReminderRepository.name);

  constructor(
    @InjectModel(WaterReminderSetting.name)
    private readonly reminderModel: Model<WaterReminderSettingDocument>,
  ) { }

  /** ------------------- CORE UTILITIES ------------------- */

  /**
   * 🧩 Đảm bảo expoPushToken là duy nhất:
   *  - Xóa token trùng ở user khác
   *  - Log lại số token đã bị xóa
   */
  private async ensureUniqueToken(userId: Types.ObjectId, expoPushToken?: string) {
    if (!expoPushToken) return;

    const result = await this.reminderModel.updateMany(
      {
        userId: { $ne: userId },
        expoPushToken,
      },
      { $unset: { expoPushToken: 1 } },
    );

    if (result.modifiedCount > 0) {
      this.logger.warn(
        `⚠️ Removed ${result.modifiedCount} duplicate token(s) (${expoPushToken}) from other users`,
      );
    }
  }

  /** ------------------- MAIN METHODS ------------------- */

  async getSetting(userId: Types.ObjectId) {
    return this.reminderModel.findOne({ userId });
  }

  async createSetting(data: Partial<WaterReminderSetting>) {
    return this.reminderModel.create(data);
  }

  /**
   * ✅ Update setting (bao gồm token nếu có) và đảm bảo token unique
   */
  async updateSetting(userId: Types.ObjectId, data: Partial<WaterReminderSetting>) {
    try {
      if (data.expoPushToken) {
        await this.ensureUniqueToken(userId, data.expoPushToken);
      }

      const updated = await this.reminderModel.findOneAndUpdate(
        { userId },
        data,
        { new: true, upsert: true },
      );

      this.logger.log(`✅ Updated reminder setting for user ${userId.toString()}`);
      return updated;
    } catch (err) {
      this.logger.error(`❌ Failed to update setting for user ${userId.toString()}`, err);
      throw err;
    }
  }

  /**
   * ✅ Update riêng token (vẫn đảm bảo unique)
   */
  async updateToken(userId: Types.ObjectId, expoPushToken: string) {
    try {
      await this.ensureUniqueToken(userId, expoPushToken);

      const updated = await this.reminderModel.findOneAndUpdate(
        { userId },
        { $set: { expoPushToken } },
        { new: true, upsert: true },
      );

      this.logger.log(`✅ Updated unique expoPushToken for user ${userId.toString()}`);
      return updated;
    } catch (err) {
      this.logger.error(
        `❌ Failed to update unique expoPushToken for user ${userId.toString()}`,
        err,
      );
      throw err;
    }
  }

  async getAllSettings() {
    return this.reminderModel.find();
  }

  async getAllSettingsToPushNotify() {
    return this.reminderModel.find({
      expoPushToken: { $exists: true, $ne: '' },  // có token và không rỗng
      schedule: { $exists: true, $not: { $size: 0 } }, // schedule tồn tại và không rỗng
    });
  }


  async clearToken(userId: Types.ObjectId) {
    return this.reminderModel.updateOne(
      { userId },
      { $unset: { expoPushToken: 1 } },
    );
  }
  /** Xóa expoPushToken nếu tồn tại */
  async clearTokenByToken(expoPushToken: string) {
    if (!expoPushToken) return null;

    const result = await this.reminderModel.updateMany(
      { expoPushToken },
      { $unset: { expoPushToken: 1 } },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`✅ Cleared token ${expoPushToken} from ${result.modifiedCount} user(s)`);
    } else {
      this.logger.warn(`⚠️ No matching token found to clear: ${expoPushToken}`);
    }

    return result;
  }
}
