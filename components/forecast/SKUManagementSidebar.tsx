'use client'

import React, { useState } from 'react'
import { useForecastStore } from '@/lib/stores/forecast-store'
import { StatusBadge } from './StatusBadge'
import { formatNumber } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Package, 
  TrendingUp, 
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SKUManagementSidebarProps {
  className?: string
}

export function SKUManagementSidebar({ className }: SKUManagementSidebarProps) {
  const {
    searchTerm,
    setSearchTerm,
    selectedSKUIds,
    toggleSKU,
    selectAllSKUs,
    unselectAllSKUs,
    getFilteredSKUs,
    createSKU,
    deleteSKU,
    sidebarCollapsed,
    toggleSidebar,
    isLoading
  } = useForecastStore()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newSKU, setNewSKU] = useState({ sku: '', displayName: '', category: '' })
  
  const filteredSKUs = getFilteredSKUs()
  const hasSelection = selectedSKUIds.length > 0
  const allSelected = filteredSKUs.length > 0 && selectedSKUIds.length === filteredSKUs.length

  const handleAddSKU = async () => {
    if (newSKU.sku && newSKU.displayName) {
      await createSKU({
        sku: newSKU.sku,
        displayName: newSKU.displayName,
        category: newSKU.category || undefined
      })
      setNewSKU({ sku: '', displayName: '', category: '' })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteSKU = async (skuId: string) => {
    if (confirm('Are you sure you want to delete this SKU? This action cannot be undone.')) {
      await deleteSKU(skuId)
    }
  }

  const handleBulkAction = (action: 'select-all' | 'unselect-all') => {
    if (action === 'select-all') {
      selectAllSKUs()
    } else {
      unselectAllSKUs()
    }
  }

  if (sidebarCollapsed) {
    return (
      <div className={cn(
        "w-12 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4",
        className
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="mb-4 h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col gap-2">
          <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          {selectedSKUIds.length > 0 && (
            <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center text-xs">
              {selectedSKUIds.length}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-lg">SKUs</h2>
            {filteredSKUs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredSKUs.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search SKUs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Add SKU Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add SKU
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New SKU</DialogTitle>
              <DialogDescription>
                Create a new SKU to start forecasting its sales.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sku-code">SKU Code</Label>
                <Input
                  id="sku-code"
                  placeholder="e.g., PROD-001"
                  value={newSKU.sku}
                  onChange={(e) => setNewSKU({ ...newSKU, sku: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  placeholder="e.g., Premium Widget"
                  value={newSKU.displayName}
                  onChange={(e) => setNewSKU({ ...newSKU, displayName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  placeholder="e.g., Electronics"
                  value={newSKU.category}
                  onChange={(e) => setNewSKU({ ...newSKU, category: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddSKU}
                disabled={!newSKU.sku || !newSKU.displayName || isLoading}
              >
                {isLoading ? "Adding..." : "Add SKU"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bulk Actions */}
      {filteredSKUs.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => 
                  handleBulkAction(checked ? 'select-all' : 'unselect-all')
                }
              />
              <span className="text-gray-600 dark:text-gray-400">
                {hasSelection ? `${selectedSKUIds.length} selected` : 'Select all'}
              </span>
            </div>
            {hasSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => unselectAllSKUs()}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* SKU List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSKUs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No SKUs found matching your search.' : 'No SKUs yet. Add your first SKU to get started.'}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredSKUs.map((sku) => (
              <Card
                key={sku.sku}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedSKUIds.includes(sku.sku) 
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                )}
                onClick={() => toggleSKU(sku.sku)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedSKUIds.includes(sku.sku)}
                        onChange={() => toggleSKU(sku.sku)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm truncate">
                            {sku.displayName}
                          </h3>
                          <StatusBadge 
                            status={sku.healthStatus}
                            size="sm"
                            showIcon={false}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {sku.sku}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Forecast:</span>
                            <p className="font-medium text-blue-600 dark:text-blue-400">
                              {formatNumber(sku.totalForecast)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Actual:</span>
                            <p className="font-medium text-green-600 dark:text-green-400">
                              {sku.totalActual > 0 ? formatNumber(sku.totalActual) : '-'}
                            </p>
                          </div>
                        </div>
                        
                        {sku.accuracyPercent !== null && (
                          <div className="mt-2 flex items-center gap-1">
                            {sku.accuracyPercent >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className={cn(
                              "text-xs font-medium",
                              sku.accuracyPercent >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {sku.accuracyPercent > 0 ? '+' : ''}{sku.accuracyPercent.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit SKU
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 dark:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSKU(sku.sku)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete SKU
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {hasSelection && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">
              {selectedSKUIds.length} SKU{selectedSKUIds.length === 1 ? '' : 's'} selected
            </p>
            <div className="flex justify-between">
              <span>Total Forecast:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formatNumber(useForecastStore.getState().getTotalStats().totalForecast)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}