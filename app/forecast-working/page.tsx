'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Package, Search, Plus } from 'lucide-react'

export default function WorkingForecastPage() {
  const [selectedSKU, setSelectedSKU] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Hardcoded data for testing
  const skus = [
    { sku: '6LD', displayName: '6 LD', status: 'healthy', forecast: 1000, actual: 950 },
    { sku: '6ST', displayName: '6 ST', status: 'low-stock', forecast: 1500, actual: 1400 },
    { sku: '3LD-CS008', displayName: '3 LD - CS 008', status: 'healthy', forecast: 800, actual: 0 },
  ]
  
  const filteredSKUs = skus.filter(sku => 
    sku.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Sales Forecast (Working Version)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            A working implementation with hardcoded data
          </p>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold">SKUs</h2>
                <Badge variant="secondary">{filteredSKUs.length}</Badge>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search SKUs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add SKU
            </Button>
          </div>
          
          {/* SKU List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredSKUs.map((sku) => (
              <Card
                key={sku.sku}
                className={`cursor-pointer transition-all ${
                  selectedSKU === sku.sku ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedSKU(sku.sku)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{sku.displayName}</h3>
                      <p className="text-xs text-gray-500 mb-2">{sku.sku}</p>
                      <div className="text-xs space-y-1">
                        <div>Forecast: <span className="font-medium text-blue-600">{sku.forecast}</span></div>
                        <div>Actual: <span className="font-medium text-green-600">{sku.actual || '-'}</span></div>
                      </div>
                    </div>
                    <Badge 
                      variant={sku.status === 'healthy' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {sku.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedSKU ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {skus.find(s => s.sku === selectedSKU)?.displayName}
                </CardTitle>
                <CardDescription>
                  Weekly forecast data - Click cells to edit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead className="text-center">Opening Stock</TableHead>
                      <TableHead className="text-center">Forecast Sales</TableHead>
                      <TableHead className="text-center">Actual Sales</TableHead>
                      <TableHead className="text-center">Variance</TableHead>
                      <TableHead className="text-center">Stock In</TableHead>
                      <TableHead className="text-center">Closing Stock</TableHead>
                      <TableHead className="text-center">Weeks Cover</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((week) => (
                      <TableRow key={week}>
                        <TableCell className="font-medium">Week {week}</TableCell>
                        <TableCell className="text-center">1000</TableCell>
                        <TableCell className="text-center text-blue-600">50</TableCell>
                        <TableCell className="text-center text-green-600">-</TableCell>
                        <TableCell className="text-center">-</TableCell>
                        <TableCell className="text-center">0</TableCell>
                        <TableCell className="text-center">950</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default" className="text-xs">4.2w</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No SKU Selected
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Select an SKU from the sidebar to view its forecast details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}