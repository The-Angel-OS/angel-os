'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Lock, User, Zap } from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        // Payload sets the cookie automatically
        router.push(redirect)
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-black overflow-hidden relative flex flex-col">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-cyan-900/20" />
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23FF9900" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* LCARS Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative z-10 border-b border-orange-500/30 bg-gray-900/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-3xl"
              >
                🚀
              </motion.div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Angel OS Command Center
                </h1>
                <div className="text-sm text-gray-400">Authentication Portal</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Systems Online</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Login Panel */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-900/90 border border-orange-500/30 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden">
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-1">
              <div className="bg-gray-900 p-4">
                <h2 className="text-xl font-black uppercase tracking-wider text-center text-orange-400">
                  Secure Access Terminal
                </h2>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/50 border border-red-500/50 rounded p-3 text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-orange-500/30 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(255,153,0,0.3)] transition-all"
                    placeholder="commander@angel-os.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <Lock className="inline w-4 h-4 mr-2" />
                    Access Code
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-orange-500/30 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(255,153,0,0.3)] transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-black font-black uppercase tracking-wider py-3 rounded shadow-lg hover:shadow-[0_0_30px_rgba(255,153,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                    Authenticating...
                  </span>
                ) : (
                  'Initialize Command Session'
                )}
              </motion.button>

              <div className="text-center text-sm text-gray-400">
                <p>First time commander?</p>
                <Link
                  href="/onboarding"
                  className="text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  Initialize Command Profile
                </Link>
              </div>
            </form>

            {/* Leo AI Hint */}
            <div className="bg-black/50 border-t border-cyan-500/30 p-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-black" />
                </div>
                <div className="text-cyan-400">
                  <p className="font-bold">Leo Intelligence:</p>
                  <p className="text-cyan-300/80">
                    "Welcome to Angel OS. Your divine command center awaits."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function AngelOSLogin() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-400">Loading Authentication Portal...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
