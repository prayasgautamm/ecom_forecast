import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

export type HealthStatus = 'healthy' | 'low-stock' | 'out-of-stock' | 'overstocked'

interface StatusBadgeProps {
  status: HealthStatus
  weeksCover?: number
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ 
  status, 
  weeksCover, 
  className, 
  showIcon = true,
  size = 'md'
}: StatusBadgeProps) {
  const getStatusConfig = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return {
          label: 'Healthy',
          variant: 'default' as const,
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: CheckCircle
        }
      case 'low-stock':
        return {
          label: 'Low Stock',
          variant: 'destructive' as const,
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          icon: AlertTriangle
        }
      case 'out-of-stock':
        return {
          label: 'Out of Stock',
          variant: 'destructive' as const,
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          icon: XCircle
        }
      case 'overstocked':
        return {
          label: 'Overstocked',
          variant: 'secondary' as const,
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          icon: TrendingUp
        }
      default:
        return {
          label: 'Unknown',
          variant: 'outline' as const,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          icon: AlertTriangle
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Badge
      className={cn(
        config.color,
        sizeClasses[size],
        'font-medium border-0 flex items-center gap-1.5',
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
      {weeksCover !== undefined && (
        <span className="ml-1 opacity-75">
          ({weeksCover.toFixed(1)}w)
        </span>
      )}
    </Badge>
  )
}

// Helper function to determine health status based on weeks of cover
export function calculateHealthStatus(weeksCover: number): HealthStatus {
  if (weeksCover <= 0) return 'out-of-stock'
  if (weeksCover <= 2) return 'low-stock'
  if (weeksCover >= 12) return 'overstocked'
  return 'healthy'
}

// Helper function to get health status color for styling
export function getHealthStatusColor(status: HealthStatus): string {
  switch (status) {
    case 'healthy': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20'
    case 'low-stock': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20'  
    case 'out-of-stock': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20'
    case 'overstocked': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20'
    default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/20'
  }
}