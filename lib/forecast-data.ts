export interface SKUForecast {
  sku: string
  displayName: string
  data: {
    date: string
    stock3PLFBA: number  // Stock (3PL + FBA)
    stockWeeks: number   // Stock (Weeks)
    forecast: number
    actual?: number | null
    final: number        // Final
    errorPercent?: number | null  // Error %
    stockOut: number     // Stock Out
    stockIn: number      // Stock In
  }[]
}

// Function to generate 52 weeks of data for a SKU
const generateWeeklyData = (baseForecast: number, baseStock: number, hasActualData: number = 7) => {
  const data = []
  let currentStock = baseStock
  
  for (let week = 1; week <= 52; week++) {
    const forecastVariation = baseForecast * (0.9 + Math.random() * 0.2) // ±10% variation
    const forecast = Math.round(forecastVariation)
    
    // Generate actual data for first hasActualData weeks
    const actual = week <= hasActualData 
      ? Math.round(forecast * (0.95 + Math.random() * 0.1)) // ±5% variation from forecast
      : null
    
    const final = actual || forecast
    const errorPercent = actual ? ((forecast - actual) / actual) * 100 : null
    
    // Calculate stock depletion
    currentStock = Math.max(0, currentStock - final)
    const stockWeeks = currentStock / forecast
    
    // Random stock replenishment
    const stockIn = (week % 8 === 0 || currentStock < forecast * 2) 
      ? Math.round(baseForecast * (4 + Math.random() * 4)) 
      : 0
    
    currentStock += stockIn
    
    data.push({
      date: `Week ${week}`,
      stock3PLFBA: currentStock,
      stockWeeks: stockWeeks,
      forecast: forecast,
      actual: actual,
      final: final,
      errorPercent: errorPercent,
      stockOut: Math.max(0, forecast - currentStock),
      stockIn: stockIn
    })
  }
  
  return data
}

// Sample data matching Excel format - each SKU has its own table
export const skuForecasts: SKUForecast[] = [
  {
    sku: "6LD",
    displayName: "6 LD",
    data: generateWeeklyData(1200, 15000, 7)
  },
  {
    sku: "6ST", 
    displayName: "6 ST",
    data: generateWeeklyData(800, 10000, 7)
  },
  {
    sku: "3LD-CS008",
    displayName: "3 LD - CS 008",
    data: generateWeeklyData(500, 6000, 7)
  },
  {
    sku: "3ST-CS010",
    displayName: "3 ST - CS 010",
    data: generateWeeklyData(300, 3600, 7)
  },
  {
    sku: "10LD",
    displayName: "10 LD",
    data: generateWeeklyData(2000, 25000, 7)
  },
  {
    sku: "10ST",
    displayName: "10 ST",
    data: generateWeeklyData(1500, 18000, 7)
  },
  {
    sku: "CDS-001",
    displayName: "CDS-001 - 12 x 5",
    data: generateWeeklyData(600, 7200, 7)
  },
  {
    sku: "CDS-002",
    displayName: "CDS-002 - 12 x 9",
    data: generateWeeklyData(900, 10800, 7)
  }
]

export const getAllSKUs = () => {
  return skuForecasts.map(item => ({
    sku: item.sku,
    displayName: item.displayName
  }))
}

export const getSKUsByIds = (skuIds: string[]) => {
  return skuForecasts.filter(item => skuIds.includes(item.sku))
}