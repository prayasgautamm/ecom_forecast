'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface EditableCellProps {
  value: number
  onChange: (value: number) => void
  className?: string
  disabled?: boolean
  id?: string
  onFocus?: () => void
}

export function EditableCell({ value, onChange, className, disabled = false, id, onFocus }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value.toString())
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const newValue = parseFloat(editValue)
    if (!isNaN(newValue) && newValue !== value) {
      onChange(newValue)
    } else {
      setEditValue(value.toString())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation()
      handleSave()
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      setEditValue(value.toString())
      setIsEditing(false)
    }
  }

  const handleClick = () => {
    onFocus?.()
    setIsEditing(true)
  }

  if (disabled) {
    return (
      <div className={cn("text-center font-medium", className)}>
        {value.toLocaleString()}
      </div>
    )
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("h-8 text-center", className)}
      />
    )
  }

  return (
    <div
      id={id}
      onClick={handleClick}
      className={cn(
        "text-center font-medium cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 px-2 py-1 rounded transition-colors",
        className
      )}
    >
      {value.toLocaleString()}
    </div>
  )
}