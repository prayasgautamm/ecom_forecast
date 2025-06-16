'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

export default function ForecastV2Page() {
  const [isLoading, setIsLoading] = useState(true)
  const [skus, setSkus] = useState<any[]>([])
  
  useEffect(() => {
    // Simple initialization
    setTimeout(() => {
      setSkus([
        { sku: '6LD', displayName: '6 LD', totalForecast: 1000 },
        { sku: '6ST', displayName: '6 ST', totalForecast: 1500 },
        { sku: '3LD-CS008', displayName: '3 LD - CS 008', totalForecast: 800 }
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p>Loading forecast data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold">Sales Forecast (Simplified)</h1>
          <p className="text-gray-600">Testing basic functionality</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            SKUs ({skus.length})
          </h2>
          <div className="space-y-2">
            {skus.map(sku => (
              <Card key={sku.sku} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-medium">{sku.displayName}</h3>
                  <p className="text-sm text-gray-500">{sku.sku}</p>
                  <p className="text-sm text-blue-600 mt-2">
                    Forecast: {sku.totalForecast} units
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Select an SKU</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Click on an SKU from the sidebar to view its forecast details.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  Components are loading correctly. The issue might be with the Zustand store or component imports.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}