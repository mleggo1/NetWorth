'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PassiveIncomeTracker() {
  const [darkMode, setDarkMode] = useState(false)
  const [lifestyleCost, setLifestyleCost] = useState(0)
  const [currentPassiveIncome, setCurrentPassiveIncome] = useState(0)
  const [growthRate, setGrowthRate] = useState(7)

  // Sync dark mode with document
  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    return () => observer.disconnect()
  }, [])

  // Refs for input fields
  const lifestyleCostRef = useRef<HTMLInputElement | null>(null)
  const currentPassiveIncomeRef = useRef<HTMLInputElement | null>(null)
  const growthRateRef = useRef<HTMLInputElement | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'lifestyleCost' | 'currentPassiveIncome' | 'growthRate') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      if (field === 'lifestyleCost') {
        currentPassiveIncomeRef.current?.focus()
      } else if (field === 'currentPassiveIncome') {
        growthRateRef.current?.focus()
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
    if (value === 0) return ''
    return formatCurrency(value)
  }

  const formatPercentageInput = (value: number): string => {
    if (value === 0) return ''
    return `${value}%`
  }

  const parsePercentage = (value: string): number => {
    const cleaned = value.replace(/[^\d.]/g, '')
    return parseFloat(cleaned) || 0
  }

  // Calculate Freedom Percentage
  const freedomPercentage = useMemo(() => {
    if (lifestyleCost === 0) return 0
    return Math.min(100, Math.round((currentPassiveIncome / lifestyleCost) * 100))
  }, [currentPassiveIncome, lifestyleCost])

  // Calculate Financial Independence Year
  const financialIndependenceYear = useMemo(() => {
    if (currentPassiveIncome >= lifestyleCost && lifestyleCost > 0) {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      return new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    if (lifestyleCost === 0 || currentPassiveIncome === 0 || growthRate === 0) {
      return null
    }

    const currentYear = new Date().getFullYear()
    let projectedPassive = currentPassiveIncome

    for (let year = 0; year <= 50; year++) {
      if (projectedPassive >= lifestyleCost) {
        const date = new Date(currentYear + year, 10, 1) // November
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
      projectedPassive = projectedPassive * (1 + growthRate / 100)
    }

    return 'Beyond 50 years'
  }, [currentPassiveIncome, lifestyleCost, growthRate])

  // Projection data for chart
  const projectionData = useMemo(() => {
    const data = []
    const currentYear = new Date().getFullYear()
    const yearsToProject = 20

    let projectedPassive = currentPassiveIncome

    for (let year = 0; year <= yearsToProject; year++) {
      const yearLabel = currentYear + year
      data.push({
        year: yearLabel,
        lifestyle: lifestyleCost,
        passive: projectedPassive,
      })

      // Project passive income growth
      projectedPassive = projectedPassive * (1 + growthRate / 100)
    }

    return data
  }, [lifestyleCost, currentPassiveIncome, growthRate])

  const handleReset = () => {
    setLifestyleCost(0)
    setCurrentPassiveIncome(0)
    setGrowthRate(7)
  }

  return (
    <div className={`space-y-8 relative ${darkMode ? 'dark' : ''}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Boxes */}
        <div className="space-y-6">
          <div className="glass-card embossed rounded-xl p-6 premium-hover shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="luxury-subheading text-2xl text-gray-800 dark:text-gray-200">Passive Income Tracker</h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 premium-hover glass-card text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-800/90 border border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400"
                title="Reset all values to zero"
              >
                Reset All
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  Lifestyle Cost (p.a.)
                </label>
                <input
                  ref={lifestyleCostRef}
                  type="text"
                  value={formatCurrencyInput(lifestyleCost)}
                  onChange={(e) => setLifestyleCost(parseCurrency(e.target.value))}
                  onKeyDown={(e) => handleKeyDown(e, 'lifestyleCost')}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setLifestyleCost(0)
                    }
                  }}
                  placeholder="$0"
                  className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
                />
                <input
                  type="range"
                  min="0"
                  max={500000}
                  value={Math.min(lifestyleCost, 500000)}
                  onChange={(e) => setLifestyleCost(parseFloat(e.target.value))}
                  className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer asset-slider"
                  style={{
                    background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(Math.min(lifestyleCost, 500000) / 500000) * 100}%, #e5e7eb ${(Math.min(lifestyleCost, 500000) / 500000) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {formatCurrency(lifestyleCost)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  Current Passive Income (p.a.)
                </label>
                <input
                  ref={currentPassiveIncomeRef}
                  type="text"
                  value={formatCurrencyInput(currentPassiveIncome)}
                  onChange={(e) => setCurrentPassiveIncome(parseCurrency(e.target.value))}
                  onKeyDown={(e) => handleKeyDown(e, 'currentPassiveIncome')}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setCurrentPassiveIncome(0)
                    }
                  }}
                  placeholder="$0"
                  className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
                />
                <input
                  type="range"
                  min="0"
                  max={500000}
                  value={Math.min(currentPassiveIncome, 500000)}
                  onChange={(e) => setCurrentPassiveIncome(parseFloat(e.target.value))}
                  className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer asset-slider"
                  style={{
                    background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(Math.min(currentPassiveIncome, 500000) / 500000) * 100}%, #e5e7eb ${(Math.min(currentPassiveIncome, 500000) / 500000) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {formatCurrency(currentPassiveIncome)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  Growth Rate % (P.A.)
                </label>
                <input
                  ref={growthRateRef}
                  type="text"
                  value={formatPercentageInput(growthRate)}
                  onChange={(e) => setGrowthRate(parsePercentage(e.target.value))}
                  onKeyDown={(e) => handleKeyDown(e, 'growthRate')}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setGrowthRate(0)
                    }
                  }}
                  placeholder="0%"
                  className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
                />
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
                  className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projection Section */}
        <div className="glass-card embossed rounded-xl p-6 premium-hover shadow-sm">
          <h2 className="luxury-subheading text-2xl mb-6 text-gray-800 dark:text-gray-200">Projection</h2>
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorLifestyleTracker" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.5}/>
                  <stop offset="50%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPassiveTracker" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.6}/>
                  <stop offset="50%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#cbd5e1'} strokeWidth={1.5} opacity={0.7} />
              <XAxis
                dataKey="year"
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                strokeWidth={2}
                tick={{ fill: darkMode ? '#e2e8f0' : '#1e293b', fontWeight: 'bold', fontSize: '14px' }}
                style={{ fontSize: '14px', fontWeight: 'bold' }}
              />
              <YAxis
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                strokeWidth={2}
                tick={{ fill: darkMode ? '#e2e8f0' : '#1e293b', fontWeight: 'bold', fontSize: '14px' }}
                tickFormatter={(value) => `$${value / 1000}k`}
                style={{ fontSize: '14px', fontWeight: 'bold' }}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  border: `3px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                }}
              />
              <Legend 
                wrapperStyle={{ fontWeight: 'bold', fontSize: '16px', paddingTop: '20px' }}
                iconType="square"
              />
              <Area
                type="monotone"
                dataKey="lifestyle"
                stroke="#dc2626"
                strokeWidth={5}
                fillOpacity={1}
                fill="url(#colorLifestyleTracker)"
                name="Lifestyle Cost"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#dc2626' }}
              />
              <Area
                type="monotone"
                dataKey="passive"
                stroke="#059669"
                strokeWidth={6}
                fillOpacity={1}
                fill="url(#colorPassiveTracker)"
                name="Passive Income"
                dot={false}
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#059669' }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Summary Card */}
          {(lifestyleCost > 0 || currentPassiveIncome > 0) && (
            <div className="mt-6 p-6 glass-card embossed rounded-xl border-l-4 border-teal-500 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="mb-4 relative z-10">
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  You've reached <span className="luxury-heading text-3xl text-teal-700 dark:text-teal-400">{freedomPercentage}%</span> of your lifestyle freedom target.
                </p>
                {financialIndependenceYear && (
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    At this growth rate, your passive income is projected to surpass your lifestyle cost in{' '}
                    <span className="luxury-heading text-3xl text-teal-700 dark:text-teal-400">{financialIndependenceYear}</span>.
                  </p>
                )}
                {freedomPercentage > 0 && freedomPercentage < 100 && (
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 italic mt-4">
                    You're on your way to full financial independence.
                  </p>
                )}
              </div>
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
          )}
        </div>
      </div>
    </div>
  )
}

