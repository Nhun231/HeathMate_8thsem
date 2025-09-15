import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

@Injectable()
export class EmailService {
  private resend: Resend;
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  sendOTP(payload: { email: string; code: string }) {
    const otpTemplate = fs.readFileSync(
      path.resolve('src/shared/email-templates/otp.html'),
      { encoding: 'utf-8' },
    );

    const subject = 'OTP Code';

    return this.resend.emails.send({
      from: 'Health Mate <onboarding@resend.dev>',
      to: ['tranduc2004nd01@gmail.com'],
      subject: 'Hello World',
      html: otpTemplate
        .replaceAll('{{subject}}', subject)
        .replaceAll('{{code}}', payload.code),
    });
  }
}
