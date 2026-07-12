import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

const Landing = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: 'M3 10h18M6 10v8h12v-8M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z',
      title: 'Smart Budgeting',
      description: 'Create custom budget categories with personalized spending limits and real-time tracking.',
    },
    {
      icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      title: 'Expense Tracking',
      description: 'Log every expense instantly with category tagging and detailed transaction history.',
    },
    {
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      title: 'Smart Alerts',
      description: 'Get instant notifications when you approach or exceed your budget limits.',
    },
    {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Analytics & Reports',
      description: 'Visualize spending patterns with detailed charts and monthly financial reports.',
    },
    {
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Multi-Currency Ready',
      description: 'All amounts are displayed in RWF (Rwandan Franc) with multi-currency support coming soon.',
    },
    {
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and protected with industry-standard security.',
    },
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Create Account',
      description: 'Sign up for free and set up your profile in minutes.',
    },
    {
      step: '02',
      title: 'Set Budgets',
      description: 'Create budget categories and define your monthly spending limits.',
    },
    {
      step: '03',
      title: 'Track Expenses',
      description: 'Log your daily expenses and watch your budget in real-time.',
    },
    {
      step: '04',
      title: 'Get Insights',
      description: 'Receive alerts and view analytics to improve your spending habits.',
    },
  ]

  const testimonials = [
    {
      name: 'Alex Mugisha',
      role: 'Small Business Owner',
      content: 'BudgetWise transformed how I manage my business finances. The alert system alone saved me from overspending multiple times.',
      rating: 5,
    },
    {
      name: 'Sarah Uwase',
      role: 'Freelancer',
      content: 'Finally a budgeting app that understands Rwandan users! The RWF support and intuitive interface make tracking expenses effortless.',
      rating: 5,
    },
    {
      name: 'David Niyonshuti',
      role: 'Student',
      content: 'As a student, keeping track of my limited budget is crucial. BudgetWise helps me stay on top of my finances with ease.',
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-card mx-4 mt-4' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="BudgetWise" className="h-8 w-auto" />
              <span className="text-xl font-bold text-primary">BudgetWise</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-secondary text-sm px-4 py-2">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-main mb-6">
              Smart Budget Management
              <span className="text-primary"> for Financial Freedom</span>
            </h1>
            <p className="text-lg text-text-muted max-w-2xl mx-auto mb-8">
              Take control of your finances with BudgetWise. Track expenses, manage budgets, 
              and receive smart alerts to achieve your financial goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary">
                Start Free Today
              </Link>
              <Link to="/login" className="btn-secondary">
                Already have an account? Login
              </Link>
            </div>
          </div>
          
          {/* Hero Illustration */}
          <div className="mt-16">
            <img 
              src="/images/hero-illustration.svg" 
              alt="Financial Management" 
              className="w-full max-w-3xl mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">
              Everything You Need to Manage Your Finances
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Powerful features to help you track, analyze, and optimize your spending
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-6 glass-card-hover group">
                <div className="w-12 h-12 bg-accent/50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-main mb-2">{feature.title}</h3>
                <p className="text-text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-accent/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">
              How BudgetWise Works
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Get started in minutes and take control of your financial future
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-text-main mb-2">{item.title}</h3>
                <p className="text-text-muted text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">
              Loved by Users
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their financial habits
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-text-muted mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-text-main">{testimonial.name}</p>
                  <p className="text-sm text-text-muted">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto glass-card p-12 text-center bg-gradient-to-r from-primary/5 to-accent/20">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-text-muted mb-8 max-w-2xl mx-auto">
            Join BudgetWise today and start your journey toward financial freedom
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary">
              Get Started Free
            </Link>
            <Link to="/login" className="btn-secondary">
              Login to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-accent/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="BudgetWise" className="h-6 w-auto" />
              <span className="text-primary font-semibold">BudgetWise</span>
            </div>
            <p className="text-text-muted text-sm">
              © 2026 BudgetWise. All rights reserved. All amounts in RWF.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-text-muted hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing