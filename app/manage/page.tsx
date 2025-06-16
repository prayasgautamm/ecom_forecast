'use client'

import { useState } from 'react'
import { formatNumber } from '@/lib/utils'
import { skuForecasts } from '@/lib/forecast-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

export default function ManagePage() {
  const [selectedSKU, setSelectedSKU] = useState<string>(skuForecasts[0].sku)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchDate, setSearchDate] = useState('')
  
  const selectedSKUData = skuForecasts.find(s => s.sku === selectedSKU)
  const filteredData = selectedSKUData?.data.filter(item => 
    item.date.toLowerCase().includes(searchDate.toLowerCase())
  ) || []

  const handleEdit = (item: any, sku: string) => {
    setEditingItem({ ...item, sku })
  }

  const handleSave = () => {
    toast.success('Forecast entry updated successfully')
    setEditingItem(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Forecasts</h1>
        <p className="text-muted-foreground mt-2">
          Edit forecast and actual values by SKU
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Forecast Entries</CardTitle>
              <CardDescription>
                Select a SKU to manage its forecast data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="sku-select">Select SKU</Label>
              <Select value={selectedSKU} onValueChange={setSelectedSKU}>
                <SelectTrigger id="sku-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skuForecasts.map(sku => (
                    <SelectItem key={sku.sku} value={sku.sku}>
                      {sku.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="search">Search by Date</Label>
              <div className="flex items-center space-x-2">
                <span className="h-4 w-4 text-muted-foreground">🔍</span>
                <Input
                  id="search"
                  placeholder="Search date..."
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {selectedSKUData && (
            <>
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">{selectedSKUData.displayName}</h3>
                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Records:</span>{' '}
                    <span className="font-medium">{selectedSKUData.data.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">With Actuals:</span>{' '}
                    <span className="font-medium">
                      {selectedSKUData.data.filter(d => d.actual).length}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Forecast Only:</span>{' '}
                    <span className="font-medium">
                      {selectedSKUData.data.filter(d => !d.actual).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Forecast</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead className="text-right">Accuracy</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.date}</TableCell>
                        <TableCell className="text-right">{formatNumber(item.forecast)}</TableCell>
                        <TableCell className="text-right">
                          {item.actual ? formatNumber(item.actual) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.errorPercent !== null && item.errorPercent !== undefined ? (
                            <span className={Math.abs(item.errorPercent) <= 2 ? 'text-green-600' : 'text-red-600'}>
                              {item.errorPercent > 0 ? '+' : ''}{item.errorPercent.toFixed(1)}%
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.errorPercent !== null && item.errorPercent !== undefined ? `${(100 - Math.abs(item.errorPercent)).toFixed(1)}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item, selectedSKU)}
                          >
                            <span className="h-4 w-4">✏️</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Forecast Entry</DialogTitle>
            <DialogDescription>
              Update forecast or actual values for {editingItem?.date}
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <Input 
                  id="edit-date" 
                  value={editingItem.date} 
                  className="col-span-3" 
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-forecast" className="text-right">
                  Forecast
                </Label>
                <Input 
                  id="edit-forecast" 
                  type="number" 
                  defaultValue={editingItem.forecast} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-actual" className="text-right">
                  Actual
                </Label>
                <Input 
                  id="edit-actual" 
                  type="number" 
                  defaultValue={editingItem.actual || ''} 
                  placeholder="Enter actual value"
                  className="col-span-3" 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}