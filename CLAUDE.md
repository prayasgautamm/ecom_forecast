# E-commerce Sales Forecast Application

## Tech Stack

### Frontend Framework
- **Next.js 14** - App Router architecture
- **React 18** - UI library
- **TypeScript** - Type safety

### UI Components & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **Tremor** - Dashboard components for charts

### State Management
- **Zustand** - State management for forecast data
- **React Hook Form** - Form handling

### UI Libraries
- **Sonner** - Toast notifications
- **cmdk** - Command palette
- **React Hot Toast** - Alternative toast notifications

### Data Visualization
- **Recharts** - Chart library for sales forecast visualization
- **Tremor Charts** - Additional chart components

### Data Handling
- **XLSX** - Excel file import/export
- **Prisma** - Database ORM (configured but not actively used)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Playwright** - E2E testing
- **TypeScript** - Type checking
- **npm** - Package manager

## Project Structure

### Main Implementation Directory: `/app/forecast-working/`
This is where ALL the main forecast functionality is implemented:
- `page.tsx` - Main forecast page with full functionality
- `page-minimal.tsx` - Minimal version with external UI libraries

### Component Structure: `/components/forecast/`
- `ForecastTable.tsx` - Main table component for displaying forecast data
- `ForecastWorkspace.tsx` - Workspace management component
- `InlineEditCell.tsx` - Inline editing functionality for cells
- `SKUManagementSidebar.tsx` - SKU selection and management sidebar
- `ComparisonView.tsx` - SKU/Group comparison views
- `StatusBadge.tsx` - Status indicator component
- `ForecastLoadingScreen.tsx` - Loading state component

### State Management: `/lib/stores/`
- `forecast-store.ts` - Main Zustand store for forecast state
- `data-adapter.ts` - Data persistence adapter interface
- `simple-data-adapter.ts` - Simple implementation of data adapter

### UI Components: `/components/ui/`
Standard shadcn/ui components - DO NOT modify these unless necessary

## Project Purpose

This is a **sales forecasting application** for e-commerce inventory management. It helps predict future sales, track actual vs forecasted performance, and manage inventory levels based on sales predictions.

## Key Features

1. **Sales Forecast Management**: Enter and track weekly sales forecasts by SKU
2. **Actual vs Forecast Tracking**: Compare predicted sales with actual performance
3. **Inventory Planning**: Calculate stock requirements based on sales forecasts
4. **Multi-SKU Analysis**: Compare sales performance across different products
5. **Excel-like Calculations**: Automatic error calculations and stock planning
6. **52-Week View**: Full year forecast with pagination
7. **ABC Analysis**: Product categorization based on performance
8. **Group Management**: Organize SKUs into product groups
9. **Real-time Updates**: Live calculations and state updates
10. **Data Import/Export**: Excel file support for bulk operations

## Important Implementation Guidelines

### 1. File Organization
- **ALWAYS** keep all forecast-related implementation in `/app/forecast-working/`
- Do not create new pages unless specifically requested
- Component extraction should go to `/components/forecast/`

### 2. State Management
- Use the existing Zustand store (`forecast-store.ts`)
- Maintain the current state structure
- Use the data adapter pattern for persistence

### 3. Styling Guidelines
- Use Tailwind CSS classes
- Follow the existing color scheme:
  - Primary: Blue tones (blue-500, blue-600)
  - Success: Emerald (emerald-500, emerald-600)
  - Warning: Amber (amber-500, amber-600)
  - Error: Red (red-500, red-600)
- Maintain consistent spacing and sizing

### 4. Component Patterns
- Use controlled components for forms
- Implement proper TypeScript types
- Follow React best practices (hooks, memoization where needed)
- Keep components focused and single-purpose

### 5. Data Model

```typescript
interface SKU {
  sku: string
  displayName: string
  category: string
  abc: 'A' | 'B' | 'C'
  forecastAccuracy: number
  totalForecast: number
  totalActual: number
}

interface ForecastWeek {
  weekNumber: number
  date: string
  forecastSales: number
  actualSales: number | null
  openingStock: number
  stockIn: number
  stockOut: number
  closingStock: number
  error: number | null
  errorPercent: number | null
}
```

## Commands

```bash
# Development
npm run dev

# Build & Deploy
npm run build
npm start

# Code Quality
npm run lint
npm run typecheck

# Testing
npm run test              # Run all tests
npm run test:minimal      # Run minimal UI tests
npm run test:toast        # Run toast notification tests
npm run test:performance  # Run performance tests
npm run test:ui          # Open Playwright UI
```

## Testing Strategy

Tests are located in `/tests/` directory:
- `minimal-ui-complete.spec.ts` - UI functionality tests
- `toast-notifications.spec.ts` - Notification system tests
- `performance-integration.spec.ts` - Performance benchmarks
- `forecast-page-complete.spec.ts` - Full page integration tests

## Development Workflow

1. Make changes in `/app/forecast-working/page.tsx`
2. Run `npm run dev` to test locally
3. Run `npm run lint` and `npm run typecheck` before committing
4. Run tests with `npm run test`
5. Commit with descriptive messages
6. Push to GitHub

## Important Notes

- The main implementation should remain in `forecast-working/page.tsx`
- Do not break existing functionality when adding features
- Maintain backward compatibility with existing data structures
- Follow the established patterns for consistency
- Always test thoroughly before committing