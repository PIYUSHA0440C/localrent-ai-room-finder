import { Resend } from 'resend';
import config from '../config/env.js';

let resend = null;

if (config.resend.apiKey) {
  resend = new Resend(config.resend.apiKey);
  console.log('Resend email service initialized');
} else {
  console.warn('Resend API key not found. Email sending will be disabled.');
}

// Send verification email
export const sendVerificationEmail = async (email, name, token) => {
  if (!resend) {
    console.log(`[DEV] Verification link for ${email}: ${config.clientUrl}/verify-email/${token}`);
    return;
  }

  const verifyUrl = `${config.clientUrl}/verify-email/${token}`;

  await resend.emails.send({
    from: config.resend.emailFrom,
    to: email,
    subject: 'Verify your LocalRent account',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #E67E22; margin: 0;">LocalRent</h1>
          <p style="color: #666; margin-top: 4px;">Find your perfect room</p>
        </div>
        <h2 style="color: #333;">Welcome, ${name}! 👋</h2>
        <p style="color: #555; line-height: 1.6;">
          Thank you for joining LocalRent. Please verify your email to unlock all features
          including saving listings, sending booking requests, and building your trust score.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background: #E67E22; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Verify My Email
          </a>
        </div>
        <p style="color: #888; font-size: 13px;">
          This link expires in 24 hours. If you didn't create this account, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} LocalRent. Brokerage-free rooms for students & professionals.
        </p>
      </div>
    `,
  });
};

// Send booking notification email
export const sendBookingEmail = async (email, name, subject, message) => {
  if (!resend) {
    console.log(`[DEV] Email to ${email}: ${subject} - ${message}`);
    return;
  }

  await resend.emails.send({
    from: config.resend.emailFrom,
    to: email,
    subject: `LocalRent - ${subject}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #E67E22; margin: 0;">LocalRent</h1>
        </div>
        <h2 style="color: #333;">Hi ${name},</h2>
        <p style="color: #555; line-height: 1.6;">${message}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.clientUrl}/dashboard" 
             style="background: #E67E22; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} LocalRent
        </p>
      </div>
    `,
  });
};
