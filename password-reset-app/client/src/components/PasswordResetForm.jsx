import { useState } from 'react'
import axios from 'axios'
import EmailStep from './steps/EmailStep'
import OTPStep from './steps/OTPStep'
import PasswordStep from './steps/PasswordStep'
import './PasswordResetForm.css'

export default function PasswordResetForm() {
  const [step, setStep] = useState('email') // email, otp, password
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSendOTP = async (emailValue) => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post('/api/send-otp', { email: emailValue })
      setEmail(emailValue)
      setStep('otp')
      setMessage('OTP sent to your email! Check your inbox.')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (otp) => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post('/api/verify-otp', { email, otp })
      setResetToken(response.data.resetToken)
      setStep('password')
      setMessage('OTP verified! Now set your new password.')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (newPassword) => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post('/api/reset-password', {
        resetToken,
        newPassword,
      })
      setMessage('Password reset successfully! You can now login with your new password.')
      setStep('email')
      setEmail('')
      setResetToken('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('email')
    setEmail('')
    setResetToken('')
    setMessage('')
    setError('')
  }

  return (
    <div className="password-reset-form">
      <div className="form-container">
        <h1>Reset Your Password</h1>

        {message && <div className="message success-message">{message}</div>}
        {error && <div className="message error-message">{error}</div>}

        {step === 'email' && (
          <EmailStep onSubmit={handleSendOTP} loading={loading} />
        )}

        {step === 'otp' && (
          <OTPStep
            email={email}
            onSubmit={handleVerifyOTP}
            loading={loading}
            onReset={handleReset}
          />
        )}

        {step === 'password' && (
          <PasswordStep onSubmit={handleResetPassword} loading={loading} />
        )}
      </div>
    </div>
  )
}
