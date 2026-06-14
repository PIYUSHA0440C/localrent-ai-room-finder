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
export const sendVerificationEmail = async (email, name, otp) => {
  if (!resend) {
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    return;
  }

  await resend.emails.send({
    from: config.resend.emailFrom,
    to: email,
    subject: 'Verify your LocalRent account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to LocalRent!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please use the following 6-digit OTP to verify your email address. It will expire in 10 minutes:</p>
        <div style="margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; text-align: center;">
          ${otp}
        </div>
        <p>If you did not create an account, no further action is required.</p>
        <p>Best regards,<br>The LocalRent Team</p>
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
