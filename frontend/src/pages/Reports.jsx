import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'

const Reports = () => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const COLORS = ['#0C3823', '#1A4D35', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2', '#B7E4C7']

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      let url = '/analytics/reports/'
      
      // Get date range
      const now = new Date()
      let startDate, endDate
      
      switch(dateRange) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = now
          break
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          endDate = new Date(now.getFullYear(), now.getMonth(), 0)
          break
        case 'quarter':
          const quarterStart = new Date(now.getFullYear(), now.getMonth() - (now.getMonth() % 3), 1)
          startDate = quarterStart
          endDate = now
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = now
          break
        case 'custom':
          if (customStart && customEnd) {
            startDate = new Date(customStart)
            endDate = new Date(customEnd)
          } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = now
          }
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = now
      }
      
      url += `?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
      
      const response = await api.get(url)
      setReportData(response.data)
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      setDateRange('custom')
      fetchReportData()
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  const summary = reportData?.summary || {}
  const categoryBreakdown = reportData?.category_breakdown || []
  const monthlyTrend = reportData?.monthly_trend || []
  const dailySpending = reportData?.daily_spending || []
  const recentTransactions = reportData?.recent_transactions || []
  const insights = reportData?.insights || []

  const totalExpenses = summary.total_expenses || 0

  return (
    <Layout>
      <div className="space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Reports</h1>
            <p className="text-text-muted mt-1">Analyze your spending patterns and financial health</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => window.print()}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            {/* <button className="btn-primary text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button> */}
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-text-main">Date Range:</span>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                dateRange === 'month' ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent/30'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange('last_month')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                dateRange === 'last_month' ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent/30'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setDateRange('quarter')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                dateRange === 'quarter' ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent/30'
              }`}
            >
              This Quarter
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                dateRange === 'year' ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent/30'
              }`}
            >
              This Year
            </button>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="input-field w-auto text-sm"
              />
              <span className="text-text-muted">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input-field w-auto text-sm"
              />
              <button
                onClick={handleCustomRange}
                className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <p className="text-text-muted text-sm">Total Expenses</p>
            <p className="text-2xl font-bold text-text-main">{totalExpenses.toLocaleString()} RWF</p>
            <p className="text-xs text-text-muted mt-1">{summary.total_transactions || 0} transactions</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-text-muted text-sm">Daily Average</p>
            <p className="text-2xl font-bold text-text-main">{summary.average_daily_spending?.toLocaleString() || 0} RWF</p>
            <p className="text-xs text-text-muted mt-1">Over {summary.date_range?.days || 0} days</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-text-muted text-sm">Date Range</p>
            <p className="text-sm font-semibold text-text-main">{summary.date_range?.start || '-'}</p>
            <p className="text-xs text-text-muted mt-1">to {summary.date_range?.end || '-'}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-text-muted text-sm">Transaction Frequency</p>
            <p className="text-2xl font-bold text-text-main">
              {summary.total_transactions && summary.date_range?.days 
                ? (summary.total_transactions / summary.date_range.days).toFixed(1) 
                : 0}
            </p>
            <p className="text-xs text-text-muted mt-1">Transactions per day</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown Pie Chart */}
          {categoryBreakdown.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-text-main mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Spending by Category
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="spent"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} RWF`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly Trend Line Chart */}
          {monthlyTrend.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-text-main mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Monthly Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0C3823" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0C3823" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} RWF`} />
                  <Area type="monotone" dataKey="total" stroke="#0C3823" strokeWidth={2} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Daily Spending Trend */}
        {dailySpending.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-text-main mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Daily Spending
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailySpending.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value.toLocaleString()} RWF`} />
                <Bar dataKey="amount" fill="#0C3823" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Insights Section */}
        {insights.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-text-main mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 bg-background rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {insight.type === 'top_category' && (
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      )}
                      {insight.type === 'budget_alert' && (
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {insight.type === 'daily_average' && (
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {insight.type === 'transaction_count' && (
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-text-main">{insight.title}</p>
                      <p className="text-sm text-text-muted mt-1">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-main flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Recent Transactions
              </h3>
              <span className="text-sm text-text-muted">Showing {recentTransactions.length} of {summary.total_transactions}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-accent/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-accent/20 hover:bg-accent/10 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-muted">{transaction.date}</td>
                      <td className="px-4 py-3 text-sm text-text-main">{transaction.description}</td>
                      <td className="px-4 py-3 text-sm text-text-muted">{transaction.category}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-600 text-right">
                        -{transaction.amount.toLocaleString()} RWF
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Reports