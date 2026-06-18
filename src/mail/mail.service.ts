import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { renderTemplate } from './render-template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const info = await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_FROM'),
      to,
      subject,
      html,
    });

    this.logger.log(`Email sent to ${to}, messageId: ${info.messageId}`);
    return info;
  }

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    const html = renderTemplate('password-reset', {
      reset_url: resetUrl,
      support_url:
        this.configService.get<string>('SUPPORT_URL') ??
        'mailto:nanny.service.ukraine@gmail.com',
    });

    return this.sendMail(to, 'Password recovery — Nannies Services', html);
  }
}
