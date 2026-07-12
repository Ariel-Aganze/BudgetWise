import React from 'react'
import TopNav from './TopNav'
import BottomNav from './BottomNav'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TopNav />
      <main className="px-4 max-w-7xl mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout