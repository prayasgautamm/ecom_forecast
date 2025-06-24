import { SKUForecast, skuForecasts } from '@/lib/forecast-data'
import { SKU, ForecastData, CalculatedWeek } from './forecast-store'

export type HealthStatus = 'healthy' | 'low-stock' | 'out-of-stock' | 'overstocked'

// Helper function to calculate health status
function calculateHealthStatus(weeksCover: number): HealthStatus {
  if (weeksCover <= 0) return 'out-of-stock'
  if (weeksCover <= 2) return 'low-stock'
  if (weeksCover >= 12) return 'overstocked'
  return 'healthy'
}

// Helper function to determine product group
function getProductGroupForSKU(sku: string): string {
  if (sku.includes('LD')) return 'ld-series'
  if (sku.includes('ST')) return 'st-series'
  if (sku.includes('CDS')) return 'cds-series'
  return 'ld-series' // default fallback
}

// Convert legacy SKUForecast data to new format
export function convertLegacyData(): { skus: SKU[], forecasts: Map<string, ForecastData> } {
  const allSKUs: SKUForecast[] = skuForecasts || []
  const skus: SKU[] = []
  const forecasts = new Map<string, ForecastData>()

  if (!allSKUs || !Array.isArray(allSKUs)) {
    console.error('No SKU data found')
    return { skus: [], forecasts: new Map() }
  }

  allSKUs.forEach((legacySKU: SKUForecast) => {
    if (!legacySKU.data || !Array.isArray(legacySKU.data)) {
      console.warn(`Skipping SKU ${legacySKU.sku} - no data array found`)
      return
    }

    // Calculate totals and accuracy
    const totalForecast = legacySKU.data.reduce((sum: number, d: any) => sum + d.forecast, 0)
    const totalActual = legacySKU.data.reduce((sum: number, d: any) => sum + (d.actual || 0), 0)
    const accuracyPercent = totalActual > 0 ? ((totalForecast - totalActual) / totalActual) * 100 : null

    // Calculate average weeks cover for health status
    const validWeeksCover = legacySKU.data
      .map((d: any) => {
        const final = d.actual || d.forecast
        return final > 0 ? d.stock3PLFBA / (final * 7) : 0
      })
      .filter((wc: number) => wc > 0)
    
    const avgWeeksCover = validWeeksCover.length > 0 
      ? validWeeksCover.reduce((sum: number, wc: number) => sum + wc, 0) / validWeeksCover.length 
      : 0

    const healthStatus = calculateHealthStatus(avgWeeksCover)

    // Create SKU entry
    const sku: SKU = {
      sku: legacySKU.sku,
      displayName: legacySKU.displayName,
      category: undefined, // Not in legacy data
      productGroup: getProductGroupForSKU(legacySKU.sku),
      healthStatus,
      totalForecast,
      totalActual,
      accuracyPercent
    }

    skus.push(sku)

    // Convert weekly data
    const weeks: CalculatedWeek[] = legacySKU.data.map((weekData: any, index: number) => {
      const weekNumber = index + 1
      
      // Calculate fields directly without using the heavy recalculateData function
      const hasActualData = weekData.actual !== null && weekData.actual !== undefined
      const final = hasActualData ? weekData.actual : weekData.forecast
      const variance = hasActualData ? weekData.forecast - weekData.actual : null
      const variancePercent = hasActualData && weekData.actual !== 0 
        ? ((weekData.forecast - weekData.actual) / weekData.actual) * 100 
        : null
      const weeksCover = final > 0 ? Math.floor(weekData.stock3PLFBA / (final * 7) * 10) / 10 : 0
      
      return {
        weekNumber,
        date: weekData.date,
        openingStock: weekData.stock3PLFBA,
        forecastSales: weekData.forecast,
        actualSales: weekData.actual,
        hasActualData,
        variance,
        variancePercent,
        stockIn: weekData.stockIn,
        closingStock: Math.max(0, weekData.stock3PLFBA - final + weekData.stockIn),
        weeksCover,
        final,
        errorPercent: variancePercent,
        stockOut: final * 7
      }
    })

    // Create forecast data
    const forecastData: ForecastData = {
      sku: legacySKU.sku,
      weeks,
      lastUpdated: new Date()
    }

    forecasts.set(legacySKU.sku, forecastData)
  })

  return { skus, forecasts }
}

// Initialize store with legacy data
export function initializeStoreWithLegacyData() {
  const { skus, forecasts } = convertLegacyData()
  
  return {
    skus,
    forecasts,
    selectedSKUIds: skus.length > 0 ? [skus[0].sku] : []
  }
}