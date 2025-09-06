"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { InvestmentChart } from "@/components/InvestmentChart"
import { getStockData, StockData } from "@/lib/stockService"
import {
  TrendingUp,
  TrendingDown,
  Smartphone,
  Laptop,
  Tv,
  Gamepad2,
  Search,
  Headphones,
  Watch,
  Car,
  RefreshCw,
  AlertCircle,
} from "lucide-react"

// Stock data cache for real-time updates
let stockDataCache: Record<string, StockData> = {}

const productDatabase = [
  // Apple Products
  {
    id: 1,
    company: "AAPL",
    name: "iPhone 15 Pro",
    msrp: 999,
    releaseDate: "2023-09-22",
    icon: Smartphone,
    category: "Phone",
  },
  {
    id: 2,
    company: "AAPL",
    name: "iPhone 14 Pro",
    msrp: 999,
    releaseDate: "2022-09-16",
    icon: Smartphone,
    category: "Phone",
  },
  {
    id: 3,
    company: "AAPL",
    name: "iPhone 13 Pro",
    msrp: 999,
    releaseDate: "2021-09-24",
    icon: Smartphone,
    category: "Phone",
  },
  {
    id: 4,
    company: "AAPL",
    name: "iPhone 12 Pro",
    msrp: 999,
    releaseDate: "2020-10-23",
    icon: Smartphone,
    category: "Phone",
  },
  {
    id: 5,
    company: "AAPL",
    name: 'MacBook Pro 16"',
    msrp: 2499,
    releaseDate: "2023-11-07",
    icon: Laptop,
    category: "Computer",
  },
  {
    id: 6,
    company: "AAPL",
    name: "MacBook Air M2",
    msrp: 1199,
    releaseDate: "2022-07-15",
    icon: Laptop,
    category: "Computer",
  },
  {
    id: 7,
    company: "AAPL",
    name: 'iPad Pro 12.9"',
    msrp: 1099,
    releaseDate: "2022-10-18",
    icon: Laptop,
    category: "Tablet",
  },
  {
    id: 8,
    company: "AAPL",
    name: "Apple Watch Series 9",
    msrp: 399,
    releaseDate: "2023-09-22",
    icon: Watch,
    category: "Wearable",
  },
  {
    id: 9,
    company: "AAPL",
    name: "AirPods Pro 2nd Gen",
    msrp: 249,
    releaseDate: "2022-09-23",
    icon: Headphones,
    category: "Audio",
  },

  // Nike Products
  {
    id: 10,
    company: "NKE",
    name: "Air Jordan 1 Retro High",
    msrp: 170,
    releaseDate: "2020-04-01",
    icon: Gamepad2,
    category: "Shoes",
  },
  {
    id: 11,
    company: "NKE",
    name: "Air Force 1 '07",
    msrp: 90,
    releaseDate: "2020-01-01",
    icon: Gamepad2,
    category: "Shoes",
  },
  {
    id: 12,
    company: "NKE",
    name: "Air Max 270",
    msrp: 150,
    releaseDate: "2021-03-15",
    icon: Gamepad2,
    category: "Shoes",
  },
  { id: 13, company: "NKE", name: "Dunk Low", msrp: 100, releaseDate: "2021-08-12", icon: Gamepad2, category: "Shoes" },

  // Microsoft Products
  {
    id: 14,
    company: "MSFT",
    name: "Surface Laptop Studio",
    msrp: 1599,
    releaseDate: "2021-10-05",
    icon: Laptop,
    category: "Computer",
  },
  {
    id: 15,
    company: "MSFT",
    name: "Surface Pro 9",
    msrp: 999,
    releaseDate: "2022-10-25",
    icon: Laptop,
    category: "Computer",
  },
  {
    id: 16,
    company: "MSFT",
    name: "Xbox Series X",
    msrp: 499,
    releaseDate: "2020-11-10",
    icon: Gamepad2,
    category: "Gaming",
  },
  {
    id: 17,
    company: "MSFT",
    name: "Surface Headphones 2",
    msrp: 249,
    releaseDate: "2020-05-12",
    icon: Headphones,
    category: "Audio",
  },

  // Best Buy Products (TVs and Electronics)
  {
    id: 18,
    company: "BBY",
    name: 'Samsung 65" QLED 4K TV',
    msrp: 1499,
    releaseDate: "2023-03-01",
    icon: Tv,
    category: "TV",
  },
  { id: 19, company: "BBY", name: 'LG 55" OLED C3', msrp: 1299, releaseDate: "2023-04-15", icon: Tv, category: "TV" },
  {
    id: 20,
    company: "BBY",
    name: 'Sony 75" Bravia XR',
    msrp: 2199,
    releaseDate: "2022-06-01",
    icon: Tv,
    category: "TV",
  },

  // Tesla Products
  { id: 21, company: "TSLA", name: "Model 3", msrp: 35000, releaseDate: "2020-01-01", icon: Car, category: "Vehicle" },
  { id: 22, company: "TSLA", name: "Model Y", msrp: 52990, releaseDate: "2020-03-13", icon: Car, category: "Vehicle" },
  { id: 23, company: "TSLA", name: "Model S", msrp: 74990, releaseDate: "2021-06-10", icon: Car, category: "Vehicle" },
]

