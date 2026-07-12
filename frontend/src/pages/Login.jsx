import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 animate-fade-in">
        {/* Left Side - Form */}
        <div className="flex-1 glass-card p-8 lg:p-12">
          <div className="mb-8 text-center lg:text-left">
            <img src="/images/logo.png" alt="BudgetWise" className="h-12 mx-auto lg:mx-0 mb-4" />
            <h2 className="text-3xl font-bold text-text-main mb-2">Welcome Back!</h2>
            <p className="text-text-muted">Please enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm text-text-muted">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center text-text-muted text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>

        {/* Right Side - Illustration */}
        <div className="flex-1 hidden lg:flex items-center justify-center">
          <div className="text-center">
            <img src="/images/login-illustration.svg" alt="Financial Management" className="w-full max-w-md mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-text-main mb-2">Seamless Financial Control</h3>
            <p className="text-text-muted">Everything you need in an easily customizable dashboard</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login