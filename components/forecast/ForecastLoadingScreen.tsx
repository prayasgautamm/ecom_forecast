import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ForecastLoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Skeleton */}
        <div className="w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-5 w-8" />
              </div>
            </div>
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Skeleton className="h-4 w-4 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-3 w-20 mb-2" />
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Skeleton className="h-3 w-12 mb-1" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <div>
                            <Skeleton className="h-3 w-10 mb-1" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Workspace Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Stats Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div>
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="flex-1 overflow-auto p-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-20" />
                    <div className="text-right">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {/* Table Header Skeleton */}
                  <div className="border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-3">
                    <div className="grid grid-cols-8 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                  
                  {/* Table Rows Skeleton */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="border-b border-gray-200 dark:border-gray-700 p-3">
                      <div className="grid grid-cols-8 gap-4">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <Skeleton key={j} className="h-8 w-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Loading indicator overlay */}
      <div className="fixed bottom-8 right-8 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Loading forecast data...</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Setting up your workspace</p>
          </div>
        </div>
      </div>
    </div>
  )
}