import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
});

export async function sendOwnerContactEmail(params: {
  to: string;
  boardPublicId: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  message: string;
  locationText?: string;
}) {
  const { to, boardPublicId, senderName, senderEmail, senderPhone, message, locationText } = params;
  const lines = [
    `Board: ${boardPublicId}`,
    `Sender: ${senderName}`,
    senderEmail ? `Email: ${senderEmail}` : 'Email: not provided',
    senderPhone ? `Phone: ${senderPhone}` : 'Phone: not provided',
    locationText ? `Location: ${locationText}` : 'Location: not provided',
    '',
    message
  ];

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: `Message about board ${boardPublicId}`,
    text: lines.join('\n')
  });
}
