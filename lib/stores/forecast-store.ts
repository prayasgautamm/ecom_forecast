import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { SKUForecast } from '@/lib/forecast-data'

export interface CalculatedWeek {
  weekNumber: number
  date: string
  openingStock: number
  forecastSales: number
  actualSales: number | null
  hasActualData: boolean
  variance: number | null
  variancePercent: number | null
  stockIn: number
  closingStock: number
  weeksCover: number
  final: number
  errorPercent: number | null
  stockOut: number
}

export interface SKU {
  sku: string
  displayName: string
  category?: string
  healthStatus: 'healthy' | 'low-stock' | 'out-of-stock' | 'overstocked'
  totalForecast: number
  totalActual: number
  accuracyPercent: number | null
}

export interface ForecastData {
  sku: string
  weeks: CalculatedWeek[]
  lastUpdated: Date
}

interface ForecastStore {
  // State
  skus: SKU[]
  selectedSKUIds: string[]
  forecasts: Map<string, ForecastData>
  isLoading: boolean
  error: string | null
  searchTerm: string
  
  // UI State
  viewMode: 'table' | 'chart' | 'summary'
  sidebarCollapsed: boolean
  
  // Actions
  setSearchTerm: (term: string) => void
  setViewMode: (mode: 'table' | 'chart' | 'summary') => void
  toggleSidebar: () => void
  
  // SKU Management
  selectSKU: (skuId: string) => void
  unselectSKU: (skuId: string) => void
  toggleSKU: (skuId: string) => void
  selectAllSKUs: () => void
  unselectAllSKUs: () => void
  
  // Data Management
  updateCell: (skuId: string, weekNumber: number, field: keyof CalculatedWeek, value: number) => Promise<void>
  createSKU: (skuData: { sku: string; displayName: string; category?: string }) => Promise<void>
  deleteSKU: (skuId: string) => Promise<void>
  
  // Computed getters
  getFilteredSKUs: () => SKU[]
  getSelectedForecasts: () => ForecastData[]
  getTotalStats: () => {
    totalForecast: number
    totalActual: number
    averageAccuracy: number | null
  }
}

export const useForecastStore = create<ForecastStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      skus: [],
      selectedSKUIds: [],
      forecasts: new Map(),
      isLoading: false,
      error: null,
      searchTerm: '',
      viewMode: 'table',
      sidebarCollapsed: false,
      
      // UI Actions
      setSearchTerm: (term) => set({ searchTerm: term }),
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      // SKU Selection Actions
      selectSKU: (skuId) => set((state) => ({
        selectedSKUIds: state.selectedSKUIds.includes(skuId) 
          ? state.selectedSKUIds 
          : [...state.selectedSKUIds, skuId]
      })),
      
      unselectSKU: (skuId) => set((state) => ({
        selectedSKUIds: state.selectedSKUIds.filter(id => id !== skuId)
      })),
      
      toggleSKU: (skuId) => set((state) => ({
        selectedSKUIds: state.selectedSKUIds.includes(skuId)
          ? state.selectedSKUIds.filter(id => id !== skuId)
          : [...state.selectedSKUIds, skuId]
      })),
      
      selectAllSKUs: () => set((state) => ({
        selectedSKUIds: state.skus.map(sku => sku.sku)
      })),
      
      unselectAllSKUs: () => set({ selectedSKUIds: [] }),
      
      // Data Management Actions
      updateCell: async (skuId, weekNumber, field, value) => {
        set({ isLoading: true, error: null })
        
        try {
          // TODO: Replace with actual API call
          // await updateForecastCell(skuId, weekNumber, field, value)
          
          console.log(`Updating ${skuId} week ${weekNumber} ${field} to ${value}`)
          
          // Optimistic update
          const { forecasts } = get()
          const forecastData = forecasts.get(skuId)
          
          if (forecastData) {
            const updatedWeeks = forecastData.weeks.map(week => 
              week.weekNumber === weekNumber 
                ? { ...week, [field]: value }
                : week
            )
            
            forecasts.set(skuId, {
              ...forecastData,
              weeks: updatedWeeks,
              lastUpdated: new Date()
            })
            
            set({ forecasts: new Map(forecasts) })
          }
          
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Update failed' })
        } finally {
          set({ isLoading: false })
        }
      },
      
      createSKU: async (skuData) => {
        set({ isLoading: true, error: null })
        
        try {
          // TODO: Replace with actual API call
          // const newSKU = await createSKU(skuData)
          
          const newSKU: SKU = {
            ...skuData,
            healthStatus: 'healthy',
            totalForecast: 0,
            totalActual: 0,
            accuracyPercent: null
          }
          
          set((state) => ({
            skus: [...state.skus, newSKU],
            selectedSKUIds: [...state.selectedSKUIds, newSKU.sku]
          }))
          
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create SKU' })
        } finally {
          set({ isLoading: false })
        }
      },
      
      deleteSKU: async (skuId) => {
        set({ isLoading: true, error: null })
        
        try {
          // TODO: Replace with actual API call
          // await deleteSKU(skuId)
          
          const { forecasts } = get()
          forecasts.delete(skuId)
          
          set((state) => ({
            skus: state.skus.filter(sku => sku.sku !== skuId),
            selectedSKUIds: state.selectedSKUIds.filter(id => id !== skuId),
            forecasts: new Map(forecasts)
          }))
          
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete SKU' })
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Computed getters
      getFilteredSKUs: () => {
        const { skus, searchTerm } = get()
        if (!searchTerm) return skus
        
        const term = searchTerm.toLowerCase()
        return skus.filter(sku => 
          sku.sku.toLowerCase().includes(term) ||
          sku.displayName.toLowerCase().includes(term) ||
          (sku.category && sku.category.toLowerCase().includes(term))
        )
      },
      
      getSelectedForecasts: () => {
        const { selectedSKUIds, forecasts } = get()
        return selectedSKUIds
          .map(skuId => forecasts.get(skuId))
          .filter((forecast): forecast is ForecastData => forecast !== undefined)
      },
      
      getTotalStats: () => {
        const selectedForecasts = get().getSelectedForecasts()
        
        if (selectedForecasts.length === 0) {
          return { totalForecast: 0, totalActual: 0, averageAccuracy: null }
        }
        
        const totals = selectedForecasts.reduce(
          (acc, forecast) => {
            const forecastSum = forecast.weeks.reduce((sum, week) => sum + week.forecastSales, 0)
            const actualSum = forecast.weeks.reduce((sum, week) => sum + (week.actualSales || 0), 0)
            
            return {
              totalForecast: acc.totalForecast + forecastSum,
              totalActual: acc.totalActual + actualSum
            }
          },
          { totalForecast: 0, totalActual: 0 }
        )
        
        const averageAccuracy = totals.totalActual > 0 
          ? ((totals.totalForecast - totals.totalActual) / totals.totalActual) * 100
          : null
        
        return {
          ...totals,
          averageAccuracy
        }
      }
    }),
    {
      name: 'forecast-store'
    }
  )
)