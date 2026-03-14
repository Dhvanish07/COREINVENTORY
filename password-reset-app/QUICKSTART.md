# Quick Start Guide

## 🚀 Getting Started

Your password reset application with OTP verification is ready! Follow these steps to run it:

### Option 1: Run Both Servers Concurrently (from root)
```bash
npm run dev
```
This starts both the backend (port 3001) and frontend (port 5173) simultaneously.

### Option 2: Run Separately

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```
Server runs on: http://localhost:3001

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```
Client runs on: http://localhost:5173

## 📧 How to Test

1. **Open Frontend**: Navigate to `http://localhost:5173`
2. **Enter Email**: Type your email address
3. **Click "Send OTP"**: Check your email for the OTP code (sent via Resend API)
4. **Enter OTP**: Copy the 6-digit code from email and paste it
5. **Set New Password**: Create a password with:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
6. **Confirm**: Re-enter the password and click "Reset Password"

## 🔑 API Key Status

✅ Resend API Key is configured: `re_YhevnQDh_GXoMx79wPum5U2bstoDSunFc`

## 📁 Project Structure

```
password-reset-app/
├── server/          # Express.js backend
│   ├── index.js     # API endpoints
│   └── package.json
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md        # Full documentation
```

## ✨ Features

✅ Email OTP generation and verification
✅ 10-minute OTP expiration
✅ Maximum 5 verification attempts
✅ Strong password validation
✅ Responsive design
✅ Real-time validation feedback
✅ Error handling and user guidance

## 🛠️ Troubleshooting

### Email not arriving?
- Check spam/junk folder
- Verify email address is correct
- Check server console for errors

### Port already in use?
- Change port in `server/.env` (PORT=3002)
- Or kill the process using the port

### Dependencies not installing?
```bash
npm install --legacy-peer-deps
```

## 📚 Learn More

See `README.md` for detailed documentation on:
- API endpoints and request/response formats
- Security features
- Future enhancements
- Technology stack

## 🎯 Next Steps

1. Connect to your database to store users and reset tokens
2. Implement JWT for secure reset tokens
3. Add rate limiting to prevent abuse
4. Customize email templates
5. Add user authentication system

Enjoy! 🚀
