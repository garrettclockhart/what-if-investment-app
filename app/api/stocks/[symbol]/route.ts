import { NextRequest, NextResponse } from 'next/server';

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

// Company name mapping
const COMPANY_NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  NKE: "Nike Inc.",
  MSFT: "Microsoft Corp.",
  BBY: "Best Buy Co.",
  TSLA: "Tesla Inc.",
};

// Yahoo Finance API endpoints
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Fetch current stock price from Yahoo Finance
async function fetchCurrentPrice(symbol: string): Promise<number | null> {
  try {
    const response = await fetch(`${YAHOO_FINANCE_BASE}/${symbol}?interval=1d&range=1d`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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
    const response = await fetch(`${YAHOO_FINANCE_BASE}/${symbol}?interval=1mo&range=5y`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol.toUpperCase();
  
  try {
    // Fetch real-time data
    const [currentPrice, historicalData] = await Promise.all([
      fetchCurrentPrice(symbol),
      fetchHistoricalData(symbol)
    ]);

    // If we got real data, use it
    if (currentPrice && historicalData.length > 0) {
      const stockData: StockData = {
        symbol,
        name: COMPANY_NAMES[symbol] || `${symbol} Inc.`,
        currentPrice,
        priceHistory: generateDetailedHistory(historicalData),
        lastUpdated: new Date().toISOString(),
      };

      return NextResponse.json(stockData);
    }

    // If no real data, return error
    return NextResponse.json(
      { error: 'Unable to fetch stock data' },
      { status: 500 }
    );
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
