# E-commerce Forecast Application

A modern, user-friendly forecasting application built with Next.js 14, TypeScript, and Prisma to replace traditional Excel-based forecasting.

## Features

- Import Excel/CSV data
- Interactive data visualization with charts
- CRUD operations for forecast management
- User authentication
- Responsive design with loading states
- Real-time data updates

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **UI**: Tailwind CSS + Shadcn/ui components
- **Charts**: Recharts
- **Forms**: React Hook Form

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your database
3. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```
4. Set up the database:
   ```bash
   npx prisma db push
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure
```
ecom_forecast/
├── app/              # Next.js app directory
├── components/       # React components
│   └── ui/          # Shadcn/ui components
├── lib/             # Utility functions
├── prisma/          # Database schema
├── public/          # Static assets
└── forecast.xlsx    # Sample forecast data
```
