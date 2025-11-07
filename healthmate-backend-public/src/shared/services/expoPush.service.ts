import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ExpoPushData {
  [key: string]: any;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Gửi thông báo push đến một token Expo
   * @param expoPushToken Token nhận thông báo
   * @param title Tiêu đề
   * @param body Nội dung
   * @param data Payload bổ sung
   */
  async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data: ExpoPushData = {},
  ) {
    if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
      throw new Error('Invalid Expo Push Token');
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    };
    

    try {
      // firstValueFrom chuyển Observable sang Promise để dùng async/await
      const response = await firstValueFrom(
        this.httpService.post(EXPO_PUSH_URL, message, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Expo Push Error:', error.response?.data || error.message);
      throw error;
    }
  }
}
