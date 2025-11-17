'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

export default function FreedomScorecard() {
  const [darkMode, setDarkMode] = useState(false)
  const [targetLifestyle, setTargetLifestyle] = useState(0)
  
  // Sync dark mode with document
  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    // Watch for changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    return () => observer.disconnect()
  }, [])
  const [passiveIncome, setPassiveIncome] = useState(0)
  const [activeIncome, setActiveIncome] = useState(0)
  const [savingsRate, setSavingsRate] = useState(15)
  const [growthRate, setGrowthRate] = useState(7)
  const [showCelebration, setShowCelebration] = useState(false)
  const [hasReachedFreedom, setHasReachedFreedom] = useState(false)

  // Refs for input fields and slider
  const targetLifestyleRef = useRef<HTMLInputElement | null>(null)
  const passiveIncomeRef = useRef<HTMLInputElement | null>(null)
  const activeIncomeRef = useRef<HTMLInputElement | null>(null)
  const savingsRateSliderRef = useRef<HTMLInputElement | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'targetLifestyle' | 'passiveIncome' | 'activeIncome') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      if (field === 'targetLifestyle') {
        passiveIncomeRef.current?.focus()
      } else if (field === 'passiveIncome') {
        activeIncomeRef.current?.focus()
      } else if (field === 'activeIncome') {
        savingsRateSliderRef.current?.focus()
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d.]/g, '')
    return parseFloat(cleaned) || 0
  }

  const formatCurrencyInput = (value: number): string => {
    return formatCurrency(value)
  }

  const projectionData = useMemo(() => {
    const data = []
    const currentYear = new Date().getFullYear()
    const yearsToProject = 20

    let currentPassive = passiveIncome
    let currentSavings = activeIncome * (savingsRate / 100)

    for (let year = 0; year <= yearsToProject; year++) {
      const yearLabel = currentYear + year
      data.push({
        year: yearLabel,
        lifestyle: targetLifestyle,
        passive: currentPassive,
      })

      // Project passive income growth
      currentPassive = currentPassive * (1 + growthRate / 100)
    }

    return data
  }, [targetLifestyle, passiveIncome, activeIncome, savingsRate, growthRate])

  const freedomDate = useMemo(() => {
    const currentYear = new Date().getFullYear()
    let currentPassive = passiveIncome

    for (let year = 0; year <= 50; year++) {
      if (currentPassive >= targetLifestyle) {
        const date = new Date(currentYear + year, 10, 1) // November
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
      currentPassive = currentPassive * (1 + growthRate / 100)
    }

    return 'Beyond 50 years'
  }, [targetLifestyle, passiveIncome, growthRate])

  const freedomPercentage = useMemo(() => {
    if (passiveIncome >= targetLifestyle) return 100
    return Math.min(100, Math.round((passiveIncome / targetLifestyle) * 100))
  }, [passiveIncome, targetLifestyle])

  // Check if financial freedom is reached
  useEffect(() => {
    if (passiveIncome >= targetLifestyle && targetLifestyle > 0) {
      if (!hasReachedFreedom) {
        setHasReachedFreedom(true)
        setShowCelebration(true)
      }
    } else {
      setHasReachedFreedom(false)
    }
  }, [passiveIncome, targetLifestyle, hasReachedFreedom])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const closeCelebration = () => {
    setShowCelebration(false)
  }

  return (
    <div className={`space-y-8 relative ${darkMode ? 'dark' : ''}`}>
      {/* Celebratory Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeCelebration}
          ></div>
          
          {/* Modal Content */}
          <div className="relative z-50 w-full max-w-2xl glass-card embossed rounded-3xl p-12 transform animate-scale-in">
            {/* Confetti Effect Background */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute top-0 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
              <div className="absolute top-0 right-1/4 w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2s' }}></div>
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '2s' }}></div>
              <div className="absolute top-0 right-1/3 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.9s', animationDuration: '2s' }}></div>
              <div className="absolute bottom-0 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '2s' }}></div>
              <div className="absolute bottom-0 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2s' }}></div>
            </div>

            {/* Close Button */}
            <button
              onClick={closeCelebration}
              className="absolute top-6 right-6 p-2 rounded-full glass-card hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all premium-hover"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Celebration Icon */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-teal-400 to-green-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-yellow-400 to-teal-500 rounded-full p-8 shadow-2xl">
                    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Main Message */}
              <h2 className="luxury-heading text-5xl md:text-6xl text-gray-900 dark:text-gray-50 mb-4 bg-gradient-to-r from-teal-600 via-green-500 to-teal-600 bg-clip-text text-transparent">
                Congratulations!
              </h2>
              
              <p className="luxury-subheading text-3xl md:text-4xl text-gray-800 dark:text-gray-200 mb-6">
                Well Done!
              </p>

              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 font-medium">
                You've Reached <span className="font-bold text-teal-600 dark:text-teal-400">Financial Freedom</span>!
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="glass-card rounded-xl p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Target Lifestyle</p>
                  <p className="luxury-heading text-2xl text-gray-900 dark:text-gray-50">{formatCurrency(targetLifestyle)}</p>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Passive Income</p>
                  <p className="luxury-heading text-2xl text-teal-600 dark:text-teal-400">{formatCurrency(passiveIncome)}</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeCelebration}
                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-500/30 premium-hover"
              >
                Continue Planning
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs Section - Luxury Enhanced */}
        <div className="glass-card embossed rounded-xl p-6 premium-hover shadow-sm">
          <h2 className="luxury-subheading text-2xl text-gray-800 dark:text-gray-200 mb-6">Your Inputs</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Target Lifestyle Cost (p.a.)
              </label>
              <input
                ref={targetLifestyleRef}
                type="text"
                value={formatCurrencyInput(targetLifestyle)}
                onChange={(e) => setTargetLifestyle(parseCurrency(e.target.value))}
                onKeyDown={(e) => handleKeyDown(e, 'targetLifestyle')}
                className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
              />
              <input
                type="range"
                min="0"
                max={1000000}
                value={Math.min(targetLifestyle, 1000000)}
                onChange={(e) => setTargetLifestyle(parseFloat(e.target.value))}
                className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer asset-slider"
                style={{
                  background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(Math.min(targetLifestyle, 1000000) / 1000000) * 100}%, #e5e7eb ${(Math.min(targetLifestyle, 1000000) / 1000000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                {formatCurrency(targetLifestyle)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Target Passive Income (p.a.)
              </label>
              <input
                ref={passiveIncomeRef}
                type="text"
                value={formatCurrencyInput(passiveIncome)}
                onChange={(e) => setPassiveIncome(parseCurrency(e.target.value))}
                onKeyDown={(e) => handleKeyDown(e, 'passiveIncome')}
                className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
              />
              <input
                type="range"
                min="0"
                max={1000000}
                value={Math.min(passiveIncome, 1000000)}
                onChange={(e) => setPassiveIncome(parseFloat(e.target.value))}
                className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer asset-slider"
                style={{
                  background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(Math.min(passiveIncome, 1000000) / 1000000) * 100}%, #e5e7eb ${(Math.min(passiveIncome, 1000000) / 1000000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                {formatCurrency(passiveIncome)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Active Income (optional)
              </label>
              <input
                ref={activeIncomeRef}
                type="text"
                value={formatCurrencyInput(activeIncome)}
                onChange={(e) => setActiveIncome(parseCurrency(e.target.value))}
                onKeyDown={(e) => handleKeyDown(e, 'activeIncome')}
                className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
              />
              <input
                type="range"
                min="0"
                max={1000000}
                value={Math.min(activeIncome, 1000000)}
                onChange={(e) => setActiveIncome(parseFloat(e.target.value))}
                className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer asset-slider"
                style={{
                  background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(Math.min(activeIncome, 1000000) / 1000000) * 100}%, #e5e7eb ${(Math.min(activeIncome, 1000000) / 1000000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                {formatCurrency(activeIncome)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Savings Rate: <span className="text-teal-600 dark:text-teal-400 text-lg">{savingsRate}%</span>
              </label>
              <input
                ref={savingsRateSliderRef}
                type="range"
                min="0"
                max="100"
                step="1"
                value={savingsRate}
                onChange={(e) => setSavingsRate(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer accent-teal-600"
                tabIndex={0}
              />
              <div className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                Savings: {formatCurrency(activeIncome * (savingsRate / 100))} per year
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Growth Rate (p.a.): <span className="text-teal-600 dark:text-teal-400 text-lg">{growthRate}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={growthRate}
                onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Projection Section - Luxury Enhanced */}
        <div className="glass-card embossed rounded-xl p-6 premium-hover shadow-sm">
          <h2 className="luxury-subheading text-2xl mb-6 text-gray-800 dark:text-gray-200">Projection</h2>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorLifestyle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPassive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="year"
                stroke="#6b7280"
                tick={{ fill: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: 'bold' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fill: darkMode ? '#cbd5e1' : '#4b5563', fontWeight: 'bold' }}
                tickFormatter={(value) => `$${value / 1000}k`}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  border: `2px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              />
              <Legend 
                wrapperStyle={{ fontWeight: 'bold', fontSize: '14px' }}
              />
              <Area
                type="monotone"
                dataKey="lifestyle"
                stroke="#ef4444"
                strokeWidth={3}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorLifestyle)"
                name="Lifestyle"
              />
              <Area
                type="monotone"
                dataKey="passive"
                stroke="#10b981"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorPassive)"
                name="Passive"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-6 p-6 glass-card embossed rounded-xl border-l-4 border-teal-500 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-2xl"></div>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 relative z-10">
              At this rate, <span className="luxury-heading text-3xl text-teal-700 dark:text-teal-400">{freedomPercentage}%</span> Freedom expected by{' '}
              <span className="luxury-heading text-3xl text-teal-700 dark:text-teal-400">{freedomDate}</span>.
            </p>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-teal-600 rounded-full shadow-lg" />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Current Progress</span>
                </div>
                <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{freedomPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 shadow-inner">
                <div
                  className="bg-gradient-to-r from-teal-500 to-teal-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${Math.min(100, freedomPercentage)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
