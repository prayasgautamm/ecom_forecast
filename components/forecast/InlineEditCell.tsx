'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { cn, formatNumber } from '@/lib/utils'
import { useForecastStore } from '@/lib/stores/forecast-store'

interface InlineEditCellProps {
  skuId: string
  weekNumber: number
  field: 'forecastSales' | 'actualSales' | 'stockIn' | 'openingStock'
  value: number | null
  className?: string
  disabled?: boolean
  placeholder?: string
  onFocus?: () => void
  onBlur?: () => void
  allowNull?: boolean // For actualSales which can be null
}

export function InlineEditCell({
  skuId,
  weekNumber,
  field,
  value,
  className,
  disabled = false,
  placeholder = '',
  onFocus,
  onBlur,
  allowNull = false
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const updateCell = useForecastStore((state) => state.updateCell)

  // Initialize edit value when value changes
  useEffect(() => {
    if (value !== null) {
      setEditValue(value.toString())
    } else {
      setEditValue('')
    }
  }, [value])

  // Auto-focus and select when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = useCallback(() => {
    if (disabled) return
    setIsEditing(true)
    onFocus?.()
  }, [disabled, onFocus])

  const handleSave = useCallback(async () => {
    if (disabled) return

    const numValue = parseFloat(editValue)
    const isValid = editValue === '' ? allowNull : !isNaN(numValue) && numValue >= 0
    
    if (!isValid) {
      // Reset to original value if invalid
      setEditValue(value?.toString() || '')
      setIsEditing(false)
      return
    }

    const newValue = editValue === '' ? (allowNull ? null : 0) : numValue
    
    // Only update if value actually changed
    if (newValue !== value) {
      setIsLoading(true)
      try {
        await updateCell(skuId, weekNumber, field, newValue as number)
      } catch (error) {
        console.error('Failed to update cell:', error)
        // Reset to original value on error
        setEditValue(value?.toString() || '')
      } finally {
        setIsLoading(false)
      }
    }
    
    setIsEditing(false)
    onBlur?.()
  }, [editValue, value, allowNull, disabled, updateCell, skuId, weekNumber, field, onBlur])

  const handleCancel = useCallback(() => {
    setEditValue(value?.toString() || '')
    setIsEditing(false)
    onBlur?.()
  }, [value, onBlur])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        e.stopPropagation()
        handleSave()
        break
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        handleCancel()
        break
      case 'Tab':
        // Let tab handle naturally, but save first
        handleSave()
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        // Allow navigation, but stop propagation to prevent table navigation
        e.stopPropagation()
        break
    }
  }, [handleSave, handleCancel])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers, decimals, and empty string
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setEditValue(value)
    }
  }, [])

  const displayValue = value !== null ? formatNumber(value) : (allowNull ? '-' : '0')

  if (disabled) {
    return (
      <div className={cn(
        "h-9 px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50",
        className
      )}>
        {displayValue}
      </div>
    )
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={editValue}
        onChange={handleInputChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className={cn(
          "h-9 text-center font-medium border-2 border-blue-500 shadow-sm",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
      />
    )
  }

  return (
    <div
      onClick={handleStartEdit}
      onDoubleClick={handleStartEdit}
      className={cn(
        "h-9 px-3 py-2 text-center font-medium cursor-pointer rounded transition-colors",
        "hover:bg-blue-50 dark:hover:bg-blue-950/20",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
        "active:bg-blue-100 dark:active:bg-blue-950/30",
        value === null && allowNull && "text-gray-400 italic",
        className
      )}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${field} for week ${weekNumber}`}
    >
      {displayValue}
    </div>
  )
}

// Specialized components for different field types
export function ForecastSalesCell(props: Omit<InlineEditCellProps, 'field' | 'allowNull'>) {
  return (
    <InlineEditCell
      {...props}
      field="forecastSales"
      className={cn("text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/10", props.className)}
      placeholder="Enter forecast"
    />
  )
}

export function ActualSalesCell(props: Omit<InlineEditCellProps, 'field' | 'allowNull'>) {
  return (
    <InlineEditCell
      {...props}
      field="actualSales"
      allowNull={true}
      className={cn("text-green-600 dark:text-green-400 bg-green-50/30 dark:bg-green-950/10", props.className)}
      placeholder="Enter actual"
    />
  )
}

export function StockInCell(props: Omit<InlineEditCellProps, 'field' | 'allowNull'>) {
  return (
    <InlineEditCell
      {...props}
      field="stockIn"
      className={cn("text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-950/10", props.className)}
      placeholder="Enter stock in"
    />
  )
}

export function OpeningStockCell(props: Omit<InlineEditCellProps, 'field' | 'allowNull'>) {
  return (
    <InlineEditCell
      {...props}
      field="openingStock"
      className={cn("text-gray-700 dark:text-gray-300 bg-gray-50/30 dark:bg-gray-950/10", props.className)}
      placeholder="Enter opening stock"
      disabled={props.weekNumber !== 1} // Only editable for first week
    />
  )
}