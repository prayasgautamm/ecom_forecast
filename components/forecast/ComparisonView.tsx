'use client'

import React from 'react'
import { useForecastStore } from '@/lib/stores/forecast-store'
import { ForecastTable } from './ForecastTable'
import { cn } from '@/lib/utils'
import type { ForecastData, CalculatedWeek } from '@/lib/stores/forecast-store'

interface ComparisonViewProps {
  mode: 'groups' | 'skus'
  className?: string
}

export function ComparisonView({ mode, className }: ComparisonViewProps) {
  const {
    selectedSKUIds,
    productGroups,
    getSelectedForecasts,
    getSKUsByGroup,
    skus,
    forecasts
  } = useForecastStore()

  const selectedForecasts = getSelectedForecasts()

  if (mode === 'groups') {
    // Group comparison view - aggregate data for each group
    const selectedGroups = productGroups.filter(g => 
      getSKUsByGroup(g.id).some(sku => selectedSKUIds.includes(sku.sku))
    )

    const groupForecasts = selectedGroups.map(group => {
      const groupSKUs = getSKUsByGroup(group.id).filter(sku => 
        selectedSKUIds.includes(sku.sku)
      )

      // Get all forecasts for SKUs in this group
      const groupForecastData = groupSKUs
        .map(sku => forecasts.get(sku.sku))
        .filter((f): f is ForecastData => f !== undefined)

      if (groupForecastData.length === 0) return null

      // Aggregate weekly data
      const weekNumbers = groupForecastData[0].weeks.map(w => w.weekNumber)
      const aggregatedWeeks: CalculatedWeek[] = weekNumbers.map(weekNumber => {
        let totalForecastSales = 0
        let totalActualSales = 0
        let totalOpeningStock = 0
        let totalClosingStock = 0
        let totalStockIn = 0
        let totalStockOut = 0
        let hasActualSales = false

        groupForecastData.forEach(forecast => {
          const week = forecast.weeks.find(w => w.weekNumber === weekNumber)
          if (week) {
            totalForecastSales += week.forecastSales
            if (week.actualSales !== null) {
              totalActualSales += week.actualSales
              hasActualSales = true
            }
            totalOpeningStock += week.openingStock
            totalClosingStock += week.closingStock
            totalStockIn += week.stockIn
            totalStockOut += week.stockOut
          }
        })

        const variance = hasActualSales ? totalForecastSales - totalActualSales : null
        const variancePercent = hasActualSales && totalActualSales > 0 
          ? (variance! / totalActualSales) * 100 
          : null

        // Calculate weeks cover based on total closing stock and average weekly forecast
        const avgWeeklyForecast = totalForecastSales
        const weeksCover = avgWeeklyForecast > 0 
          ? Math.round(totalClosingStock / avgWeeklyForecast) 
          : 0

        return {
          weekNumber,
          date: `Week ${weekNumber}`, // Placeholder date
          forecastSales: totalForecastSales,
          actualSales: hasActualSales ? totalActualSales : null,
          hasActualData: hasActualSales,
          openingStock: totalOpeningStock,
          closingStock: totalClosingStock,
          stockIn: totalStockIn,
          stockOut: totalStockOut,
          variance,
          variancePercent,
          weeksCover,
          final: totalClosingStock, // Using closing stock as final
          errorPercent: variancePercent
        }
      })

      // Create aggregated forecast data
      const aggregatedForecast: ForecastData = {
        sku: `${group.name} (${groupSKUs.length} SKUs)`,
        weeks: aggregatedWeeks,
        lastUpdated: new Date()
      }

      return aggregatedForecast
    }).filter((f): f is ForecastData => f !== null)

    return (
      <div className={cn("w-full overflow-x-auto", className)}>
        <div className="flex gap-4 pb-4">
          {groupForecasts.map((forecast) => (
            <div key={forecast.sku} className="flex-shrink-0 w-[600px]">
              <ForecastTable
                forecast={forecast}
                isCompact={true}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // SKU comparison view - side by side tables
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex gap-4 pb-4">
        {selectedForecasts.map((forecast) => (
          <div key={forecast.sku} className="flex-shrink-0 w-[600px]">
            <ForecastTable
              forecast={forecast}
              isCompact={true}
            />
          </div>
        ))}
      </div>
    </div>
  )
}