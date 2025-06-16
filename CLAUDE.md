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

### Data Visualization
- **Recharts** - Chart library for sales forecast visualization

### Development Tools
- **ESLint** - Code linting
- **npm** - Package manager

## Project Purpose

This is a **sales forecasting application** for e-commerce inventory management. It helps predict future sales, track actual vs forecasted performance, and manage inventory levels based on sales predictions.

## Key Features

1. **Sales Forecast Management**: Enter and track weekly sales forecasts by SKU
2. **Actual vs Forecast Tracking**: Compare predicted sales with actual performance
3. **Inventory Planning**: Calculate stock requirements based on sales forecasts
4. **Multi-SKU Analysis**: Compare sales performance across different products
5. **Excel-like Calculations**: Automatic error calculations and stock planning

## Commands

```bash
# Development
npm run dev

# Build & Deploy
npm run build

# Code Quality
npm run lint
npm run typecheck
```

## Data Model

- **Forecast**: Predicted weekly sales units
- **Actual**: Real sales data when available
- **Stock Management**: Inventory levels based on sales velocity
- **Error Tracking**: Forecast accuracy metrics