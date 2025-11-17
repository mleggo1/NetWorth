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
    { name: 'Cash', value: 1421000 },
    { name: 'Stocks & ETFs', value: 1091000 },
    { name: 'Property', value: 0 },
    { name: 'Super', value: 0 },
    { name: 'Other', value: 0 },
  ])
  const [liabilities, setLiabilities] = useState<Liability[]>([
    { name: 'Mortgage', value: 607000 },
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

  // Custom label renderer that wraps text with enhanced visibility
  const renderCustomLabel = (entry: any, chartType: 'assets' | 'liabilities' = 'assets') => {
    const { cx, cy, name, percent } = entry
    const percentage = (percent * 100).toFixed(0)
    
    // Calculate position - move labels further away from chart
    const { midAngle, outerRadius } = entry
    const RADIAN = Math.PI / 180
    
    // Estimate container bounds (ResponsiveContainer height is 280)
    // Use chart center and reasonable bounds
    const estimatedWidth = cx * 2 // Chart is centered, so width is roughly 2x center X
    const estimatedHeight = 280
    const legendSpace = 70 // Space reserved for legend below
    
    // Calculate approximate text width (rough estimate: 8-10px per character)
    const estimatedTextWidth = name.length * 9
    const textPadding = Math.max(30, estimatedTextWidth / 2 + 10) // Extra padding for longer text
    
    // Check if label has multiple words (contains space or &)
    const hasMultipleWords = name.includes(' ') || name.includes('&')
    
    // Adjust label distance - move multi-word labels further out to keep them outside the donut
    const baseDistance = outerRadius + 60
    const adjustedDistance = hasMultipleWords ? baseDistance + 30 : baseDistance
    let labelX = cx + adjustedDistance * Math.cos(-midAngle * RADIAN)
    let labelY = cy + adjustedDistance * Math.sin(-midAngle * RADIAN)
    
    // Constrain labels to visible area, avoiding legend and accounting for text width
    const minX = textPadding
    const maxX = estimatedWidth - textPadding
    const minY = 25
    const maxY = estimatedHeight - 25 - legendSpace
    
    // Determine text anchor based on position
    const textAnchor = labelX > cx ? 'start' : 'end'
    
    // Adjust X position to account for text width to prevent cutoff
    if (textAnchor === 'end') {
      // Text extends left from labelX, so ensure we have enough space on the left
      labelX = Math.max(minX + estimatedTextWidth / 2, labelX)
    } else {
      // Text extends right from labelX, so ensure we have enough space on the right
      labelX = Math.min(maxX - estimatedTextWidth / 2, labelX)
    }
    
    // Clamp Y position to bounds
    labelY = Math.max(minY, Math.min(maxY, labelY))
    
    // Split long names into multiple lines - wrap only at word boundaries, never break words
    const wrapText = (text: string, maxLength: number = 8) => {
      if (text.length <= maxLength) return [text]
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = ''
      
      words.forEach((word, index) => {
        // Never break a word - keep whole words together
        // If adding this word would exceed maxLength, start a new line
        const wouldExceed = currentLine.length + (currentLine ? 1 : 0) + word.length > maxLength
        
        if (wouldExceed && currentLine) {
          // Current line is full, push it and start new line with this word
          lines.push(currentLine)
          currentLine = word
        } else {
          // Add word to current line
          currentLine += (currentLine ? ' ' : '') + word
        }
        
        // Push the last line if we're at the end
        if (index === words.length - 1 && currentLine) {
          lines.push(currentLine)
        }
      })
      
      return lines.length > 0 ? lines : [text]
    }
    
    // More aggressive wrapping for labels near edges or with long names
    const isNearEdge = labelX < minX + 30 || labelX > maxX - 30 || labelY < minY + 30 || labelY > maxY - 30
    const maxLineLength = isNearEdge ? 7 : (name.length > 15 ? 8 : 10)
    const nameLines = wrapText(name, maxLineLength)
    
    // Simple text colors - white in dark mode, dark in light mode, no shading
    const textColor = darkMode ? '#FFFFFF' : '#000000'
    
    // Consistent font size for all text - clean and easy to read
    const fontSize = 14
    
    return (
      <g>
        <text
          x={labelX}
          y={labelY}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fill={textColor}
          fontSize={fontSize}
          fontWeight="400"
        >
          {nameLines.map((line: string, i: number) => (
            <tspan 
              key={i} 
              x={labelX} 
              y={labelY + (i - (nameLines.length - 1) / 2) * (fontSize + 2)} 
              textAnchor={textAnchor}
              fill={textColor}
              fontSize={fontSize}
              fontWeight="400"
            >
              {line}
            </tspan>
          ))}
          <tspan 
            x={labelX} 
            y={labelY + (nameLines.length * (fontSize + 2) / 2) + 10} 
            fontSize={fontSize} 
            fill={textColor}
            fontWeight="400"
            textAnchor={textAnchor}
          >
            {percentage}%
          </tspan>
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
      
      {/* Summary Cards - Luxury Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <div className="glass-card embossed rounded-xl p-5 premium-hover border-l-4 border-blue-500 shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">ASSETS</h3>
          <p className="luxury-heading text-4xl text-teal-700 dark:text-teal-400">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="glass-card embossed rounded-xl p-5 premium-hover border-l-4 border-red-500 shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">LIABILITIES</h3>
          <p className="luxury-heading text-4xl text-teal-700 dark:text-teal-400">{formatCurrency(totalLiabilities)}</p>
        </div>
        <div className="glass-card embossed rounded-xl p-5 premium-hover border-l-4 border-teal-500 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-2xl"></div>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 relative z-10">NET WORTH</h3>
          <p className="luxury-heading text-4xl text-teal-700 dark:text-teal-400 relative z-10">{formatCurrency(netWorth)}</p>
        </div>
      </div>

      <h2 className="luxury-subheading text-2xl text-gray-800 dark:text-gray-200 mb-3 mt-4 relative z-10">Assets & Liabilities Overview</h2>

      {/* Assets and Liabilities Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Assets Panel */}
        <div className="glass-card embossed rounded-xl p-6 premium-hover shadow-sm">
          <h3 className="luxury-subheading text-2xl mb-6 text-gray-800 dark:text-gray-200">Assets — High Level</h3>
          <div className="space-y-4">
            {assets.map((asset, index) => (
              <div key={index}>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  {asset.name}
                </label>
                <input
                  ref={(el) => (assetInputRefs.current[index] = el)}
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
                  max={Math.max(5000000, asset.value * 2)}
                  value={asset.value}
                  onChange={(e) => {
                    const updated = [...assets]
                    updated[index].value = parseFloat(e.target.value)
                    setAssets(updated)
                  }}
                  className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer asset-slider"
                  style={{
                    background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(asset.value / Math.max(5000000, asset.value * 2)) * 100}%, #e5e7eb ${(asset.value / Math.max(5000000, asset.value * 2)) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            ))}
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
                  ref={(el) => (liabilityInputRefs.current[index] = el)}
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
                  max={Math.max(2000000, liability.value * 2)}
                  value={liability.value}
                  onChange={(e) => {
                    const updated = [...liabilities]
                    updated[index].value = parseFloat(e.target.value)
                    setLiabilities(updated)
                  }}
                  className="w-full mt-3 h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-lg appearance-none cursor-pointer liability-slider"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(liability.value / Math.max(2000000, liability.value * 2)) * 100}%, #e5e7eb ${(liability.value / Math.max(2000000, liability.value * 2)) * 100}%, #e5e7eb 100%)`
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
                <PieChart>
                  <defs>
                    <filter id="textShadow-light-assets" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                      <feOffset dx="1" dy="1" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="textShadow-dark-assets" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                      <feOffset dx="1" dy="1" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie
                    data={assetChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={{ stroke: darkMode ? '#cbd5e1' : '#4b5563', strokeWidth: darkMode ? 2.5 : 2 }}
                    label={renderAssetLabel}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={3}
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
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                {assetChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 glass-card px-4 py-2 rounded-lg premium-hover">
                    <div
                      className="w-4 h-4 rounded-full shadow-md"
                      style={{ backgroundColor: VIBRANT_COLORS.assets[index % VIBRANT_COLORS.assets.length] }}
                    />
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100 drop-shadow-sm">{item.name}</span>
                    <span className="text-base font-extrabold text-teal-700 dark:text-teal-300 drop-shadow-sm">{formatCurrency(item.value)}</span>
                  </div>
                ))}
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
                <PieChart>
                  <defs>
                    <filter id="textShadow-light-liabilities" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                      <feOffset dx="1" dy="1" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="textShadow-dark-liabilities" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                      <feOffset dx="1" dy="1" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie
                    data={liabilityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={{ stroke: darkMode ? '#cbd5e1' : '#4b5563', strokeWidth: darkMode ? 2.5 : 2 }}
                    label={renderLiabilityLabel}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={3}
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
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                {liabilityChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 glass-card px-4 py-2 rounded-lg premium-hover">
                    <div
                      className="w-4 h-4 rounded-full shadow-md"
                      style={{ backgroundColor: VIBRANT_COLORS.liabilities[index % VIBRANT_COLORS.liabilities.length] }}
                    />
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100 drop-shadow-sm">{item.name}</span>
                    <span className="text-base font-extrabold text-red-700 dark:text-red-300 drop-shadow-sm">{formatCurrency(item.value)}</span>
                  </div>
                ))}
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
