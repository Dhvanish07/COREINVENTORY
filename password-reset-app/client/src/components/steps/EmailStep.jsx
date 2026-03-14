import { useState } from 'react'
import './EmailStep.css'

export default function EmailStep({ onSubmit, loading }) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const handleChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (emailError) validateEmail(value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateEmail(email)) {
      onSubmit(email)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="email-step">
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleChange}
          disabled={loading}
          className={emailError ? 'input-error' : ''}
        />
        {emailError && <span className="field-error">{emailError}</span>}
      </div>

      <p className="step-description">
        Enter your email address and we'll send you an OTP to verify your identity.
      </p>

      <button
        type="submit"
        disabled={loading || !email}
        className="btn btn-primary"
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </form>
  )
}
