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
// Product groups definition
const productGroups = [
  { id: 'ld-series', name: 'Group 1', color: 'blue' },
  { id: 'st-series', name: 'Group 2', color: 'green' },
  { id: 'cds-series', name: 'Group 3', color: 'purple' }
]

const initialSKUs = [
  { 
    sku: '6LD', 
    displayName: '6 LD', 
    category: 'Electronics',
    productGroup: 'ld-series',
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
    productGroup: 'st-series',
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
    productGroup: 'ld-series',
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
    productGroup: 'st-series',
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
    productGroup: 'cds-series',
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
    productGroup: 'cds-series',
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
  },
  { 
    sku: '10LD', 
    displayName: '10 LD', 
    category: 'Electronics',
    productGroup: 'ld-series',
    status: 'healthy', 
    totalForecast: 4500, 
    totalActual: 4200,
    accuracy: 93.3,
    currentStock: 980,
    weeksCover: 4.2,
    leadTime: 14,
    reorderPoint: 245,
    costPrice: 68.50,
    sellingPrice: 129.99,
    abcCategory: 'A',
    annualRevenue: 584955,
    annualVolume: 4500
  },
  { 
    sku: '10ST', 
    displayName: '10 ST', 
    category: 'Electronics',
    productGroup: 'st-series',
    status: 'healthy', 
    totalForecast: 5200, 
    totalActual: 4800,
    accuracy: 92.3,
    currentStock: 1450,
    weeksCover: 5.8,
    leadTime: 14,
    reorderPoint: 280,
    costPrice: 78.00,
    sellingPrice: 149.99,
    abcCategory: 'A',
    annualRevenue: 779948,
    annualVolume: 5200
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
  productGroup: string
  status: string
  totalForecast: number
  currentStock: number
  leadTime: number
  reorderPoint: number
  costPrice: number
  sellingPrice: number
  abcCategory: string
}

interface InventoryBatch {
  id: string
  sku: string
  quantity: number
  status: 'production' | 'transit' | 'customs' | 'ready' | 'delayed'
  location: string
  carrier?: string
  estimatedReadyDate: Date
  remarks?: string
  createdAt: Date
  updatedAt: Date
  daysInStatus: number
  progress: number
}

interface BatchFormData {
  sku: string
  quantity: number
  status: string
  location: string
  carrier: string
  estimatedReadyDate: string
  remarks: string
}

export default function MinimalForecastPage() {
  const [sampleSKUs, setSampleSKUs] = useState(initialSKUs)
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>(['6LD'])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSelectionDialog, setShowSelectionDialog] = useState(false)
  const [editingSKU, setEditingSKU] = useState<any>(null)
  const [activeView, setActiveView] = useState<'dashboard' | 'sales-forecast' | 'inventory' | 'management' | null>('dashboard')
  const [inventoryView, setInventoryView] = useState<'summary' | 'movement' | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(productGroups.map(g => g.id))
  const [comparisonMode, setComparisonMode] = useState<'none' | 'groups' | 'skus'>('none')
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [editingBatch, setEditingBatch] = useState<any>(null)
  const [batchSearchTerm, setBatchSearchTerm] = useState('')
  const [batchStatusFilter, setBatchStatusFilter] = useState<string>('all')
  const [batchSKUFilter, setBatchSKUFilter] = useState<string>('all')
  const [formData, setFormData] = useState<SKUFormData>({
    sku: '',
    displayName: '',
    category: 'Electronics',
    productGroup: 'pg-electronics',
    status: 'healthy',
    totalForecast: 0,
    currentStock: 0,
    leadTime: 14,
    reorderPoint: 0,
    costPrice: 0,
    sellingPrice: 0,
    abcCategory: 'B'
  })
  
  const [batchFormData, setBatchFormData] = useState<BatchFormData>({
    sku: '',
    quantity: 0,
    status: 'production',
    location: '',
    carrier: '',
    estimatedReadyDate: '',
    remarks: ''
  })
  
  // Sample inventory batches
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([
    {
      id: 'INV-12',
      sku: '6LD',
      quantity: 750,
      status: 'production',
      location: 'Factory',
      estimatedReadyDate: new Date('2024-08-10'),
      createdAt: new Date('2024-07-01'),
      updatedAt: new Date('2024-07-15'),
      daysInStatus: 15,
      progress: 25
    },
    {
      id: 'INV-11',
      sku: '6ST',
      quantity: 1200,
      status: 'transit',
      location: 'Pacific Ocean',
      carrier: 'MSC',
      estimatedReadyDate: new Date('2024-07-29'),
      createdAt: new Date('2024-06-15'),
      updatedAt: new Date('2024-07-10'),
      daysInStatus: 12,
      progress: 60
    },
    {
      id: 'INV-10',
      sku: '6LD',
      quantity: 500,
      status: 'transit',
      location: 'Indian Ocean',
      carrier: 'OOCL',
      estimatedReadyDate: new Date('2024-07-15'),
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-07-01'),
      daysInStatus: 20,
      progress: 75
    },
    {
      id: 'INV-9',
      sku: '3LD-CS008',
      quantity: 800,
      status: 'customs',
      location: 'UK Port',
      carrier: 'MSC',
      estimatedReadyDate: new Date('2024-07-08'),
      createdAt: new Date('2024-05-20'),
      updatedAt: new Date('2024-07-05'),
      daysInStatus: 3,
      progress: 90
    },
    {
      id: 'INV-8',
      sku: '6LD',
      quantity: 650,
      status: 'ready',
      location: 'UK Warehouse',
      estimatedReadyDate: new Date('2024-05-25'),
      remarks: 'OOS Week',
      createdAt: new Date('2024-04-10'),
      updatedAt: new Date('2024-05-25'),
      daysInStatus: 45,
      progress: 100
    }
  ])
  
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


  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    )
  }

  const selectAllInGroup = (groupId: string) => {
    const groupSKUs = sampleSKUs.filter(s => s.productGroup === groupId).map(s => s.sku)
    setSelectedSKUs(prev => Array.from(new Set([...prev, ...groupSKUs])))
  }

  const deselectAllInGroup = (groupId: string) => {
    const groupSKUs = sampleSKUs.filter(s => s.productGroup === groupId).map(s => s.sku)
    setSelectedSKUs(prev => prev.filter(s => !groupSKUs.includes(s)))
  }

  const getGroupColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300',
      green: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300',
      purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300'
    }
    return colorMap[color] || colorMap.blue
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
      productGroup: 'pg-electronics',
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
        productGroup: skuData.productGroup,
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
                
                
                <div>
                  <button
                    onClick={() => {
                      setActiveView(activeView === 'inventory' ? null : 'inventory')
                      if (activeView !== 'inventory') {
                        setInventoryView(null)
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      activeView === 'inventory' 
                        ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Package className="h-4 w-4" />
                    Inventory
                  </button>
                  
                  {activeView === 'inventory' && (
                    <div className="ml-4 mt-1 space-y-1">
                      <button
                        onClick={() => setInventoryView('summary')}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                          inventoryView === 'summary'
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <ChevronRight className="h-3 w-3" />
                        View Summary
                      </button>
                      <button
                        onClick={() => setInventoryView('movement')}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                          inventoryView === 'movement'
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <ChevronRight className="h-3 w-3" />
                        View Movement
                      </button>
                    </div>
                  )}
                </div>
                
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
                  className="h-full overflow-y-auto"
                >
                  <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
                    <div className="max-w-7xl mx-auto p-6">
                      {/* Header */}
                      <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-8"
                      >
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Dashboard Overview
                        </h1>
                        <p className="text-gray-600 mt-2">Real-time insights into your inventory and forecasting performance</p>
                      </motion.div>

                      {/* Animated Hero Metrics */}
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                      >
                        {/* Revenue Metric */}
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="relative overflow-hidden"
                        >
                          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-emerald-100 text-sm font-medium">Monthly Revenue</p>
                                  <motion.p 
                                    className="text-3xl font-bold mt-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                  >
                                    $485,320
                                  </motion.p>
                                  <div className="flex items-center mt-2 text-emerald-100">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    <span className="text-sm">+12.5% from last month</span>
                                  </div>
                                </div>
                                <motion.div 
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                  className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center"
                                >
                                  <TrendingUp className="h-8 w-8" />
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        {/* Forecast Accuracy */}
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="relative overflow-hidden"
                        >
                          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-blue-100 text-sm font-medium">Forecast Accuracy</p>
                                  <motion.p 
                                    className="text-3xl font-bold mt-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring" }}
                                  >
                                    94.2%
                                  </motion.p>
                                  <div className="flex items-center mt-2 text-blue-100">
                                    <BarChart3 className="h-4 w-4 mr-1" />
                                    <span className="text-sm">Target: 90%</span>
                                  </div>
                                </div>
                                <motion.div 
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                  className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center"
                                >
                                  <BarChart3 className="h-8 w-8" />
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        {/* Inventory Health */}
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="relative overflow-hidden"
                        >
                          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-purple-100 text-sm font-medium">Inventory Health</p>
                                  <motion.p 
                                    className="text-3xl font-bold mt-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                  >
                                    {sampleSKUs.filter(s => s.status === 'healthy').length}/{sampleSKUs.length}
                                  </motion.p>
                                  <div className="flex items-center mt-2 text-purple-100">
                                    <Package className="h-4 w-4 mr-1" />
                                    <span className="text-sm">Healthy SKUs</span>
                                  </div>
                                </div>
                                <motion.div 
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                  className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center"
                                >
                                  <Package className="h-8 w-8" />
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        {/* Active SKUs */}
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="relative overflow-hidden"
                        >
                          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-orange-100 text-sm font-medium">Active SKUs</p>
                                  <motion.p 
                                    className="text-3xl font-bold mt-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.6, type: "spring" }}
                                  >
                                    {sampleSKUs.length}
                                  </motion.p>
                                  <div className="flex items-center mt-2 text-orange-100">
                                    <Settings className="h-4 w-4 mr-1" />
                                    <span className="text-sm">In management</span>
                                  </div>
                                </div>
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                  className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center"
                                >
                                  <Settings className="h-8 w-8" />
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>

                      {/* Real-time Inventory Pipeline */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                      >
                        <Card className="border-0 shadow-lg">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              >
                                <Settings className="h-5 w-5 text-blue-600" />
                              </motion.div>
                              Real-time Inventory Pipeline
                            </CardTitle>
                            <CardDescription>Live view of inventory movement and status</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {/* In Transit */}
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100"
                              >
                                <motion.div
                                  animate={{ x: [-10, 10, -10] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                  className="h-12 w-12 mx-auto mb-3 rounded-full bg-blue-500 flex items-center justify-center"
                                >
                                  <TrendingUp className="h-6 w-6 text-white" />
                                </motion.div>
                                <p className="text-2xl font-bold text-blue-600">1,247</p>
                                <p className="text-sm text-blue-600">Units in Transit</p>
                              </motion.div>

                              {/* Arriving Soon */}
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-center p-4 bg-green-50 rounded-lg border border-green-100"
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="h-12 w-12 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center"
                                >
                                  <Package className="h-6 w-6 text-white" />
                                </motion.div>
                                <p className="text-2xl font-bold text-green-600">892</p>
                                <p className="text-sm text-green-600">Arriving This Week</p>
                              </motion.div>

                              {/* Delayed */}
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-center p-4 bg-red-50 rounded-lg border border-red-100"
                              >
                                <motion.div
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="h-12 w-12 mx-auto mb-3 rounded-full bg-red-500 flex items-center justify-center"
                                >
                                  <BarChart3 className="h-6 w-6 text-white" />
                                </motion.div>
                                <p className="text-2xl font-bold text-red-600">156</p>
                                <p className="text-sm text-red-600">Delayed Shipments</p>
                              </motion.div>

                              {/* Total Inventory */}
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100"
                              >
                                <motion.div
                                  animate={{ y: [0, -3, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                                  className="h-12 w-12 mx-auto mb-3 rounded-full bg-purple-500 flex items-center justify-center"
                                >
                                  <Package className="h-6 w-6 text-white" />
                                </motion.div>
                                <p className="text-2xl font-bold text-purple-600">15,432</p>
                                <p className="text-sm text-purple-600">Total Units</p>
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Quick Actions & Alerts Grid */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                      >
                        {/* Quick Actions */}
                        <Card className="border-0 shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                            <CardDescription>Common tasks and operations</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <motion.button
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              onClick={() => setActiveView('sales-forecast')}
                            >
                              <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">Update Forecasts</span>
                              </div>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              onClick={() => setActiveView('inventory')}
                            >
                              <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-green-600" />
                                <span className="font-medium">Manage Inventory</span>
                              </div>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                              onClick={() => setActiveView('management')}
                            >
                              <div className="flex items-center gap-3">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                                <span className="font-medium">SKU Management</span>
                              </div>
                            </motion.button>
                          </CardContent>
                        </Card>

                        {/* Critical Alerts */}
                        <Card className="border-0 shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <BarChart3 className="h-5 w-5 text-red-600" />
                              </motion.div>
                              Critical Alerts
                            </CardTitle>
                            <CardDescription>Items requiring immediate attention</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {sampleSKUs
                                .filter(s => s.status === 'out-of-stock' || s.status === 'low-stock')
                                .slice(0, 3)
                                .map((sku, index) => (
                                  <motion.div
                                    key={sku.sku}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ x: 5 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer"
                                  >
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
                                  </motion.div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Top Performers */}
                        <Card className="border-0 shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                              >
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              </motion.div>
                              Top Performers
                            </CardTitle>
                            <CardDescription>Best selling SKUs this period</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {sampleSKUs
                                .sort((a, b) => b.totalForecast - a.totalForecast)
                                .slice(0, 3)
                                .map((sku, index) => (
                                  <motion.div
                                    key={sku.sku}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ x: -5 }}
                                    className="flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3">
                                      <motion.span 
                                        className="text-lg font-bold text-gray-400"
                                        whileHover={{ scale: 1.2, color: "#10b981" }}
                                      >
                                        #{index + 1}
                                      </motion.span>
                                      <div>
                                        <p className="text-sm font-medium">{sku.displayName}</p>
                                        <p className="text-xs text-gray-500">{formatNumber(sku.totalForecast)} units</p>
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      {sku.accuracy ? `${sku.accuracy}%` : 'N/A'}
                                    </Badge>
                                  </motion.div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Recent Activity Feed */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Card className="border-0 shadow-lg">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                              >
                                <Settings className="h-5 w-5 text-blue-600" />
                              </motion.div>
                              Recent Activity
                            </CardTitle>
                            <CardDescription>Latest updates and system activity</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {[
                                { action: "Forecast updated for 6LD", time: "2 minutes ago", type: "forecast" },
                                { action: "Low stock alert: 6ST", time: "15 minutes ago", type: "alert" },
                                { action: "Inventory restock: 3LD-CS008", time: "1 hour ago", type: "inventory" },
                                { action: "New SKU added: 12CDS-PRO", time: "3 hours ago", type: "sku" },
                                { action: "Weekly forecast review completed", time: "6 hours ago", type: "review" }
                              ].map((activity, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ x: -50, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                                    className={cn(
                                      "h-2 w-2 rounded-full",
                                      activity.type === 'alert' ? "bg-red-500" :
                                      activity.type === 'forecast' ? "bg-blue-500" :
                                      activity.type === 'inventory' ? "bg-green-500" :
                                      activity.type === 'sku' ? "bg-purple-500" :
                                      "bg-gray-500"
                                    )}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{activity.action}</p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
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
                    comparisonMode === 'none' ? (
                      <div className="h-full flex items-center justify-center bg-gray-50">
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="max-w-2xl w-full p-8"
                        >
                          <h2 className="text-2xl font-semibold text-center mb-8">Select View Type</h2>
                          <div className="grid grid-cols-2 gap-6">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setComparisonMode('skus')
                                setShowSelectionDialog(true)
                              }}
                              className="p-8 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all group"
                            >
                              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                              <h3 className="text-xl font-semibold mb-2">View by SKUs</h3>
                              <p className="text-gray-600">View individual product SKUs side by side</p>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setComparisonMode('groups')
                                setShowSelectionDialog(true)
                              }}
                              className="p-8 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all group"
                            >
                              <LayoutDashboard className="h-16 w-16 mx-auto mb-4 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
                              <h3 className="text-xl font-semibold mb-2">View by Groups</h3>
                              <p className="text-gray-600">View aggregated product groups</p>
                            </motion.button>
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <Tabs defaultValue="detailed" className="h-full flex flex-col">
                        <div className="bg-white border-b px-6 py-3">
                          <div className="flex items-center justify-between">
                            <TabsList className="h-9">
                              <TabsTrigger value="detailed" className="text-xs">Details</TabsTrigger>
                              <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                            </TabsList>
                            
                            {/* View Mode Controls */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">View by:</span>
                              <div className="flex gap-1">
                                <Button
                                  variant={comparisonMode === 'skus' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    setComparisonMode('skus')
                                    setShowSelectionDialog(true)
                                  }}
                                  className="h-7 text-xs px-2"
                                >
                                  Individual SKUs
                                </Button>
                                <Button
                                  variant={comparisonMode === 'groups' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    setComparisonMode('groups')
                                    setShowSelectionDialog(true)
                                  }}
                                  className="h-7 text-xs px-2"
                                >
                                  Product Groups
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <TabsContent value="detailed" className="flex-1 overflow-auto p-6 mt-0">
                        {comparisonMode === 'skus' ? (
                          <div className="overflow-x-auto">
                            <div className="flex gap-4 pb-4">
                              {selectedSKUs.map(skuId => {
                              const sku = sampleSKUs.find(s => s.sku === skuId)
                              if (!sku) return null
                              
                              const weeklyData = generateWeeklyData(sku)
                              
                              return (
                                <Card
                                  key={skuId}
                                  className="border-0 shadow-sm flex-shrink-0 w-[600px]"
                                >
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <CardTitle className="text-base">{sku.displayName}</CardTitle>
                                      <CardDescription className="text-xs">
                                        Weekly Forecast • {formatNumber(sku.totalForecast)} total units
                                      </CardDescription>
                                    </div>
                                    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(sku.status))}>
                                      {sku.status.replace('-', ' ')}
                                    </span>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                  <div className="overflow-y-auto max-h-[700px]">
                                    <Table>
                                      <TableHeader className="sticky top-0 bg-white z-10">
                                        <TableRow className="border-b-2">
                                          <TableHead className="w-20">Week</TableHead>
                                          <TableHead className="text-right">Forecast</TableHead>
                                          <TableHead className="text-right">Actual</TableHead>
                                          <TableHead className="text-right">Opening</TableHead>
                                          <TableHead className="text-right">Stock Movement</TableHead>
                                          <TableHead className="text-right">Closing</TableHead>
                                          <TableHead className="text-right">Cover</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {weeklyData.map((week, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell className="font-medium">{week.week}</TableCell>
                                              <TableCell className="text-right">{formatNumber(week.forecast)}</TableCell>
                                              <TableCell className="text-right">
                                                {week.actual ? formatNumber(week.actual) : '-'}
                                              </TableCell>
                                              <TableCell className="text-right text-gray-500">{formatNumber(week.openingStock)}</TableCell>
                                              <TableCell className="text-right">
                                                {(() => {
                                                  const netMovement = week.stockIn - week.stockOut
                                                  return (
                                                    <span className={cn(
                                                      "font-medium",
                                                      netMovement >= 0 ? "text-emerald-600" : "text-red-600"
                                                    )}>
                                                      {netMovement >= 0 ? '+' : ''}{formatNumber(netMovement)}
                                                    </span>
                                                  )
                                                })()}
                                              </TableCell>
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
                                  </CardContent>
                                </Card>
                              )
                              })}
                            </div>
                          </div>
                        ) : (
                          // Group Comparison View - Tables showing aggregated data
                          <div className="overflow-x-auto">
                            <div className="flex gap-4 pb-4">
                              {productGroups.map((group) => {
                                const groupSKUs = sampleSKUs.filter(s => s.productGroup === group.id && selectedSKUs.includes(s.sku))
                                if (groupSKUs.length === 0) return null
                                
                                // Generate aggregated weekly data for the group
                                const aggregatedWeeklyData = Array.from({ length: 52 }, (_, i) => {
                                  const weekNum = i + 1
                                  let totalForecast = 0
                                  let totalActual = 0
                                  let totalOpeningStock = 0
                                  let totalClosingStock = 0
                                  let totalStockIn = 0
                                  let totalStockOut = 0
                                  let hasActualData = false
                                  
                                  groupSKUs.forEach(sku => {
                                    const weekData = generateWeeklyData(sku).find(w => parseInt(w.week.substring(1)) === weekNum)
                                    if (weekData) {
                                      totalForecast += weekData.forecast
                                      if (weekData.actual !== null) {
                                        totalActual += weekData.actual
                                        hasActualData = true
                                      }
                                      totalOpeningStock += weekData.openingStock
                                      totalClosingStock += weekData.closingStock
                                      totalStockIn += weekData.stockIn
                                      totalStockOut += weekData.stockOut
                                    }
                                  })
                                  
                                  return {
                                    week: `W${weekNum.toString().padStart(2, '0')}`,
                                    forecast: totalForecast,
                                    actual: hasActualData ? totalActual : null,
                                    openingStock: totalOpeningStock,
                                    closingStock: totalClosingStock,
                                    stockIn: totalStockIn,
                                    stockOut: totalStockOut,
                                    movement: totalStockIn - totalStockOut
                                  }
                                })
                                
                                return (
                                  <Card key={group.id} className="border-0 shadow-sm flex-shrink-0 w-[600px]">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-base">{group.name} ({groupSKUs.length} SKUs)</CardTitle>
                                      <CardDescription className="text-xs">
                                        Total Forecast: {formatNumber(groupSKUs.reduce((sum, sku) => sum + sku.totalForecast, 0))} units
                                      </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                      <div className="overflow-y-auto max-h-[700px]">
                                        <Table className="text-sm">
                                          <TableHeader className="sticky top-0 bg-white z-10">
                                            <TableRow className="border-b-2">
                                              <TableHead className="text-xs px-2 py-1">Week</TableHead>
                                              <TableHead className="text-right text-xs px-2 py-1">Opening Stock</TableHead>
                                              <TableHead className="text-right text-xs px-2 py-1 text-blue-700">Forecast</TableHead>
                                              <TableHead className="text-right text-xs px-2 py-1 text-green-700">Actual</TableHead>
                                              <TableHead className="text-right text-xs px-2 py-1 text-purple-700">Movement</TableHead>
                                              <TableHead className="text-right text-xs px-2 py-1">Closing Stock</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {aggregatedWeeklyData.map((week, idx) => (
                                              <TableRow key={idx} className={cn("hover:bg-gray-50", idx % 2 === 1 && "bg-gray-50/50")}>
                                                <TableCell className="text-xs px-2 py-1 font-medium">{week.week}</TableCell>
                                                <TableCell className="text-right text-xs px-2 py-1">{formatNumber(week.openingStock)}</TableCell>
                                                <TableCell className="text-right text-xs px-2 py-1 font-medium text-blue-700">
                                                  {formatNumber(week.forecast)}
                                                </TableCell>
                                                <TableCell className="text-right text-xs px-2 py-1 font-medium text-green-700">
                                                  {week.actual !== null ? formatNumber(week.actual) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right text-xs px-2 py-1">
                                                  <span className={cn(
                                                    "font-medium inline-flex items-center gap-0.5",
                                                    week.movement >= 0 ? "text-purple-700" : "text-red-600"
                                                  )}>
                                                    {week.movement >= 0 ? '↑' : '↓'}{formatNumber(Math.abs(week.movement))}
                                                  </span>
                                                </TableCell>
                                                <TableCell className="text-right text-xs px-2 py-1">{formatNumber(week.closingStock)}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="analytics" className="flex-1 overflow-auto p-6 mt-0">
                        {comparisonMode === 'skus' ? (
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
                        ) : (
                          // Group Analytics
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {productGroups.map((group) => {
                              const groupSKUs = sampleSKUs.filter(s => s.productGroup === group.id && selectedSKUs.includes(s.sku))
                              if (groupSKUs.length === 0) return null
                              
                              // Generate aggregated chart data
                              const aggregatedChartData = Array.from({ length: 12 }, (_, i) => {
                                const weekNum = i + 1
                                let totalForecast = 0
                                let totalActual = 0
                                let totalStock = 0
                                let hasActualData = false
                                
                                groupSKUs.forEach(sku => {
                                  const weekData = generateWeeklyData(sku).find(w => parseInt(w.week.substring(1)) === weekNum)
                                  if (weekData) {
                                    totalForecast += weekData.forecast
                                    if (weekData.actual !== null) {
                                      totalActual += weekData.actual
                                      hasActualData = true
                                    }
                                    totalStock += weekData.closingStock
                                  }
                                })
                                
                                return {
                                  week: `W${weekNum.toString().padStart(2, '0')}`,
                                  forecast: totalForecast,
                                  actual: hasActualData ? totalActual : 0,
                                  stock: totalStock
                                }
                              })
                              
                              // Calculate group statistics
                              const totalGroupForecast = groupSKUs.reduce((sum, sku) => sum + sku.totalForecast, 0)
                              const totalGroupStock = groupSKUs.reduce((sum, sku) => sum + sku.currentStock, 0)
                              const avgWeeksCover = groupSKUs.reduce((sum, sku) => sum + sku.weeksCover, 0) / groupSKUs.length
                              
                              return (
                                <Card key={group.id} className="border-0 shadow-sm">
                                  <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                      <span className="text-sm font-medium">{group.name}</span>
                                      <Badge className="text-xs">
                                        {groupSKUs.length} SKUs
                                      </Badge>
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      Aggregated performance for {group.name}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="h-64">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={aggregatedChartData}>
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
                                        <p className="text-sm font-medium">{formatNumber(totalGroupForecast)}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500">Total Stock</p>
                                        <p className="text-sm font-medium">{formatNumber(totalGroupStock)}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500">Avg Weeks Cover</p>
                                        <p className="text-sm font-medium">{avgWeeksCover.toFixed(1)}w</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                    )
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
              ) : activeView === 'inventory' ? (
                inventoryView === null ? (
                  <motion.div
                    key="inventory-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex items-center justify-center"
                  >
                    <div className="text-center">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 bg-clip-text text-transparent animate-gradient bg-300% bg-animated">
                        Inventory Management
                      </h3>
                      <p className="text-sm text-gray-500">Select an option from the sidebar to view inventory details</p>
                    </div>
                  </motion.div>
                ) : inventoryView === 'summary' ? (
                  <motion.div
                    key="inventory-summary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full overflow-y-auto"
                  >
                    <div className="p-6">
                      <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl font-semibold mb-6">Inventory Summary</h2>
                    
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
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="inventory-movement"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full overflow-y-auto"
                  >
                    <div className="p-6">
                      <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-semibold">Inventory Movement</h2>
                          <Button onClick={() => {
                            setBatchFormData({
                              sku: '',
                              quantity: 0,
                              status: 'production',
                              location: '',
                              carrier: '',
                              estimatedReadyDate: '',
                              remarks: ''
                            })
                            setEditingBatch(null)
                            setShowBatchDialog(true)
                          }} size="sm" className="h-9">
                            <Plus className="h-4 w-4 mr-1.5" />
                            Add New Batch
                          </Button>
                        </div>
                        
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-gray-600">Total In Transit</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold text-blue-600">
                                {formatNumber(inventoryBatches.filter(b => b.status === 'transit').reduce((sum, b) => sum + b.quantity, 0))}
                              </p>
                              <p className="text-xs text-gray-500">units on the way</p>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-gray-600">Arriving &lt; 7d</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold text-green-600">
                                {formatNumber(inventoryBatches.filter(b => {
                                  const daysUntil = Math.ceil((b.estimatedReadyDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                  return daysUntil <= 7 && daysUntil > 0 && b.status !== 'ready'
                                }).reduce((sum, b) => sum + b.quantity, 0))}
                              </p>
                              <p className="text-xs text-gray-500">units arriving soon</p>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-gray-600">Delayed Batches</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold text-red-600">
                                {inventoryBatches.filter(b => b.status === 'delayed' || (b.estimatedReadyDate < new Date() && b.status !== 'ready')).length}
                              </p>
                              <p className="text-xs text-gray-500">need attention</p>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-gray-600">Total Units</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {formatNumber(inventoryBatches.reduce((sum, b) => sum + b.quantity, 0))}
                              </p>
                              <p className="text-xs text-gray-500">in pipeline</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Filters */}
                        <Card className="border-0 shadow-sm mb-6">
                          <CardContent className="p-4">
                            <div className="flex flex-wrap gap-4">
                              <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    placeholder="Search batch ID, SKU..."
                                    value={batchSearchTerm}
                                    onChange={(e) => setBatchSearchTerm(e.target.value)}
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                              
                              <Select value={batchStatusFilter} onValueChange={setBatchStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                  <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Status</SelectItem>
                                  <SelectItem value="production">In Production</SelectItem>
                                  <SelectItem value="transit">In Transit</SelectItem>
                                  <SelectItem value="customs">Customs</SelectItem>
                                  <SelectItem value="ready">Ready Stock</SelectItem>
                                  <SelectItem value="delayed">Delayed</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Select value={batchSKUFilter} onValueChange={setBatchSKUFilter}>
                                <SelectTrigger className="w-[160px]">
                                  <SelectValue placeholder="Filter by SKU" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All SKUs</SelectItem>
                                  {sampleSKUs.map(sku => (
                                    <SelectItem key={sku.sku} value={sku.sku}>{sku.displayName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Movement Table */}
                        <Card className="border-0 shadow-sm">
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>PO / Batch ID</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Product (SKU)</TableHead>
                                    <TableHead className="text-center">Qty</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Location / Carrier</TableHead>
                                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => {
                                      // Sort by date logic here
                                    }}>
                                      Est. Ready Date ▼
                                    </TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {inventoryBatches
                                    .filter(batch => {
                                      const matchesSearch = batchSearchTerm === '' || 
                                        batch.id.toLowerCase().includes(batchSearchTerm.toLowerCase()) ||
                                        batch.sku.toLowerCase().includes(batchSearchTerm.toLowerCase())
                                      const matchesStatus = batchStatusFilter === 'all' || batch.status === batchStatusFilter
                                      const matchesSKU = batchSKUFilter === 'all' || batch.sku === batchSKUFilter
                                      return matchesSearch && matchesStatus && matchesSKU
                                    })
                                    .sort((a, b) => a.estimatedReadyDate.getTime() - b.estimatedReadyDate.getTime())
                                    .map((batch) => {
                                      const sku = sampleSKUs.find(s => s.sku === batch.sku)
                                      const statusConfig = {
                                        production: { color: 'bg-blue-100 text-blue-700', icon: '🔵', label: 'In Production' },
                                        transit: { color: 'bg-orange-100 text-orange-700', icon: '🟠', label: 'In Transit' },
                                        customs: { color: 'bg-yellow-100 text-yellow-700', icon: '🟡', label: 'Arrived / Customs' },
                                        ready: { color: 'bg-green-100 text-green-700', icon: '🟢', label: 'Ready Stock' },
                                        delayed: { color: 'bg-red-100 text-red-700', icon: '🔴', label: 'Delayed' }
                                      }
                                      const status = statusConfig[batch.status]
                                      const isDelayed = batch.estimatedReadyDate < new Date() && batch.status !== 'ready'
                                      
                                      return (
                                        <TableRow key={batch.id}>
                                          <TableCell>
                                            <button className="font-medium text-blue-600 hover:underline">
                                              {batch.id}
                                            </button>
                                          </TableCell>
                                          <TableCell>
                                            <div className="w-20">
                                              <div className="bg-gray-200 rounded-full h-2">
                                                <div 
                                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                  style={{ width: `${batch.progress}%` }}
                                                />
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell>{sku?.displayName || batch.sku}</TableCell>
                                          <TableCell className="text-center font-medium">{formatNumber(batch.quantity)}</TableCell>
                                          <TableCell>
                                            <Badge className={cn("text-xs", status.color)}>
                                              <span className="mr-1">{status.icon}</span>
                                              {status.label}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            <span className={cn(
                                              "text-sm",
                                              batch.daysInStatus > 10 && batch.status !== 'ready' && "text-amber-600 font-medium"
                                            )}>
                                              {batch.daysInStatus}d
                                              {batch.daysInStatus > 10 && batch.status !== 'ready' && ' ⚠️'}
                                            </span>
                                          </TableCell>
                                          <TableCell>
                                            <div>
                                              <p className="font-medium">{batch.location}</p>
                                              {batch.carrier && (
                                                <p className="text-xs text-gray-500">{batch.carrier}</p>
                                              )}
                                            </div>
                                          </TableCell>
                                          <TableCell className={cn(isDelayed && "text-red-600 font-medium")}>
                                            {batch.estimatedReadyDate.toLocaleDateString()}
                                            {isDelayed && ' ⚠️'}
                                          </TableCell>
                                          <TableCell className="text-sm text-gray-600">
                                            {batch.remarks || '-'}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                  setEditingBatch(batch)
                                                  setBatchFormData({
                                                    sku: batch.sku,
                                                    quantity: batch.quantity,
                                                    status: batch.status,
                                                    location: batch.location,
                                                    carrier: batch.carrier || '',
                                                    estimatedReadyDate: batch.estimatedReadyDate.toISOString().split('T')[0],
                                                    remarks: batch.remarks || ''
                                                  })
                                                  setShowBatchDialog(true)
                                                }}
                                                className="h-8 w-8 p-0"
                                              >
                                                <Edit2 className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                  if (confirm('Are you sure you want to delete this batch?')) {
                                                    setInventoryBatches(prev => prev.filter(b => b.id !== batch.id))
                                                    toast.success('Batch deleted successfully')
                                                  }
                                                }}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </div>
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
                    </div>
                  </motion.div>
                )
              ) : activeView === 'management' ? (
                <motion.div
                  key="management"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-semibold">SKU Management</h2>
                          <p className="text-sm text-gray-500">Manage all SKUs and product groups</p>
                        </div>
                        <Button onClick={handleAddSKU} size="sm" className="h-9">
                          <Plus className="h-4 w-4 mr-1.5" />
                          Add SKU
                        </Button>
                      </div>
                    </div>
                  
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-0">
                        <Tabs defaultValue="skus" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-gray-50 rounded-none border-b">
                            <TabsTrigger value="skus" className="data-[state=active]:bg-white">All SKUs</TabsTrigger>
                            <TabsTrigger value="groups" className="data-[state=active]:bg-white">Product Groups</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="skus" className="mt-0">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Product Group</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead className="text-right">Lead Time</TableHead>
                                    <TableHead className="text-right">Reorder Pt</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {sampleSKUs.map((sku) => (
                                    <TableRow key={sku.sku}>
                                      <TableCell className="font-medium">{sku.sku}</TableCell>
                                      <TableCell>{sku.displayName}</TableCell>
                                      <TableCell>
                                        {productGroups.find(g => g.id === sku.productGroup)?.name || sku.productGroup}
                                      </TableCell>
                                      <TableCell>{sku.category}</TableCell>
                                      <TableCell>
                                        <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(sku.status))}>
                                          {sku.status.replace('-', ' ')}
                                        </span>
                                      </TableCell>
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
                          
                          <TabsContent value="groups" className="mt-0">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Group Name</TableHead>
                                    <TableHead>SKU Count</TableHead>
                                    <TableHead className="text-right">Total Stock</TableHead>
                                    <TableHead className="text-right">Total Forecast</TableHead>
                                    <TableHead>Status Overview</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {productGroups.map((group) => {
                                    const groupSKUs = sampleSKUs.filter(sku => sku.productGroup === group.id)
                                    const totalStock = groupSKUs.reduce((sum, sku) => sum + sku.currentStock, 0)
                                    const totalForecast = groupSKUs.reduce((sum, sku) => sum + sku.totalForecast, 0)
                                    const statusCounts = {
                                      healthy: groupSKUs.filter(s => s.status === 'healthy').length,
                                      'low-stock': groupSKUs.filter(s => s.status === 'low-stock').length,
                                      'out-of-stock': groupSKUs.filter(s => s.status === 'out-of-stock').length,
                                      overstocked: groupSKUs.filter(s => s.status === 'overstocked').length
                                    }
                                    
                                    return (
                                      <TableRow key={group.id}>
                                        <TableCell className="font-medium">{group.name}</TableCell>
                                        <TableCell>{groupSKUs.length}</TableCell>
                                        <TableCell className="text-right">{formatNumber(totalStock)}</TableCell>
                                        <TableCell className="text-right">{formatNumber(totalForecast)}</TableCell>
                                        <TableCell>
                                          <div className="flex gap-2">
                                            {statusCounts.healthy > 0 && (
                                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                {statusCounts.healthy} healthy
                                              </Badge>
                                            )}
                                            {statusCounts['low-stock'] > 0 && (
                                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                                {statusCounts['low-stock']} low
                                              </Badge>
                                            )}
                                            {statusCounts['out-of-stock'] > 0 && (
                                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                                {statusCounts['out-of-stock']} out
                                              </Badge>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ) : (
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
                <Label htmlFor="productGroup" className="text-sm">Product Group</Label>
                <Select value={formData.productGroup} onValueChange={(value) => setFormData({ ...formData, productGroup: value })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
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

      {/* Selection Dialog */}
      <Dialog open={showSelectionDialog} onOpenChange={setShowSelectionDialog}>
        <DialogContent className="max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {comparisonMode === 'skus' ? 'Select SKUs to View' : 'Select Product Groups to View'}
            </DialogTitle>
            <DialogDescription>
              {comparisonMode === 'skus' 
                ? 'Choose individual SKUs to view their forecasts side by side' 
                : 'Select product groups to view aggregated forecasts'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <AnimatePresence mode="wait">
              {comparisonMode === 'skus' ? (
                <motion.div
                  key="skus"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                <div className="flex items-center justify-between mb-4">
                  <div className="relative flex-1 mr-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search SKUs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedSKUs.length === filteredSKUs.length) {
                        setSelectedSKUs([])
                      } else {
                        setSelectedSKUs(filteredSKUs.map(s => s.sku))
                      }
                    }}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {selectedSKUs.length === filteredSKUs.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 scroll-smooth">
                  {productGroups.map((group) => {
                    const groupSKUs = filteredSKUs.filter(sku => sku.productGroup === group.id)
                    if (groupSKUs.length === 0) return null
                    
                    return (
                      <div key={group.id} className="space-y-2">
                        <div className="flex items-center justify-between px-2">
                          <h3 className="font-medium text-sm">{group.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => {
                              const groupSkuIds = groupSKUs.map(s => s.sku)
                              const allSelected = groupSkuIds.every(id => selectedSKUs.includes(id))
                              if (allSelected) {
                                setSelectedSKUs(prev => prev.filter(id => !groupSkuIds.includes(id)))
                              } else {
                                setSelectedSKUs(prev => Array.from(new Set([...prev, ...groupSkuIds])))
                              }
                            }}
                          >
                            {groupSKUs.every(s => selectedSKUs.includes(s.sku)) ? 'Deselect Group' : 'Select Group'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pl-4">
                          {groupSKUs.map((sku) => (
                            <label
                              key={sku.sku}
                              className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-sm"
                            >
                              <Checkbox
                                checked={selectedSKUs.includes(sku.sku)}
                                onCheckedChange={() => toggleSKU(sku.sku)}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{sku.displayName}</p>
                                <p className="text-xs text-gray-500">{sku.sku}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="groups"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-2"
              >
                {productGroups.map((group) => {
                  const groupSKUs = sampleSKUs.filter(sku => sku.productGroup === group.id)
                  const isSelected = groupSKUs.some(sku => selectedSKUs.includes(sku.sku))
                  
                  return (
                    <label
                      key={group.id}
                      className="flex items-center gap-3 p-3 rounded border hover:bg-gray-50 hover:border-purple-300 cursor-pointer transition-all duration-200 hover:shadow-sm"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const groupSkuIds = groupSKUs.map(s => s.sku)
                          if (checked) {
                            setSelectedSKUs(prev => Array.from(new Set([...prev, ...groupSkuIds])))
                          } else {
                            setSelectedSKUs(prev => prev.filter(id => !groupSkuIds.includes(id)))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-gray-500">{groupSKUs.length} SKUs</p>
                      </div>
                    </label>
                  )
                })}
              </motion.div>
            )}
            </AnimatePresence>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSelectionDialog(false)}
              className="transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowSelectionDialog(false)}
              className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Apply Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Batch Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBatch ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
            <DialogDescription>
              {editingBatch ? 'Update batch information' : 'Enter details for the new inventory batch'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batch-sku" className="text-sm">SKU</Label>
                <Select value={batchFormData.sku} onValueChange={(value) => setBatchFormData({ ...batchFormData, sku: value })}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select SKU" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleSKUs.map(sku => (
                      <SelectItem key={sku.sku} value={sku.sku}>{sku.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batch-quantity" className="text-sm">Quantity</Label>
                <Input
                  id="batch-quantity"
                  type="number"
                  value={batchFormData.quantity}
                  onChange={(e) => setBatchFormData({ ...batchFormData, quantity: parseInt(e.target.value) || 0 })}
                  className="h-9"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batch-status" className="text-sm">Status</Label>
                <Select value={batchFormData.status} onValueChange={(value) => setBatchFormData({ ...batchFormData, status: value })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">🔵 In Production</SelectItem>
                    <SelectItem value="transit">🟠 In Transit</SelectItem>
                    <SelectItem value="customs">🟡 Arrived / Customs</SelectItem>
                    <SelectItem value="ready">🟢 Ready Stock</SelectItem>
                    <SelectItem value="delayed">🔴 Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batch-date" className="text-sm">Est. Ready Date</Label>
                <Input
                  id="batch-date"
                  type="date"
                  value={batchFormData.estimatedReadyDate}
                  onChange={(e) => setBatchFormData({ ...batchFormData, estimatedReadyDate: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batch-location" className="text-sm">Location</Label>
                <Input
                  id="batch-location"
                  value={batchFormData.location}
                  onChange={(e) => setBatchFormData({ ...batchFormData, location: e.target.value })}
                  className="h-9"
                  placeholder="e.g., Factory, UK Port"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batch-carrier" className="text-sm">Carrier (optional)</Label>
                <Input
                  id="batch-carrier"
                  value={batchFormData.carrier}
                  onChange={(e) => setBatchFormData({ ...batchFormData, carrier: e.target.value })}
                  className="h-9"
                  placeholder="e.g., MSC, OOCL"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="batch-remarks" className="text-sm">Remarks (optional)</Label>
              <Input
                id="batch-remarks"
                value={batchFormData.remarks}
                onChange={(e) => setBatchFormData({ ...batchFormData, remarks: e.target.value })}
                className="h-9"
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchDialog(false)} size="sm">
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingBatch) {
                // Update existing batch
                setInventoryBatches(prev => prev.map(b => 
                  b.id === editingBatch.id 
                    ? {
                        ...b,
                        sku: batchFormData.sku,
                        quantity: batchFormData.quantity,
                        status: batchFormData.status as any,
                        location: batchFormData.location,
                        carrier: batchFormData.carrier,
                        estimatedReadyDate: new Date(batchFormData.estimatedReadyDate),
                        remarks: batchFormData.remarks,
                        updatedAt: new Date()
                      }
                    : b
                ))
                toast.success('Batch updated successfully')
              } else {
                // Add new batch
                const newBatch: InventoryBatch = {
                  id: `INV-${Date.now().toString().slice(-3)}`,
                  sku: batchFormData.sku,
                  quantity: batchFormData.quantity,
                  status: batchFormData.status as any,
                  location: batchFormData.location,
                  carrier: batchFormData.carrier,
                  estimatedReadyDate: new Date(batchFormData.estimatedReadyDate),
                  remarks: batchFormData.remarks,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  daysInStatus: 0,
                  progress: batchFormData.status === 'production' ? 25 : 
                           batchFormData.status === 'transit' ? 60 :
                           batchFormData.status === 'customs' ? 90 :
                           batchFormData.status === 'ready' ? 100 : 0
                }
                setInventoryBatches(prev => [...prev, newBatch])
                toast.success('Batch added successfully')
              }
              setShowBatchDialog(false)
            }} size="sm">
              {editingBatch ? 'Update Batch' : 'Add Batch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}