
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './SignIn.css'

const defaultForm = {
  email: '',
  password: ''
}

export default function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isAuthenticated, user } = useAuth()

  const [formValues, setFormValues] = useState(defaultForm)
  const [status, setStatus] = useState('idle') // idle | loading | error | success
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const nextRoute = location.state?.from || '/my-library'

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const result = await signIn(formValues.email, formValues.password)

    if (!result.success) {
      setStatus('error')
      setErrorMessage(result.error || 'Unable to sign in. Please try again.')
      return
    }

    setStatus('success')
    setTimeout(() => {
      navigate(nextRoute, { replace: true })
    }, 300)
  }

  const buttonDisabled =
    status === 'loading' ||
    !formValues.email.trim() ||
    formValues.password.trim().length < 6

  return (
    <div className="auth-page">
      <div className="auth-glow" aria-hidden="true" />
      <section className="auth-card">
        <div className="auth-card-header">
          <p className="auth-eyebrow">Library Catalog AI</p>
          <h1>Sign in to continue</h1>
          <p className="auth-subtitle">
            Securely access your saved shelves, reviews, and personalized recommendations.
          </p>
        </div>

        {isAuthenticated && status !== 'error' && (
          <div className="auth-active-session" role="status">
            <p>Signed in as <strong>{user.name}</strong></p>
            <button
              type="button"
              className="auth-secondary-btn"
              onClick={() => navigate('/my-library')}
            >
              Go to My Library
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              placeholder="you@librarycatalog.ai"
              value={formValues.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field password-field">
            <span>Password</span>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formValues.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {errorMessage && (
            <p className="auth-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={buttonDisabled}
          >
            {status === 'loading' ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Need help? Reach the catalog team at <span>support@librarycatalog.ai</span></p>
          <div className="auth-shortcuts">
            <button
              type="button"
              onClick={() =>
                setFormValues({
                  email: 'avery@librarycatalog.ai',
                  password: 'catalog2025'
                })
              }
            >
              Autofill demo account
            </button>
            <button
              type="button"
              onClick={() => navigate('/resources')}
            >
              Explore resources
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
