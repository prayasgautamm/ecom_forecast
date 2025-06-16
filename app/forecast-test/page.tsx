'use client'

import React from 'react'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Component Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Basic Test</h2>
          <p>If you can see this, basic rendering is working.</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Store Test</h2>
          <button 
            onClick={() => {
              const { useForecastStore } = require('@/lib/stores/forecast-store')
              const state = useForecastStore.getState()
              console.log('Store state:', state)
              alert(`SKUs: ${state.skus.length}, Loading: ${state.isLoading}`)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check Store State
          </button>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Initialize Data Test</h2>
          <button 
            onClick={() => {
              const { initializeStoreWithSimpleData } = require('@/lib/stores/simple-data-adapter')
              const { useForecastStore } = require('@/lib/stores/forecast-store')
              
              const data = initializeStoreWithSimpleData()
              console.log('Initialized data:', data)
              
              const store = useForecastStore.getState()
              store.initializeData(data)
              
              alert('Data initialized! Check console.')
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Initialize Data Manually
          </button>
        </div>
      </div>
    </div>
  )
}