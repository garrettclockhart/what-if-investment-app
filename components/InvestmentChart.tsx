"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { StockPrice } from "@/lib/stockService"

interface InvestmentChartProps {
  chartData: Array<{
    date: string;
    investmentValue: number;
    originalDate: Date;
  }>;
  originalInvestment: number;
  currentValue: number;
  releaseDate: string;
  productName: string;
  companyName: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-primary font-medium">
          Investment Value: ${Number(data.investmentValue).toLocaleString()}
        </p>
        <p className="text-muted-foreground text-xs">
          {new Date(data.originalDate).toLocaleDateString()}
        </p>
      </div>
    );
  }
  return null;
};

// Format date for x-axis display
const formatXAxisDate = (tickItem: string) => {
  const date = new Date(tickItem + "-01");
  const now = new Date();
  const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  
  if (diffInMonths < 12) {
    return date.toLocaleDateString("en-US", { month: "short" });
  } else {
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
};

export function InvestmentChart({
  chartData,
  originalInvestment,
  currentValue,
  releaseDate,
  productName,
  companyName,
}: InvestmentChartProps) {
  const gain = currentValue - originalInvestment;
  const gainPercentage = ((currentValue - originalInvestment) / originalInvestment) * 100;
  const isPositive = gain >= 0;

  // Calculate min and max values for better chart scaling
  const values = chartData.map(d => d.investmentValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  const padding = range * 0.1; // 10% padding

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          <div>
            Investment Growth Over Time
            <CardDescription className="text-base mt-1">
              How your ${originalInvestment.toLocaleString()} investment would have grown since{" "}
              {new Date(releaseDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-lg font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {gainPercentage.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--muted-foreground))" 
                opacity={0.3} 
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatXAxisDate}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[minValue - padding, maxValue + padding]}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference line for original investment */}
              <ReferenceLine 
                y={originalInvestment} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="2 2"
                opacity={0.5}
                label={{ value: "Original Investment", position: "topRight" }}
              />
              
              <Line
                type="monotone"
                dataKey="investmentValue"
                stroke={isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                strokeWidth={3}
                dot={{
                  fill: isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))",
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart legend and additional info */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isPositive ? "bg-primary" : "bg-destructive"}`}></div>
              <span>Purchase Date: {new Date(releaseDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Current Date: {new Date().toLocaleDateString()}</span>
              <div className={`w-3 h-3 rounded-full ${isPositive ? "bg-primary" : "bg-destructive"}`}></div>
            </div>
          </div>
          
          {/* Performance summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Total Return</div>
              <div className={`font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                ${Math.abs(gain).toLocaleString()}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Return %</div>
              <div className={`font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {gainPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Years Held</div>
              <div className="font-semibold">
                {((new Date().getTime() - new Date(releaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1)}y
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
