'use client'

import React, { useEffect } from 'react'
import { useForecastStore } from '@/lib/stores/forecast-store'
// import { initializeStoreWithLegacyData } from '@/lib/stores/data-adapter'
import { initializeStoreWithSimpleData } from '@/lib/stores/simple-data-adapter'
import { ForecastLoadingScreen } from '@/components/forecast/ForecastLoadingScreen'
import { SKUManagementSidebar } from '@/components/forecast/SKUManagementSidebar'
import { ForecastWorkspace } from '@/components/forecast/ForecastWorkspace'
import { cn } from '@/lib/utils'

export default function ForecastPage() {
  const {
    skus,
    selectedSKUIds,
    sidebarCollapsed,
    isLoading,
    error,
    initializeData
  } = useForecastStore()

  // Initialize store with legacy data on component mount
  useEffect(() => {
    if (skus.length === 0) {
      // Set loading state immediately
      useForecastStore.setState({ isLoading: true })
      
      // Use setTimeout to make initialization async and show loading state
      setTimeout(() => {
        try {
          console.log('Starting data initialization...')
          const initialData = initializeStoreWithSimpleData()
          console.log('Data initialized:', { 
            skusCount: initialData.skus.length, 
            forecastsCount: initialData.forecasts.size 
          })
          initializeData(initialData)
        } catch (error) {
          console.error('Initialization error:', error)
          useForecastStore.setState({ 
            error: error instanceof Error ? error.message : 'Failed to load data',
            isLoading: false 
          })
        }
      }, 100)
    }
  }, []) // Remove dependencies to prevent re-runs

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 mx-auto mb-4 text-red-500">
            ⚠️
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (isLoading && skus.length === 0) {
    return <ForecastLoadingScreen />
  }

  console.log('Rendering forecast page:', { 
    skusCount: skus.length, 
    selectedCount: selectedSKUIds.length,
    isLoading,
    error 
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Sales Forecast
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and analyze your inventory forecasts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedSKUIds.length} of {skus.length} SKUs selected
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        <SKUManagementSidebar 
          className={cn(
            "transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "w-12" : "w-80"
          )} 
        />
        <ForecastWorkspace className="flex-1" />
      </div>

      {/* Debug Info */}
      <div className="fixed bottom-4 left-4 bg-black text-white p-2 text-xs rounded">
        SKUs: {skus.length} | Selected: {selectedSKUIds.length} | Loading: {isLoading.toString()}
      </div>
    </div>
  )
}