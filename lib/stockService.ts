// Stock data service for fetching real-time and historical stock data
export interface StockPrice {
  date: string;
  price: number;
}

export interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  priceHistory: StockPrice[];
  lastUpdated: string;
}

// Free stock API endpoints (no API key required)
const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Fallback mock data for when APIs are unavailable
const mockStockData: Record<string, StockData> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    currentPrice: 175.43,
    priceHistory: [
      { date: "2020-01", price: 77.38 },
      { date: "2021-01", price: 132.05 },
      { date: "2022-01", price: 174.78 },
      { date: "2023-01", price: 144.29 },
      { date: "2024-01", price: 185.64 },
      { date: "2024-12", price: 175.43 },
    ],
    lastUpdated: new Date().toISOString(),
  },
  NKE: {
    symbol: "NKE",
    name: "Nike Inc.",
    currentPrice: 75.12,
    priceHistory: [
      { date: "2020-01", price: 101.31 },
      { date: "2021-01", price: 141.47 },
      { date: "2022-01", price: 166.72 },
      { date: "2023-01", price: 117.66 },
      { date: "2024-01", price: 103.91 },
      { date: "2024-12", price: 75.12 },
    ],
    lastUpdated: new Date().toISOString(),
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    currentPrice: 415.26,
    priceHistory: [
      { date: "2020-01", price: 160.62 },
      { date: "2021-01", price: 231.96 },
      { date: "2022-01", price: 309.42 },
      { date: "2023-01", price: 239.82 },
      { date: "2024-01", price: 384.3 },
      { date: "2024-12", price: 415.26 },
    ],
    lastUpdated: new Date().toISOString(),
  },
  BBY: {
    symbol: "BBY",
    name: "Best Buy Co.",
    currentPrice: 88.45,
    priceHistory: [
      { date: "2020-01", price: 87.65 },
      { date: "2021-01", price: 109.58 },
      { date: "2022-01", price: 104.66 },
      { date: "2023-01", price: 81.59 },
      { date: "2024-01", price: 78.11 },
      { date: "2024-12", price: 88.45 },
    ],
    lastUpdated: new Date().toISOString(),
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla Inc.",
    currentPrice: 248.98,
    priceHistory: [
      { date: "2020-01", price: 88.6 },
      { date: "2021-01", price: 793.61 },
      { date: "2022-01", price: 1056.78 },
      { date: "2023-01", price: 123.18 },
      { date: "2024-01", price: 238.45 },
      { date: "2024-12", price: 248.98 },
    ],
    lastUpdated: new Date().toISOString(),
  },
};

// Cache for storing fetched data
const stockCache = new Map<string, { data: StockData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Generate more detailed historical data for better chart visualization
function generateDetailedHistory(baseHistory: StockPrice[]): StockPrice[] {
  const detailedHistory: StockPrice[] = [];
  
  for (let i = 0; i < baseHistory.length - 1; i++) {
    const current = baseHistory[i];
    const next = baseHistory[i + 1];
    
    // Add the current point
    detailedHistory.push(current);
    
    // Generate intermediate points for better visualization
    const currentDate = new Date(current.date + "-01");
    const nextDate = new Date(next.date + "-01");
    const monthsDiff = (nextDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                      (nextDate.getMonth() - currentDate.getMonth());
    
    if (monthsDiff > 1) {
      const priceDiff = next.price - current.price;
      const priceStep = priceDiff / monthsDiff;
      
      for (let j = 1; j < monthsDiff; j++) {
        const intermediateDate = new Date(currentDate);
        intermediateDate.setMonth(currentDate.getMonth() + j);
        
        const intermediatePrice = current.price + (priceStep * j);
        
        detailedHistory.push({
          date: intermediateDate.toISOString().slice(0, 7), // YYYY-MM format
          price: Math.round(intermediatePrice * 100) / 100
        });
      }
    }
  }
  
  // Add the last point
  if (baseHistory.length > 0) {
    detailedHistory.push(baseHistory[baseHistory.length - 1]);
  }
  
  return detailedHistory;
}

// Fetch current stock price from Yahoo Finance
async function fetchCurrentPrice(symbol: string): Promise<number | null> {
  try {
    const response = await fetch(`${YAHOO_FINANCE_BASE}/${symbol}?interval=1d&range=1d`);
    const data = await response.json();
    
    if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return data.chart.result[0].meta.regularMarketPrice;
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to fetch current price for ${symbol}:`, error);
    return null;
  }
}

// Fetch historical data from Yahoo Finance
async function fetchHistoricalData(symbol: string): Promise<StockPrice[]> {
  try {
    const response = await fetch(`${YAHOO_FINANCE_BASE}/${symbol}?interval=1mo&range=5y`);
    const data = await response.json();
    
    if (data.chart?.result?.[0]?.timestamp && data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
      const timestamps = data.chart.result[0].timestamp;
      const prices = data.chart.result[0].indicators.quote[0].close;
      
      return timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().slice(0, 7), // YYYY-MM format
        price: Math.round(prices[index] * 100) / 100
      })).filter((item: StockPrice) => item.price !== null);
    }
    
    return [];
  } catch (error) {
    console.warn(`Failed to fetch historical data for ${symbol}:`, error);
    return [];
  }
}

// Main function to get stock data
export async function getStockData(symbol: string): Promise<StockData> {
  // Check cache first
  const cached = stockCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Try to fetch real-time data
    const [currentPrice, historicalData] = await Promise.all([
      fetchCurrentPrice(symbol),
      fetchHistoricalData(symbol)
    ]);

    // If we got real data, use it
    if (currentPrice && historicalData.length > 0) {
      const stockData: StockData = {
        symbol,
        name: mockStockData[symbol]?.name || `${symbol} Inc.`,
        currentPrice,
        priceHistory: generateDetailedHistory(historicalData),
        lastUpdated: new Date().toISOString(),
      };

      // Cache the result
      stockCache.set(symbol, { data: stockData, timestamp: Date.now() });
      
      return stockData;
    }
  } catch (error) {
    console.warn(`Error fetching real-time data for ${symbol}:`, error);
  }

  // Fallback to mock data with enhanced history
  const mockData = mockStockData[symbol];
  if (mockData) {
    const enhancedData: StockData = {
      ...mockData,
      priceHistory: generateDetailedHistory(mockData.priceHistory),
      lastUpdated: new Date().toISOString(),
    };

    // Cache the enhanced mock data
    stockCache.set(symbol, { data: enhancedData, timestamp: Date.now() });
    
    return enhancedData;
  }

  // If no mock data available, return a default structure
  return {
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    priceHistory: [{ date: "2024-01", price: 100 }],
    lastUpdated: new Date().toISOString(),
  };
}

// Get all available stock symbols
export function getAvailableSymbols(): string[] {
  return Object.keys(mockStockData);
}

// Clear cache (useful for testing or forcing refresh)
export function clearStockCache(): void {
  stockCache.clear();
}
