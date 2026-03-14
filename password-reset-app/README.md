# Password Reset with OTP Verification

A full-stack password reset system using React frontend and Node.js/Express backend with Resend API for email delivery.

## Features

- **Email Verification**: Enter your email and receive an OTP
- **OTP Validation**: 6-digit code sent to email, valid for 10 minutes
- **Password Reset**: Set a new password with validation requirements
- **Security**: 
  - Maximum 5 OTP verification attempts
  - Password strength validation (min 8 characters, uppercase, number)
  - Rate limiting ready (server-side)
  - CORS enabled for secure cross-origin requests

## Project Structure

```
password-reset-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── PasswordResetForm.jsx
│   │   │   └── steps/
│   │   │       ├── EmailStep.jsx
│   │   │       ├── OTPStep.jsx
│   │   │       └── PasswordStep.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # Express backend
│   ├── index.js           # Main API server
│   ├── package.json
│   ├── .env.example       # Environment variables template
│   └── .gitignore
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Update with your Resend API key:
   ```
   RESEND_API_KEY=re_YhevnQDh_GXoMx79wPum5U2bstoDSunFc
   PORT=3001
   CLIENT_URL=http://localhost:5173
   ```

4. Start the server:
   ```bash
   npm run dev
   ```
   
   Server will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   Client will run on `http://localhost:5173`

## API Endpoints

### Send OTP
- **Endpoint**: `POST /api/send-otp`
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP sent to email",
    "email": "us***@example.com"
  }
  ```

### Verify OTP
- **Endpoint**: `POST /api/verify-otp`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "resetToken": "base64encodedtoken"
  }
  ```

### Reset Password
- **Endpoint**: `POST /api/reset-password`
- **Request Body**:
  ```json
  {
    "resetToken": "base64encodedtoken",
    "newPassword": "NewPassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password reset successfully"
  }
  ```

## Features in Detail

### Email Step
- Email validation
- Input error handling
- Clean, intuitive UI

### OTP Step
- 6-digit code input
- Visual feedback during verification
- Display masked email for user confirmation
- Resend capability (backend ready)

### Password Step
- Strong password validation
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number
- Real-time validation feedback
- Password visibility toggle
- Confirm password matching

## Security Features

1. **OTP Management**:
   - 10-minute expiration
   - Maximum 5 verification attempts
   - Automatic cleanup of expired OTPs

2. **Password Validation**:
   - Client-side validation
   - Server-side validation
   - Password complexity requirements

3. **CORS Protection**:
   - Restricted to frontend URL
   - Credentials support ready

## Technologies Used

### Frontend
- React 18+
- Vite (build tool)
- Axios (HTTP client)
- CSS3 (styling)

### Backend
- Node.js
- Express.js
- Resend API (email delivery)
- CORS middleware

## Environment Variables

### Server (.env)
```
RESEND_API_KEY=your_resend_api_key
PORT=3001
CLIENT_URL=http://localhost:5173
```

## Future Enhancements

1. **Database Integration**: Store users and reset tokens in database
2. **JWT Implementation**: Use JWT for reset tokens with expiry
3. **Rate Limiting**: Implement rate limiting per IP/email
4. **Email Templates**: Customize email templates
5. **User Authentication**: Integrate with existing auth system
6. **Resend OTP**: Allow users to request new OTP
7. **Session Management**: Remember device/email for faster reset
8. **Audit Logging**: Track password reset attempts

## Troubleshooting

### OTP not received
1. Check spam/junk folder
2. Verify email address is correct
3. Ensure Resend API key is valid

### CORS errors
1. Verify `CLIENT_URL` in server `.env`
2. Ensure frontend is running on correct port
3. Check browser console for detailed errors

### Server not starting
1. Ensure port 3001 is not in use
2. Check Node.js version (14+ required)
3. Verify all dependencies are installed

## License

MIT
