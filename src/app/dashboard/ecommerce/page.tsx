"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Download, Star } from "lucide-react"
import { motion } from "framer-motion"

const revenueData = [
  { month: "January", desktop: 2400, mobile: 2400 },
  { month: "February", desktop: 1398, mobile: 2210 },
  { month: "March", desktop: 9800, mobile: 2290 },
  { month: "April", desktop: 3908, mobile: 2000 },
  { month: "May", desktop: 4800, mobile: 2181 },
  { month: "June", desktop: 3800, mobile: 2500 },
]

const returningRateData = [
  { month: "Feb", rate: 65 },
  { month: "Mar", rate: 59 },
  { month: "Apr", rate: 80 },
  { month: "May", rate: 81 },
  { month: "Jun", rate: 56 },
  { month: "Jul", rate: 55 },
  { month: "Aug", rate: 40 },
  { month: "Sep", rate: 71 },
  { month: "Oct", rate: 56 },
  { month: "Nov", rate: 88 },
  { month: "Dec", rate: 92 },
]

const salesByLocation = [
  { country: "Canada", flag: "🇨🇦", percentage: 85, change: "+5.2%" },
  { country: "Greenland", flag: "🇬🇱", percentage: 80, change: "-0.7%" },
  { country: "Russia", flag: "🇷🇺", percentage: 62, change: "-1.4%" },
  { country: "China", flag: "🇨🇳", percentage: 60, change: "+2.4%" },
  { country: "Australia", flag: "🇦🇺", percentage: 45, change: "+1.2%" },
  { country: "Greece", flag: "🇬🇷", percentage: 40, change: "+1.8%" },
]

const storeVisitsData = [
  { name: "Direct", value: 4200, color: "#8884d8" },
  { name: "Social", value: 3200, color: "#82ca9d" },
  { name: "Email", value: 2100, color: "#ffc658" },
  { name: "Referrals", value: 1800, color: "#ff7300" },
  { name: "Other", value: 900, color: "#00ff00" },
]

export default function EcommercePage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">E-Commerce Dashboard</h2>
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

      {/* Congratulations Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Congratulations Toby! 🎉</h3>
                <p className="text-blue-100 mb-2">Best seller of the month</p>
                <p className="text-2xl font-bold">$15,231.89</p>
                <p className="text-blue-100">+42% from last month</p>
              </div>
              <Button variant="secondary" size="sm">
                View Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$125,231</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +20.1% from last month
              </div>
              <div className="mt-4 h-[80px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData.slice(0, 6)}>
                    <Line type="monotone" dataKey="desktop" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20K</div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                -12% from last month
              </div>
              <div className="mt-4 h-[80px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData.slice(0, 6)}>
                    <Line type="monotone" dataKey="mobile" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3602</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +37.8% from last month
              </div>
              <div className="mt-4 h-[80px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData.slice(0, 6)}>
                    <Line type="monotone" dataKey="desktop" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Total Revenue Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Income in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-sm">Desktop</span>
                  <span className="text-sm font-medium">24,828</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm">Mobile</span>
                  <span className="text-sm font-medium">25,010</span>
                </div>
              </div>
            </div>
            <ChartContainer
              config={{
                desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
                mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Returning Rate */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Returning Rate</CardTitle>
            <CardDescription className="flex items-center">
              <span className="text-2xl font-bold text-green-600 mr-2">$42,379</span>
              <Badge variant="secondary" className="text-green-600">
                +2.2%
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                rate: { label: "Rate", color: "hsl(var(--chart-1))" },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={returningRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales by Location */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sales by Location</CardTitle>
              <CardDescription>Income in the last 30 days</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesByLocation.map((location, index) => (
              <div key={location.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{location.flag}</span>
                  <span className="font-medium">{location.country}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24">
                    <Progress value={location.percentage} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">{location.percentage}%</span>
                  <Badge variant={location.change.startsWith("+") ? "default" : "destructive"} className="text-xs">
                    {location.change}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Store Visits by Source */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Store Visits by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={storeVisitsData}
                      cx={100}
                      cy={100}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {storeVisitsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">10.2K</div>
                    <div className="text-sm text-muted-foreground">Visits</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {storeVisitsData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Reviews */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>Based on 1,429 verified purchases</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-2xl font-bold">4.5</span>
              </div>
              <span className="text-sm text-muted-foreground">out of 5</span>
            </div>

            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm w-6">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Progress
                  value={rating === 5 ? 70 : rating === 4 ? 60 : rating === 3 ? 15 : rating === 2 ? 4 : 2}
                  className="flex-1 h-2"
                />
                <span className="text-sm text-muted-foreground w-12">
                  {rating === 5 ? "4000" : rating === 4 ? "2100" : rating === 3 ? "800" : rating === 2 ? "400" : "344"}
                </span>
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Exceeded my expectations!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      I was skeptical at first, but this product has completely changed my daily routine. The quality is
                      outstanding and it's so easy to use.
                    </p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <span>Sarah J.</span>
                      <span className="mx-1">•</span>
                      <span>Verified Purchase</span>
                      <span className="mx-1">•</span>
                      <span>March 15, 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
