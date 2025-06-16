'use client'

import React, { useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useForecastStore } from '@/lib/stores/forecast-store'
// import { initializeStoreWithLegacyData } from '@/lib/stores/data-adapter'
import { initializeStoreWithSimpleData } from '@/lib/stores/simple-data-adapter'
import { ForecastLoadingScreen } from '@/components/forecast/ForecastLoadingScreen'
import { cn } from '@/lib/utils'

// Lazy load heavy components
const SKUManagementSidebar = dynamic(
  () => import('@/components/forecast/SKUManagementSidebar').then(mod => ({ default: mod.SKUManagementSidebar })),
  { 
    loading: () => <div className="w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 animate-pulse" />,
    ssr: false
  }
)

const ForecastWorkspace = dynamic(
  () => import('@/components/forecast/ForecastWorkspace').then(mod => ({ default: mod.ForecastWorkspace })),
  { 
    loading: () => <div className="flex-1 bg-gray-50 dark:bg-gray-900 animate-pulse" />,
    ssr: false
  }
)

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
    return <ForecastLoadingScreen />
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