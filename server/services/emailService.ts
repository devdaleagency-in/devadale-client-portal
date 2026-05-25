import { config } from '../utils/config';

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (config.nodeEnv === 'development') {
    console.log(`\n=== EMAIL (DEV) ===`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html.substring(0, 200)}...`);
    console.log(`==================\n`);
    return;
  }

  // Production: integrate with nodemailer, SendGrid, SES, etc.
  // const transporter = nodemailer.createTransport({ ... });
  // await transporter.sendMail({ from: config.email.from, to, subject, html });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${config.appUrl}/verify-email?token=${token}`;
  await sendEmail(
    to,
    'Verify your email address',
    `<p>Click <a href="${link}">here</a> to verify your email address.</p><p>Link: ${link}</p><p>This link expires in 24 hours.</p>`
  );
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${config.appUrl}/reset-password?token=${token}`;
  await sendEmail(
    to,
    'Reset your password',
    `<p>Click <a href="${link}">here</a> to reset your password.</p><p>Link: ${link}</p><p>This link expires in 1 hour.</p><p>If you did not request this, please ignore this email.</p>`
  );
}
