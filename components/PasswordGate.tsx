'use client'

import { useState, useMemo } from 'react'

interface PasswordGateProps {
  children: React.ReactNode
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Calculate expected password based on current month
  const expectedPassword = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1 // getMonth() returns 0-11, so add 1
    return `MJL${currentMonth}`
  }, [])

  const handleLogin = () => {
    // Trim and convert to uppercase
    const trimmedPassword = password.trim().toUpperCase()
    
    // Compare with expected password
    if (trimmedPassword === expectedPassword) {
      setIsAuthenticated(true)
      setError('')
      setPassword('')
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  // If authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Show password gate
  return (
    <div className="min-h-screen luxury-leather-bg flex items-center justify-center relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-100/20 to-transparent dark:from-amber-900/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-100/20 to-transparent dark:from-teal-900/10 rounded-full blur-3xl"></div>
      
      <div className="glass-card embossed rounded-xl p-8 md:p-12 max-w-md w-full mx-4 relative z-10 shadow-xl">
        <h1 className="luxury-heading text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-gray-50 mb-2 bg-gradient-to-r from-gray-900 via-teal-700 to-gray-900 dark:from-gray-50 dark:via-teal-400 dark:to-gray-50 bg-clip-text text-transparent drop-shadow-lg mb-6">
          Welcome to Networth & Freedom Scorecard
        </h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('') // Clear error when user types
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter password"
              className="w-full px-4 py-3 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">
              {error}
            </div>
          )}
          
          <button
            onClick={handleLogin}
            className="w-full px-6 py-3 rounded-lg text-base font-bold transition-all duration-300 premium-hover glass-card text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  )
}

