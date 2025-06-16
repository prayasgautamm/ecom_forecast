export interface SKUForecast {
  sku: string
  displayName: string
  data: {
    date: string
    stock3PLFBA: number  // Stock (3PL + FBA) - User enters for week 1, calculated for others
    stockWeeks: number   // Stock (Weeks) - Always calculated: FLOOR(stock3PLFBA/(final*7),1)
    forecast: number     // User editable
    actual?: number | null  // User editable - null means no data entered, number (including 0) means data entered
    hasActualData: boolean  // Flag to track if actual data was entered
    final: number        // Calculated: IF(ISBLANK(actual), forecast, actual)
    errorPercent?: number | null  // Calculated: IFERROR((forecast-actual)/actual, "")
    stockOut: number     // Calculated: final * 7 (always uses final)
    stockIn: number      // User editable
  }[]
}

// Create empty data structure - all values start at 0 except first week stock
const createEmptyWeeklyData = () => {
  const data = []
  
  for (let week = 1; week <= 52; week++) {
    data.push({
      date: `Week ${week}`,
      stock3PLFBA: 0,      // User enters for week 1, calculated for others
      stockWeeks: 0,       // Always calculated
      forecast: 0,         // User editable
      actual: null,        // User editable
      hasActualData: false, // Flag to track if actual data was entered
      final: 0,           // Calculated: IF(ISBLANK(actual), forecast, actual)
      errorPercent: null,  // Calculated: IFERROR((forecast-actual)/actual, null)
      stockOut: 0,        // Calculated: final * 7
      stockIn: 0          // User editable
    })
  }
  
  return data
}

// Function to recalculate all dependent fields based on Excel formulas
export const recalculateData = (data: SKUForecast['data']) => {
  const updatedData = [...data]
  
  for (let i = 0; i < updatedData.length; i++) {
    const row = updatedData[i]
    
    // Final = IF(ISBLANK(actual), forecast, actual)
    // Use hasActualData flag to determine if actual data was entered
    row.final = row.hasActualData ? (row.actual || 0) : row.forecast
    
    // Error % = IFERROR((forecast - actual) / actual, null)
    // Only calculate if actual data was entered and actual is not zero
    if (row.hasActualData && row.actual !== 0) {
      row.errorPercent = ((row.forecast - row.actual!) / row.actual!) * 100
    } else {
      row.errorPercent = null
    }
    
    // Stock Out calculation
    // In Excel: IF(ISBLANK(actual), forecast*($A4-$A3), actual*($A4-$A3))
    // Since ($A4-$A3) = 7, this becomes: IF(ISBLANK(actual), forecast*7, actual*7)
    // This is simply: Final * 7 (since Final = IF(ISBLANK(actual), forecast, actual))
    row.stockOut = row.final * 7
    
    // For weeks after 1: Stock = Previous Stock - Previous Stock Out + Previous Stock In
    if (i > 0) {
      const prevRow = updatedData[i - 1]
      row.stock3PLFBA = Math.max(0, prevRow.stock3PLFBA - prevRow.stockOut + prevRow.stockIn)
    }
    
    // Stock Weeks = FLOOR(stock3PLFBA / (final * 7), 1)
    if (row.final > 0) {
      row.stockWeeks = Math.floor(row.stock3PLFBA / (row.final * 7))
    } else {
      row.stockWeeks = 0
    }
  }
  
  return updatedData
}

// Sample data - all SKUs start empty, user fills in data
export const skuForecasts: SKUForecast[] = [
  {
    sku: "6LD",
    displayName: "6 LD",
    data: createEmptyWeeklyData()
  },
  {
    sku: "6ST", 
    displayName: "6 ST",
    data: createEmptyWeeklyData()
  },
  {
    sku: "3LD-CS008",
    displayName: "3 LD - CS 008",
    data: createEmptyWeeklyData()
  },
  {
    sku: "3ST-CS010",
    displayName: "3 ST - CS 010",
    data: createEmptyWeeklyData()
  },
  {
    sku: "10LD",
    displayName: "10 LD",
    data: createEmptyWeeklyData()
  },
  {
    sku: "10ST",
    displayName: "10 ST",
    data: createEmptyWeeklyData()
  },
  {
    sku: "CDS-001",
    displayName: "CDS-001 - 12 x 5",
    data: createEmptyWeeklyData()
  },
  {
    sku: "CDS-002",
    displayName: "CDS-002 - 12 x 9",
    data: createEmptyWeeklyData()
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