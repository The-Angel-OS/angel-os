"use client"

import React from 'react'
import Link from 'next/link'
import { Home, LayoutDashboard, ExternalLink } from 'lucide-react'

export function AdminNavLinks() {
  return (
    <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <Link
        href="/"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Go to Home"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
        <ExternalLink className="w-3 h-3 opacity-60" />
      </Link>
      
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title="Go to Dashboard"
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ExternalLink className="w-3 h-3 opacity-60" />
      </Link>
      
      <div className="flex-1" />
      
      <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
        Admin Panel
      </div>
    </div>
  )
}

export default AdminNavLinks

