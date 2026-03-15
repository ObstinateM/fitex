import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!process.env.SMTP_HOST) {
      console.warn('[EmailService] SMTP not configured, skipping email send');
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'Fitex <noreply@fitex.app>',
      to,
      subject,
      html,
    });
  }

  async sendPaymentReceipt(
    to: string,
    data: {
      amount: number;
      productType: string;
      credits: number | null;
      date: Date;
      invoiceUrl: string | null;
    },
  ): Promise<void> {
    const productLabel =
      data.productType === 'unlimited'
        ? 'Unlimited (Monthly)'
        : data.productType === 'pro'
          ? 'Pro Pack'
          : 'Starter Pack';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Payment received</h1>
        <p style="color: #666; margin-bottom: 32px;">Thanks for your purchase!</p>

        <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #666;">Product</span>
            <span style="font-weight: 500;">${productLabel}</span>
          </div>
          ${data.credits ? `<div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span style="color: #666;">Credits</span><span style="font-weight: 500;">${data.credits}</span></div>` : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #666;">Amount</span>
            <span style="font-weight: 500;">${(data.amount / 100).toFixed(2)}€</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Date</span>
            <span style="font-weight: 500;">${data.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        ${data.invoiceUrl ? `<a href="${data.invoiceUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">View Invoice</a>` : ''}

        <p style="color: #999; font-size: 12px; margin-top: 32px;">Fitex · noreply@fitex.app</p>
      </div>
    `;

    await this.sendEmail(to, `Payment received — ${productLabel}`, html);
  }
}
