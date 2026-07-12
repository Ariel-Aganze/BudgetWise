import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

const Budgets = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    budget_limit: '',
    alert_percentage: 80,
  })
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchSummary()
  }, [])

  // FIXED: Handle paginated response correctly
  const fetchCategories = async () => {
    try {
      const response = await api.get('/budgets/')
      console.log('Budgets API response:', response.data) // Debug log
      
      // Handle paginated response - DRF returns {count, next, previous, results}
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        setCategories(response.data.results)
      } 
      // Handle direct array response
      else if (Array.isArray(response.data)) {
        setCategories(response.data)
      }
      // Handle case where data is empty but structure is different
      else if (response.data && Array.isArray(response.data)) {
        setCategories(response.data)
      }
      else {
        console.error('Budgets API unexpected format:', response.data)
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await api.get('/budgets/summary/')
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        budget_limit: parseFloat(formData.budget_limit)
      }
      
      if (editingCategory) {
        await api.put(`/budgets/${editingCategory.id}/`, submitData)
      } else {
        await api.post('/budgets/', submitData)
      }
      setShowModal(false)
      resetForm()
      fetchCategories()
      fetchSummary()
    } catch (error) {
      console.error('Failed to save category:', error)
      const errorMsg = error.response?.data?.name?.[0] || error.response?.data?.message || 'Failed to save category'
      alert(errorMsg)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/budgets/${id}/`)
        fetchCategories()
        fetchSummary()
      } catch (error) {
        console.error('Failed to delete category:', error)
        alert('Failed to delete category')
      }
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      budget_limit: category.budget_limit,
      alert_percentage: category.alert_percentage,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      budget_limit: '',
      alert_percentage: 80,
    })
  }

  const getAlertColor = (percentage, alertLevel) => {
    if (alertLevel === 'exceeded') return 'text-red-600'
    if (alertLevel === 'critical') return 'text-orange-600'
    if (alertLevel === 'warning') return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-primary">Loading budgets...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Budget Categories</h1>
            <p className="text-text-muted mt-1">Manage your spending categories and budget limits</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-card p-5">
              <p className="text-text-muted text-sm">Total Monthly Budget</p>
              <p className="text-2xl font-bold text-text-main mt-1">{summary.total_budget?.toLocaleString() || 0} RWF</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-text-muted text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{summary.total_spent?.toLocaleString() || 0} RWF</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-text-muted text-sm">Remaining</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{summary.remaining_balance?.toLocaleString() || 0} RWF</p>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {!categories || categories.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <img src="/images/budget-illustration.svg" alt="No categories" className="w-48 mx-auto mb-6 opacity-50" 
              onError={(e) => e.target.style.display = 'none'} />
            <h3 className="text-xl font-semibold text-text-main mb-2">No Budget Categories Yet</h3>
            <p className="text-text-muted mb-4">Create your first budget category to start tracking expenses</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="btn-primary"
            >
              Create Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="glass-card p-6 glass-card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text-main">{category.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {category.budget_limit?.toLocaleString() || 0} RWF
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 hover:bg-accent/30 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">Spent this month</span>
                    <span className={`font-medium ${getAlertColor(category.spending_percentage, category.alert_level)}`}>
                      {(category.spending_percentage || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-accent/30 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (category.spending_percentage || 0) >= 100
                          ? 'bg-red-500'
                          : (category.spending_percentage || 0) >= 95
                          ? 'bg-orange-500'
                          : (category.spending_percentage || 0) >= (category.alert_percentage || 80)
                          ? 'bg-yellow-500'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((category.spending_percentage || 0), 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">
                    Spent: {(category.total_spent_current_month || 0).toLocaleString()} RWF
                  </span>
                  <span className="text-text-muted">
                    Left: {(category.remaining_budget || 0).toLocaleString()} RWF
                  </span>
                </div>

                {category.alert_level && (
                  <div className={`mt-3 p-2 rounded-lg text-xs ${
                    category.alert_level === 'exceeded'
                      ? 'bg-red-50 text-red-600'
                      : category.alert_level === 'critical'
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    Alert at {category.alert_percentage}% • 
                    {category.alert_level === 'exceeded'
                      ? ' Budget exceeded!'
                      : category.alert_level === 'critical'
                      ? ' Critical level reached!'
                      : ' Warning threshold reached!'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-text-main mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Category Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Food, Transport, Entertainment"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Monthly Budget (RWF)</label>
                  <input
                    type="number"
                    value={formData.budget_limit}
                    onChange={(e) => setFormData({ ...formData, budget_limit: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    required
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">
                    Alert Threshold ({formData.alert_percentage}%)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={formData.alert_percentage}
                    onChange={(e) => setFormData({ ...formData, alert_percentage: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>1%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Budgets