export default function InvestmentDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [calculations, setCalculations] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stockData, setStockData] = useState<Record<string, StockData>>({})
  const [lastUpdated, setLastUpdated] = useState<string>("")

  // Load stock data on component mount
  useEffect(() => {
    loadStockData()
  }, [])

  const loadStockData = async () => {
    setIsLoading(true)
    try {
      const symbols = ["AAPL", "NKE", "MSFT", "BBY", "TSLA"]
      const stockPromises = symbols.map(symbol => getStockData(symbol))
      const stockResults = await Promise.all(stockPromises)
      
      const newStockData: Record<string, StockData> = {}
      stockResults.forEach(stock => {
        newStockData[stock.symbol] = stock
      })
      
      setStockData(newStockData)
      stockDataCache = newStockData
      setLastUpdated(new Date().toLocaleString())
    } catch (error) {
      console.error("Error loading stock data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStockData = async () => {
    await loadStockData()
  }

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return productDatabase.slice(0, 12) // Show first 12 products by default

    return productDatabase.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (stockData[product.company]?.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, stockData])

  const calculateInvestment = (product: any) => {
    const company = stockData[product.company]
    if (!company) {
      console.error(`No stock data available for ${product.company}`)
      return
    }

    const price = product.msrp
    const date = new Date(product.releaseDate)

    // Find the closest historical price
    const historicalPrice =
      company.priceHistory.find((p) => new Date(p.date + "-01").getTime() <= date.getTime())?.price ||
      company.priceHistory[0].price

    const shares = price / historicalPrice
    const currentValue = shares * company.currentPrice
    const gain = currentValue - price
    const gainPercentage = ((currentValue - price) / price) * 100

    const purchaseDate = new Date(product.releaseDate)
    const enhancedChartData = []

    // Add purchase date as starting point
    enhancedChartData.push({
      date: purchaseDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      investmentValue: Number.parseFloat((shares * historicalPrice).toFixed(2)),
      originalDate: purchaseDate,
    })

    // Add historical data points after purchase date
    company.priceHistory.forEach((point) => {
      const pointDate = new Date(point.date + "-01")
      if (pointDate >= purchaseDate) {
        enhancedChartData.push({
          date: pointDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          investmentValue: Number.parseFloat((shares * point.price).toFixed(2)),
          originalDate: pointDate,
        })
      }
    })

    // Sort by date to ensure proper timeline
    enhancedChartData.sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())

    setSelectedProduct(product)
    setCalculations({
      company: company.name,
      productName: product.name,
      releaseDate: product.releaseDate,
      originalInvestment: price,
      shares: shares.toFixed(4),
      historicalPrice: historicalPrice.toFixed(2),
      currentPrice: company.currentPrice.toFixed(2),
      currentValue: currentValue.toFixed(2),
      gain: gain.toFixed(2),
      gainPercentage: gainPercentage.toFixed(2),
      chartData: enhancedChartData,
    })
  }

  const resetCalculation = () => {
    setCalculations(null)
    setSelectedProduct(null)
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Investment Opportunity Dashboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search for any product and discover what your purchase could have been worth if you had invested in the
            company's stock instead.
          </p>
          
          {/* Data Status */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              )}
              <span>
                {isLoading ? "Updating stock data..." : `Last updated: ${lastUpdated || "Never"}`}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStockData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Products
            </CardTitle>
            <CardDescription>
              Find any product to see what your purchase could have been worth as a stock investment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for iPhone, MacBook, Air Jordan, Tesla Model 3..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => {
                const Icon = product.icon
                const company = stockData[product.company]
                const hasStockData = !!company
                
                return (
                  <Button
                    key={product.id}
                    variant="outline"
                    className={`h-auto p-4 flex flex-col items-center gap-2 bg-transparent hover:bg-muted/50 ${
                      !hasStockData ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => hasStockData && calculateInvestment(product)}
                    disabled={!hasStockData}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {company?.name || "Loading..."}
                      </div>
                      <div className="text-sm font-medium">${product.msrp.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        Released: {new Date(product.releaseDate).toLocaleDateString()}
                      </div>
                      {hasStockData && (
                        <div className="text-xs text-green-600 font-medium">
                          ${company.currentPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </Button>
                )
              })}
            </div>

            {filteredProducts.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">No products found matching "{searchQuery}"</div>
            )}

            {calculations && (
              <Button variant="outline" onClick={resetCalculation} className="w-full bg-transparent">
                Search for Another Product
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {calculations && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Summary Cards */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <div className="text-lg">{calculations.productName}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        Released: {new Date(calculations.releaseDate).toLocaleDateString()} • {calculations.company}
                      </div>
                    </div>
                    <Badge variant={Number.parseFloat(calculations.gain) >= 0 ? "default" : "destructive"}>
                      {Number.parseFloat(calculations.gain) >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {calculations.gainPercentage}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Original MSRP</div>
                      <div className="text-2xl font-bold">
                        ${Number(calculations.originalInvestment).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Current Value</div>
                      <div className="text-2xl font-bold text-primary">
                        ${Number(calculations.currentValue).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Shares Purchased</div>
                      <div className="font-semibold">{calculations.shares}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Gain/Loss</div>
                      <div
                        className={`font-semibold ${Number.parseFloat(calculations.gain) >= 0 ? "text-primary" : "text-destructive"}`}
                      >
                        ${Number(calculations.gain).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Stock Price at Release</div>
                      <div className="font-semibold">${calculations.historicalPrice}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Current Stock Price</div>
                      <div className="font-semibold">${calculations.currentPrice}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <InvestmentChart
              chartData={calculations.chartData}
              originalInvestment={Number(calculations.originalInvestment)}
              currentValue={Number(calculations.currentValue)}
              releaseDate={calculations.releaseDate}
              productName={calculations.productName}
              companyName={calculations.company}
            />
          </div>
        )}

        {/* Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                This tool uses real-time and historical stock data for educational purposes. 
                Data is fetched from Yahoo Finance and cached for 5 minutes to improve performance.
              </p>
              <p>
                Past performance does not guarantee future results. Always consult with a financial advisor before making investment decisions.
              </p>
              {lastUpdated && (
                <p className="text-xs">
                  Stock data last updated: {lastUpdated}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
