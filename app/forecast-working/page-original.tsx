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
    totalForecast: 2800, 
    totalActual: 2600,
    accuracy: 92.9,
    currentStock: 1100,
    weeksCover: 5.5
  }
]

const generateWeeklyData = (sku: any) => {
  const weeks = []
  let currentStock = sku.currentStock
  
  for (let i = 1; i <= 12; i++) {
    const weekNum = new Date().getWeek() + i - 1
    const forecast = Math.floor(sku.totalForecast / 12 * (0.8 + Math.random() * 0.4))
    const actual = i <= 2 ? Math.floor(forecast * (0.9 + Math.random() * 0.2)) : null
    const openingStock = currentStock
    const stockIn = i % 4 === 0 ? Math.floor(sku.totalForecast / 3) : 0
    const stockOut = actual || forecast
    const closingStock = Math.max(0, openingStock + stockIn - stockOut)
    const variance = actual ? ((actual - forecast) / forecast * 100).toFixed(1) : null
    const weeksCover = closingStock > 0 ? (closingStock / (sku.totalForecast / 12)).toFixed(1) : '0'
    
    weeks.push({
      week: `W${weekNum}`,
      forecast,
      actual,
      variance,
      openingStock,
      stockIn,
      stockOut,
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

  const handleCardClick = (e: React.MouseEvent, sku: string) => {
    // Only toggle if clicking on the card itself, not on interactive elements
    const target = e.target as HTMLElement
    const isInteractiveElement = 
      target.closest('button') || 
      target.closest('input') || 
      target.closest('[role="menuitem"]')
    
    if (!isInteractiveElement) {
      toggleSKU(sku)
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
                onClick={(e) => handleCardClick(e, sku.sku)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedSKUs.includes(sku.sku)}
                        onCheckedChange={() => toggleSKU(sku.sku)}
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
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-gray-200/50 dark:border-gray-700/50">
                        <DropdownMenuItem 
                          onClick={() => handleEditSKU(sku.sku)}
                          className="cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit SKU
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteSKU(sku.sku)}
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
                      <Collapsible key={skuId} open={isExpanded} onOpenChange={() => toggleExpanded(skuId)}>
                        <Card className="glass overflow-hidden border-0 shadow-md">
                          <CollapsibleTrigger className="w-full">
                            <CardHeader className="cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="text-left">
                                    <CardTitle className="text-lg flex items-center gap-3">
                                      {sku.displayName}
                                      {getStatusBadge(sku.status, sku.weeksCover)}
                                    </CardTitle>
                                    <CardDescription className="mt-1 flex items-center gap-4 text-sm">
                                      <span>Total Forecast: <strong className="text-gray-900 dark:text-gray-100">{formatNumber(sku.totalForecast)}</strong></span>
                                      <span>•</span>
                                      <span>Accuracy: <strong className="text-gray-900 dark:text-gray-100">{sku.accuracy ? `${sku.accuracy}%` : 'N/A'}</strong></span>
                                      <span>•</span>
                                      <span>Current Stock: <strong className="text-gray-900 dark:text-gray-100">{formatNumber(sku.currentStock)}</strong></span>
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <CardContent className="px-6 pb-6">
                              <div className="rounded-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/20">
                                      <TableHead className="font-semibold">Week</TableHead>
                                      <TableHead className="text-right font-semibold">Forecast</TableHead>
                                      <TableHead className="text-right font-semibold">Actual</TableHead>
                                      <TableHead className="text-right font-semibold">Variance</TableHead>
                                      <TableHead className="text-right font-semibold">Opening Stock</TableHead>
                                      <TableHead className="text-right font-semibold">Stock In</TableHead>
                                      <TableHead className="text-right font-semibold">Stock Out</TableHead>
                                      <TableHead className="text-right font-semibold">Closing Stock</TableHead>
                                      <TableHead className="text-right font-semibold">Weeks Cover</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {weeklyData.map((week, idx) => (
                                      <TableRow key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <TableCell className="font-medium">{week.week}</TableCell>
                                        <TableCell className="text-right">{formatNumber(week.forecast)}</TableCell>
                                        <TableCell className="text-right">
                                          {week.actual ? formatNumber(week.actual) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {week.variance && (
                                            <span className={cn(
                                              "font-medium",
                                              parseFloat(week.variance) > 0 ? "text-green-600" : "text-red-600"
                                            )}>
                                              {week.variance}%
                                            </span>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">{formatNumber(week.openingStock)}</TableCell>
                                        <TableCell className="text-right">
                                          {week.stockIn > 0 && (
                                            <span className="text-green-600 font-medium">
                                              +{formatNumber(week.stockIn)}
                                            </span>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">{formatNumber(week.stockOut)}</TableCell>
                                        <TableCell className="text-right">
                                          <span className={cn(
                                            "font-medium",
                                            week.closingStock === 0 ? "text-red-600" : week.closingStock < 500 ? "text-yellow-600" : "text-gray-900 dark:text-gray-100"
                                          )}>
                                            {formatNumber(week.closingStock)}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Badge variant={parseFloat(week.weeksCover) < 2 ? "destructive" : parseFloat(week.weeksCover) < 4 ? "secondary" : "default"}>
                                            {week.weeksCover}w
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                              
                              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                <p className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  Weekly sales forecast with inventory flow analysis
                                </p>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    )
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="flex-1 overflow-auto p-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedSKUs.map(skuId => {
                    const sku = sampleSKUs.find(s => s.sku === skuId)
                    if (!sku) return null
                    
                    const chartData = generateWeeklyData(sku).map(week => ({
                      week: week.week,
                      forecast: week.forecast,
                      actual: week.actual || 0,
                      stock: week.closingStock
                    }))
                    
                    return (
                      <Card key={skuId} className="glass border-0 shadow-md">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{sku.displayName}</span>
                            {getStatusBadge(sku.status)}
                          </CardTitle>
                          <CardDescription>
                            Forecast accuracy: {sku.accuracy ? `${sku.accuracy}%` : 'N/A'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} name="Forecast" />
                                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
                                <Line type="monotone" dataKey="stock" stroke="#f59e0b" strokeWidth={2} name="Stock Level" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No SKUs Selected</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  Select one or more SKUs from the sidebar to view their forecast details and analytics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Add this extension to Date prototype for week calculation
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}