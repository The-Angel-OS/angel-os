"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Download } from "lucide-react"
import { motion } from "framer-motion"

const analyticsData = [
  { name: "Direct", value: 435, color: "#8884d8" },
  { name: "Sessions", value: 520, color: "#82ca9d" },
  { name: "Leads", value: 146, color: "#ffc658" },
  { name: "Organic", value: 510, color: "#ff7300" },
  { name: "Page Views", value: 230, color: "#00ff00" },
  { name: "Conversions", value: 180, color: "#ff0000" },
]

const earningsData = [
  { month: "Mon", earnings: 1200 },
  { month: "Tue", earnings: 800 },
  { month: "Wed", earnings: 1600 },
  { month: "Thu", earnings: 900 },
  { month: "Fri", earnings: 1100 },
  { month: "Sat", earnings: 1800 },
  { month: "Sun", earnings: 1400 },
]

const salesByCountry = [
  { country: "United States", flag: "🇺🇸", amount: "+$1,099.00", change: "+25.8%" },
  { country: "Brazil", flag: "🇧🇷", amount: "+$39.00", change: "+0.3%" },
  { country: "India", flag: "🇮🇳", amount: "+$299.00", change: "+12.1%" },
  { country: "Australia", flag: "🇦🇺", amount: "+$99.00", change: "+8.1%" },
  { country: "France", flag: "🇫🇷", amount: "+$39.00", change: "+2.2%" },
  { country: "Greece", flag: "🇬🇷", amount: "+$30.00", change: "+1.9%" },
]

const campaignStats = [
  { name: "New Tickets", value: 1903, change: "-3.1%", color: "green" },
  { name: "Open Tickets", value: 6043, change: "+2.1%", color: "orange" },
  { name: "Response Time", value: 600, change: "-2.1%", color: "blue" },
  { name: "Subscribe", value: 490, change: "+4.2%", color: "green" },
  { name: "Complaints", value: 490, change: "+4.2%", color: "green" },
  { name: "Unsubscribe", value: 12, change: "-8.1%", color: "red" },
]

export default function WebsiteAnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Website Analytics</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            22 Jul 2025 - 18 Aug 2025
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {analyticsData.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: item.color }}></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Website Analytics */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Website Analytics</CardTitle>
            <CardDescription>Total 28.5K Conversion Rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {analyticsData.slice(0, 6).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Average Daily Sales */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Average Daily Sales</CardTitle>
            <CardDescription className="flex items-center">
              <span className="text-2xl font-bold mr-2">$28,450</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sales: { label: "Sales", color: "hsl(var(--chart-1))" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="var(--color-sales)"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sales Overview */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription className="flex items-center">
              <span className="text-2xl font-bold text-green-600 mr-2">$42.5K</span>
              <Badge variant="secondary" className="text-green-600">
                +18.2%
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Orders</span>
                  <span className="text-sm font-medium">62.2%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Visits</span>
                  <span className="text-sm font-medium">25.5%</span>
                </div>
              </div>
            </div>
            <ChartContainer
              config={{
                orders: { label: "Orders", color: "#f97316" },
                visits: { label: "Visits", color: "#22c55e" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="earnings" fill="var(--color-orders)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Earnings Reports */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Earnings Reports</CardTitle>
              <CardDescription>Last 28 days</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-2xl font-bold text-green-600">$1,468</div>
              <Badge variant="secondary" className="text-green-600">
                +8.2%
              </Badge>
            </div>
            <ChartContainer
              config={{
                earnings: { label: "Earnings", color: "hsl(var(--chart-1))" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="earnings" fill="var(--color-earnings)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Earnings</span>
                <span className="font-medium">$545.69</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Profit</span>
                <span className="font-medium">$256.34</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Expense</span>
                <span className="font-medium">$74.19</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Countries */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sales by Countries</CardTitle>
              <CardDescription>Last 28 days</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesByCountry.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{country.flag}</span>
                  <span className="font-medium text-sm">{country.country}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{country.amount}</div>
                  <div className="text-xs text-muted-foreground">{country.change}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Campaign State */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Monthly Campaign State</CardTitle>
            <CardDescription>8.52k social visitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaignStats.map((stat, index) => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      stat.color === "green"
                        ? "bg-green-500"
                        : stat.color === "orange"
                          ? "bg-orange-500"
                          : stat.color === "blue"
                            ? "bg-blue-500"
                            : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm">{stat.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{stat.value}</div>
                  <div className={`text-xs ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Total Earning */}
      <Card>
        <CardHeader>
          <CardTitle>Total Earning</CardTitle>
          <CardDescription>Yearly report overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-2xl font-bold text-green-600 mb-2">83%</div>
              <Badge variant="secondary" className="text-green-600 mb-4">
                +24.2%
              </Badge>
              <ChartContainer
                config={{
                  earning: { label: "Earning", color: "hsl(var(--chart-1))" },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsData}>
                    <Bar dataKey="earnings" fill="var(--color-earning)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Total Revenue</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">+$76K</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Sales</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">-$8K</span>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
