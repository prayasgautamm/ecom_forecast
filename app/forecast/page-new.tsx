'use client'

import React, { useEffect } from 'react'
import { useForecastStore } from '@/lib/stores/forecast-store'
import { initializeStoreWithLegacyData } from '@/lib/stores/data-adapter'
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
      const initialData = initializeStoreWithLegacyData()
      initializeData(initialData)
    }
  }, [skus.length, initializeData])

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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your forecast data...</p>
        </div>
      </div>
    )
  }

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
    </div>
  )
}