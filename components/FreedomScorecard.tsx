'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'

type ProjectionPoint = {
  year: number
  passiveIncome: number
  lifestyleCost: number
}

const SLIDER_MAX_CURRENCY = 500000
const SLIDER_MAX_PERCENTAGE = 15
const PROJECTION_YEARS = 20

export default function FreedomScorecard() {
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

  // Helper: Format currency with thousands separators
  const formatCurrency = (value: number): string => {
    if (!isFinite(value) || isNaN(value)) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.max(0, value))
  }

  // Helper: Parse currency input
  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d.]/g, '')
    const parsed = parseFloat(cleaned)
    return isFinite(parsed) && !isNaN(parsed) ? Math.max(0, parsed) : 0
  }

  // Helper: Format currency for input field
  const formatCurrencyInput = (value: number): string => {
    if (value === 0 || !isFinite(value) || isNaN(value)) return ''
    return formatCurrency(value)
  }

  // Helper: Format percentage for input field
  const formatPercentageInput = (value: number): string => {
    if (value === 0 || !isFinite(value) || isNaN(value)) return ''
    return `${value}%`
  }

  // Helper: Parse percentage input
  const parsePercentage = (value: string): number => {
    const cleaned = value.replace(/[^\d.]/g, '')
    const parsed = parseFloat(cleaned)
    return isFinite(parsed) && !isNaN(parsed) ? Math.max(0, Math.min(100, parsed)) : 0
  }

  // Helper: Clamp value for slider
  const clampSliderValue = (value: number, max: number): number => {
    return Math.max(0, Math.min(max, isFinite(value) && !isNaN(value) ? value : 0))
  }

  // Keyboard navigation
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

  // Calculate Freedom Percentage (clamped at 300%, handles edge cases)
  const freedomPercentage = useMemo(() => {
    if (lifestyleCost === 0 || !isFinite(lifestyleCost) || isNaN(lifestyleCost)) return 0
    if (!isFinite(currentPassiveIncome) || isNaN(currentPassiveIncome)) return 0
    
    const percentage = (currentPassiveIncome / lifestyleCost) * 100
    return Math.min(Math.round(isFinite(percentage) ? percentage : 0), 300)
  }, [currentPassiveIncome, lifestyleCost])

  // Generate projection data
  const projections = useMemo((): ProjectionPoint[] => {
    const startYear = new Date().getFullYear()
    const safePassiveIncome = isFinite(currentPassiveIncome) && !isNaN(currentPassiveIncome) ? Math.max(0, currentPassiveIncome) : 0
    const safeLifestyleCost = isFinite(lifestyleCost) && !isNaN(lifestyleCost) ? Math.max(0, lifestyleCost) : 0
    const safeGrowthRate = isFinite(growthRate) && !isNaN(growthRate) ? Math.max(0, growthRate) : 0

    return Array.from({ length: PROJECTION_YEARS }, (_, i) => {
      const year = startYear + i
      const growthMultiplier = Math.pow(1 + safeGrowthRate / 100, i)
      const passiveIncome = safePassiveIncome * (isFinite(growthMultiplier) ? growthMultiplier : 1)
      
      return {
        year,
        passiveIncome: isFinite(passiveIncome) ? Math.max(0, passiveIncome) : 0,
        lifestyleCost: safeLifestyleCost,
      }
    })
  }, [currentPassiveIncome, lifestyleCost, growthRate])

  // Find independence year
  const independencePoint = useMemo(() => {
    return projections.find(p => p.passiveIncome >= p.lifestyleCost && p.lifestyleCost > 0)
  }, [projections])

  const independenceYear = useMemo(() => {
    if (independencePoint) {
      return independencePoint.year
    }
    return null
  }, [independencePoint])

  // Chart data format for Recharts
  const projectionData = useMemo(() => {
    return projections.map(p => ({
      year: p.year,
      lifestyle: p.lifestyleCost,
      passive: p.passiveIncome,
    }))
  }, [projections])

  // Handle reset
  const handleReset = () => {
    setLifestyleCost(0)
    setCurrentPassiveIncome(0)
    setGrowthRate(7)
  }

  // Handle input changes with validation
  const handleLifestyleCostChange = (value: string) => {
    const parsed = parseCurrency(value)
    setLifestyleCost(clampSliderValue(parsed, SLIDER_MAX_CURRENCY * 10)) // Allow higher input than slider max
  }

  const handlePassiveIncomeChange = (value: string) => {
    const parsed = parseCurrency(value)
    setCurrentPassiveIncome(clampSliderValue(parsed, SLIDER_MAX_CURRENCY * 10))
  }

  const handleGrowthRateChange = (value: string) => {
    const parsed = parsePercentage(value)
    setGrowthRate(clampSliderValue(parsed, SLIDER_MAX_PERCENTAGE))
  }

  // Check if we have valid data to show
  const hasValidData = lifestyleCost > 0 || currentPassiveIncome > 0

  return (
    <div className={`space-y-8 relative ${darkMode ? 'dark' : ''}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Boxes */}
        <div className="space-y-6">
          <div className="glass-card embossed rounded-xl p-6 premium-hover shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="luxury-subheading text-2xl text-gray-800 dark:text-gray-200">Targets & Growth</h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 premium-hover glass-card text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-800/90 border border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400"
                title="Reset all values to zero"
                aria-label="Reset all values to zero"
              >
                Reset All
              </button>
            </div>
            <div className="space-y-4">
              {/* Field 1: Lifestyle Cost */}
              <div>
                <label 
                  htmlFor="lifestyle-cost-input"
                  className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide"
                >
                  Lifestyle Cost (P.A.)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 italic">
                  How much your ideal life costs per year.
                </p>
                <input
                  id="lifestyle-cost-input"
                  ref={lifestyleCostRef}
                  type="text"
                  value={formatCurrencyInput(lifestyleCost)}
                  onChange={(e) => handleLifestyleCostChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'lifestyleCost')}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setLifestyleCost(0)
                    }
                  }}
                  placeholder="$0"
                  aria-label="Lifestyle Cost per annum"
                  aria-describedby="lifestyle-cost-helper"
                  className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
                />
                <input
                  type="range"
                  min="0"
                  max={SLIDER_MAX_CURRENCY}
                  value={clampSliderValue(lifestyleCost, SLIDER_MAX_CURRENCY)}
                  onChange={(e) => setLifestyleCost(parseFloat(e.target.value))}
                  aria-label="Lifestyle Cost slider"
                  className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer asset-slider"
                  style={{
                    background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(clampSliderValue(lifestyleCost, SLIDER_MAX_CURRENCY) / SLIDER_MAX_CURRENCY) * 100}%, #e5e7eb ${(clampSliderValue(lifestyleCost, SLIDER_MAX_CURRENCY) / SLIDER_MAX_CURRENCY) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div id="lifestyle-cost-helper" className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {formatCurrency(lifestyleCost)}
                </div>
              </div>

              {/* Field 2: Current Passive Income */}
              <div>
                <label 
                  htmlFor="passive-income-input"
                  className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide"
                >
                  Current Passive Income (P.A.)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 italic">
                  Money that comes in whether you work or not.
                </p>
                <input
                  id="passive-income-input"
                  ref={currentPassiveIncomeRef}
                  type="text"
                  value={formatCurrencyInput(currentPassiveIncome)}
                  onChange={(e) => handlePassiveIncomeChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'currentPassiveIncome')}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setCurrentPassiveIncome(0)
                    }
                  }}
                  placeholder="$0"
                  aria-label="Current Passive Income per annum"
                  aria-describedby="passive-income-helper"
                  className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
                />
                <input
                  type="range"
                  min="0"
                  max={SLIDER_MAX_CURRENCY}
                  value={clampSliderValue(currentPassiveIncome, SLIDER_MAX_CURRENCY)}
                  onChange={(e) => setCurrentPassiveIncome(parseFloat(e.target.value))}
                  aria-label="Current Passive Income slider"
                  className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer asset-slider"
                  style={{
                    background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(clampSliderValue(currentPassiveIncome, SLIDER_MAX_CURRENCY) / SLIDER_MAX_CURRENCY) * 100}%, #e5e7eb ${(clampSliderValue(currentPassiveIncome, SLIDER_MAX_CURRENCY) / SLIDER_MAX_CURRENCY) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div id="passive-income-helper" className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {formatCurrency(currentPassiveIncome)}
                </div>
              </div>

              {/* Field 3: Growth Rate */}
              <div>
                <label 
                  htmlFor="growth-rate-input"
                  className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide"
                >
                  Growth Rate % (P.A.)
                </label>
                <input
                  id="growth-rate-input"
                  ref={growthRateRef}
                  type="text"
                  value={formatPercentageInput(growthRate)}
                  onChange={(e) => handleGrowthRateChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'growthRate')}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setGrowthRate(0)
                    }
                  }}
                  placeholder="0%"
                  aria-label="Growth Rate percentage per annum"
                  aria-describedby="growth-rate-helper"
                  className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
                />
                <input
                  type="range"
                  min="0"
                  max={SLIDER_MAX_PERCENTAGE}
                  step="0.5"
                  value={clampSliderValue(growthRate, SLIDER_MAX_PERCENTAGE)}
                  onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
                  aria-label="Growth Rate slider"
                  className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div id="growth-rate-helper" className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {growthRate}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projection Section */}
        <div className="glass-card embossed rounded-xl p-6 premium-hover shadow-sm">
          <h2 className="luxury-subheading text-2xl mb-6 text-gray-800 dark:text-gray-200">Projection</h2>
          <ResponsiveContainer width="100%" height={500} className="min-h-[300px]">
            <ComposedChart data={projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorPassive" x1="0" y1="0" x2="0" y2="1">
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
                tick={{ fill: darkMode ? '#e2e8f0' : '#1e293b', fontWeight: 'bold', fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                stroke={darkMode ? '#94a3b8' : '#64748b'}
                strokeWidth={2}
                tick={{ fill: darkMode ? '#e2e8f0' : '#1e293b', fontWeight: 'bold', fontSize: '12px' }}
                tickFormatter={(value) => `$${value / 1000}k`}
                width={60}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  border: `3px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                }}
              />
              <Legend 
                wrapperStyle={{ fontWeight: 'bold', fontSize: '14px', paddingTop: '20px' }}
                iconType="square"
              />
              <Line
                type="monotone"
                dataKey="lifestyle"
                stroke="#dc2626"
                strokeWidth={5}
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
                fill="url(#colorPassive)"
                name="Passive Income"
                dot={false}
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#059669' }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Summary Card */}
          {hasValidData ? (
            <div className="mt-6 p-6 glass-card embossed rounded-xl border-l-4 border-teal-500 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="mb-4 relative z-10">
                {lifestyleCost === 0 ? (
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Set a lifestyle cost to calculate your freedom score.
                  </p>
                ) : independenceYear ? (
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    You've reached <span className="luxury-heading text-3xl text-teal-700 dark:text-teal-400">{freedomPercentage}%</span> of your lifestyle freedom target so far, and at this growth rate your passive income is projected to surpass your lifestyle cost by <span className="luxury-heading text-3xl text-teal-700 dark:text-teal-400">{independenceYear}</span>.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      You've reached <span className="luxury-heading text-3xl text-teal-700 dark:text-teal-400">{freedomPercentage}%</span> of your lifestyle freedom target so far.
                    </p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      At this growth rate, financial independence is projected to be beyond the current forecast period. Try increasing your growth rate or lifestyle cost assumptions to see different scenarios.
                    </p>
                  </div>
                )}
              </div>
              {lifestyleCost > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-teal-600 rounded-full shadow-lg" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Current Progress</span>
                    </div>
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{Math.min(100, freedomPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${Math.min(100, freedomPercentage)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 p-6 glass-card embossed rounded-xl border-l-4 border-teal-500 relative overflow-hidden shadow-sm">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Enter your lifestyle cost and current passive income to see your financial independence projection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
