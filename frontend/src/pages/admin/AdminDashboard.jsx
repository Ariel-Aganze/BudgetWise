import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../services/api'
import { useAuth } from '../../store/AuthContext'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [systemStats, setSystemStats] = useState(null)
  const [systemLogs, setSystemLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [createUserForm, setCreateUserForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    is_staff: false,
  })
  const [createUserError, setCreateUserError] = useState('')
  const [createUserSuccess, setCreateUserSuccess] = useState('')

  useEffect(() => {
    fetchAllAdminData()
  }, [])

  const fetchAllAdminData = async () => {
    try {
      const [usersRes, statsRes, logsRes] = await Promise.all([
        api.get('/accounts/admin/users/'),
        api.get('/accounts/admin/stats/'),
        api.get('/accounts/admin/logs/')
      ])
      
      console.log('Users response:', usersRes.data)
      console.log('Stats response:', statsRes.data)
      console.log('Logs response:', logsRes.data)
      
      // Handle paginated response for users
      if (usersRes.data && Array.isArray(usersRes.data.results)) {
        setUsers(usersRes.data.results)
      } else if (Array.isArray(usersRes.data)) {
        setUsers(usersRes.data)
      } else {
        setUsers([])
      }
      
      setSystemStats(statsRes.data)
      setSystemLogs(logsRes.data?.logs || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId, action) => {
    try {
      const response = await api.patch(`/accounts/admin/users/${userId}/`, { action })
      console.log(`${action} action response:`, response.data)
      await fetchAllAdminData()
      alert(response.data.message || `${action} completed successfully`)
    } catch (error) {
      console.error('Failed to update user:', error)
      const errorMsg = error.response?.data?.error || 'Failed to update user'
      alert(errorMsg)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreateUserError('')
    setCreateUserSuccess('')
    
    if (createUserForm.password !== createUserForm.confirm_password) {
      setCreateUserError('Passwords do not match')
      return
    }
    
    try {
      // Use the admin create endpoint directly
      await api.post('/accounts/admin/users/create/', {
        full_name: createUserForm.full_name,
        email: createUserForm.email,
        password: createUserForm.password,
        confirm_password: createUserForm.confirm_password,
        is_staff: createUserForm.is_staff,
      })
      
      setCreateUserSuccess('User created successfully!')
      setCreateUserForm({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        is_staff: false,
      })
      setTimeout(() => {
        setShowCreateUserModal(false)
        setCreateUserSuccess('')
        fetchAllAdminData()
      }, 1500)
    } catch (error) {
      console.error('Failed to create user:', error)
      const errorMsg = error.response?.data?.email?.[0] || error.response?.data?.password?.[0] || 'Failed to create user'
      setCreateUserError(errorMsg)
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

  return (
    <Layout>
      <div className="space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div className="glass-card p-6 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-main">Admin Dashboard</h1>
              <p className="text-text-muted mt-1">System Administration & Monitoring</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-main">Admin Access</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-accent/50 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-muted hover:bg-accent/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'users' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-muted hover:bg-accent/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'settings' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-muted hover:bg-accent/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            System Settings
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'logs' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-muted hover:bg-accent/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            System Logs ({systemLogs.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && systemStats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm">Total Users</span>
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-text-main">{systemStats.total_users || 0}</p>
                <p className="text-xs text-text-muted mt-1">
                  +{systemStats.new_users_this_week || 0} this week
                </p>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm">Active Today</span>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-text-main">{systemStats.active_users_today || 0}</p>
                <p className="text-xs text-text-muted mt-1">Logged in today</p>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm">Total Budgets</span>
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-text-main">{systemStats.total_budgets || 0}</p>
                <p className="text-xs text-text-muted mt-1">
                  {(systemStats.total_budget_amount || 0).toLocaleString()} RWF total
                </p>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm">Total Expenses</span>
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-text-main">
                  {(systemStats.total_expenses || 0).toLocaleString()} RWF
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {systemStats.total_expenses_count || 0} transactions
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-semibold text-text-main mb-4">Notification Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total Notifications</span>
                    <span className="font-semibold">{systemStats.total_notifications || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Unread Notifications</span>
                    <span className="font-semibold text-orange-600">{systemStats.unread_notifications || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Emails Sent</span>
                    <span className="font-semibold text-green-600">{systemStats.total_emails_sent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Failed Emails</span>
                    <span className="font-semibold text-red-600">{systemStats.failed_emails || 0}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold text-text-main mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                    <span className="text-text-muted">API Status</span>
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                    <span className="text-text-muted">Database</span>
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Connected
                    </span>
                  </div>
                  <div className={`flex items-center justify-between p-2 rounded-lg ${systemStats?.system_health?.email_service === 'configured' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span className="text-text-muted">Email Service</span>
                    <span className={`font-semibold flex items-center gap-1 ${systemStats?.system_health?.email_service === 'configured' ? 'text-green-600' : 'text-red-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${systemStats?.system_health?.email_service === 'configured' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                      {systemStats?.system_health?.email_service === 'configured' ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create User
              </button>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/30">
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-accent/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">{userItem.full_name?.charAt(0)}</span>
                            </div>
                            <span className="font-medium text-text-main">{userItem.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-muted">{userItem.email}</td>
                        <td className="px-6 py-4 text-text-muted text-sm">
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userItem.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {userItem.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userItem.is_staff ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {userItem.is_staff ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            {/* Activate/Deactivate Button */}
                            {!userItem.is_active ? (
                              <button
                                onClick={() => handleUserAction(userItem.id, 'activate')}
                                className="text-green-600 hover:underline text-sm"
                              >
                                Activate
                              </button>
                            ) : (
                              userItem.id !== user?.id && (
                                <button
                                  onClick={() => handleUserAction(userItem.id, 'deactivate')}
                                  className="text-red-600 hover:underline text-sm"
                                >
                                  Deactivate
                                </button>
                              )
                            )}
                            
                            {/* Make/Remove Admin Button */}
                            {!userItem.is_staff && userItem.id !== user?.id && (
                              <button
                                onClick={() => handleUserAction(userItem.id, 'make_admin')}
                                className="text-primary hover:underline text-sm"
                              >
                                Make Admin
                              </button>
                            )}
                            {userItem.is_staff && userItem.id !== user?.id && (
                              <button
                                onClick={() => handleUserAction(userItem.id, 'remove_admin')}
                                className="text-orange-600 hover:underline text-sm"
                              >
                                Remove Admin
                              </button>
                            )}
                            
                            {/* Delete Button */}
                            {userItem.id !== user?.id && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete user "${userItem.full_name}"? This action cannot be undone.`)) {
                                    handleUserAction(userItem.id, 'delete')
                                  }
                                }}
                                className="text-red-600 hover:underline text-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-text-main mb-4">SMTP Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">SMTP Server</label>
                    <input type="text" className="input-field bg-gray-50" value="smtp.gmail.com" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">SMTP Port</label>
                    <input type="text" className="input-field bg-gray-50" value="587" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Username</label>
                    <input type="text" className="input-field bg-gray-50" value={systemStats?.system_health?.email_service === 'configured' ? 'Configured' : 'Not Configured'} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Status</label>
                    <input type="text" className="input-field bg-gray-50" value={systemStats?.system_health?.email_service === 'configured' ? 'Active' : 'Inactive'} disabled />
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => alert('Please configure email in .env file')}
                >
                  Test Connection
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-text-main mb-4">System Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                  <div>
                    <p className="font-medium text-text-main">Backup Database</p>
                    <p className="text-xs text-text-muted">Create a manual backup</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Run Backup</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                  <div>
                    <p className="font-medium text-text-main">Clear Cache</p>
                    <p className="text-xs text-text-muted">Clear all system cache</p>
                  </div>
                  <button className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm">Clear Cache</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Logs Tab */}
        {activeTab === 'logs' && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-main">Recent System Events</h3>
              <button className="text-sm text-primary" onClick={() => fetchAllAdminData()}>
                Refresh
              </button>
            </div>
            {systemLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted">No logs available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {systemLogs.map((log, index) => (
                  <div key={index} className="p-3 bg-background rounded-xl font-mono text-sm">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-xs text-text-muted">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        log.level === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {log.level}
                      </span>
                      {log.type && (
                        <span className="text-xs text-text-muted px-2 py-0.5 bg-gray-100 rounded-full">
                          {log.type}
                        </span>
                      )}
                    </div>
                    <p className="text-text-muted">{log.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-text-main mb-4">Create New User</h2>
            
            {createUserError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                {createUserError}
              </div>
            )}
            
            {createUserSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm">
                {createUserSuccess}
              </div>
            )}
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Full Name</label>
                <input
                  type="text"
                  value={createUserForm.full_name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, full_name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Email</label>
                <input
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Password</label>
                <input
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={createUserForm.confirm_password}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, confirm_password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_staff"
                  checked={createUserForm.is_staff}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, is_staff: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="is_staff" className="text-sm text-text-main">
                  Grant Admin Privileges
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUserModal(false)
                    setCreateUserError('')
                    setCreateUserSuccess('')
                    setCreateUserForm({
                      full_name: '',
                      email: '',
                      password: '',
                      confirm_password: '',
                      is_staff: false,
                    })
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default AdminDashboard