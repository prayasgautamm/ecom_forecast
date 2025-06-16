import { SKU, ForecastData, CalculatedWeek } from './forecast-store'

// Create a simplified data initialization that won't crash
export function initializeStoreWithSimpleData() {
  const skus: SKU[] = [
    {
      sku: "6LD",
      displayName: "6 LD",
      healthStatus: 'healthy',
      totalForecast: 1000,
      totalActual: 0,
      accuracyPercent: null
    },
    {
      sku: "6ST",
      displayName: "6 ST", 
      healthStatus: 'healthy',
      totalForecast: 1500,
      totalActual: 0,
      accuracyPercent: null
    },
    {
      sku: "3LD-CS008",
      displayName: "3 LD - CS 008",
      healthStatus: 'healthy',
      totalForecast: 800,
      totalActual: 0,
      accuracyPercent: null
    }
  ]

  const forecasts = new Map<string, ForecastData>()

  // Create simple weekly data for each SKU
  skus.forEach(sku => {
    const weeks: CalculatedWeek[] = []
    
    for (let i = 1; i <= 52; i++) {
      weeks.push({
        weekNumber: i,
        date: `Week ${i}`,
        openingStock: 1000,
        forecastSales: Math.floor(Math.random() * 50) + 20,
        actualSales: null,
        hasActualData: false,
        variance: null,
        variancePercent: null,
        stockIn: 0,
        closingStock: 950,
        weeksCover: 4.5,
        final: 30,
        errorPercent: null,
        stockOut: 210
      })
    }

    forecasts.set(sku.sku, {
      sku: sku.sku,
      weeks,
      lastUpdated: new Date()
    })
  })

  return {
    skus,
    forecasts,
    selectedSKUIds: [skus[0].sku]
  }
}