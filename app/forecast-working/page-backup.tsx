'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { 
  Package, 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Sample data with more realistic values
const sampleSKUs = [
  { 
    sku: '6LD', 
    displayName: '6 LD', 
    category: 'Electronics',
    status: 'healthy', 
    totalForecast: 5200, 
    totalActual: 4850,
    accuracy: 93.3,
    currentStock: 1200,
    weeksCover: 5.2
  },
  { 
    sku: '6ST', 
    displayName: '6 ST', 
    category: 'Electronics',
    status: 'low-stock', 
    totalForecast: 7800, 
    totalActual: 7200,
    accuracy: 92.3,
    currentStock: 450,
    weeksCover: 2.1
  },
  { 
    sku: '3LD-CS008', 
    displayName: '3 LD - CS 008', 
    category: 'Accessories',
    status: 'healthy', 
    totalForecast: 3200, 
    totalActual: 0,
    accuracy: null,
    currentStock: 890,
    weeksCover: 4.8
  },
  { 
    sku: '3ST-CS010', 
    displayName: '3 ST - CS 010', 
    category: 'Accessories',
    status: 'overstocked', 
    totalForecast: 2100, 
    totalActual: 1950,
    accuracy: 92.9,
    currentStock: 3200,
    weeksCover: 15.2
  },
  { 
    sku: 'CDS-001', 
    displayName: 'CDS-001 - 12 x 5', 
    category: 'Storage',
    status: 'out-of-stock', 
    totalForecast: 1500, 
    totalActual: 1480,
    accuracy: 98.7,
    currentStock: 0,
    weeksCover: 0
  },
  { 
    sku: 'CDS-002', 
    displayName: 'CDS-002 - 12 x 9', 
    category: 'Storage',
    status: 'healthy', 
    totalForecast: 2400, 
    totalActual: 2350,
    accuracy: 97.9,
    currentStock: 680,
    weeksCover: 3.9
  }
]

// Generate weekly data for a SKU - using stable data to avoid hydration errors
const generateWeeklyData = (sku: any) => {
  const weeks = []
  let currentStock = sku.currentStock || 1000
  
  // Base forecast patterns for each SKU
  const basePatterns = {
    '6LD': { base: 180, variation: 20 },
    '6ST': { base: 220, variation: 25 },
    '3LD-CS008': { base: 150, variation: 15 },
    '3ST-CS010': { base: 120, variation: 15 },
    'CDS-001': { base: 100, variation: 15 },
    'CDS-002': { base: 140, variation: 15 }
  }
  
  const pattern = basePatterns[sku.sku] || { base: 150, variation: 20 }
  
  for (let i = 1; i <= 52; i++) {
    // Create seasonal variation
    const seasonalFactor = 1 + 0.2 * Math.sin((i / 52) * 2 * Math.PI)
    const forecast = Math.round(pattern.base * seasonalFactor + (i % 3 - 1) * pattern.variation)
    
    const hasActual = i <= 8 // First 8 weeks have actual data
    const actual = hasActual ? forecast + (i % 2 === 0 ? 5 : -5) : null
    const final = actual || forecast
    const stockOut = final * 7
    const stockIn = i % 4 === 0 ? 1000 : 0 // Stock in every 4 weeks
    const closingStock = Math.max(0, currentStock - stockOut + stockIn)
    const weeksCover = final > 0 ? (closingStock / (final * 7)).toFixed(1) : '0'
    
    weeks.push({
      week: i,
      openingStock: currentStock,
      forecast,
      actual,
      variance: actual ? forecast - actual : null,
      variancePercent: actual ? ((forecast - actual) / actual * 100).toFixed(1) : null,
      stockIn,
      closingStock,
      weeksCover,
      stockOut
    })
    
    currentStock = closingStock
  }
  
  return weeks
}

