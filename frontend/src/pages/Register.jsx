import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      await register(formData)
      navigate('/dashboard')
    } catch (err) {
      const errors = err.response?.data
      if (errors) {
        if (errors.email) setError(errors.email[0])
        else if (errors.password) setError(errors.password[0])
        else if (errors.confirm_password) setError(errors.confirm_password)
        else setError('Registration failed. Please try again.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row-reverse gap-8 animate-fade-in">
        {/* Right Side - Form */}
        <div className="flex-1 glass-card p-8 lg:p-12">
          <div className="mb-8 text-center lg:text-right">
            <img src="/images/logo.png" alt="BudgetWise" className="h-12 mx-auto lg:mx-0 mb-4" />
            <h2 className="text-3xl font-bold text-text-main mb-2">Create Account</h2>
            <p className="text-text-muted">Start managing your finances today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Create a strong password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="input-field"
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <p className="text-center text-text-muted text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Login
              </Link>
            </p>

            <p className="text-center text-text-muted text-xs">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>

        {/* Left Side - Illustration */}
        <div className="flex-1 hidden lg:flex items-center justify-center">
          <div className="text-center">
            <img src="/images/hero-illustration.svg" alt="Budget Management" className="w-full max-w-md mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-text-main mb-2">Smart Budgeting Made Simple</h3>
            <p className="text-text-muted">Track expenses, set goals, and achieve financial freedom</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register