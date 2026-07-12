import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../store/AuthContext'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { updateUnreadCount, fetchUnreadCount } = useAuth()

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      let url = '/notifications/'
      if (filter === 'unread') url += '?is_read=false'
      if (filter === 'read') url += '?is_read=true'
      
      const response = await api.get(url)
      // Handle paginated response - DRF returns {count, next, previous, results}
      if (response.data && Array.isArray(response.data.results)) {
        setNotifications(response.data.results)
      } else if (Array.isArray(response.data)) {
        setNotifications(response.data)
      } else {
        console.error('Notifications API unexpected format:', response.data)
        setNotifications([])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/`, { is_read: true })
      fetchNotifications()
      fetchUnreadCount()
      const newCount = await getUnreadCount()
      updateUnreadCount(newCount)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-read/', { mark_all: true })
      fetchNotifications()
      fetchUnreadCount()
      updateUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}/`)
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const deleteAllRead = async () => {
    if (window.confirm('Delete all read notifications?')) {
      try {
        await api.delete('/notifications/delete-all-read/')
        fetchNotifications()
      } catch (error) {
        console.error('Failed to delete read notifications:', error)
      }
    }
  }

  const getUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count/')
      return response.data.unread_count
    } catch (error) {
      console.error('Failed to get unread count:', error)
      return 0
    }
  }

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'exceeded':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'critical':
        return (
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-primary">Loading notifications...</div>
        </div>
      </Layout>
    )
  }

  // Ensure notifications is an array before using filter
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Notifications</h1>
            <p className="text-text-muted mt-1">Stay updated with your budget alerts</p>
          </div>
          <div className="flex gap-3">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-secondary text-sm">
                Mark All as Read
              </button>
            )}
            <button onClick={deleteAllRead} className="btn-secondary text-sm">
              Clear Read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-accent/50 pb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent/30'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread' ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent/30'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'read' ? 'bg-primary text-white' : 'text-text-muted hover:bg-accent/30'
            }`}
          >
            Read
          </button>
        </div>

        {/* Notifications List */}
        {!notifications || notifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <svg className="w-24 h-24 mx-auto mb-4 text-text-muted opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-xl font-semibold text-text-main mb-2">No Notifications</h3>
            <p className="text-text-muted">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`glass-card p-5 transition-all ${
                  !notification.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {getNotificationIcon(notification.notification_type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${!notification.is_read ? 'text-text-main' : 'text-text-muted'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-text-muted mt-1">{notification.message}</p>
                        <p className="text-xs text-text-muted mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-accent/30 rounded transition-colors"
                            title="Mark as read"
                          >
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5 text-text-muted hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Notifications