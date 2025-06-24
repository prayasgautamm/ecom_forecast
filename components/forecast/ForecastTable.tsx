'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible'
import { StatusBadge, getHealthStatusColor } from './StatusBadge'
import { 
  ForecastSalesCell, 
  ActualSalesCell, 
  StockInCell, 
  OpeningStockCell,
  StockMovementCell
} from './InlineEditCell'
import { formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import type { ForecastData, CalculatedWeek } from '@/lib/stores/forecast-store'

interface ForecastTableProps {
  forecast: ForecastData
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isCompact?: boolean
  className?: string
}

export function ForecastTable({ 
  forecast, 
  isCollapsed = false, 
  onToggleCollapse,
  isCompact = false,
  className 
}: ForecastTableProps) {
  const [focusedCell, setFocusedCell] = useState<{
    weekNumber: number
    field: string
  } | null>(null)

  const totalForecast = forecast.weeks.reduce((sum, week) => sum + week.forecastSales, 0)
  const totalActual = forecast.weeks.reduce((sum, week) => sum + (week.actualSales || 0), 0)
  const totalVariance = totalForecast - totalActual
  const totalVariancePercent = totalActual > 0 ? (totalVariance / totalActual) * 100 : null
  
  // Calculate average weeks of cover
  const validWeeksCover = forecast.weeks.filter(w => w.weeksCover > 0)
  const avgWeeksCover = validWeeksCover.length > 0 
    ? validWeeksCover.reduce((sum, w) => sum + w.weeksCover, 0) / validWeeksCover.length 
    : 0

  const getVarianceColor = (variance: number | null, variancePercent: number | null) => {
    if (variance === null || variancePercent === null) return ''
    
    const absPercent = Math.abs(variancePercent)
    if (absPercent <= 5) return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/10'
    if (absPercent <= 15) return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/10'
    return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/10'
  }

  const getWeeksCoverBadge = (weeksCover: number) => {
    if (weeksCover <= 0) return <StatusBadge status="out-of-stock" size="sm" />
    if (weeksCover <= 2) return <StatusBadge status="low-stock" size="sm" weeksCover={weeksCover} />
    if (weeksCover >= 12) return <StatusBadge status="overstocked" size="sm" weeksCover={weeksCover} />
    return <StatusBadge status="healthy" size="sm" weeksCover={weeksCover} />
  }

  // Table content shared between compact and full modes
  const tableContent = (
    <div className="overflow-x-auto">
      <Table className={isCompact ? "text-sm" : ""}>
        <TableHeader className={cn("sticky top-0 bg-white dark:bg-gray-950 z-10", isCompact && "text-xs")}>
          <TableRow className="border-b-2 border-gray-200 dark:border-gray-700">
            <TableHead className={cn("sticky left-0 bg-white dark:bg-gray-950 z-20 border-r border-gray-200 dark:border-gray-700 font-semibold", isCompact && "px-2 py-1")}>
              Week
            </TableHead>
            <TableHead className={cn("text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300", isCompact && "px-2 py-1")}>
              Opening Stock
            </TableHead>
            <TableHead className={cn("text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-blue-700 dark:text-blue-400", isCompact && "px-2 py-1")}>
              Forecast Sales
            </TableHead>
            <TableHead className={cn("text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-green-700 dark:text-green-400", isCompact && "px-2 py-1")}>
              Actual Sales
            </TableHead>
            <TableHead className={cn("text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-purple-700 dark:text-purple-400", isCompact && "px-2 py-1")}>
              Stock Movement
            </TableHead>
            <TableHead className={cn("text-center border-r border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300", isCompact && "px-2 py-1")}>
              Closing Stock
            </TableHead>
            <TableHead className={cn("text-center font-semibold text-indigo-700 dark:text-indigo-400", isCompact && "px-2 py-1")}>
              Weeks Cover
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forecast.weeks.map((week, index) => {
            const variance = week.variance
            const variancePercent = week.variancePercent
            
            return (
              <TableRow 
                key={week.weekNumber}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
              >
                <TableCell className={cn("sticky left-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-700 font-medium text-center", isCompact && "px-2 py-1")}>
                  {week.weekNumber}
                </TableCell>
                
                <TableCell className={cn("border-r border-gray-200 dark:border-gray-700 p-1", isCompact && "px-2 py-1")}>
                  <div className="text-center font-medium text-gray-700 dark:text-gray-300">
                    {formatNumber(week.openingStock)}
                  </div>
                </TableCell>
                
                <TableCell className={cn("border-r border-gray-200 dark:border-gray-700 p-1", isCompact && "px-2 py-1")}>
                  {isCompact ? (
                    <div className="text-center font-medium text-blue-700 dark:text-blue-400">
                      {formatNumber(week.forecastSales)}
                    </div>
                  ) : (
                    <ForecastSalesCell
                      skuId={forecast.sku}
                      weekNumber={week.weekNumber}
                      value={week.forecastSales}
                      onFocus={() => setFocusedCell({ weekNumber: week.weekNumber, field: 'forecastSales' })}
                      onBlur={() => setFocusedCell(null)}
                    />
                  )}
                </TableCell>
                
                <TableCell className={cn("border-r border-gray-200 dark:border-gray-700 p-1", isCompact && "px-2 py-1")}>
                  {isCompact ? (
                    <div className="text-center font-medium text-green-700 dark:text-green-400">
                      {week.actualSales !== null ? formatNumber(week.actualSales) : '-'}
                    </div>
                  ) : (
                    <ActualSalesCell
                      skuId={forecast.sku}
                      weekNumber={week.weekNumber}
                      value={week.actualSales}
                      onFocus={() => setFocusedCell({ weekNumber: week.weekNumber, field: 'actualSales' })}
                      onBlur={() => setFocusedCell(null)}
                    />
                  )}
                </TableCell>
                
                <TableCell className={cn("border-r border-gray-200 dark:border-gray-700 p-1", isCompact && "px-2 py-1")}>
                  {isCompact ? (
                    <div className="text-center font-medium text-purple-700 dark:text-purple-400">
                      {week.stockIn > 0 ? `+${formatNumber(week.stockIn)}` : '-'}
                    </div>
                  ) : (
                    <StockMovementCell
                      skuId={forecast.sku}
                      weekNumber={week.weekNumber}
                      stockIn={week.stockIn}
                      stockOut={week.stockOut}
                      onFocus={() => setFocusedCell({ weekNumber: week.weekNumber, field: 'stockIn' })}
                      onBlur={() => setFocusedCell(null)}
                    />
                  )}
                </TableCell>
                
                <TableCell className={cn("text-center font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700", isCompact ? "px-2 py-1" : "p-2")}>
                  {formatNumber(week.closingStock)}
                </TableCell>
                
                <TableCell className={cn("text-center", isCompact ? "px-2 py-1" : "p-2")}>
                  {getWeeksCoverBadge(week.weeksCover)}
                </TableCell>
              </TableRow>
            )
          })}
          
          {/* Summary Row */}
          <TableRow className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 font-semibold">
            <TableCell className={cn("sticky left-0 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 text-center", isCompact && "px-2 py-1")}>
              Total
            </TableCell>
            <TableCell className={cn("text-center border-r border-gray-200 dark:border-gray-700", isCompact && "px-2 py-1")}>
              -
            </TableCell>
            <TableCell className={cn("text-center text-blue-700 dark:text-blue-400 border-r border-gray-200 dark:border-gray-700", isCompact && "px-2 py-1")}>
              {formatNumber(totalForecast)}
            </TableCell>
            <TableCell className={cn("text-center text-green-700 dark:text-green-400 border-r border-gray-200 dark:border-gray-700", isCompact && "px-2 py-1")}>
              {totalActual > 0 ? formatNumber(totalActual) : '-'}
            </TableCell>
            <TableCell className={cn("text-center text-purple-700 dark:text-purple-400 border-r border-gray-200 dark:border-gray-700", isCompact && "px-2 py-1")}>
              -
            </TableCell>
            <TableCell className={cn("text-center border-r border-gray-200 dark:border-gray-700", isCompact && "px-2 py-1")}>
              -
            </TableCell>
            <TableCell className={cn("text-center", isCompact && "px-2 py-1")}>
              {getWeeksCoverBadge(avgWeeksCover)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )

  // Render compact version without collapsible wrapper
  if (isCompact) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{forecast.sku}</CardTitle>
              <CardDescription className="text-xs">
                Weekly forecast • {formatNumber(totalForecast)} total units
              </CardDescription>
            </div>
            {getWeeksCoverBadge(avgWeeksCover)}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {tableContent}
        </CardContent>
      </Card>
    )
  }

  // Full version with collapsible functionality
  return (
    <Card className={cn("", className)}>
      <Collapsible open={!isCollapsed} onOpenChange={() => onToggleCollapse?.()}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <div>
                  <CardTitle className="text-lg">{forecast.sku}</CardTitle>
                  <CardDescription>
                    Weekly sales forecast with inventory flow analysis
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getWeeksCoverBadge(avgWeeksCover)}
                <div className="text-right text-sm">
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    {formatNumber(totalForecast)} units forecast
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Last updated: {forecast.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-0">
            {tableContent}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}