'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card as TremorCard, AreaChart, BarChart, DonutChart, Metric, Text } from '@tremor/react'
import { toast, Toaster } from 'sonner'
import { Command } from 'cmdk'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { 
  Package, 
  Search, 
  Plus, 
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  BarChart3,
  Command as CommandIcon,
  User
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Sample data
const initialSKUs = [
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
  
  for (let i = 1; i <= 52; i++) {
    const forecast = Math.floor(sku.totalForecast / 52 * (0.8 + Math.random() * 0.4))
    const actual = i <= 4 ? Math.floor(forecast * (0.9 + Math.random() * 0.2)) : null
    const openingStock = currentStock
    const stockIn = i % 4 === 0 ? Math.floor(sku.totalForecast / 13) : 0
    const stockOut = actual || forecast
    const closingStock = Math.max(0, openingStock + stockIn - stockOut)
    const variance = actual ? ((actual - forecast) / forecast * 100).toFixed(1) : null
    const weeksCover = closingStock > 0 ? (closingStock / (sku.totalForecast / 52)).toFixed(1) : '0'
    
    weeks.push({
      week: `W${i.toString().padStart(2, '0')}`,
      forecast,
      actual,
      variance,
      openingStock,
      stockIn,
      stockOut,
      closingStock,
      weeksCover,
      date: `Week ${i}`
    })
    
    currentStock = closingStock
  }
  
  return weeks
}

interface SKUFormData {
  sku: string
  displayName: string
  category: string
  status: string
  totalForecast: number
  currentStock: number
}

export default function MinimalForecastPage() {
  const [sampleSKUs, setSampleSKUs] = useState(initialSKUs)
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>(['6LD'])
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSKUs, setExpandedSKUs] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingSKU, setEditingSKU] = useState<any>(null)
  const [activeView, setActiveView] = useState<'forecast' | 'management'>('forecast')
  const [commandOpen, setCommandOpen] = useState(false)
  const [formData, setFormData] = useState<SKUFormData>({
    sku: '',
    displayName: '',
    category: 'Electronics',
    status: 'healthy',
    totalForecast: 0,
    currentStock: 0
  })
  
  const filteredSKUs = useMemo(() => {
    if (!searchTerm) return sampleSKUs
    
    const term = searchTerm.toLowerCase()
    return sampleSKUs.filter(sku => 
      sku.displayName.toLowerCase().includes(term) ||
      sku.sku.toLowerCase().includes(term) ||
      sku.category.toLowerCase().includes(term)
    )
  }, [searchTerm, sampleSKUs])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-600 bg-emerald-50'
      case 'low-stock': return 'text-amber-600 bg-amber-50'
      case 'out-of-stock': return 'text-red-600 bg-red-50'
      case 'overstocked': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const handleAddSKU = () => {
    setFormData({
      sku: '',
      displayName: '',
      category: 'Electronics',
      status: 'healthy',
      totalForecast: 0,
      currentStock: 0
    })
    setShowAddDialog(true)
  }

  const handleEditSKU = (sku: string) => {
    const skuData = sampleSKUs.find(s => s.sku === sku)
    if (skuData) {
      setEditingSKU(skuData)
      setFormData({
        sku: skuData.sku,
        displayName: skuData.displayName,
        category: skuData.category,
        status: skuData.status,
        totalForecast: skuData.totalForecast,
        currentStock: skuData.currentStock
      })
      setShowEditDialog(true)
    }
  }

  const handleDeleteSKU = (sku: string) => {
    setSampleSKUs(prev => prev.filter(s => s.sku !== sku))
    setSelectedSKUs(prev => prev.filter(s => s !== sku))
    toast.success('SKU deleted successfully')
  }

  const handleSaveAdd = () => {
    const weeksCover = formData.currentStock > 0 ? (formData.currentStock / (formData.totalForecast / 52)).toFixed(1) : '0'
    const newSKU = {
      ...formData,
      totalActual: 0,
      accuracy: null,
      weeksCover: parseFloat(weeksCover)
    }
    setSampleSKUs(prev => [...prev, newSKU])
    setShowAddDialog(false)
    toast.success('SKU added successfully')
  }

  const handleSaveEdit = () => {
    const weeksCover = formData.currentStock > 0 ? (formData.currentStock / (formData.totalForecast / 52)).toFixed(1) : '0'
    setSampleSKUs(prev => prev.map(sku => 
      sku.sku === editingSKU.sku 
        ? { ...sku, ...formData, weeksCover: parseFloat(weeksCover) }
        : sku
    ))
    setShowEditDialog(false)
    toast.success('SKU updated successfully')
  }

  const getPageForSKU = (sku: string) => currentPage[sku] || 1
  const setPageForSKU = (sku: string, page: number) => {
    setCurrentPage(prev => ({ ...prev, [sku]: page }))
  }

  // Command palette actions
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <Toaster position="bottom-right" />
      
      {/* Command Palette */}
      <Command.Dialog open={commandOpen} onOpenChange={setCommandOpen} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/50" onClick={() => setCommandOpen(false)} />
        <div className="fixed left-1/2 top-20 -translate-x-1/2 w-full max-w-lg">
          <Command className="rounded-lg border bg-white shadow-lg">
            <Command.Input placeholder="Search commands..." className="h-12 px-4 text-sm" />
            <Command.List className="max-h-96 overflow-y-auto p-2">
              <Command.Empty>No results found.</Command.Empty>
              
              <Command.Group heading="Navigation">
                <Command.Item onSelect={() => { setActiveView('forecast'); setCommandOpen(false) }} className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Go to Forecast View
                </Command.Item>
                <Command.Item onSelect={() => { setActiveView('management'); setCommandOpen(false) }} className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100">
                  <Package className="h-4 w-4 mr-2" />
                  Go to SKU Management
                </Command.Item>
              </Command.Group>
              
              <Command.Group heading="Actions">
                <Command.Item onSelect={() => { handleAddSKU(); setCommandOpen(false) }} className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New SKU
                </Command.Item>
              </Command.Group>
              
              <Command.Group heading="SKUs">
                {sampleSKUs.map(sku => (
                  <Command.Item key={sku.sku} onSelect={() => { toggleSKU(sku.sku); setCommandOpen(false) }} className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100">
                    <Package className="h-4 w-4 mr-2" />
                    {selectedSKUs.includes(sku.sku) ? 'Deselect' : 'Select'} {sku.displayName}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      </Command.Dialog>

      <div className="min-h-screen bg-gray-50">
        {/* Minimal Header */}
        <header className="bg-white border-b h-14 sticky top-0 z-40">
          <div className="px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-medium">Sales Forecast</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCommandOpen(true)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
              >
                <CommandIcon className="h-4 w-4" />
                <span>⌘K</span>
              </button>
              
              <button className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <User className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-56px)]">
          {/* Minimal Sidebar */}
          <aside className="w-60 bg-white border-r">
            <nav className="p-4 space-y-1">
              <button
                onClick={() => setActiveView('forecast')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                  activeView === 'forecast' 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Forecast View
              </button>
              
              <button
                onClick={() => setActiveView('management')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                  activeView === 'management' 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Package className="h-4 w-4" />
                SKU Management
              </button>
            </nav>

            {/* SKU Selection for Forecast View */}
            {activeView === 'forecast' && (
              <div className="px-4 pb-4">
                <div className="border-t pt-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Select SKUs</h3>
                  
                  <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {filteredSKUs.map((sku) => (
                      <label
                        key={sku.sku}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedSKUs.includes(sku.sku)}
                          onCheckedChange={() => toggleSKU(sku.sku)}
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-xs">{sku.displayName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden bg-gray-50">
            <AnimatePresence mode="wait">
              {activeView === 'forecast' ? (
                <motion.div
                  key="forecast"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  {selectedSKUs.length > 0 ? (
                    <Tabs defaultValue="overview" className="h-full flex flex-col">
                      <div className="bg-white border-b px-6 py-3">
                        <TabsList className="h-9">
                          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                          <TabsTrigger value="detailed" className="text-xs">Detailed</TabsTrigger>
                          <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <TabsContent value="overview" className="flex-1 overflow-auto p-6 mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          {selectedSKUs.map(skuId => {
                            const sku = sampleSKUs.find(s => s.sku === skuId)
                            if (!sku) return null
                            
                            return (
                              <motion.div
                                key={skuId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">{sku.displayName}</CardTitle>
                                    <CardDescription className="text-xs">
                                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(sku.status))}>
                                        {sku.status.replace('-', ' ')}
                                      </span>
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Current Stock</span>
                                        <span className="font-medium">{formatNumber(sku.currentStock)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Weeks Cover</span>
                                        <span className="font-medium">{sku.weeksCover}w</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Accuracy</span>
                                        <span className="font-medium">{sku.accuracy ? `${sku.accuracy}%` : 'N/A'}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )
                          })}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <TremorCard className="border-0 shadow-sm">
                            <h3 className="text-sm font-medium mb-4">Forecast vs Actual</h3>
                            <AreaChart
                              className="h-72"
                              data={generateWeeklyData(sampleSKUs.find(s => s.sku === selectedSKUs[0]) || sampleSKUs[0]).slice(0, 12)}
                              index="week"
                              categories={["forecast", "actual"]}
                              colors={["blue", "emerald"]}
                              showLegend={true}
                              showGridLines={false}
                              curveType="monotone"
                            />
                          </TremorCard>
                          
                          <TremorCard className="border-0 shadow-sm">
                            <h3 className="text-sm font-medium mb-4">Stock Levels by SKU</h3>
                            <BarChart
                              className="h-72"
                              data={selectedSKUs.map(skuId => {
                                const sku = sampleSKUs.find(s => s.sku === skuId)
                                return {
                                  name: sku?.displayName || skuId,
                                  'Current Stock': sku?.currentStock || 0,
                                  'Total Forecast': sku?.totalForecast || 0
                                }
                              })}
                              index="name"
                              categories={["Current Stock", "Total Forecast"]}
                              colors={["blue", "gray"]}
                              showLegend={false}
                              showGridLines={false}
                            />
                          </TremorCard>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="detailed" className="flex-1 overflow-auto p-6 mt-0">
                        <div className="space-y-6">
                          {selectedSKUs.map(skuId => {
                            const sku = sampleSKUs.find(s => s.sku === skuId)
                            if (!sku) return null
                            
                            const weeklyData = generateWeeklyData(sku)
                            const isExpanded = expandedSKUs.includes(skuId)
                            const currentPageNum = getPageForSKU(skuId)
                            const startIndex = (currentPageNum - 1) * 10
                            const endIndex = startIndex + 10
                            const paginatedData = weeklyData.slice(startIndex, endIndex)
                            const totalPages = Math.ceil(weeklyData.length / 10)
                            
                            return (
                              <motion.div
                                key={skuId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg shadow-sm border-0"
                              >
                                <button
                                  onClick={() => toggleExpanded(skuId)}
                                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <h3 className="text-sm font-medium">{sku.displayName}</h3>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        Forecast: {formatNumber(sku.totalForecast)} units · Stock: {formatNumber(sku.currentStock)} units
                                      </p>
                                    </div>
                                  </div>
                                  {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                                </button>
                                
                                {isExpanded && (
                                  <div className="px-6 pb-6">
                                    <div className="overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-20">Week</TableHead>
                                            <TableHead className="text-right">Forecast</TableHead>
                                            <TableHead className="text-right">Actual</TableHead>
                                            <TableHead className="text-right">Variance</TableHead>
                                            <TableHead className="text-right">Opening</TableHead>
                                            <TableHead className="text-right">In</TableHead>
                                            <TableHead className="text-right">Out</TableHead>
                                            <TableHead className="text-right">Closing</TableHead>
                                            <TableHead className="text-right">Cover</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {paginatedData.map((week, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell className="font-medium">{week.week}</TableCell>
                                              <TableCell className="text-right">{formatNumber(week.forecast)}</TableCell>
                                              <TableCell className="text-right">
                                                {week.actual ? formatNumber(week.actual) : '-'}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                {week.variance && (
                                                  <span className={cn(
                                                    "text-xs font-medium",
                                                    parseFloat(week.variance) > 0 ? "text-emerald-600" : "text-red-600"
                                                  )}>
                                                    {week.variance}%
                                                  </span>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-right text-gray-500">{formatNumber(week.openingStock)}</TableCell>
                                              <TableCell className="text-right">
                                                {week.stockIn > 0 && (
                                                  <span className="text-emerald-600">+{formatNumber(week.stockIn)}</span>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-right text-gray-500">{formatNumber(week.stockOut)}</TableCell>
                                              <TableCell className="text-right font-medium">{formatNumber(week.closingStock)}</TableCell>
                                              <TableCell className="text-right">
                                                <span className={cn(
                                                  "text-xs",
                                                  parseFloat(week.weeksCover) < 2 ? "text-red-600" : 
                                                  parseFloat(week.weeksCover) < 4 ? "text-amber-600" : "text-gray-600"
                                                )}>
                                                  {week.weeksCover}w
                                                </span>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center justify-between">
                                      <p className="text-xs text-gray-500">
                                        Showing weeks {startIndex + 1}-{Math.min(endIndex, weeklyData.length)} of {weeklyData.length}
                                      </p>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setPageForSKU(skuId, currentPageNum - 1)}
                                          disabled={currentPageNum === 1}
                                          className="h-8 px-2"
                                        >
                                          <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs text-gray-500 px-2">
                                          {currentPageNum} / {totalPages}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setPageForSKU(skuId, currentPageNum + 1)}
                                          disabled={currentPageNum === totalPages}
                                          className="h-8 px-2"
                                        >
                                          <ChevronRight className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="analytics" className="flex-1 overflow-auto p-6 mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {selectedSKUs.map(skuId => {
                            const sku = sampleSKUs.find(s => s.sku === skuId)
                            if (!sku) return null
                            
                            const weeklyData = generateWeeklyData(sku).slice(0, 12)
                            
                            return (
                              <TremorCard key={skuId} className="border-0 shadow-sm">
                                <div className="mb-4">
                                  <h3 className="text-sm font-medium">{sku.displayName}</h3>
                                  <p className="text-xs text-gray-500 mt-1">12-week forecast analysis</p>
                                </div>
                                
                                <AreaChart
                                  className="h-64"
                                  data={weeklyData}
                                  index="week"
                                  categories={["forecast", "actual", "closingStock"]}
                                  colors={["blue", "emerald", "amber"]}
                                  showLegend={true}
                                  showGridLines={false}
                                  curveType="monotone"
                                />
                                
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                  <div className="text-center">
                                    <p className="text-xs text-gray-500">Accuracy</p>
                                    <p className="text-lg font-medium">{sku.accuracy ? `${sku.accuracy}%` : 'N/A'}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-gray-500">Current Stock</p>
                                    <p className="text-lg font-medium">{formatNumber(sku.currentStock)}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-gray-500">Weeks Cover</p>
                                    <p className="text-lg font-medium">{sku.weeksCover}w</p>
                                  </div>
                                </div>
                              </TremorCard>
                            )
                          })}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-1">No SKUs Selected</h3>
                        <p className="text-xs text-gray-500">Select SKUs from the sidebar to view forecasts</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="management"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium">SKU Management</h2>
                      <p className="text-sm text-gray-500">Manage your inventory items</p>
                    </div>
                    <Button onClick={handleAddSKU} size="sm" className="h-9">
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add SKU
                    </Button>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Forecast</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead className="text-right">Cover</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sampleSKUs.map((sku) => (
                          <TableRow key={sku.sku}>
                            <TableCell className="font-medium">{sku.sku}</TableCell>
                            <TableCell>{sku.displayName}</TableCell>
                            <TableCell>{sku.category}</TableCell>
                            <TableCell>
                              <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(sku.status))}>
                                {sku.status.replace('-', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{formatNumber(sku.totalForecast)}</TableCell>
                            <TableCell className="text-right">{formatNumber(sku.currentStock)}</TableCell>
                            <TableCell className="text-right">
                              <span className={cn(
                                "text-xs",
                                sku.weeksCover < 2 ? "text-red-600" : 
                                sku.weeksCover < 4 ? "text-amber-600" : "text-gray-600"
                              )}>
                                {sku.weeksCover}w
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditSKU(sku.sku)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSKU(sku.sku)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Add/Edit Dialogs - Simplified */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New SKU</DialogTitle>
            <DialogDescription>
              Enter the details for the new SKU
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sku" className="text-sm">SKU Code</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="displayName" className="text-sm">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-sm">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Storage">Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalForecast" className="text-sm">Total Forecast</Label>
                <Input
                  id="totalForecast"
                  type="number"
                  value={formData.totalForecast}
                  onChange={(e) => setFormData({ ...formData, totalForecast: parseInt(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currentStock" className="text-sm">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} size="sm">Add SKU</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit SKU</DialogTitle>
            <DialogDescription>
              Update the details for {editingSKU?.displayName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-displayName" className="text-sm">Display Name</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category" className="text-sm">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Storage">Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-totalForecast" className="text-sm">Total Forecast</Label>
                <Input
                  id="edit-totalForecast"
                  type="number"
                  value={formData.totalForecast}
                  onChange={(e) => setFormData({ ...formData, totalForecast: parseInt(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-currentStock" className="text-sm">Current Stock</Label>
                <Input
                  id="edit-currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} size="sm">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} size="sm">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}