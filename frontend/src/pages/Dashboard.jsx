import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../store/AuthContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard/')
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setDashboardData({
        summary: {
          total_budget: 0,
          total_expenses: 0,
          remaining_balance: 0,
          spending_percentage: 0,
        },
        category_breakdown: [],
        recent_expenses: [],
        categories_with_alerts: [],
        monthly_trend: [],
        top_categories: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const prepareCategoryChartData = () => {
    const categories = dashboardData?.category_breakdown || []
    return categories.slice(0, 6).map(cat => ({
      name: cat.name.length > 8 ? cat.name.substring(0, 6) + '...' : cat.name,
      fullName: cat.name,
      spent: cat.spent,
      budget: cat.budget_limit,
      percentage: cat.percentage,
    }))
  }

  const prepareMonthlyTrendData = () => {
    const trend = dashboardData?.monthly_trend || []
    return trend.map(item => ({
      month: item.month.substring(0, 3),
      fullMonth: item.month,
      expenses: item.total,
    }))
  }

  const preparePieChartData = () => {
    const categories = dashboardData?.category_breakdown || []
    return categories.slice(0, 5).map(cat => ({
      name: cat.name,
      value: cat.spent,
    }))
  }

  const COLORS = ['#0C3823', '#1A4D35', '#2D6A4F', '#40916C', '#52B788']

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  const summary = dashboardData?.summary || {}
  const categoryBreakdown = dashboardData?.category_breakdown || []
  const recentExpenses = dashboardData?.recent_expenses || []
  const categoriesWithAlerts = dashboardData?.categories_with_alerts || []
  const monthlyTrend = dashboardData?.monthly_trend || []
  const topCategories = dashboardData?.top_categories || []

  const categoryChartData = prepareCategoryChartData()
  const monthlyTrendData = prepareMonthlyTrendData()
  const pieChartData = preparePieChartData()

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-6 pb-20 md:pb-0">
        {/* Welcome Section */}
        <div className="glass-card p-5 sm:p-6 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-main">
                {getGreeting()}, {user?.full_name?.split(' ')[0]}!
              </h1>
              <p className="text-sm text-text-muted mt-0.5">Here's your financial overview</p>
            </div>
          </div>
        </div>

        {/* Stats Cards - With Gradient from Right to Left */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r from-white via-white to-primary/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12"></div>
            <div className="relative p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-muted">Total Budget</span>
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-text-main">
                {summary.total_budget?.toLocaleString() || 0} RWF
              </p>
              <p className="text-xs text-text-muted mt-2">Monthly budget limit</p>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 glass-card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-muted">Total Expenses</span>
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-text-main">
              {summary.total_expenses?.toLocaleString() || 0} RWF
            </p>
            <p className="text-xs text-text-muted mt-2">Spent this month</p>
          </div>

          <div className="glass-card p-5 sm:p-6 glass-card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-muted">Remaining Balance</span>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-primary">
              {summary.remaining_balance?.toLocaleString() || 0} RWF
            </p>
            <p className="text-xs text-text-muted mt-2">
              {summary.spending_percentage?.toFixed(1) || 0}% of budget used
            </p>
          </div>
        </div>

        {/* Budget Alerts - Premium Design */}
        {categoriesWithAlerts.length > 0 && (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500 p-5 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-main mb-3">Budget Threshold Alerts</h3>
                  <div className="space-y-3">
                    {categoriesWithAlerts.map((category) => (
                      <div key={category.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-medium text-text-main">{category.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    category.alert_level === 'exceeded' ? 'bg-red-500' : 'bg-orange-500'
                                  }`}
                                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-text-muted">
                                {category.spent.toLocaleString()} / {category.budget_limit.toLocaleString()} RWF
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              category.alert_level === 'exceeded' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {category.alert_level === 'exceeded' ? 'Exceeded' : `${category.percentage}% Used`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {categoryChartData.length > 0 && (
            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="font-semibold text-text-main">Budget vs Actual</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryChartData} margin={{ left: 0, right: 0, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => `${value.toLocaleString()} RWF`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="#0C3823" name="Budget" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" fill="#F59E0B" name="Spent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {pieChartData.length > 0 && (
            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <h3 className="font-semibold text-text-main">Spending by Category</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={90}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} RWF`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        {monthlyTrendData.length > 0 && (
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <h3 className="font-semibold text-text-main">6-Month Spending Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0C3823" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0C3823" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => `${value.toLocaleString()} RWF`}
                  labelFormatter={(label) => monthlyTrendData.find(d => d.month === label)?.fullMonth || label}
                />
                <Area type="monotone" dataKey="expenses" stroke="#0C3823" strokeWidth={2} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Breakdown & Recent Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="font-semibold text-text-main">Category Breakdown</h3>
            </div>
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted">No categories created yet</p>
                <Link to="/budgets" className="text-primary text-sm mt-2 inline-block">Create your first budget →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.slice(0, 5).map((category) => (
                  <div key={category.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-text-main">{category.name}</span>
                      <span className="text-text-muted">
                        {category.spent.toLocaleString()} / {category.budget_limit.toLocaleString()} RWF
                      </span>
                    </div>
                    <div className="w-full bg-accent/30 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          category.percentage >= 100 ? 'bg-red-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="font-semibold text-text-main">Recent Transactions</h3>
              </div>
              <Link to="/expenses" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted">No expenses recorded yet</p>
                <Link to="/expenses" className="text-primary text-sm mt-2 inline-block">Add your first expense →</Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-background rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/30 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-text-main">{expense.description || expense.category}</p>
                        <p className="text-xs text-text-muted">{expense.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-{expense.amount.toLocaleString()} RWF</p>
                      <p className="text-xs text-text-muted">{expense.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Spending Insights - Premium Section */}
        <div className="glass-card p-5 sm:p-6 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="font-semibold text-text-main">Financial Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-main">Spending Analysis</p>
                  <p className="text-xs text-text-muted mt-1">
                    {summary.spending_percentage > 80 
                      ? `You're at ${summary.spending_percentage?.toFixed(1)}% of your budget. Consider reducing expenses.`
                      : summary.spending_percentage > 50
                      ? `You've used ${summary.spending_percentage?.toFixed(1)}% of your budget. Keep monitoring.`
                      : `Excellent! Only ${summary.spending_percentage?.toFixed(1)}% of budget used.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-main">Savings Opportunity</p>
                  <p className="text-xs text-text-muted mt-1">
                    Save {(summary.remaining_balance * 0.5).toLocaleString()} RWF this month 
                    to reach your financial goals faster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard