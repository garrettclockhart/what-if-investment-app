# Investment Value Dashboard

A Next.js application that allows users to explore what their product purchases could have been worth if invested in the company's stock instead.

## Features

### 🚀 Real-Time Stock Data
- **Live Stock Prices**: Fetches current stock prices from Yahoo Finance API
- **Historical Data**: 5 years of monthly historical stock data
- **Smart Caching**: 5-minute cache to improve performance and reduce API calls
- **Fallback System**: Graceful fallback to enhanced mock data when APIs are unavailable

### 📊 Enhanced Line Charts
- **Time-Based X-Axis**: Displays years/months along the x-axis for better time visualization
- **Interactive Tooltips**: Detailed hover information showing exact dates and values
- **Performance Indicators**: Visual indicators for gains/losses with color coding
- **Reference Lines**: Shows original investment amount as a reference line
- **Responsive Design**: Adapts to different screen sizes

### 🛍️ Product Database
- **Comprehensive Catalog**: Products from Apple, Nike, Microsoft, Best Buy, and Tesla
- **Smart Search**: Search by product name, category, or company
- **Real-Time Pricing**: Shows current stock prices alongside product MSRP
- **Investment Calculations**: Automatic calculation of shares, current value, and returns

### 💡 Investment Analysis
- **What-If Scenarios**: See what your purchase could have been worth as stock
- **Performance Metrics**: Total return, percentage gain/loss, and years held
- **Visual Timeline**: Track investment growth over time with detailed charts
- **Educational Focus**: Learn about investment opportunities through real examples

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Charts**: Recharts library for interactive line charts
- **Data**: Yahoo Finance API for real-time stock data
- **State Management**: React hooks (useState, useEffect, useMemo)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Data Loading**: App fetches real-time stock data on startup
2. **Product Selection**: Users search and select products from the database
3. **Investment Calculation**: System calculates what the purchase amount could have bought in stock
4. **Visualization**: Interactive charts show investment growth over time
5. **Analysis**: Users see detailed performance metrics and returns

## API Integration

The app integrates with Yahoo Finance API for:
- Current stock prices
- Historical monthly data (5 years)
- Company information

**Note**: The app includes fallback mock data to ensure functionality even when APIs are unavailable.

## Deployment

This project is configured for deployment on Vercel and can be easily deployed by connecting your GitHub repository.

## Educational Purpose

This tool is designed for educational purposes to help users understand:
- The power of compound growth in stock investments
- Historical performance of major companies
- The opportunity cost of consumer purchases
- Investment analysis and portfolio thinking

**Disclaimer**: Past performance does not guarantee future results. Always consult with a financial advisor before making investment decisions.
