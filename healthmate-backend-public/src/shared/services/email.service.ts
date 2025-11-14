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

  expertRequestSent(payload: { email: string; name: string }) {
    const expertTemplate = fs.readFileSync(
      path.resolve('src/shared/email-templates/registerExpert.html'),
      { encoding: 'utf-8' },
    );

    const subject = 'Xác nhận đăng ký trở thành chuyên gia dinh dưỡng';

    return this.resend.emails.send({
      from: 'Health Mate <no-reply@yourhealthmate.io.vn>',
      to: [payload.email],
      subject,
      html: expertTemplate
        .replaceAll('{{subject}}', subject)
        .replaceAll('{{username}}', payload.name)
        .replaceAll('{{email}}', payload.email),
    });
  }

  approveExpertRequest(payload: { email: string; name: string }) {
    const approveExpertTemplate = fs.readFileSync(
      path.resolve('src/shared/email-templates/approveExpertRequest.html'),
      { encoding: 'utf-8' },
    );

    const subject = 'Thông báo trạng thái phê duyệt Chuyên gia dinh dưỡng';

    return this.resend.emails.send({
      from: 'Health Mate <no-reply@yourhealthmate.io.vn>',
      to: [payload.email],
      subject,
      html: approveExpertTemplate
        .replaceAll('{{subject}}', subject)
        .replaceAll('{{username}}', payload.name)
        .replaceAll('{{email}}', payload.email)
        .replaceAll('{{link}}', 'https://yourhealthmate.io.vn/'),
    });
  }

  rejectExpertRequest(payload: { email: string; name: string }) {
    const rejectExpertTemplate = fs.readFileSync(
      path.resolve('src/shared/email-templates/rejectExpertRequest.html'),
      { encoding: 'utf-8' },
    );

    const subject = 'Thông báo trạng thái phê duyệt Chuyên gia dinh dưỡng';

    return this.resend.emails.send({
      from: 'Health Mate <no-reply@yourhealthmate.io.vn>',
      to: [payload.email],
      subject,
      html: rejectExpertTemplate
        .replaceAll('{{subject}}', subject)
        .replaceAll('{{username}}', payload.name)
        .replaceAll('{{email}}', payload.email),
    });
  }
}
