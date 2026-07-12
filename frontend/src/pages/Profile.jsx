import React, { useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../store/AuthContext'

const Profile = () => {
  const { user, fetchUnreadCount } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email_notifications_enabled: user?.email_notifications_enabled ?? true,
    in_app_notifications_enabled: user?.in_app_notifications_enabled ?? true,
  })
  
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const response = await api.put('/accounts/profile/', profileForm)
      setMessage('Profile updated successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setError('New passwords do not match')
      return
    }
    setLoading(true)
    setMessage('')
    setError('')
    try {
      await api.post('/accounts/change-password/', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
        confirm_new_password: passwordForm.confirm_new_password,
      })
      setMessage('Password changed successfully')
      setPasswordForm({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
      })
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.old_password?.[0] || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationPrefUpdate = async () => {
    setLoading(true)
    try {
      await api.put('/accounts/profile/', profileForm)
      setMessage('Notification preferences updated')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-main">Profile Settings</h1>
          <p className="text-text-muted mt-1">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-accent/50 pb-3">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'profile' ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent/30'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'security' ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent/30'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('notifications-pref')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'notifications-pref' ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent/30'
            }`}
          >
            Notifications
          </button>
        </div>

        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm animate-fade-in">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-main">{user?.full_name}</h2>
                <p className="text-text-muted">{user?.email}</p>
                <p className="text-xs text-text-muted mt-1">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  className="input-field bg-gray-50"
                  disabled
                />
                <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-text-main mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_new_password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Notifications Preferences Tab */}
        {activeTab === 'notifications-pref' && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-text-main mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                <div>
                  <p className="font-medium text-text-main">Email Notifications</p>
                  <p className="text-sm text-text-muted">Receive budget alerts via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileForm.email_notifications_enabled}
                    onChange={(e) => setProfileForm({ ...profileForm, email_notifications_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                <div>
                  <p className="font-medium text-text-main">In-App Notifications</p>
                  <p className="text-sm text-text-muted">Receive notifications within the app</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileForm.in_app_notifications_enabled}
                    onChange={(e) => setProfileForm({ ...profileForm, in_app_notifications_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <button onClick={handleNotificationPrefUpdate} disabled={loading} className="btn-primary mt-4">
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Profile