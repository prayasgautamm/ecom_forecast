'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { skuForecasts, getAllSKUs, getSKUsByIds, SKUForecast } from '@/lib/forecast-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { EditableCell } from '@/components/ui/editable-cell'
import { Search, Filter, Download, RefreshCw, TrendingUp, Package, AlertCircle, CheckCircle2, TableIcon, LineChartIcon, BarChart3Icon, ChevronDown, ChevronRight, Plus, Trash2, Eye, Minus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function ForecastPage() {
  const allSKUs = getAllSKUs()
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>([allSKUs[0].sku])
  const [viewMode, setViewMode] = useState<'summary' | 'table' | 'chart'>('table')
  const [forecastData, setForecastData] = useState<SKUForecast[]>(skuForecasts)
  const [searchTerm, setSearchTerm] = useState('')
  const [isViewSKUsOpen, setIsViewSKUsOpen] = useState(true)
  const [isAddSKUOpen, setIsAddSKUOpen] = useState(false)
  const [isDeleteSKUOpen, setIsDeleteSKUOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{sku: string, weekIndex: number} | null>(null)
  const [focusedCell, setFocusedCell] = useState<{sku: string, rowIndex: number, columnIndex: number} | null>(null)
  
  const handleSKUToggle = (sku: string) => {
    setSelectedSKUs(prev => 
      prev.includes(sku) 
        ? prev.filter(s => s !== sku)
        : [...prev, sku]
    )
  }

  const handleSelectAll = () => {
    setSelectedSKUs(allSKUs.map(s => s.sku))
  }

  const handleClearAll = () => {
    setSelectedSKUs([])
  }

  const handleForecastUpdate = (sku: string, dateIndex: number, newValue: number) => {
    setForecastData(prev => 
      prev.map(item => 
        item.sku === sku 
          ? {
              ...item,
              data: item.data.map((d, idx) => {
                if (idx === dateIndex) {
                  const updatedData = { ...d, forecast: newValue }
                  updatedData.final = d.actual || newValue
                  if (d.actual) {
                    updatedData.errorPercent = ((newValue - d.actual) / d.actual) * 100
                  }
                  return updatedData
                }
                return d
              })
            }
          : item
      )
    )
  }

  const handleCellUpdate = (sku: string, dateIndex: number, field: string, newValue: number) => {
    setForecastData(prev => 
      prev.map(item => 
        item.sku === sku 
          ? {
              ...item,
              data: item.data.map((d, idx) => {
                if (idx === dateIndex) {
                  const updatedData = { ...d, [field]: newValue }
                  // Recalculate dependent fields
                  if (field === 'forecast' || field === 'actual') {
                    updatedData.final = updatedData.actual || updatedData.forecast
                    if (updatedData.actual && updatedData.forecast) {
                      updatedData.errorPercent = ((updatedData.forecast - updatedData.actual) / updatedData.actual) * 100
                    }
                  }
                  return updatedData
                }
                return d
              })
            }
          : item
      )
    )
  }


  const handleDeleteWeek = (sku: string, weekIndex: number) => {
    setDeleteConfirm({ sku, weekIndex })
  }

  const confirmDeleteWeek = () => {
    if (!deleteConfirm) return
    
    setForecastData(prev => 
      prev.map(item => 
        item.sku === deleteConfirm.sku 
          ? {
              ...item,
              data: item.data.filter((_, index) => index !== deleteConfirm.weekIndex)
            }
          : item
      )
    )
    setDeleteConfirm(null)
  }

  const filteredSKUs = allSKUs.filter(sku => 
    sku.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedData = forecastData.filter(item => selectedSKUs.includes(item.sku))

  // Keyboard navigation
  const handleKeyNavigation = useCallback((e: KeyboardEvent) => {
    if (!focusedCell || viewMode !== 'table') return
    
    const { sku, rowIndex, columnIndex } = focusedCell
    const skuIndex = selectedData.findIndex(item => item.sku === sku)
    const currentSku = selectedData[skuIndex]
    
    if (!currentSku) return
    
    let newSku = sku
    let newRowIndex = rowIndex
    let newColumnIndex = columnIndex
    
    // Define editable columns (excluding Week and Delete columns)
    const editableColumns = ['stock3PLFBA', 'stockWeeks', 'forecast', 'actual', 'final', 'stockOut', 'stockIn']
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        if (newRowIndex > 0) {
          newRowIndex--
        } else if (skuIndex > 0) {
          // Move to previous SKU, last row
          newSku = selectedData[skuIndex - 1].sku
          newRowIndex = selectedData[skuIndex - 1].data.length - 1
        }
        break
        
      case 'ArrowDown':
        e.preventDefault()
        if (newRowIndex < currentSku.data.length - 1) {
          newRowIndex++
        } else if (skuIndex < selectedData.length - 1) {
          // Move to next SKU, first row
          newSku = selectedData[skuIndex + 1].sku
          newRowIndex = 0
        }
        break
        
      case 'ArrowLeft':
        e.preventDefault()
        if (newColumnIndex > 0) {
          newColumnIndex--
        }
        break
        
      case 'ArrowRight':
        e.preventDefault()
        if (newColumnIndex < editableColumns.length - 1) {
          newColumnIndex++
        }
        break
        
      case 'Tab':
        e.preventDefault()
        if (e.shiftKey) {
          // Shift+Tab - move backward
          if (newColumnIndex > 0) {
            newColumnIndex--
          } else if (newRowIndex > 0) {
            newColumnIndex = editableColumns.length - 1
            newRowIndex--
          } else if (skuIndex > 0) {
            newSku = selectedData[skuIndex - 1].sku
            newRowIndex = selectedData[skuIndex - 1].data.length - 1
            newColumnIndex = editableColumns.length - 1
          }
        } else {
          // Tab - move forward
          if (newColumnIndex < editableColumns.length - 1) {
            newColumnIndex++
          } else if (newRowIndex < currentSku.data.length - 1) {
            newColumnIndex = 0
            newRowIndex++
          } else if (skuIndex < selectedData.length - 1) {
            newSku = selectedData[skuIndex + 1].sku
            newRowIndex = 0
            newColumnIndex = 0
          }
        }
        break
        
      case 'Enter':
        e.preventDefault()
        // Focus the current cell for editing
        const cellId = `cell-${newSku}-${newRowIndex}-${newColumnIndex}`
        const cellElement = document.getElementById(cellId)
        if (cellElement) {
          cellElement.click()
        }
        break
        
      default:
        return
    }
    
    setFocusedCell({ sku: newSku, rowIndex: newRowIndex, columnIndex: newColumnIndex })
  }, [focusedCell, selectedData, viewMode])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyNavigation)
    return () => {
      document.removeEventListener('keydown', handleKeyNavigation)
    }
  }, [handleKeyNavigation])

  // Initialize focus on first cell when switching to table view
  useEffect(() => {
    if (viewMode === 'table' && selectedData.length > 0 && !focusedCell) {
      setFocusedCell({ sku: selectedData[0].sku, rowIndex: 0, columnIndex: 0 })
    }
  }, [viewMode, selectedData, focusedCell])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/20">
      <div className="flex h-screen">
        {/* Left Sidebar - SKU Management */}
        <div className="w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto shadow-xl">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">SKU Management</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your inventory items
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* View SKUs Section */}
            <Collapsible open={isViewSKUsOpen} onOpenChange={setIsViewSKUsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-semibold">View SKUs</span>
                  </div>
                  {isViewSKUsOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3 w-3 text-gray-400" />
                  <Input 
                    placeholder="Search SKUs..." 
                    className="pl-9 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* SKU List */}
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {filteredSKUs.map(sku => {
                    const isSelected = selectedSKUs.includes(sku.sku)
                    
                    return (
                      <div 
                        key={sku.sku} 
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-150 cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                        }`}
                        onClick={() => handleSKUToggle(sku.sku)}
                      >
                        <Checkbox
                          id={sku.sku}
                          checked={isSelected}
                          onCheckedChange={() => handleSKUToggle(sku.sku)}
                          className="h-4 w-4 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                        <label
                          htmlFor={sku.sku}
                          className="text-xs font-medium cursor-pointer flex-1"
                        >
                          {sku.displayName}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Add New SKU Section */}
            <Collapsible open={isAddSKUOpen} onOpenChange={setIsAddSKUOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-semibold">Insert New SKU</span>
                  </div>
                  {isAddSKUOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4">
                <div className="space-y-4">
                  <Input 
                    placeholder="SKU Code (e.g., 12LD)" 
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <Input 
                    placeholder="Display Name (e.g., 12 LD)" 
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add SKU
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Delete SKU Section */}
            <Collapsible open={isDeleteSKUOpen} onOpenChange={setIsDeleteSKUOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Trash2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-semibold">Delete SKU</span>
                  </div>
                  {isDeleteSKUOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select SKUs to delete. This action cannot be undone.
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allSKUs.map(sku => (
                      <div 
                        key={sku.sku} 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <span className="text-sm font-medium">{sku.displayName}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Stats Footer */}
          {selectedData.length > 0 && (
            <div className="p-6 pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-semibold text-base mb-3">Quick Stats</p>
                <div className="flex justify-between">
                  <span>Selected:</span>
                  <span className="font-medium">{selectedSKUs.length} SKUs</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Forecast:</span>
                  <span className="font-medium">{selectedData.reduce((sum, sku) => 
                    sum + sku.data.reduce((s, d) => s + d.forecast, 0), 0
                  ).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Error:</span>
                  <span className="font-medium">{(() => {
                    const errors = selectedData.flatMap(sku => 
                      sku.data.filter(d => d.errorPercent !== null).map(d => Math.abs(d.errorPercent!))
                    )
                    return errors.length > 0 
                      ? (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(1) + '%'
                      : 'N/A'
                  })()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Forecast Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Real-time inventory insights and predictions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-3 w-3" />
                    Export
                  </Button>
                </div>
              </div>
              
              {/* Quick Stats */}
              {selectedData.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <Card className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Forecast</p>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                          {selectedData.reduce((sum, sku) => 
                            sum + sku.data.reduce((s, d) => s + d.forecast, 0), 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Actual</p>
                        <p className="text-lg font-bold text-green-700 dark:text-green-400">
                          {selectedData.reduce((sum, sku) => 
                            sum + sku.data.reduce((s, d) => s + (d.actual || 0), 0), 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Stock Weeks</p>
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                          {(() => {
                            const latestStocks = selectedData.map(sku => 
                              sku.data[sku.data.length - 1]?.stockWeeks || 0
                            )
                            return latestStocks.length > 0 
                              ? (latestStocks.reduce((a, b) => a + b, 0) / latestStocks.length).toFixed(1)
                              : '0'
                          })()}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Error</p>
                        <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                          {(() => {
                            const errors = selectedData.flatMap(sku => 
                              sku.data.filter(d => d.errorPercent !== null).map(d => Math.abs(d.errorPercent!))
                            )
                            return errors.length > 0 
                              ? (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(1) + '%'
                              : 'N/A'
                          })()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {selectedData.length === 0 ? (
              <Card className="p-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl">
                <CardContent className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No SKUs Selected</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Select one or more SKUs from the sidebar to view their forecast data and analytics
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'summary' | 'table' | 'chart')}>
                <div className="flex justify-center mb-6">
                  <TabsList className="h-10 p-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
                    <TabsTrigger value="summary" className="px-4 h-8 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                      <BarChart3Icon className="w-4 h-4 mr-1.5" />
                      Summary
                    </TabsTrigger>
                    <TabsTrigger value="table" className="px-4 h-8 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                      <TableIcon className="w-4 h-4 mr-1.5" />
                      Detailed View
                    </TabsTrigger>
                    <TabsTrigger value="chart" className="px-4 h-8 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                      <LineChartIcon className="w-4 h-4 mr-1.5" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="table" className="space-y-6">
                  {selectedData.map(sku => (
                    <Card key={sku.sku} className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-indigo-200 dark:border-indigo-800">
                        <CardTitle className="text-xl flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          {sku.displayName}
                        </CardTitle>
                        <CardDescription>
                          Weekly forecast data with all inventory metrics
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-auto max-h-[500px]">
                          <Table className="border-collapse">
                            <TableHeader className="sticky top-0 z-10">
                              <TableRow className="border-b-2 border-gray-300 dark:border-gray-600">
                                <TableHead className="font-bold text-xs bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 sticky left-0 z-20">Week</TableHead>
                                <TableHead className="font-bold text-xs bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-12"></TableHead>
                                <TableHead className="text-center font-bold text-xs bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-w-[120px]">Stock (3PL+FBA)</TableHead>
                                <TableHead className="text-center font-bold text-xs bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-w-[100px]">Stock (Weeks)</TableHead>
                                <TableHead className="text-center font-bold text-xs bg-blue-100 dark:bg-blue-900 border-r border-gray-200 dark:border-gray-700 min-w-[100px]">Forecast</TableHead>
                                <TableHead className="text-center font-bold text-xs bg-green-100 dark:bg-green-900 border-r border-gray-200 dark:border-gray-700 min-w-[100px]">Actual</TableHead>
                                <TableHead className="text-center font-bold text-xs bg-purple-100 dark:bg-purple-900 border-r border-gray-200 dark:border-gray-700 min-w-[100px]">Final</TableHead>
                                <TableHead className="text-center font-bold text-xs bg-yellow-100 dark:bg-yellow-900 border-r border-gray-200 dark:border-gray-700 min-w-[100px]">Error %</TableHead>
                                <TableHead className="text-center font-bold text-xs bg-red-100 dark:bg-red-900 border-r border-gray-200 dark:border-gray-700 min-w-[100px]">Stock Out</TableHead>
                                <TableHead className="text-center font-bold text-xs bg-green-100 dark:bg-green-900 border-r border-gray-200 dark:border-gray-700 min-w-[100px]">Stock In</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sku.data.map((row, index) => {
                                const skuIndex = forecastData.findIndex(item => item.sku === sku.sku)
                                const dataItem = forecastData[skuIndex].data[index]
                                const editableColumns = ['stock3PLFBA', 'stockWeeks', 'forecast', 'actual', 'final', 'stockOut', 'stockIn']
                                
                                return (
                                  <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <TableCell className="font-medium text-sm border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-900 z-10">
                                      Week {index + 1}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-200 dark:border-gray-700 p-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                                        onClick={() => handleDeleteWeek(sku.sku, index)}
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                    </TableCell>
                                    <TableCell className={`text-center border-r border-gray-200 dark:border-gray-700 p-2 ${
                                      focusedCell?.sku === sku.sku && focusedCell?.rowIndex === index && focusedCell?.columnIndex === 0 
                                        ? 'ring-2 ring-indigo-500 ring-inset' : ''
                                    }`}>
                                      <EditableCell
                                        id={`cell-${sku.sku}-${index}-0`}
                                        value={dataItem.stock3PLFBA}
                                        onChange={(newValue) => handleCellUpdate(sku.sku, index, 'stock3PLFBA', newValue)}
                                        className="text-gray-600 font-medium text-sm"
                                        onFocus={() => setFocusedCell({ sku: sku.sku, rowIndex: index, columnIndex: 0 })}
                                      />
                                    </TableCell>
                                    <TableCell className={`text-center border-r border-gray-200 dark:border-gray-700 p-2 ${
                                      focusedCell?.sku === sku.sku && focusedCell?.rowIndex === index && focusedCell?.columnIndex === 1 
                                        ? 'ring-2 ring-indigo-500 ring-inset' : ''
                                    }`}>
                                      <EditableCell
                                        id={`cell-${sku.sku}-${index}-1`}
                                        value={dataItem.stockWeeks}
                                        onChange={(newValue) => handleCellUpdate(sku.sku, index, 'stockWeeks', newValue)}
                                        className="text-gray-600 font-medium text-sm"
                                        onFocus={() => setFocusedCell({ sku: sku.sku, rowIndex: index, columnIndex: 1 })}
                                      />
                                    </TableCell>
                                    <TableCell className={`text-center border-r border-gray-200 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-950/10 p-2 ${
                                      focusedCell?.sku === sku.sku && focusedCell?.rowIndex === index && focusedCell?.columnIndex === 2 
                                        ? 'ring-2 ring-indigo-500 ring-inset' : ''
                                    }`}>
                                      <EditableCell
                                        id={`cell-${sku.sku}-${index}-2`}
                                        value={dataItem.forecast}
                                        onChange={(newValue) => handleForecastUpdate(sku.sku, index, newValue)}
                                        className="text-blue-600 font-medium text-sm"
                                        onFocus={() => setFocusedCell({ sku: sku.sku, rowIndex: index, columnIndex: 2 })}
                                      />
                                    </TableCell>
                                    <TableCell className={`text-center border-r border-gray-200 dark:border-gray-700 bg-green-50/30 dark:bg-green-950/10 p-2 ${
                                      focusedCell?.sku === sku.sku && focusedCell?.rowIndex === index && focusedCell?.columnIndex === 3 
                                        ? 'ring-2 ring-indigo-500 ring-inset' : ''
                                    }`}>
                                      <EditableCell
                                        id={`cell-${sku.sku}-${index}-3`}
                                        value={dataItem.actual || 0}
                                        onChange={(newValue) => handleCellUpdate(sku.sku, index, 'actual', newValue)}
                                        className="text-green-600 font-medium text-sm"
                                        onFocus={() => setFocusedCell({ sku: sku.sku, rowIndex: index, columnIndex: 3 })}
                                      />
                                    </TableCell>
                                    <TableCell className={`text-center border-r border-gray-200 dark:border-gray-700 bg-purple-50/30 dark:bg-purple-950/10 p-2 ${
                                      focusedCell?.sku === sku.sku && focusedCell?.rowIndex === index && focusedCell?.columnIndex === 4 
                                        ? 'ring-2 ring-indigo-500 ring-inset' : ''
                                    }`}>
                                      <EditableCell
                                        id={`cell-${sku.sku}-${index}-4`}
                                        value={dataItem.final}
                                        onChange={(newValue) => handleCellUpdate(sku.sku, index, 'final', newValue)}
                                        className="text-purple-600 font-medium text-sm"
                                        onFocus={() => setFocusedCell({ sku: sku.sku, rowIndex: index, columnIndex: 4 })}
                                      />
                                    </TableCell>
                                    <TableCell className={`text-center font-medium text-sm border-r border-gray-200 dark:border-gray-700 ${
                                      dataItem.errorPercent === null || dataItem.errorPercent === undefined ? '' : Math.abs(dataItem.errorPercent) <= 1 ? 'text-green-600 bg-green-50/30 dark:bg-green-950/10' : Math.abs(dataItem.errorPercent) <= 2 ? 'text-yellow-600 bg-yellow-50/30 dark:bg-yellow-950/10' : 'text-red-600 bg-red-50/30 dark:bg-red-950/10'
                                    }`}>
                                      {dataItem.errorPercent !== null && dataItem.errorPercent !== undefined ? `${dataItem.errorPercent.toFixed(1)}%` : '-'}
                                    </TableCell>
                                    <TableCell className={`text-center border-r border-gray-200 dark:border-gray-700 p-2 ${
                                      focusedCell?.sku === sku.sku && focusedCell?.rowIndex === index && focusedCell?.columnIndex === 5 
                                        ? 'ring-2 ring-indigo-500 ring-inset' : ''
                                    }`}>
                                      <EditableCell
                                        id={`cell-${sku.sku}-${index}-5`}
                                        value={dataItem.stockOut}
                                        onChange={(newValue) => handleCellUpdate(sku.sku, index, 'stockOut', newValue)}
                                        className="text-red-600 font-medium text-sm"
                                        onFocus={() => setFocusedCell({ sku: sku.sku, rowIndex: index, columnIndex: 5 })}
                                      />
                                    </TableCell>
                                    <TableCell className={`text-center border-r border-gray-200 dark:border-gray-700 p-2 ${
                                      focusedCell?.sku === sku.sku && focusedCell?.rowIndex === index && focusedCell?.columnIndex === 6 
                                        ? 'ring-2 ring-indigo-500 ring-inset' : ''
                                    }`}>
                                      <EditableCell
                                        id={`cell-${sku.sku}-${index}-6`}
                                        value={dataItem.stockIn}
                                        onChange={(newValue) => handleCellUpdate(sku.sku, index, 'stockIn', newValue)}
                                        className="text-green-600 font-medium text-sm"
                                        onFocus={() => setFocusedCell({ sku: sku.sku, rowIndex: index, columnIndex: 6 })}
                                      />
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                              {/* Total Row */}
                              <TableRow className="font-bold bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-t-2 border-gray-300 dark:border-gray-600">
                                <TableCell className="border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-100 dark:bg-gray-800">
                                  Total
                                </TableCell>
                                <TableCell className="border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                </TableCell>
                                <TableCell className="text-center bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                                  -
                                </TableCell>
                                <TableCell className="text-center bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                                  -
                                </TableCell>
                                <TableCell className="text-center text-blue-700 bg-blue-100 dark:bg-blue-950/40 border-r border-gray-200 dark:border-gray-700">
                                  {sku.data.reduce((sum, d) => sum + d.forecast, 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center text-green-700 bg-green-100 dark:bg-green-950/40 border-r border-gray-200 dark:border-gray-700">
                                  {sku.data.reduce((sum, d) => sum + (d.actual || 0), 0).toLocaleString() || '-'}
                                </TableCell>
                                <TableCell className="text-center text-purple-700 bg-purple-100 dark:bg-purple-950/40 border-r border-gray-200 dark:border-gray-700">
                                  {sku.data.reduce((sum, d) => sum + d.final, 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center bg-yellow-100 dark:bg-yellow-950/40 border-r border-gray-200 dark:border-gray-700">
                                  {(() => {
                                    const errors = sku.data.filter(d => d.errorPercent !== null).map(d => d.errorPercent!)
                                    return errors.length > 0 
                                      ? `${(errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(1)}%`
                                      : '-'
                                  })()}
                                </TableCell>
                                <TableCell className="text-center text-red-700 bg-red-100 dark:bg-red-950/40 border-r border-gray-200 dark:border-gray-700">
                                  {sku.data.reduce((sum, d) => sum + d.stockOut, 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center text-green-700 bg-green-100 dark:bg-green-950/40">
                                  {sku.data.reduce((sum, d) => sum + d.stockIn, 0).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="summary" className="space-y-6">
                  {selectedData.map(sku => (
                    <Card key={sku.sku} className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-indigo-200 dark:border-indigo-800">
                        <CardTitle className="text-xl flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          {sku.displayName}
                        </CardTitle>
                        <CardDescription>
                          Weekly forecast and actual data summary
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-auto max-h-[500px]">
                          <Table className="border-collapse">
                            <TableHeader className="sticky top-0 z-10">
                              <TableRow className="border-b-2 border-gray-300 dark:border-gray-600">
                                <TableHead className="font-bold text-xs bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 sticky left-0 z-20">Week</TableHead>
                                <TableHead className="text-center font-bold text-xs bg-blue-100 dark:bg-blue-900 border-r border-gray-200 dark:border-gray-700 min-w-[100px]">Forecast</TableHead>
                                <TableHead className="text-center font-bold text-xs bg-green-100 dark:bg-green-900 border-r border-gray-200 dark:border-gray-700 min-w-[100px]">Actual</TableHead>
                                <TableHead className="text-center font-bold text-xs bg-yellow-100 dark:bg-yellow-900 border-r border-gray-200 dark:border-gray-700 min-w-[100px]">Variance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sku.data.map((row, index) => {
                                const variance = row.actual ? row.forecast - row.actual : null
                                const variancePercent = row.actual ? ((row.forecast - row.actual) / row.actual) * 100 : null
                                
                                return (
                                  <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <TableCell className="font-medium text-sm border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-900 z-10">
                                      Week {index + 1}
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-sm text-blue-600 bg-blue-50/30 dark:bg-blue-950/10 border-r border-gray-200 dark:border-gray-700">
                                      {row.forecast.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-sm text-green-600 bg-green-50/30 dark:bg-green-950/10 border-r border-gray-200 dark:border-gray-700">
                                      {row.actual ? row.actual.toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell className={`text-center font-medium text-sm border-r border-gray-200 dark:border-gray-700 ${
                                      variance === null ? '' : 
                                      variance === 0 ? 'text-gray-600 bg-gray-50/30 dark:bg-gray-950/10' :
                                      variance > 0 ? 'text-red-600 bg-red-50/30 dark:bg-red-950/10' : 
                                      'text-green-600 bg-green-50/30 dark:bg-green-950/10'
                                    }`}>
                                      {variance !== null ? 
                                        `${variance > 0 ? '+' : ''}${variance.toLocaleString()}` + 
                                        (variancePercent !== null ? ` (${variancePercent > 0 ? '+' : ''}${variancePercent.toFixed(1)}%)` : '')
                                        : '-'
                                      }
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                              {/* Total Row */}
                              <TableRow className="font-bold bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-t-2 border-gray-300 dark:border-gray-600">
                                <TableCell className="border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-100 dark:bg-gray-800">
                                  Total
                                </TableCell>
                                <TableCell className="text-center text-blue-700 bg-blue-100 dark:bg-blue-950/40 border-r border-gray-200 dark:border-gray-700">
                                  {sku.data.reduce((sum, d) => sum + d.forecast, 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center text-green-700 bg-green-100 dark:bg-green-950/40 border-r border-gray-200 dark:border-gray-700">
                                  {sku.data.reduce((sum, d) => sum + (d.actual || 0), 0).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center text-gray-700 bg-gray-100 dark:bg-gray-950/40 border-r border-gray-200 dark:border-gray-700">
                                  {(() => {
                                    const totalForecast = sku.data.reduce((sum, d) => sum + d.forecast, 0)
                                    const totalActual = sku.data.reduce((sum, d) => sum + (d.actual || 0), 0)
                                    const totalVariance = totalForecast - totalActual
                                    const totalVariancePercent = totalActual > 0 ? (totalVariance / totalActual) * 100 : null
                                    return totalVariance !== 0 ? 
                                      `${totalVariance > 0 ? '+' : ''}${totalVariance.toLocaleString()}` + 
                                      (totalVariancePercent !== null ? ` (${totalVariancePercent > 0 ? '+' : ''}${totalVariancePercent.toFixed(1)}%)` : '')
                                      : '0'
                                  })()}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="chart" className="space-y-6">
                  {selectedData.map(sku => (
                    <Card key={sku.sku} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-xl">{sku.displayName} - Trend Analysis</CardTitle>
                        <CardDescription>
                          Forecast vs Actual performance over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={sku.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis 
                              dataKey="date" 
                              angle={-45} 
                              textAnchor="end" 
                              height={80}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip 
                              formatter={(value: any) => value ? value.toLocaleString() : 'N/A'}
                              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="forecast" 
                              stroke="#6366f1" 
                              name="Forecast"
                              strokeWidth={3}
                              dot={{ fill: '#6366f1', r: 4 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="actual" 
                              stroke="#10b981" 
                              name="Actual"
                              strokeWidth={3}
                              dot={{ fill: '#10b981', r: 4 }}
                              connectNulls={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Week</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Week {deleteConfirm ? deleteConfirm.weekIndex + 1 : ''}? This action cannot be undone and all data for this week will be lost.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteWeek}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Week
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}