'use client'

import React, { useState } from 'react'
import { useForecastStore } from '@/lib/stores/forecast-store'
import { ForecastTable } from './ForecastTable'
import { StatusBadge } from './StatusBadge'
import { formatNumber } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { 
  TableIcon, 
  LineChartIcon, 
  BarChart3Icon, 
  TrendingUp, 
  Package, 
  AlertCircle,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ForecastWorkspaceProps {
  className?: string
}

export function ForecastWorkspace({ className }: ForecastWorkspaceProps) {
  const {
    selectedSKUIds,
    viewMode,
    setViewMode,
    getSelectedForecasts,
    getTotalStats,
    isLoading
  } = useForecastStore()

  const [collapsedTables, setCollapsedTables] = useState<Set<string>>(new Set())
  
  const selectedForecasts = getSelectedForecasts()
  const totalStats = getTotalStats()

  const toggleTableCollapse = (skuId: string) => {
    const newCollapsed = new Set(collapsedTables)
    if (newCollapsed.has(skuId)) {
      newCollapsed.delete(skuId)
    } else {
      newCollapsed.add(skuId)
    }
    setCollapsedTables(newCollapsed)
  }

  const collapseAll = () => {
    setCollapsedTables(new Set(selectedForecasts.map(f => f.sku)))
  }

  const expandAll = () => {
    setCollapsedTables(new Set())
  }

  // Prepare chart data
  const chartData = selectedForecasts.length > 0 
    ? selectedForecasts[0].weeks.map(week => {
        const data: any = { week: week.weekNumber }
        selectedForecasts.forEach(forecast => {
          const weekData = forecast.weeks.find(w => w.weekNumber === week.weekNumber)
          if (weekData) {
            data[`${forecast.sku}_forecast`] = weekData.forecastSales
            data[`${forecast.sku}_actual`] = weekData.actualSales || 0
          }
        })
        return data
      })
    : []

  if (selectedSKUIds.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50", className)}>
        <div className="text-center max-w-md">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No SKUs Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select one or more SKUs from the sidebar to start analyzing your sales forecasts.
          </p>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First SKU
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex-1 flex flex-col", className)}>
      {/* Header with Stats and Controls */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Forecast</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatNumber(totalStats.totalForecast)}
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
                      {totalStats.totalActual > 0 ? formatNumber(totalStats.totalActual) : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {totalStats.averageAccuracy !== null 
                        ? `${totalStats.averageAccuracy.toFixed(1)}%` 
                        : '-'
                      }
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
                      {selectedSKUIds.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center justify-between">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList>
                <TabsTrigger value="table" className="gap-2">
                  <TableIcon className="h-4 w-4" />
                  Table View
                </TabsTrigger>
                <TabsTrigger value="chart" className="gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  Chart View
                </TabsTrigger>
                <TabsTrigger value="summary" className="gap-2">
                  <BarChart3Icon className="h-4 w-4" />
                  Summary View
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              {viewMode === 'table' && selectedForecasts.length > 1 && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={expandAll}
                    disabled={collapsedTables.size === 0}
                  >
                    Expand All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={collapseAll}
                    disabled={collapsedTables.size === selectedForecasts.length}
                  >
                    Collapse All
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={viewMode} className="h-full">
          <TabsContent value="table" className="mt-0 space-y-6">
            {selectedForecasts.map((forecast) => (
              <ForecastTable
                key={forecast.sku}
                forecast={forecast}
                isCollapsed={collapsedTables.has(forecast.sku)}
                onToggleCollapse={() => toggleTableCollapse(forecast.sku)}
              />
            ))}
          </TabsContent>

          <TabsContent value="chart" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Sales Forecast vs Actual Comparison</CardTitle>
                <CardDescription>
                  Weekly comparison of forecasted vs actual sales across selected SKUs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="week" 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: any) => formatNumber(value)}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #ccc', 
                          borderRadius: '8px' 
                        }}
                      />
                      <Legend />
                      {selectedForecasts.map((forecast, index) => {
                        const colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea']
                        const color = colors[index % colors.length]
                        return (
                          <React.Fragment key={forecast.sku}>
                            <Line
                              type="monotone"
                              dataKey={`${forecast.sku}_forecast`}
                              stroke={color}
                              strokeWidth={2}
                              name={`${forecast.sku} Forecast`}
                              strokeDasharray="5 5"
                            />
                            <Line
                              type="monotone"
                              dataKey={`${forecast.sku}_actual`}
                              stroke={color}
                              strokeWidth={2}
                              name={`${forecast.sku} Actual`}
                            />
                          </React.Fragment>
                        )
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Forecast Accuracy by SKU</CardTitle>
                  <CardDescription>
                    Comparison of forecast accuracy across selected SKUs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedForecasts.map((forecast) => {
                      const totalForecast = forecast.weeks.reduce((sum, w) => sum + w.forecastSales, 0)
                      const totalActual = forecast.weeks.reduce((sum, w) => sum + (w.actualSales || 0), 0)
                      const accuracy = totalActual > 0 ? ((totalForecast - totalActual) / totalActual) * 100 : null
                      
                      return (
                        <div key={forecast.sku} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div>
                            <p className="font-medium">{forecast.sku}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatNumber(totalForecast)} forecast / {totalActual > 0 ? formatNumber(totalActual) : '-'} actual
                            </p>
                          </div>
                          {accuracy !== null ? (
                            <div className={cn(
                              "text-right",
                              Math.abs(accuracy) <= 5 ? "text-green-600" : 
                              Math.abs(accuracy) <= 15 ? "text-yellow-600" : "text-red-600"
                            )}>
                              <p className="font-medium">
                                {accuracy > 0 ? '+' : ''}{accuracy.toFixed(1)}%
                              </p>
                              <p className="text-xs opacity-75">accuracy</p>
                            </div>
                          ) : (
                            <div className="text-gray-400">
                              <p className="text-sm">No data</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Health Overview</CardTitle>
                  <CardDescription>
                    Current stock status and weeks of cover analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedForecasts.map((forecast) => {
                      const currentWeek = forecast.weeks[0] // Assuming current week is first
                      return (
                        <div key={forecast.sku} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div>
                            <p className="font-medium">{forecast.sku}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatNumber(currentWeek.closingStock)} units in stock
                            </p>
                          </div>
                          <StatusBadge 
                            status={
                              currentWeek.weeksCover <= 0 ? 'out-of-stock' :
                              currentWeek.weeksCover <= 2 ? 'low-stock' :
                              currentWeek.weeksCover >= 12 ? 'overstocked' :
                              'healthy'
                            }
                            weeksCover={currentWeek.weeksCover}
                          />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}