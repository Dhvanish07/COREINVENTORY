import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// Store OTPs in memory (use database in production)
const otpStore = new Map();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Generate random OTP
function generateOTP(length = 6) {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
}

// Send OTP to email
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const otp = generateOTP();
    
    // Store OTP with email and 10-minute expiry
    otpStore.set(email, {
      otp,
      requestedEmail: email, // Track which email requested the OTP
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    });

    // Send email via Resend to verified email (testing mode limitation)
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'dhvanish.07@gmail.com', // Resend testing mode - must use verified email
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
      `,
    });

    if (data.error) {
      return res.status(500).json({ error: 'Failed to send OTP', details: data.error });
    }

    res.json({
      success: true,
      message: `OTP sent to ${email}`,
      email: email, // Return the requested email
      sentTo: 'dhvanish.07@gmail.com (testing mode)',
      note: 'Check dhvanish.07@gmail.com for the OTP code'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const storedOtpData = otpStore.get(email);

    if (!storedOtpData) {
      return res.status(400).json({ error: 'No OTP found for this email. Please request a new one.' });
    }

    // Check if OTP is expired
    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check attempt limit
    if (storedOtpData.attempts >= 5) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'Too many attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      storedOtpData.attempts += 1;
      return res.status(400).json({ 
        error: 'Invalid OTP',
        attemptsLeft: 5 - storedOtpData.attempts
      });
    }

    // OTP is valid, remove it from store
    otpStore.delete(email);

    // Generate a reset token (in production, use JWT with expiry)
    const resetToken = Buffer.from(email + Date.now()).toString('base64');

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password endpoint
app.post('/api/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Decode email from token (in production, verify JWT)
    const email = Buffer.from(resetToken, 'base64').toString().split(Date.now().toString())[0];

    // Here you would update the user's password in your database
    // For now, we'll just return success

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS enabled for ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
