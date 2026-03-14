import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetOtpEmail = async ({ email, otp }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const testingRecipient = process.env.RESEND_TEST_RECIPIENT || "dhvanish.07@gmail.com";

  const data = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: testingRecipient,
    subject: `Your Password Reset OTP for ${email}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #999; text-align: center; font-size: 12px;">Requested for: ${email}</p>
        <p style="color: #666; text-align: center; font-size: 16px;">Your One-Time Password (OTP) is:</p>
        <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p style="color: #666; text-align: center; font-size: 14px;">This OTP is valid for 10 minutes.</p>
        <p style="color: #999; text-align: center; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
      </div>
    `
  });

  if (data?.error) {
    throw new Error(data.error.message || "Failed to send OTP email");
  }

  return {
    sentTo: testingRecipient,
    id: data?.data?.id || null
  };
};