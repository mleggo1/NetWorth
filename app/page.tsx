'use client'

import { useState, useEffect } from 'react'
import NetWorthEngine from '@/components/NetWorthEngine'
import FreedomScorecard from '@/components/FreedomScorecard'
import PassiveIncomeTracker from '@/components/PassiveIncomeTracker'
import PasswordGate from '@/components/PasswordGate'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'networth' | 'freedom' | 'passive'>('networth')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check if dark mode is already set
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <PasswordGate>
      <main className="min-h-screen luxury-leather-bg relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-100/20 to-transparent dark:from-amber-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-100/20 to-transparent dark:from-teal-900/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-4 relative z-10">
          {/* Dark Mode Toggle - Discreet Top Right */}
          <div className="flex justify-end mb-2">
            <button
              onClick={toggleDarkMode}
              className="glass-card p-1.5 rounded-lg premium-hover text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all opacity-70 hover:opacity-100"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="luxury-heading text-4xl md:text-6xl font-black text-gray-900 dark:text-gray-50 mb-1 bg-gradient-to-r from-gray-900 via-teal-700 to-gray-900 dark:from-gray-50 dark:via-teal-400 dark:to-gray-50 bg-clip-text text-transparent drop-shadow-lg leading-[1.1] pb-2 overflow-visible">
                {activeTab === 'networth' ? 'Net Worth Engine' : 'Freedom Scorecard'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 font-light text-sm mt-1">
                {activeTab === 'networth' 
                  ? 'Exclusive Wealth Management Platform' 
                  : 'Your Path to Financial Independence'}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setActiveTab('networth')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 premium-hover ${
                  activeTab === 'networth'
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-500/30'
                    : 'glass-card text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-800/90'
                }`}
              >
                Net Worth
              </button>
              <button
                onClick={() => setActiveTab('freedom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 premium-hover ${
                  activeTab === 'freedom'
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-500/30'
                    : 'glass-card text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-800/90'
                }`}
              >
                Freedom Scorecard
              </button>
            </div>
          </div>

          {activeTab === 'networth' ? <NetWorthEngine /> : <FreedomScorecard />}
        </div>
      </main>
    </PasswordGate>
  )
}

