import { useState } from 'react'
import './PasswordStep.css'

export default function PasswordStep({ onSubmit, loading }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('Password is required')
      return false
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return false
    }
    if (!/[A-Z]/.test(value)) {
      setPasswordError('Password must contain at least one uppercase letter')
      return false
    }
    if (!/[0-9]/.test(value)) {
      setPasswordError('Password must contain at least one number')
      return false
    }
    setPasswordError('')
    return true
  }

  const validateConfirm = (value) => {
    if (!value) {
      setConfirmError('Please confirm your password')
      return false
    }
    if (value !== password) {
      setConfirmError('Passwords do not match')
      return false
    }
    setConfirmError('')
    return true
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    if (passwordError) validatePassword(value)
    if (confirmPassword) validateConfirm(confirmPassword)
  }

  const handleConfirmChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (confirmError) validateConfirm(value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const isPasswordValid = validatePassword(password)
    const isConfirmValid = validateConfirm(confirmPassword)

    if (isPasswordValid && isConfirmValid) {
      onSubmit(password)
    }
  }

  const passwordStrength = password ? 'strong' : ''

  return (
    <form onSubmit={handleSubmit} className="password-step">
      <div className="form-group">
        <label htmlFor="password">New Password</label>
        <div className="password-input-wrapper">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            className={passwordError ? 'input-error' : ''}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {passwordError && <span className="field-error">{passwordError}</span>}
      </div>

      <div className="password-requirements">
        <p>Password must contain:</p>
        <ul>
          <li className={password.length >= 8 ? 'valid' : ''}>
            At least 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? 'valid' : ''}>
            At least one uppercase letter
          </li>
          <li className={/[0-9]/.test(password) ? 'valid' : ''}>
            At least one number
          </li>
        </ul>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={handleConfirmChange}
          disabled={loading}
          className={confirmError ? 'input-error' : ''}
        />
        {confirmError && <span className="field-error">{confirmError}</span>}
      </div>

      <button
        type="submit"
        disabled={loading || !password || !confirmPassword}
        className="btn btn-primary"
      >
        {loading ? 'Resetting Password...' : 'Reset Password'}
      </button>
    </form>
  )
}
