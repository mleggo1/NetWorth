'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface Asset {
  name: string
  value: number
}

interface Liability {
  name: string
  value: number
}

const COLORS = {
  assets: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
  liabilities: ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#6366f1'],
}

// Enhanced vibrant colors for charts
const VIBRANT_COLORS = {
  assets: ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777'],
  liabilities: ['#dc2626', '#ea580c', '#ca8a04', '#0891b2', '#4f46e5'],
}

export default function NetWorthEngine() {
  const [darkMode, setDarkMode] = useState(false)

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
  const [assets, setAssets] = useState<Asset[]>([
    { name: 'Cash', value: 0 },
    { name: 'Stocks & ETFs', value: 0 },
    { name: 'Property', value: 0 },
    { name: 'Super', value: 0 },
    { name: 'Other', value: 0 },
  ])
  const [liabilities, setLiabilities] = useState<Liability[]>([
    { name: 'Mortgage', value: 0 },
    { name: 'Credit Card', value: 0 },
    { name: 'Personal Loans', value: 0 },
    { name: 'Margin Loan', value: 0 },
    { name: 'Other', value: 0 },
  ])
  const [growthRate, setGrowthRate] = useState(6)
  const [horizon, setHorizon] = useState(20)
  const [yearlyInvestment, setYearlyInvestment] = useState(0)

  // Refs for all input fields
  const assetInputRefs = useRef<(HTMLInputElement | null)[]>(Array(assets.length).fill(null))
  const liabilityInputRefs = useRef<(HTMLInputElement | null)[]>(Array(liabilities.length).fill(null))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'asset' | 'liability', index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      if (type === 'asset') {
        // If not the last asset, move to next asset
        if (index < assets.length - 1) {
          assetInputRefs.current[index + 1]?.focus()
        } else {
          // Last asset, move to first liability (Mortgage)
          liabilityInputRefs.current[0]?.focus()
        }
      } else {
        // Liability
        // If not the last liability, move to next liability
        if (index < liabilities.length - 1) {
          liabilityInputRefs.current[index + 1]?.focus()
        } else {
          // Last liability, wrap back to first asset (Cash)
          assetInputRefs.current[0]?.focus()
        }
      }
    }
  }

  const totalAssets = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets])
  const totalLiabilities = useMemo(() => liabilities.reduce((sum, l) => sum + l.value, 0), [liabilities])
  const netWorth = useMemo(() => totalAssets - totalLiabilities, [totalAssets, totalLiabilities])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const parseCurrency = (value: string): number => {
    // Remove all non-digit characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '')
    return parseFloat(cleaned) || 0
  }

  const formatCurrencyInput = (value: number): string => {
    if (value === 0) return ''
    return formatCurrency(value)
  }

  const handleAssetInputChange = (index: number, value: string) => {
    const numValue = parseCurrency(value)
    const updated = [...assets]
    updated[index].value = Math.max(0, numValue)
    setAssets(updated)
  }

  const handleLiabilityInputChange = (index: number, value: string) => {
    const numValue = parseCurrency(value)
    const updated = [...liabilities]
    updated[index].value = Math.max(0, numValue)
    setLiabilities(updated)
  }

  const handleReset = () => {
    // Reset all assets to zero
    setAssets(assets.map(asset => ({ ...asset, value: 0 })))
    // Reset all liabilities to zero
    setLiabilities(liabilities.map(liability => ({ ...liability, value: 0 })))
    // Reset other values
    setGrowthRate(6)
    setHorizon(20)
    setYearlyInvestment(0)
  }

  const assetChartData = useMemo(() => {
    return assets.filter(a => a.value > 0).map(a => ({ name: a.name, value: a.value }))
  }, [assets])

  const liabilityChartData = useMemo(() => {
    return liabilities.filter(l => l.value > 0).map(l => ({ name: l.name, value: l.value }))
  }, [liabilities])

  const projectionData = useMemo(() => {
    const data = []
    const rate = growthRate / 100
    
    for (let year = 0; year <= horizon; year++) {
      // Compound existing net worth
      const compoundedNetWorth = netWorth * Math.pow(1 + rate, year)
      
      // Future value of annuity (yearly investments)
      // Formula: investment * ((1 + r)^n - 1) / r
      let investmentValue = 0
      if (year > 0 && yearlyInvestment > 0 && rate > 0) {
        investmentValue = yearlyInvestment * (Math.pow(1 + rate, year) - 1) / rate
      } else if (year > 0 && yearlyInvestment > 0) {
        // If rate is 0, just multiply by years
        investmentValue = yearlyInvestment * year
      }
      
      const totalValue = compoundedNetWorth + investmentValue
      
      data.push({
        year: `${year}y`,
        value: totalValue,
      })
    }
    return data
  }, [netWorth, growthRate, horizon, yearlyInvestment])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Custom label renderer for assets chart
  const renderAssetLabel = (entry: any) => {
    return renderCustomLabel(entry, 'assets')
  }

  // Custom label renderer for liabilities chart
  const renderLiabilityLabel = (entry: any) => {
    return renderCustomLabel(entry, 'liabilities')
  }

  // Professional label renderer - labels centered on each slice
  // Connector line from dead center of slice, label 2mm above line end
  const renderCustomLabel = (entry: any, chartType: 'assets' | 'liabilities' = 'assets') => {
    const { cx, cy, name, percent, midAngle, outerRadius } = entry
    const percentage = (percent * 100).toFixed(0)
    const RADIAN = Math.PI / 180
    
    // Wrap specific names first
    let labelLines: string[] = []
    if (name === 'Stocks & ETFs') {
      labelLines = ['Stocks &', `ETFs ${percentage}%`]
    } else if (name === 'Personal Loans') {
      labelLines = ['Personal', `Loans ${percentage}%`]
    } else if (name === 'Margin Loan') {
      labelLines = ['Margin', `Loan ${percentage}%`]
    } else {
      labelLines = [`${name} ${percentage}%`]
    }
    
    // Text dimensions
    const fontSize = 11
    const lineHeight = 13
    const maxLineLength = Math.max(...labelLines.map(line => line.length))
    const textWidth = maxLineLength * 6.5
    const textHeight = labelLines.length * lineHeight
    
    // Connector line extends from center of slice outward
    // 2mm ≈ 8px at standard screen resolution
    const connectorLineLength = 65 // Length of connector line from donut edge
    const twoMmInPixels = 8 // 2mm separation above line end
    
    // Calculate connector line: starts at center of slice (midAngle), extends outward
    // Use midAngle to ensure line comes from dead center of slice
    // innerRadius is 40, outerRadius is 100, so center of ring is at 70
    const innerRadius = 40
    const ringCenter = (innerRadius + outerRadius) / 2 // Center of donut ring
    const lineStartX = cx + ringCenter * Math.cos(-midAngle * RADIAN)
    const lineStartY = cy + ringCenter * Math.sin(-midAngle * RADIAN)
    
    // Line extends outward along midAngle
    const lineEndDistance = outerRadius + connectorLineLength
    const lineEndX = cx + lineEndDistance * Math.cos(-midAngle * RADIAN)
    const lineEndY = cy + lineEndDistance * Math.sin(-midAngle * RADIAN)
    
    // Label positioned 2mm above the end of the connector line, centered on the slice
    // Text is always center-aligned relative to the slice center
    const labelX = lineEndX // X position centered on line end
    const labelY = lineEndY - twoMmInPixels // 2mm above line end
    
    // Chart boundaries for safety checks
    const margin = 70
    const chartWidth = cx * 2
    const chartHeight = 280
    const minX = margin
    const maxX = chartWidth - margin
    const minY = margin
    const maxY = chartHeight - margin - 60
    
    // Adjust label position if it would be cut off, but keep it centered on slice
    let finalLabelX = labelX
    let finalLabelY = labelY
    
    // Ensure text doesn't go outside chart boundaries (centered alignment)
    if (labelX - textWidth / 2 < minX) {
      finalLabelX = minX + textWidth / 2
    } else if (labelX + textWidth / 2 > maxX) {
      finalLabelX = maxX - textWidth / 2
    }
    
    // Ensure text doesn't go outside vertical boundaries
    const halfTextHeight = textHeight / 2
    if (labelY - halfTextHeight < minY) {
      finalLabelY = minY + halfTextHeight
    } else if (labelY + halfTextHeight > maxY) {
      finalLabelY = maxY - halfTextHeight
    }
    
    // Text styling
    const textColor = darkMode ? '#FFFFFF' : '#1F2937'
    const lineColor = darkMode ? '#000000' : '#000000' // Black line as requested
    const fontWeight = 500
    
    return (
      <g>
        {/* Draw connector line from center of slice outward */}
        <line
          x1={lineStartX}
          y1={lineStartY}
          x2={lineEndX}
          y2={lineEndY}
          stroke={lineColor}
          strokeWidth={1.5}
          fill="none"
        />
        {/* Label text - centered on slice, 2mm above line end */}
        <text
          x={finalLabelX}
          y={finalLabelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize={fontSize}
          fontWeight={fontWeight}
        >
          {labelLines.map((line, index) => (
            <tspan
              key={index}
              x={finalLabelX}
              y={finalLabelY + (index - (labelLines.length - 1) / 2) * lineHeight}
              textAnchor="middle"
            >
              {line}
            </tspan>
          ))}
        </text>
      </g>
    )
  }

  return (
    <div className={`space-y-4 relative ${darkMode ? 'dark' : ''}`}>
      {/* Decorative leather pattern sides in dark mode */}
      {darkMode && (
        <>
          <div className="fixed left-0 top-0 bottom-0 w-40 luxury-leather-pattern opacity-40 pointer-events-none z-0"></div>
          <div className="fixed right-0 top-0 bottom-0 w-40 luxury-leather-pattern opacity-40 pointer-events-none z-0"></div>
        </>
      )}
      
      {/* Net Worth, Assets & Liabilities - Compact Combined Card */}
      <div className="relative z-10 mb-6">
        <div className="glass-card embossed rounded-2xl p-6 md:p-8 premium-hover relative overflow-hidden border-2 border-teal-500/30 dark:border-teal-400/30 shadow-2xl shadow-teal-500/20 dark:shadow-teal-400/20">
          {/* Premium gradient overlays */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-teal-400/30 via-teal-500/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 via-teal-500/10 to-transparent rounded-full blur-3xl"></div>
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          <div className="relative z-10">
            {/* Net Worth - Top Section */}
            <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-2">NET WORTH</h3>
              {netWorth < 0 ? (
                <p className="luxury-heading text-5xl md:text-6xl lg:text-7xl font-black text-red-700 dark:text-red-400 drop-shadow-2xl leading-normal py-2 px-4">
                  {formatCurrency(netWorth)}
                </p>
              ) : (
                <p className="luxury-heading text-5xl md:text-6xl lg:text-7xl font-black text-teal-700 dark:text-teal-300 bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 dark:from-teal-300 dark:via-teal-400 dark:to-teal-300 bg-clip-text text-transparent drop-shadow-2xl leading-normal py-2 px-4">
                  {formatCurrency(netWorth)}
                </p>
              )}
            </div>
            
            {/* Assets & Liabilities - Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 relative z-10">ASSETS</h3>
                <p className="luxury-heading text-3xl md:text-4xl text-teal-700 dark:text-teal-400 font-black relative z-10">{formatCurrency(totalAssets)}</p>
              </div>
              <div className="relative overflow-hidden rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10 border-l-4 border-red-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-400/20 to-transparent rounded-full blur-2xl"></div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 relative z-10">LIABILITIES</h3>
                <p className="luxury-heading text-3xl md:text-4xl text-red-700 dark:text-red-400 font-black relative z-10">{formatCurrency(totalLiabilities)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3 mt-4 relative z-10">
        <h2 className="luxury-subheading text-2xl text-gray-800 dark:text-gray-200">Assets & Liabilities Overview</h2>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 premium-hover glass-card text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-800/90 border border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400"
          title="Reset all values to zero"
        >
          Reset All
        </button>
      </div>

      {/* Assets and Liabilities Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Assets Panel */}
        <div className="glass-card embossed rounded-xl p-6 premium-hover shadow-sm">
          <h3 className="luxury-subheading text-2xl mb-6 text-gray-800 dark:text-gray-200">Assets — High Level</h3>
          <div className="space-y-4">
            {assets.map((asset, index) => {
              // Cash slider has max of 1,000,000, Property has 10,000,000, others have 5,000,000
              const isCash = asset.name === 'Cash'
              const isProperty = asset.name === 'Property'
              const sliderMax = isCash ? 1000000 : isProperty ? 10000000 : 5000000
              const sliderValue = Math.min(asset.value, sliderMax)
              const sliderPercentage = (sliderValue / sliderMax) * 100
              
              return (
                <div key={index}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    {asset.name}
                  </label>
                  <input
                    ref={(el) => { assetInputRefs.current[index] = el }}
                    type="text"
                    value={formatCurrencyInput(asset.value)}
                    onChange={(e) => handleAssetInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'asset', index)}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        const updated = [...assets]
                        updated[index].value = 0
                        setAssets(updated)
                      }
                    }}
                    placeholder="$0"
                    className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
                  />
                  <input
                    type="range"
                    min="0"
                    max={sliderMax}
                    value={sliderValue}
                    onChange={(e) => {
                      const updated = [...assets]
                      updated[index].value = parseFloat(e.target.value)
                      setAssets(updated)
                    }}
                    className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer asset-slider"
                    style={{
                      background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${sliderPercentage}%, #e5e7eb ${sliderPercentage}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Liabilities Panel */}
        <div className="glass-card embossed rounded-xl p-6 premium-hover shadow-sm">
          <h3 className="luxury-subheading text-2xl mb-6 text-gray-800 dark:text-gray-200">Liabilities — High Level</h3>
          <div className="space-y-4">
            {liabilities.map((liability, index) => (
              <div key={index}>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  {liability.name}
                </label>
                <input
                  ref={(el) => { liabilityInputRefs.current[index] = el }}
                  type="text"
                  value={formatCurrencyInput(liability.value)}
                  onChange={(e) => handleLiabilityInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'liability', index)}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      const updated = [...liabilities]
                      updated[index].value = 0
                      setLiabilities(updated)
                    }
                  }}
                  placeholder="$0"
                  className="w-full px-4 py-2.5 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-3 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner"
                />
                <input
                  type="range"
                  min="0"
                  max={5000000}
                  value={Math.min(liability.value, 5000000)}
                  onChange={(e) => {
                    const updated = [...liabilities]
                    updated[index].value = parseFloat(e.target.value)
                    setLiabilities(updated)
                  }}
                  className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer liability-slider"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(Math.min(liability.value, 5000000) / 5000000) * 100}%, #e5e7eb ${(Math.min(liability.value, 5000000) / 5000000) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 mt-4">
        {/* Assets Allocation */}
        <div className="glass-card embossed rounded-xl p-5 premium-hover shadow-sm">
          <h3 className="luxury-subheading text-xl mb-4 text-gray-800 dark:text-gray-200">Assets Allocation</h3>
          {assetChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart margin={{ top: 70, right: 70, bottom: 70, left: 70 }}>
                  <Pie
                    data={assetChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2.5}
                    stroke="#fff"
                  >
                    {assetChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={VIBRANT_COLORS.assets[index % VIBRANT_COLORS.assets.length]}
                        stroke="#fff"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: darkMode ? '#f8fafc' : '#fff',
                      color: darkMode ? '#1e293b' : '#1f2937',
                      border: `2px solid ${darkMode ? '#cbd5e1' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                    itemStyle={{
                      color: darkMode ? '#1e293b' : '#1f2937',
                    }}
                    labelStyle={{
                      color: darkMode ? '#1e293b' : '#1f2937',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                {assetChartData.map((item, index) => {
                  const totalAssets = assetChartData.reduce((sum, a) => sum + a.value, 0)
                  const percentage = totalAssets > 0 ? ((item.value / totalAssets) * 100).toFixed(0) : '0'
                  return (
                    <div key={index} className="flex items-center gap-3 glass-card px-4 py-2 rounded-lg premium-hover">
                      <div
                        className="w-4 h-4 rounded-full shadow-md"
                        style={{ backgroundColor: VIBRANT_COLORS.assets[index % VIBRANT_COLORS.assets.length] }}
                      />
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100 drop-shadow-sm">{item.name}</span>
                      <span className="text-base font-extrabold text-teal-700 dark:text-teal-300 drop-shadow-sm">{formatCurrency(item.value)}</span>
                      <span className="text-base font-semibold text-gray-600 dark:text-gray-400 drop-shadow-sm">({percentage}%)</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-400">
              No assets data
            </div>
          )}
        </div>

        {/* Liability Allocation */}
        <div className="glass-card embossed rounded-xl p-5 premium-hover shadow-sm">
          <h3 className="luxury-subheading text-xl mb-4 text-gray-800 dark:text-gray-200">Liability Allocation</h3>
          {liabilityChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart margin={{ top: 70, right: 70, bottom: 70, left: 70 }}>
                  <Pie
                    data={liabilityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2.5}
                    stroke="#fff"
                  >
                    {liabilityChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={VIBRANT_COLORS.liabilities[index % VIBRANT_COLORS.liabilities.length]}
                        stroke="#fff"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: darkMode ? '#f8fafc' : '#fff',
                      color: darkMode ? '#1e293b' : '#1f2937',
                      border: `2px solid ${darkMode ? '#cbd5e1' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                    itemStyle={{
                      color: darkMode ? '#1e293b' : '#1f2937',
                    }}
                    labelStyle={{
                      color: darkMode ? '#1e293b' : '#1f2937',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                {liabilityChartData.map((item, index) => {
                  const totalLiabilities = liabilityChartData.reduce((sum, l) => sum + l.value, 0)
                  const percentage = totalLiabilities > 0 ? ((item.value / totalLiabilities) * 100).toFixed(0) : '0'
                  return (
                    <div key={index} className="flex items-center gap-3 glass-card px-4 py-2 rounded-lg premium-hover">
                      <div
                        className="w-4 h-4 rounded-full shadow-md"
                        style={{ backgroundColor: VIBRANT_COLORS.liabilities[index % VIBRANT_COLORS.liabilities.length] }}
                      />
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100 drop-shadow-sm">{item.name}</span>
                      <span className="text-base font-extrabold text-red-700 dark:text-red-300 drop-shadow-sm">{formatCurrency(item.value)}</span>
                      <span className="text-base font-semibold text-gray-600 dark:text-gray-400 drop-shadow-sm">({percentage}%)</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-400">
              No liabilities data
            </div>
          )}
        </div>

        {/* Net Worth Projection - Enhanced with Yearly Investment */}
        <div className="glass-card embossed rounded-xl p-5 premium-hover shadow-sm">
          <h3 className="luxury-subheading text-xl mb-4 text-gray-800 dark:text-gray-200">Net Worth Projection</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
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
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
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
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0d9488"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Growth Rate (% p.a.): <span className="text-teal-600 dark:text-teal-400 text-lg">{growthRate}%</span>
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
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                Yearly Investment
              </label>
              <input
                type="text"
                value={formatCurrencyInput(yearlyInvestment)}
                onChange={(e) => setYearlyInvestment(parseCurrency(e.target.value))}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    setYearlyInvestment(0)
                  }
                }}
                placeholder="$0"
                className="w-full px-4 py-2 text-base font-semibold border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-teal-500/50 focus:border-teal-500 transition-all mb-3"
              />
              <input
                type="range"
                min="0"
                max="500000"
                step="5000"
                value={yearlyInvestment}
                onChange={(e) => setYearlyInvestment(parseFloat(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="mt-2 text-xs font-semibold text-teal-600 dark:text-teal-400">
                Shows the power of compounding with regular investments
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Horizon (years): <span className="text-teal-600 dark:text-teal-400 text-lg">{horizon}</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={horizon}
                onChange={(e) => setHorizon(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
