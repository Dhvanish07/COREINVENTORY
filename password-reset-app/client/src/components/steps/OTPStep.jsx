import { useState } from 'react'
import './OTPStep.css'

export default function OTPStep({ email, onSubmit, loading, onReset }) {
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  const validateOTP = (value) => {
    if (!value) {
      setOtpError('OTP is required')
      return false
    }
    if (!/^\d{6}$/.test(value)) {
      setOtpError('OTP must be 6 digits')
      return false
    }
    setOtpError('')
    return true
  }

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    if (otpError && value.length === 6) {
      validateOTP(value)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateOTP(otp)) {
      onSubmit(otp)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="otp-step">
      <div className="email-display">
        <p>Sent to: <strong>{email}</strong></p>
      </div>

      <div className="form-group">
        <label htmlFor="otp">One-Time Password</label>
        <input
          id="otp"
          type="text"
          placeholder="000000"
          value={otp}
          onChange={handleChange}
          disabled={loading}
          maxLength="6"
          className={`otp-input ${otpError ? 'input-error' : ''}`}
        />
        {otpError && <span className="field-error">{otpError}</span>}
      </div>

      <p className="step-description">
        Enter the 6-digit code sent to your email. The code is valid for 10 minutes.
      </p>

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="btn btn-primary"
      >
        {loading ? 'Verifying OTP...' : 'Verify OTP'}
      </button>

      <button
        type="button"
        onClick={onReset}
        disabled={loading}
        className="btn btn-secondary"
      >
        Back
      </button>
    </form>
  )
}