export default function WorkingForecastPage() {
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>(['6LD'])
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSKUs, setExpandedSKUs] = useState<string[]>([])
  
  const filteredSKUs = useMemo(() => {
    if (!searchTerm) return sampleSKUs
    
    const term = searchTerm.toLowerCase()
    return sampleSKUs.filter(sku => 
      sku.displayName.toLowerCase().includes(term) ||
      sku.sku.toLowerCase().includes(term) ||
      sku.category.toLowerCase().includes(term)
    )
  }, [searchTerm])

  const toggleSKU = (sku: string) => {
    setSelectedSKUs(prev => 
      prev.includes(sku) 
        ? prev.filter(s => s !== sku)
        : [...prev, sku]
    )
  }

  const toggleExpanded = (sku: string) => {
    setExpandedSKUs(prev => 
      prev.includes(sku) 
        ? prev.filter(s => s !== sku)
        : [...prev, sku]
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'low-stock': return <AlertTriangle className="h-3 w-3 text-yellow-500" />
      case 'out-of-stock': return <XCircle className="h-3 w-3 text-red-500" />
      case 'overstocked': return <TrendingUp className="h-3 w-3 text-blue-500" />
      default: return null
    }
  }

  const getStatusBadge = (status: string, weeksCover?: number) => {
    const configs = {
      'healthy': { label: 'Healthy', className: 'gradient-success text-white' },
      'low-stock': { label: 'Low Stock', className: 'gradient-warning text-white' },
      'out-of-stock': { label: 'Out of Stock', className: 'gradient-danger text-white' },
      'overstocked': { label: 'Overstocked', className: 'gradient-primary text-white' }
    }
    
    const config = configs[status] || configs['healthy']
    
    return (
      <Badge className={cn('text-xs font-semibold border-0 shadow-sm px-3 py-1', config.className)}>
        {getStatusIcon(status)}
        <span className="ml-1.5">{config.label}</span>
        {weeksCover !== undefined && (
          <span className="ml-1.5 opacity-90">({weeksCover}w)</span>
        )}
      </Badge>
    )
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const handleEditSKU = (sku: string) => {
    console.log('Edit SKU:', sku)
    // TODO: Implement edit functionality
    alert(`Edit functionality for ${sku} - Coming soon!`)
  }

  const handleDeleteSKU = (sku: string) => {
    console.log('Delete SKU:', sku)
    // TODO: Implement delete functionality
    if (confirm(`Are you sure you want to delete ${sku}?`)) {
      alert(`Delete functionality for ${sku} - Coming soon!`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
      {/* Modern gradient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
      
      {/* Header */}
      <header className="glass sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow transition-smooth hover:scale-105">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                Sales Forecast
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Real-time inventory analytics</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-88px)] relative">
        {/* Sidebar */}
        <div className="w-80 glass border-r border-white/10 dark:border-gray-800/30 flex flex-col shadow-xl">
          <div className="p-4 border-b border-white/10 dark:border-gray-800/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="font-semibold text-lg">SKUs</h2>
                <Badge className="gradient-primary text-white border-0 shadow-sm">{filteredSKUs.length}</Badge>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative mb-3 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
              <Input
                placeholder="Search SKUs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-700/50 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200"
              />
            </div>
            
            <Button 
              className="w-full gradient-primary text-white border-0 shadow-glow hover:shadow-glow-lg transition-smooth" 
              size="sm"
              onClick={() => alert('Add SKU functionality - Coming soon!')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add SKU
            </Button>
          </div>

          {/* Bulk Actions */}
          {filteredSKUs.length > 0 && (
            <div className="px-4 py-3 border-b border-white/10 dark:border-gray-800/30 bg-gradient-to-r from-gray-50/50 to-blue-50/30 dark:from-gray-900/30 dark:to-blue-900/20">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filteredSKUs.length > 0 && selectedSKUs.length === filteredSKUs.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSKUs(filteredSKUs.map(s => s.sku))
                      } else {
                        setSelectedSKUs([])
                      }
                    }}
                    className="transition-all duration-200"
                  />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {selectedSKUs.length > 0 ? `${selectedSKUs.length} selected` : 'Select all'}
                  </span>
                </div>
                {selectedSKUs.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSKUs([])}
                    className="h-7 px-3 text-xs hover:bg-white/50 dark:hover:bg-gray-800/50 transition-smooth"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* SKU List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredSKUs.map((sku) => (
              <Card
                key={sku.sku}
                className={cn(
                  "cursor-pointer transition-smooth hover-lift border-0 shadow-sm",
                  selectedSKUs.includes(sku.sku) 
                    ? "ring-2 ring-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-glow" 
                    : "hover:shadow-lg bg-white/80 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900/70"
                )}
                onClick={() => toggleSKU(sku.sku)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedSKUs.includes(sku.sku)}
                        onCheckedChange={() => toggleSKU(sku.sku)}
                        onClick={(e) => e.stopPropagation()}
                        className="transition-all duration-200"
                      />
                      <div>
                        <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                          {sku.displayName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sku.category}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-gray-200/50 dark:border-gray-700/50">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditSKU(sku.sku)
                          }}
                          className="cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit SKU
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSKU(sku.sku)
                          }}
                          className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete SKU
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {selectedSKUs.length > 0 ? (
            <Tabs defaultValue="detailed" className="h-full flex flex-col">
              <div className="px-6 pt-6 pb-4 glass-subtle border-b border-white/10 dark:border-gray-800/30">
                <TabsList className="bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50">
                  <TabsTrigger value="detailed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">Detailed View</TabsTrigger>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">Analytics View</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="detailed" className="flex-1 overflow-auto p-6 mt-0">
                <div className="space-y-6">
                  {selectedSKUs.map(skuId => {
                const sku = sampleSKUs.find(s => s.sku === skuId)
                if (!sku) return null
                
                const weeklyData = generateWeeklyData(sku)
                const isExpanded = expandedSKUs.includes(skuId)
                
                return (
                  <Card key={skuId} className="glass border-0 shadow-lg hover:shadow-xl transition-smooth">
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(skuId)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all duration-200 rounded-t-lg group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-blue-600 transition-transform duration-300" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-blue-600 transition-transform duration-300" />
                              )}
                            </div>
                              <div>
                                <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{sku.displayName}</CardTitle>
                                <CardDescription className="mt-1">
                                  Weekly sales forecast with inventory flow analysis
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {getStatusBadge(sku.status, sku.weeksCover)}
                              <div className="text-right">
                                <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                                  {formatNumber(sku.totalForecast)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Stock: {formatNumber(sku.currentStock)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-b-lg">
                            <Table className="relative">
                              <TableHeader className="sticky top-0 glass z-10">
                                <TableRow className="border-b-2 border-gray-200/50 dark:border-gray-700/50">
                                  <TableHead className="sticky left-0 glass z-20 border-r border-white/10 dark:border-gray-700/30 font-bold text-gray-900 dark:text-gray-100">
                                    Week
                                  </TableHead>
                                  <TableHead className="text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300">
                                    Opening Stock
                                  </TableHead>
                                  <TableHead className="text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-blue-700 dark:text-blue-400">
                                    Forecast Sales
                                  </TableHead>
                                  <TableHead className="text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-green-700 dark:text-green-400">
                                    Actual Sales
                                  </TableHead>
                                  <TableHead className="text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-orange-700 dark:text-orange-400">
                                    Variance
                                  </TableHead>
                                  <TableHead className="text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-purple-700 dark:text-purple-400">
                                    Stock In
                                  </TableHead>
                                  <TableHead className="text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300">
                                    Closing Stock
                                  </TableHead>
                                  <TableHead className="text-center font-semibold text-indigo-700 dark:text-indigo-400">
                                    Weeks Cover
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {weeklyData.map((week) => (
                                  <TableRow key={week.week} className="hover:bg-white/30 dark:hover:bg-gray-900/30 transition-all duration-200">
                                    <TableCell className="sticky left-0 glass-subtle border-r border-white/10 dark:border-gray-700/30 font-semibold text-center">
                                      {week.week}
                                    </TableCell>
                                    <TableCell className="text-center border-r border-gray-200 dark:border-gray-700">
                                      {formatNumber(week.openingStock)}
                                    </TableCell>
                                    <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-medium">
                                      {formatNumber(week.forecast)}
                                    </TableCell>
                                    <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-400 font-medium">
                                      {week.actual ? formatNumber(week.actual) : '-'}
                                    </TableCell>
                                    <TableCell className={cn(
                                      "text-center border-r border-gray-200 dark:border-gray-700 font-medium",
                                      week.variance && Math.abs(week.variance) > 20 ? "text-red-600" : "text-gray-600"
                                    )}>
                                      {week.variance !== null ? (
                                        <div>
                                          <div>{week.variance > 0 ? '+' : ''}{week.variance}</div>
                                          <div className="text-xs opacity-75">({week.variancePercent}%)</div>
                                        </div>
                                      ) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 text-purple-600 dark:text-purple-400 font-medium">
                                      {week.stockIn > 0 ? formatNumber(week.stockIn) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 font-medium">
                                      {formatNumber(week.closingStock)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge 
                                        variant={
                                          parseFloat(week.weeksCover) <= 2 ? "destructive" : 
                                          parseFloat(week.weeksCover) >= 12 ? "secondary" : 
                                          "default"
                                        }
                                        className="text-xs"
                                      >
                                        {week.weeksCover}w
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                
                                {/* Summary Row */}
                                <TableRow className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 font-semibold">
                                  <TableCell className="sticky left-0 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 text-center">
                                    Total
                                  </TableCell>
                                  <TableCell className="text-center border-r border-gray-200 dark:border-gray-700">
                                    -
                                  </TableCell>
                                  <TableCell className="text-center text-blue-700 dark:text-blue-400 border-r border-gray-200 dark:border-gray-700">
                                    {formatNumber(weeklyData.reduce((sum, w) => sum + w.forecast, 0))}
                                  </TableCell>
                                  <TableCell className="text-center text-green-700 dark:text-green-400 border-r border-gray-200 dark:border-gray-700">
                                    {formatNumber(weeklyData.reduce((sum, w) => sum + (w.actual || 0), 0)) || '-'}
                                  </TableCell>
                                  <TableCell className="text-center border-r border-gray-200 dark:border-gray-700">
                                    -
                                  </TableCell>
                                  <TableCell className="text-center text-purple-700 dark:text-purple-400 border-r border-gray-200 dark:border-gray-700">
                                    {formatNumber(weeklyData.reduce((sum, w) => sum + w.stockIn, 0))}
                                  </TableCell>
                                  <TableCell className="text-center border-r border-gray-200 dark:border-gray-700">
                                    -
                                  </TableCell>
                                  <TableCell className="text-center">
                                    -
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )
              })}
            </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="flex-1 overflow-auto p-6 mt-0">
                <div className="space-y-6">
                  {selectedSKUs.map(skuId => {
                    const sku = sampleSKUs.find(s => s.sku === skuId)
                    if (!sku) return null
                    
                    const weeklyData = generateWeeklyData(sku)
                    const chartData = weeklyData.slice(0, 12).map(week => ({
                      week: `Week ${week.week}`,
                      forecast: week.forecast,
                      actual: week.actual || 0,
                    }))
                    
                    return (
                      <Card key={skuId} className="glass border-0 shadow-lg hover:shadow-xl transition-smooth">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{sku.displayName}</CardTitle>
                              <CardDescription className="mt-1">
                                Forecast vs Actual Sales Analysis
                              </CardDescription>
                            </div>
                            {getStatusBadge(sku.status, sku.weeksCover)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis 
                                  dataKey="week" 
                                  className="text-xs"
                                  tick={{ fill: 'currentColor' }}
                                />
                                <YAxis 
                                  className="text-xs"
                                  tick={{ fill: 'currentColor' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px'
                                  }}
                                />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="forecast" 
                                  stroke="#3b82f6" 
                                  strokeWidth={2}
                                  dot={{ fill: '#3b82f6', r: 4 }}
                                  name="Forecast"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="actual" 
                                  stroke="#10b981" 
                                  strokeWidth={2}
                                  dot={{ fill: '#10b981', r: 4 }}
                                  name="Actual"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="mt-6 grid grid-cols-4 gap-4">
                            <div className="text-center p-4 glass-subtle rounded-xl hover-lift">
                              <div className="text-3xl font-bold gradient-primary bg-clip-text text-transparent number-transition">
                                {formatNumber(sku.totalForecast)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Total Forecast</div>
                            </div>
                            <div className="text-center p-4 glass-subtle rounded-xl hover-lift">
                              <div className="text-3xl font-bold gradient-success bg-clip-text text-transparent number-transition">
                                {formatNumber(sku.totalActual)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Total Actual</div>
                            </div>
                            <div className="text-center p-4 glass-subtle rounded-xl hover-lift">
                              <div className="text-3xl font-bold gradient-warning bg-clip-text text-transparent number-transition">
                                {sku.accuracy ? `${sku.accuracy}%` : 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Accuracy</div>
                            </div>
                            <div className="text-center p-4 glass-subtle rounded-xl hover-lift">
                              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent number-transition">
                                {formatNumber(sku.currentStock)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Current Stock</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md glass rounded-2xl p-12 shadow-xl">
                <div className="h-20 w-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  <Package className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-3">
                  No SKUs Selected
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Select one or more SKUs from the sidebar to view their forecast details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}