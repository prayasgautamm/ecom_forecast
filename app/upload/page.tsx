import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// Removed lucide-react import

export default function UploadPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Source</h1>
        <p className="text-muted-foreground mt-2">
          Forecast data is pre-loaded from the Excel file
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Data Source</CardTitle>
          <CardDescription>
            The forecast data is currently loaded from the built-in dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <span className="h-12 w-12 text-primary text-5xl">📄</span>
            <div>
              <h3 className="font-semibold">forecast.xlsx</h3>
              <p className="text-sm text-muted-foreground">
                Original Excel file containing forecast data
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex gap-2">
              <span className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">ℹ️</span>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Data is Pre-loaded
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  The forecast data from your Excel file has been converted into the application. 
                  You can view and manage this data through the Forecast and Manage sections.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}