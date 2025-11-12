import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import envConfig from '../utils/config';

@Injectable()
export class EmailService {
  private resend: Resend;
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  sendOTP(payload: { email: string; code: string }) {
    const otpTemplate = fs.readFileSync(
      path.resolve('src/shared/email-templates/otp.html'),
      { encoding: 'utf-8' },
    );

    const subject = 'OTP Code';

    return this.resend.emails.send({
      from: 'Health Mate <no-reply@yourhealthmate.io.vn>',
      to: [payload.email],
      subject: 'Mã OTP của bạn',
      html: otpTemplate
        .replaceAll('{{subject}}', subject)
        .replaceAll('{{code}}', payload.code),
    });
  }
}
