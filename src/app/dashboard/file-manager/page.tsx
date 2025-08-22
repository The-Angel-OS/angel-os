"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  ImageIcon,
  Video,
  File,
  Folder,
  Download,
  Trash2,
  Share,
  Star,
} from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  fileType?: "document" | "image" | "video" | "other"
  size: string
  uploadDate: string
  uploadedBy: string
  starred?: boolean
}

interface StorageCategory {
  name: string
  count: number
  size: string
  percentage: number
  color: string
  icon: React.ReactNode
}

const storageCategories: StorageCategory[] = [
  {
    name: "Documents",
    count: 1390,
    size: "2.1 GB used",
    percentage: 35,
    color: "bg-blue-500",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    name: "Images",
    count: 5678,
    size: "3.8 GB used",
    percentage: 62,
    color: "bg-green-500",
    icon: <ImageIcon className="h-6 w-6" />,
  },
  {
    name: "Videos",
    count: 901,
    size: "7.5 GB used",
    percentage: 89,
    color: "bg-red-500",
    icon: <Video className="h-6 w-6" />,
  },
  {
    name: "Others",
    count: 234,
    size: "1.2 GB used",
    percentage: 28,
    color: "bg-yellow-500",
    icon: <File className="h-6 w-6" />,
  },
]

const folderData = [
  { name: "Documents", items: 120, lastUpdate: "10 days ago", starred: true },
  { name: "Images", items: 250, lastUpdate: "2 days ago", starred: false },
  { name: "Downloads", items: 80, lastUpdate: "Yesterday", starred: false },
]

const recentFiles: FileItem[] = [
  {
    id: "1",
    name: "project-proposal.docx",
    type: "file",
    fileType: "document",
    size: "2.38 MB",
    uploadDate: "Apr 15, 2025",
    uploadedBy: "John Doe",
  },
  {
    id: "2",
    name: "company-logo.png",
    type: "file",
    fileType: "image",
    size: "1.14 MB",
    uploadDate: "Apr 14, 2025",
    uploadedBy: "Jane Smith",
  },
  {
    id: "3",
    name: "presentation.pptx",
    type: "file",
    fileType: "document",
    size: "5.34 MB",
    uploadDate: "Apr 13, 2025",
    uploadedBy: "Mike Johnson",
  },
  {
    id: "4",
    name: "budget.xlsx",
    type: "file",
    fileType: "document",
    size: "957.03 KB",
    uploadDate: "Mar 12, 2025",
    uploadedBy: "Sarah Wilson",
  },
  {
    id: "5",
    name: "product-video.mp4",
    type: "file",
    fileType: "video",
    size: "150.68 MB",
    uploadDate: "Apr 11, 2025",
    uploadedBy: "Tom Anderson",
  },
]

const monthlyTransferData = [
  { month: "Jan", desktop: 300, mobile: 200 },
  { month: "Feb", desktop: 350, mobile: 250 },
  { month: "Mar", desktop: 400, mobile: 300 },
  { month: "Apr", desktop: 430, mobile: 320 },
  { month: "May", desktop: 470, mobile: 350 },
  { month: "Jun", desktop: 540, mobile: 400 },
  { month: "Jul", desktop: 600, mobile: 450 },
  { month: "Aug", desktop: 750, mobile: 500 },
  { month: "Sep", desktop: 650, mobile: 480 },
  { month: "Oct", desktop: 700, mobile: 520 },
  { month: "Nov", desktop: 720, mobile: 540 },
  { month: "Dec", desktop: 800, mobile: 600 },
]

const getFileIcon = (fileType?: string) => {
  switch (fileType) {
    case "document":
      return <FileText className="h-4 w-4 text-blue-600" />
    case "image":
      return <ImageIcon className="h-4 w-4 text-green-600" />
    case "video":
      return <Video className="h-4 w-4 text-red-600" />
    default:
      return <File className="h-4 w-4 text-gray-600" />
  }
}

export default function FileManagerPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedView, setSelectedView] = useState("all")

  const filteredFiles = recentFiles.filter((file) => {
    const search = (searchTerm || "").toLowerCase()
    if (!search) return true

    return (file.name || "").toLowerCase().includes(search)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">File Manager</h1>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {storageCategories.map((category, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
              <div className={`p-2 rounded-md ${category.color} text-white`}>{category.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{category.count.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mb-2">{category.size}</p>
              <div className="flex items-center gap-2">
                <Progress value={category.percentage} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground">{category.percentage}% of storage used</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folders */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Folders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {folderData.map((folder, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Folder className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{folder.name}</h4>
                      {folder.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{folder.items} items</span>
                      <span>Last update: {folder.lastUpdate}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Storage Space Used</CardTitle>
                <p className="text-sm text-muted-foreground">See your remaining file storage</p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">1.8 GB used</span>
                  <span className="text-sm text-muted-foreground">3 GB total</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  You have used 60% of your storage. Consider upgrading your plan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Transfer Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly File Transfer</CardTitle>
                  <p className="text-sm text-muted-foreground">Last 28 days</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    22 Jul 2025 - 18 Aug 2025
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTransferData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="desktop" fill="hsl(var(--primary))" name="Desktop" />
                  <Bar dataKey="mobile" fill="hsl(var(--muted))" name="Mobile" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-sm">Desktop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-muted rounded-full" />
                  <span className="text-sm">Mobile</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recently Uploaded Files */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recently Uploaded Files</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your recently uploaded files</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value || "")}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.fileType)}
                        <span className="font-medium">{file.name || "Untitled"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{file.size || "0 KB"}</TableCell>
                    <TableCell>{file.uploadDate || "Unknown"}</TableCell>
                    <TableCell>{file.uploadedBy || "Unknown"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            Add to Favorites
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
