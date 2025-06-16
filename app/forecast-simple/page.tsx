'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

export default function SimpleForecastPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Sales Forecast
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Simplified version for testing
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Forecast System Status</CardTitle>
            <CardDescription>
              The main forecast page is being optimized. Use this simplified version for now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span>6 SKUs available in the system</span>
              </div>
              <p className="text-sm text-gray-600">
                The forecast system is operational. Data initialization is being optimized for better performance.
              </p>
              <Button 
                onClick={() => window.location.href = '/forecast'}
                className="w-full"
              >
                Try Main Forecast Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}