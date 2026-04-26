import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM = process.env.EMAIL_FROM || 'noreply@tgfunchub.com';

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const url = `${APP_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: `"TG FUN HUB" <${FROM}>`,
    to,
    subject: 'Verify your TG FUN HUB account',
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;color:#0a0a0a">
        <h1 style="font-size:24px;font-weight:600;margin-bottom:8px;letter-spacing:-0.02em">Verify your email</h1>
        <p style="color:#525252;margin-bottom:32px;line-height:1.6">
          Thanks for joining TG FUN HUB. Click the button below to verify your email address and activate your account.
        </p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#0a0a0a;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
          Verify Email
        </a>
        <p style="margin-top:24px;color:#a3a3a3;font-size:13px">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
        <p style="margin-top:8px;color:#a3a3a3;font-size:12px;word-break:break-all">
          Or copy this URL: ${url}
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const url = `${APP_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: `"TG FUN HUB" <${FROM}>`,
    to,
    subject: 'Reset your TG FUN HUB password',
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;color:#0a0a0a">
        <h1 style="font-size:24px;font-weight:600;margin-bottom:8px;letter-spacing:-0.02em">Reset your password</h1>
        <p style="color:#525252;margin-bottom:32px;line-height:1.6">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#0a0a0a;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
          Reset Password
        </a>
        <p style="margin-top:24px;color:#a3a3a3;font-size:13px">
          This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="margin-top:8px;color:#a3a3a3;font-size:12px;word-break:break-all">
          Or copy this URL: ${url}
        </p>
      </div>
    `,
  });
}
