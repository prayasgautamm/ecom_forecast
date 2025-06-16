'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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

// Generate weekly data for a SKU
const generateWeeklyData = (sku: any) => {
  const weeks = []
  let currentStock = sku.currentStock || 1000
  
  for (let i = 1; i <= 12; i++) {
    const forecast = Math.floor(Math.random() * 100) + 150
    const hasActual = i <= 3
    const actual = hasActual ? forecast + Math.floor(Math.random() * 20) - 10 : null
    const final = actual || forecast
    const stockOut = final * 7
    const stockIn = i % 3 === 0 ? Math.floor(Math.random() * 500) + 500 : 0
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
  const [expandedSKUs, setExpandedSKUs] = useState<string[]>(['6LD'])
  
  const filteredSKUs = sampleSKUs.filter(sku => 
    sku.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      'healthy': { label: 'Healthy', className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
      'low-stock': { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
      'out-of-stock': { label: 'Out of Stock', className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
      'overstocked': { label: 'Overstocked', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' }
    }
    
    const config = configs[status] || configs['healthy']
    
    return (
      <Badge className={cn('text-xs font-medium border-0', config.className)}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.label}</span>
        {weeksCover !== undefined && (
          <span className="ml-1 opacity-75">({weeksCover}w)</span>
        )}
      </Badge>
    )
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Sales Forecast
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and analyze your inventory forecasts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedSKUs.length} of {filteredSKUs.length} SKUs selected
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="font-semibold text-lg">SKUs</h2>
                <Badge variant="secondary" className="ml-2">{filteredSKUs.length}</Badge>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search SKUs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add SKU
            </Button>
          </div>

          {/* Bulk Actions */}
          {filteredSKUs.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedSKUs.length === filteredSKUs.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSKUs(filteredSKUs.map(s => s.sku))
                      } else {
                        setSelectedSKUs([])
                      }
                    }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedSKUs.length > 0 ? `${selectedSKUs.length} selected` : 'Select all'}
                  </span>
                </div>
                {selectedSKUs.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSKUs([])}
                    className="h-6 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* SKU List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredSKUs.map((sku) => (
              <Card
                key={sku.sku}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedSKUs.includes(sku.sku) 
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                )}
                onClick={() => toggleSKU(sku.sku)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedSKUs.includes(sku.sku)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm truncate">
                            {sku.displayName}
                          </h3>
                          {getStatusBadge(sku.status)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {sku.sku} • {sku.category}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Forecast:</span>
                            <p className="font-medium text-blue-600 dark:text-blue-400">
                              {formatNumber(sku.totalForecast)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Actual:</span>
                            <p className="font-medium text-green-600 dark:text-green-400">
                              {sku.totalActual > 0 ? formatNumber(sku.totalActual) : '-'}
                            </p>
                          </div>
                        </div>
                        
                        {sku.accuracy !== null && (
                          <div className="mt-2 flex items-center gap-1">
                            {sku.accuracy >= 95 ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className={cn(
                              "text-xs font-medium",
                              sku.accuracy >= 95 ? "text-green-600" : "text-red-600"
                            )}>
                              {sku.accuracy.toFixed(1)}% accuracy
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit SKU
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
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

          {/* Summary Footer */}
          {selectedSKUs.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-1">
                  {selectedSKUs.length} SKU{selectedSKUs.length === 1 ? '' : 's'} selected
                </p>
                <div className="flex justify-between">
                  <span>Total Forecast:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {formatNumber(
                      selectedSKUs.reduce((sum, sku) => {
                        const skuData = sampleSKUs.find(s => s.sku === sku)
                        return sum + (skuData?.totalForecast || 0)
                      }, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
          {selectedSKUs.length > 0 ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Forecast</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatNumber(
                            selectedSKUs.reduce((sum, sku) => {
                              const skuData = sampleSKUs.find(s => s.sku === sku)
                              return sum + (skuData?.totalForecast || 0)
                            }, 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950/20 flex items-center justify-center">
                        <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Actual</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {formatNumber(
                            selectedSKUs.reduce((sum, sku) => {
                              const skuData = sampleSKUs.find(s => s.sku === sku)
                              return sum + (skuData?.totalActual || 0)
                            }, 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</p>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          {(() => {
                            const skusWithAccuracy = selectedSKUs
                              .map(sku => sampleSKUs.find(s => s.sku === sku))
                              .filter(s => s && s.accuracy !== null)
                            if (skusWithAccuracy.length === 0) return '-'
                            const avgAccuracy = skusWithAccuracy.reduce((sum, s) => sum + s!.accuracy!, 0) / skusWithAccuracy.length
                            return `${avgAccuracy.toFixed(1)}%`
                          })()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center">
                        <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">SKUs Selected</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {selectedSKUs.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Forecast Tables */}
              {selectedSKUs.map(skuId => {
                const sku = sampleSKUs.find(s => s.sku === skuId)
                if (!sku) return null
                
                const weeklyData = generateWeeklyData(sku)
                const isExpanded = expandedSKUs.includes(skuId)
                
                return (
                  <Card key={skuId}>
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(skuId)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              <div>
                                <CardTitle className="text-lg">{sku.displayName}</CardTitle>
                                <CardDescription>
                                  Weekly sales forecast with inventory flow analysis
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {getStatusBadge(sku.status, sku.weeksCover)}
                              <div className="text-right text-sm">
                                <div className="font-medium text-blue-600 dark:text-blue-400">
                                  {formatNumber(sku.totalForecast)} units forecast
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">
                                  Current stock: {formatNumber(sku.currentStock)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                                <TableRow className="border-b-2 border-gray-200 dark:border-gray-700">
                                  <TableHead className="sticky left-0 bg-white dark:bg-gray-950 z-20 border-r border-gray-200 dark:border-gray-700 font-semibold">
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
                                  <TableRow key={week.week} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                    <TableCell className="sticky left-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-700 font-medium text-center">
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
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No SKUs Selected
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
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