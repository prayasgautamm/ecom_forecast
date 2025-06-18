'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
  Settings,
  LogOut,
  LayoutDashboard
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
    weeksCover: 5.2,
    leadTime: 14,
    reorderPoint: 280,
    costPrice: 45.50,
    sellingPrice: 89.99,
    abcCategory: 'A',
    annualRevenue: 467948,
    annualVolume: 5200
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
    weeksCover: 2.1,
    leadTime: 14,
    reorderPoint: 420,
    costPrice: 52.00,
    sellingPrice: 99.99,
    abcCategory: 'A',
    annualRevenue: 779922,
    annualVolume: 7800
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
    weeksCover: 4.8,
    leadTime: 7,
    reorderPoint: 86,
    costPrice: 12.75,
    sellingPrice: 24.99,
    abcCategory: 'B',
    annualRevenue: 79968,
    annualVolume: 3200
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
    weeksCover: 15.2,
    leadTime: 7,
    reorderPoint: 57,
    costPrice: 15.25,
    sellingPrice: 29.99,
    abcCategory: 'B',
    annualRevenue: 62979,
    annualVolume: 2100
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
    weeksCover: 0,
    leadTime: 21,
    reorderPoint: 120,
    costPrice: 8.50,
    sellingPrice: 19.99,
    abcCategory: 'C',
    annualRevenue: 29985,
    annualVolume: 1500
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
    weeksCover: 5.5,
    leadTime: 21,
    reorderPoint: 225,
    costPrice: 11.00,
    sellingPrice: 24.99,
    abcCategory: 'B',
    annualRevenue: 69972,
    annualVolume: 2800
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
  leadTime: number
  reorderPoint: number
  costPrice: number
  sellingPrice: number
  abcCategory: string
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
  const [activeView, setActiveView] = useState<'dashboard' | 'sales-forecast' | 'inventory-forecast' | 'management' | null>('dashboard')
  const [commandOpen, setCommandOpen] = useState(false)
  const [formData, setFormData] = useState<SKUFormData>({
    sku: '',
    displayName: '',
    category: 'Electronics',
    status: 'healthy',
    totalForecast: 0,
    currentStock: 0,
    leadTime: 14,
    reorderPoint: 0,
    costPrice: 0,
    sellingPrice: 0,
    abcCategory: 'B'
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

  const getStatusBorderClass = (status: string) => {
    switch (status) {
      case 'healthy': return 'border-gradient-healthy'
      case 'low-stock': return 'border-gradient-low-stock'
      case 'out-of-stock': return 'border-gradient-out-of-stock'
      case 'overstocked': return 'border-gradient-overstocked'
      default: return ''
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
      currentStock: 0,
      leadTime: 14,
      reorderPoint: 0,
      costPrice: 0,
      sellingPrice: 0,
      abcCategory: 'B'
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
        currentStock: skuData.currentStock,
        leadTime: skuData.leadTime,
        reorderPoint: skuData.reorderPoint,
        costPrice: skuData.costPrice,
        sellingPrice: skuData.sellingPrice,
        abcCategory: skuData.abcCategory
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
    const annualRevenue = formData.totalForecast * formData.sellingPrice
    const newSKU = {
      ...formData,
      totalActual: 0,
      accuracy: null,
      weeksCover: parseFloat(weeksCover),
      annualRevenue,
      annualVolume: formData.totalForecast
    }
    setSampleSKUs(prev => [...prev, newSKU])
    setShowAddDialog(false)
    toast.success('SKU added successfully')
  }

  const handleSaveEdit = () => {
    const weeksCover = formData.currentStock > 0 ? (formData.currentStock / (formData.totalForecast / 52)).toFixed(1) : '0'
    const annualRevenue = formData.totalForecast * formData.sellingPrice
    setSampleSKUs(prev => prev.map(sku => 
      sku.sku === editingSKU.sku 
        ? { ...sku, ...formData, weeksCover: parseFloat(weeksCover), annualRevenue, annualVolume: formData.totalForecast }
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
                <Command.Item onSelect={() => { setActiveView(activeView === 'sales-forecast' ? null : 'sales-forecast'); setCommandOpen(false) }} className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {activeView === 'sales-forecast' ? 'Close Sales Forecast' : 'Go to Sales Forecast'}
                </Command.Item>
                <Command.Item onSelect={() => { setActiveView(activeView === 'management' ? null : 'management'); setCommandOpen(false) }} className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100">
                  <Package className="h-4 w-4 mr-2" />
                  {activeView === 'management' ? 'Close SKU Management' : 'Go to SKU Management'}
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
              <h1 className="text-lg font-medium">Forecast</h1>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-56px)]">
          {/* Minimal Sidebar */}
          <aside className="w-60 bg-white border-r flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <nav className="p-4 space-y-1">
                <button
                  onClick={() => setActiveView(activeView === 'dashboard' ? null : 'dashboard')}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeView === 'dashboard' 
                      ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                
                <button
                  onClick={() => setActiveView(activeView === 'sales-forecast' ? null : 'sales-forecast')}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeView === 'sales-forecast' 
                      ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <TrendingUp className="h-4 w-4" />
                  Sales Forecast
                </button>
                
                {/* SKU Selection for Sales Forecast */}
                {activeView === 'sales-forecast' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-2"
                  >
                    <div className="border-l-2 border-gray-200 pl-4">
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
                      
                      <div className="space-y-1 max-h-64 overflow-y-auto">
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
                  </motion.div>
                )}
                
                <button
                  onClick={() => setActiveView(activeView === 'inventory-forecast' ? null : 'inventory-forecast')}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeView === 'inventory-forecast' 
                      ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Package className="h-4 w-4" />
                  Inventory Forecast
                </button>
                
                <button
                  onClick={() => setActiveView(activeView === 'management' ? null : 'management')}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeView === 'management' 
                      ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  SKU Management
                </button>
              </nav>
            </div>
            
            {/* Bottom Navigation */}
            <div className="border-t p-4 space-y-1">
              <button
                onClick={() => toast.info('Settings coming soon!')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              
              <button
                onClick={() => toast.info('Logout functionality coming soon!')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden bg-gray-50">
            <AnimatePresence mode="wait">
              {activeView === null ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 bg-clip-text text-transparent animate-gradient bg-300% bg-animated">
                      Welcome to Forecast
                    </h3>
                    <p className="text-sm text-gray-500">Select an option from sidebar to get started</p>
                  </div>
                </motion.div>
              ) : activeView === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full p-6"
                >
                  <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
                    
                    {/* KPI Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* Inventory Health Widget */}
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Inventory Health</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold">
                                {sampleSKUs.filter(s => s.status === 'healthy').length}
                              </p>
                              <p className="text-xs text-gray-500">Healthy SKUs</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                              <Package className="h-6 w-6 text-emerald-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Total Inventory Value */}
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Inventory Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold">$128,450</p>
                              <p className="text-xs text-gray-500">Total value</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                              <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Alerts Summary */}
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Active Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-amber-600">
                                {sampleSKUs.filter(s => s.status === 'low-stock' || s.status === 'out-of-stock').length}
                              </p>
                              <p className="text-xs text-gray-500">Need attention</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                              <BarChart3 className="h-6 w-6 text-amber-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Forecast Accuracy */}
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Forecast Accuracy</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold">94.2%</p>
                              <p className="text-xs text-gray-500">Avg accuracy</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                              <BarChart3 className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Alerts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Critical Alerts */}
                      <Card className="border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">Critical Alerts</CardTitle>
                          <CardDescription>Items requiring immediate attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {sampleSKUs
                              .filter(s => s.status === 'out-of-stock' || s.status === 'low-stock')
                              .slice(0, 5)
                              .map(sku => (
                                <div key={sku.sku} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="text-sm font-medium">{sku.displayName}</p>
                                    <p className="text-xs text-gray-500">SKU: {sku.sku}</p>
                                  </div>
                                  <Badge className={cn(
                                    "text-xs",
                                    sku.status === 'out-of-stock' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                  )}>
                                    {sku.status.replace('-', ' ')}
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Top Performers */}
                      <Card className="border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">Top Performers</CardTitle>
                          <CardDescription>Best selling SKUs this period</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {sampleSKUs
                              .sort((a, b) => b.totalForecast - a.totalForecast)
                              .slice(0, 5)
                              .map((sku, index) => (
                                <div key={sku.sku} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                                    <div>
                                      <p className="text-sm font-medium">{sku.displayName}</p>
                                      <p className="text-xs text-gray-500">{formatNumber(sku.totalForecast)} units</p>
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {sku.accuracy ? `${sku.accuracy}%` : 'N/A'} accuracy
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              ) : activeView === 'sales-forecast' ? (
                <motion.div
                  key="forecast"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full"
                >
                  {selectedSKUs.length > 0 ? (
                    <Tabs defaultValue="detailed" className="h-full flex flex-col">
                      <div className="bg-white border-b px-6 py-3">
                        <TabsList className="h-9">
                          <TabsTrigger value="detailed" className="text-xs">Details</TabsTrigger>
                          <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                        </TabsList>
                      </div>
                      
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
                                  <div className="flex items-center gap-2">
                                    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(sku.status))}>
                                      {sku.status.replace('-', ' ')}
                                    </span>
                                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                                  </div>
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
                            
                            const chartData = generateWeeklyData(sku).slice(0, 12).map(week => ({
                              week: week.week,
                              forecast: week.forecast,
                              actual: week.actual || 0,
                              stock: week.closingStock
                            }))
                            
                            return (
                              <Card key={skuId} className="border-0 shadow-sm">
                                <CardHeader>
                                  <CardTitle className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{sku.displayName}</span>
                                    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(sku.status))}>
                                      {sku.status.replace('-', ' ')}
                                    </span>
                                  </CardTitle>
                                  <CardDescription className="text-xs">
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
                                  
                                  <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Total Forecast</p>
                                      <p className="text-sm font-medium">{formatNumber(sku.totalForecast)}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Current Stock</p>
                                      <p className="text-sm font-medium">{formatNumber(sku.currentStock)}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Weeks Cover</p>
                                      <p className="text-sm font-medium">{sku.weeksCover}w</p>
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
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 bg-clip-text text-transparent animate-gradient bg-300% bg-animated">
                          No SKUs Selected
                        </h3>
                        <p className="text-sm text-gray-500">Select SKUs from the sidebar to view forecasts</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : activeView === 'inventory-forecast' ? (
                <motion.div
                  key="inventory-forecast"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6"
                >
                  <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-6">Inventory Forecast</h2>
                    
                    {/* Reorder Point Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      {/* SKUs at Reorder Point */}
                      <Card className="border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-gray-600">At Reorder Point</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold text-amber-600">
                            {sampleSKUs.filter(s => s.currentStock <= (s.totalForecast / 52) * 2).length}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">SKUs need reordering</p>
                        </CardContent>
                      </Card>
                      
                      {/* Average Lead Time */}
                      <Card className="border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-gray-600">Avg Lead Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">14</p>
                          <p className="text-xs text-gray-500 mt-1">days to restock</p>
                        </CardContent>
                      </Card>
                      
                      {/* Safety Stock Status */}
                      <Card className="border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-gray-600">Safety Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold text-green-600">Good</p>
                          <p className="text-xs text-gray-500 mt-1">Overall coverage</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Stock Projection Table */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Stock Projections & Reorder Points</CardTitle>
                        <CardDescription>
                          Based on current sales velocity and lead times
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Current Stock</TableHead>
                                <TableHead className="text-right">Daily Usage</TableHead>
                                <TableHead className="text-right">Reorder Point</TableHead>
                                <TableHead className="text-right">Days Until Reorder</TableHead>
                                <TableHead className="text-right">Stock Out Date</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sampleSKUs.map((sku) => {
                                const dailyUsage = Math.round(sku.totalForecast / 365)
                                const leadTime = 14 // days
                                const safetyStock = Math.round(dailyUsage * 7) // 1 week safety
                                const reorderPoint = (dailyUsage * leadTime) + safetyStock
                                const daysUntilReorder = Math.max(0, Math.round((sku.currentStock - reorderPoint) / dailyUsage))
                                const stockOutDays = Math.round(sku.currentStock / dailyUsage)
                                const stockOutDate = new Date()
                                stockOutDate.setDate(stockOutDate.getDate() + stockOutDays)
                                
                                return (
                                  <TableRow key={sku.sku}>
                                    <TableCell className="font-medium">{sku.sku}</TableCell>
                                    <TableCell>{sku.displayName}</TableCell>
                                    <TableCell className="text-right">{formatNumber(sku.currentStock)}</TableCell>
                                    <TableCell className="text-right">{dailyUsage}</TableCell>
                                    <TableCell className="text-right font-medium">{formatNumber(reorderPoint)}</TableCell>
                                    <TableCell className="text-right">
                                      <span className={cn(
                                        "font-medium",
                                        daysUntilReorder === 0 ? "text-red-600" : 
                                        daysUntilReorder < 7 ? "text-amber-600" : "text-gray-600"
                                      )}>
                                        {daysUntilReorder} days
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-gray-500">
                                      {stockOutDate.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                      {sku.currentStock <= reorderPoint && (
                                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                                          Reorder Now
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="management"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6"
                >
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold">SKU Management</h2>
                        <p className="text-sm text-gray-500">Manage inventory items with ABC analysis</p>
                      </div>
                      <Button onClick={handleAddSKU} size="sm" className="h-9">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add SKU
                      </Button>
                    </div>
                    
                    {/* ABC Analysis Summary */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Total SKUs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{sampleSKUs.length}</p>
                          <p className="text-xs text-gray-500">Active items</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Category A</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-green-600">
                            {sampleSKUs.filter(s => s.abcCategory === 'A').length}
                          </p>
                          <p className="text-xs text-gray-500">High value (80% revenue)</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Category B</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-blue-600">
                            {sampleSKUs.filter(s => s.abcCategory === 'B').length}
                          </p>
                          <p className="text-xs text-gray-500">Medium value (15% revenue)</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Category C</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-gray-600">
                            {sampleSKUs.filter(s => s.abcCategory === 'C').length}
                          </p>
                          <p className="text-xs text-gray-500">Low value (5% revenue)</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                      <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-none border-b">
                          <TabsTrigger value="all" className="data-[state=active]:bg-white">All SKUs</TabsTrigger>
                          <TabsTrigger value="A" className="data-[state=active]:bg-white">Category A</TabsTrigger>
                          <TabsTrigger value="B" className="data-[state=active]:bg-white">Category B</TabsTrigger>
                          <TabsTrigger value="C" className="data-[state=active]:bg-white">Category C</TabsTrigger>
                        </TabsList>
                        
                        {['all', 'A', 'B', 'C'].map((tab) => (
                          <TabsContent key={tab} value={tab} className="mt-0">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>ABC</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead className="text-right">Lead Time</TableHead>
                                    <TableHead className="text-right">Reorder Pt</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {sampleSKUs
                                    .filter(sku => tab === 'all' || sku.abcCategory === tab)
                                    .map((sku) => (
                                    <TableRow key={sku.sku}>
                                      <TableCell className="font-medium">{sku.sku}</TableCell>
                                      <TableCell>{sku.displayName}</TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant="outline" 
                                          className={cn(
                                            "text-xs font-medium",
                                            sku.abcCategory === 'A' ? "border-green-200 bg-green-50 text-green-700" :
                                            sku.abcCategory === 'B' ? "border-blue-200 bg-blue-50 text-blue-700" :
                                            "border-gray-200 bg-gray-50 text-gray-700"
                                          )}
                                        >
                                          {sku.abcCategory}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{sku.category}</TableCell>
                                      <TableCell>
                                        <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(sku.status))}>
                                          {sku.status.replace('-', ' ')}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-right">${sku.costPrice.toFixed(2)}</TableCell>
                                      <TableCell className="text-right">${sku.sellingPrice.toFixed(2)}</TableCell>
                                      <TableCell className="text-right">{formatNumber(sku.currentStock)}</TableCell>
                                      <TableCell className="text-right">{sku.leadTime}d</TableCell>
                                      <TableCell className="text-right">{sku.reorderPoint}</TableCell>
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
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>
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
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
              <div className="grid gap-2">
                <Label htmlFor="abcCategory" className="text-sm">ABC Category</Label>
                <Select value={formData.abcCategory} onValueChange={(value) => setFormData({ ...formData, abcCategory: value })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - High Value</SelectItem>
                    <SelectItem value="B">B - Medium Value</SelectItem>
                    <SelectItem value="C">C - Low Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalForecast" className="text-sm">Annual Forecast</Label>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="costPrice" className="text-sm">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="h-9"
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sellingPrice" className="text-sm">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="h-9"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="leadTime" className="text-sm">Lead Time (days)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={formData.leadTime}
                  onChange={(e) => setFormData({ ...formData, leadTime: parseInt(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reorderPoint" className="text-sm">Reorder Point</Label>
                <Input
                  id="reorderPoint"
                  type="number"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
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
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-abcCategory" className="text-sm">ABC Category</Label>
              <Select value={formData.abcCategory} onValueChange={(value) => setFormData({ ...formData, abcCategory: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - High Value</SelectItem>
                  <SelectItem value="B">B - Medium Value</SelectItem>
                  <SelectItem value="C">C - Low Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-totalForecast" className="text-sm">Annual Forecast</Label>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-costPrice" className="text-sm">Cost Price</Label>
                <Input
                  id="edit-costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="h-9"
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-sellingPrice" className="text-sm">Selling Price</Label>
                <Input
                  id="edit-sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="h-9"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-leadTime" className="text-sm">Lead Time (days)</Label>
                <Input
                  id="edit-leadTime"
                  type="number"
                  value={formData.leadTime}
                  onChange={(e) => setFormData({ ...formData, leadTime: parseInt(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-reorderPoint" className="text-sm">Reorder Point</Label>
                <Input
                  id="edit-reorderPoint"
                  type="number"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
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