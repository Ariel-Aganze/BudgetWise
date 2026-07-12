import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [filterCategory, filterMonth])

  const fetchExpenses = async () => {
    try {
      let url = '/expenses/'
      const params = []
      if (filterCategory) params.push(`category=${filterCategory}`)
      if (filterMonth) params.push(`month=${filterMonth}`)
      if (params.length) url += `?${params.join('&')}`
      
      const response = await api.get(url)
      // Handle paginated response
      if (response.data && Array.isArray(response.data.results)) {
        setExpenses(response.data.results)
      } else if (Array.isArray(response.data)) {
        setExpenses(response.data)
      } else {
        console.error('Expenses API unexpected format:', response.data)
        setExpenses([])
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/budgets/')
      if (response.data && Array.isArray(response.data.results)) {
        setCategories(response.data.results)
      } else if (Array.isArray(response.data)) {
        setCategories(response.data)
      } else {
        console.error('Categories API unexpected format:', response.data)
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount) // Ensure amount is a number
      }
      
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}/`, submitData)
      } else {
        await api.post('/expenses/', submitData)
      }
      setShowModal(false)
      resetForm()
      fetchExpenses()
    } catch (error) {
      console.error('Failed to save expense:', error)
      alert(error.response?.data?.amount?.[0] || 'Failed to save expense')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}/`)
        fetchExpenses()
      } catch (error) {
        console.error('Failed to delete expense:', error)
      }
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description || '',
      expense_date: expense.expense_date.split('T')[0],
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingExpense(null)
    setFormData({
      category: '',
      amount: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0],
    })
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Unknown'
  }

  // FIXED: Properly calculate total expenses as numbers
  const totalExpenses = expenses.reduce((sum, exp) => {
    let amount = exp.amount
    // Convert to number if it's a string
    if (typeof amount === 'string') {
      amount = parseFloat(amount)
    }
    // Handle decimal or integer
    amount = Number(amount) || 0
    return sum + amount
  }, 0)

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-primary">Loading expenses...</div>
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
            <h1 className="text-2xl font-bold text-text-main">Expenses</h1>
            <p className="text-text-muted mt-1">Track and manage your daily expenses</p>
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
            Add Expense
          </button>
        </div>

        {/* Stats Card - Fixed total display */}
        <div className="glass-card p-6 bg-gradient-to-r from-primary/5 to-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted">Total Expenses</p>
              <p className="text-3xl font-bold text-text-main">
                {totalExpenses.toLocaleString()} RWF
              </p>
            </div>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field w-auto min-w-[150px]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="input-field w-auto"
          />
          
          {(filterCategory || filterMonth) && (
            <button
              onClick={() => {
                setFilterCategory('')
                setFilterMonth('')
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <img src="/images/expense-illustration.svg" alt="No expenses" className="w-48 mx-auto mb-6 opacity-50" 
              onError={(e) => e.target.style.display = 'none'} />
            <h3 className="text-xl font-semibold text-text-main mb-2">No Expenses Recorded</h3>
            <p className="text-text-muted mb-4">Start tracking your expenses to stay on budget</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="btn-primary"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              // Ensure amount is displayed as a number
              const displayAmount = typeof expense.amount === 'string' 
                ? parseFloat(expense.amount) 
                : expense.amount
              
              return (
                <div key={expense.id} className="glass-card p-5 glass-card-hover">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-accent/30 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-main">
                            {expense.description || getCategoryName(expense.category)}
                          </h3>
                          <p className="text-sm text-text-muted">
                            {getCategoryName(expense.category)} • {new Date(expense.expense_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-red-600">
                        -{displayAmount.toLocaleString()} RWF
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-1 hover:bg-accent/30 rounded transition-colors"
                        >
                          <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-text-main mb-4">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Amount (RWF)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    required
                    min="1"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder="What was this for?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="input-field"
                    required
                  />
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
                    {editingExpense ? 'Update' : 'Add Expense'}
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

export default Expenses