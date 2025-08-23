"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { usePayloadCollection } from "@/hooks/usePayloadCollection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  FolderPlus,
  Download,
  Trash2,
  Share,
  Star,
  Eye,
  Edit,
  Grid3X3,
  List,
  ArrowLeft,
  Home,
  ChevronRight,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Media/File interfaces based on Payload CMS schema
interface MediaFile {
  id: string
  filename: string
  alt?: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  url: string
  folder?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface PayloadFolder {
  id: string
  name: string
  parent?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
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
    name: "Images",
    count: 0,
    size: "0 MB",
    percentage: 0,
    color: "bg-green-500",
    icon: <ImageIcon className="h-6 w-6" />,
  },
  {
    name: "Documents",
    count: 0,
    size: "0 MB",
    percentage: 0,
    color: "bg-blue-500",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    name: "Videos",
    count: 0,
    size: "0 MB",
    percentage: 0,
    color: "bg-red-500",
    icon: <Video className="h-6 w-6" />,
  },
  {
    name: "Others",
    count: 0,
    size: "0 MB",
    percentage: 0,
    color: "bg-yellow-500",
    icon: <File className="h-6 w-6" />,
  },
]

const monthlyTransferData = [
  { month: "Jan", uploads: 45, downloads: 120 },
  { month: "Feb", uploads: 52, downloads: 135 },
  { month: "Mar", uploads: 48, downloads: 142 },
  { month: "Apr", uploads: 61, downloads: 158 },
  { month: "May", uploads: 55, downloads: 167 },
  { month: "Jun", uploads: 67, downloads: 180 },
]

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-4 w-4 text-green-600" />
  } else if (mimeType.startsWith('video/')) {
    return <Video className="h-4 w-4 text-red-600" />
  } else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
    return <FileText className="h-4 w-4 text-blue-600" />
  }
  return <File className="h-4 w-4 text-gray-600" />
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function FileManagerPage() {
  // Set page title
  useEffect(() => {
    document.title = "Angel OS: File Manager"
  }, [])

  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'folders'>('all')

  // Fetch media files from Payload CMS
  const { 
    data: mediaFiles, 
    loading: mediaLoading, 
    error: mediaError, 
    refresh: refreshMedia 
  } = usePayloadCollection<MediaFile>({
    collection: 'media',
    limit: 50,
    sort: '-updatedAt',
    where: currentFolder ? { folder: { equals: currentFolder } } : {},
  })

  // Fetch folders from Payload CMS
  const { 
    data: folders, 
    loading: foldersLoading, 
    error: foldersError, 
    refresh: refreshFolders 
  } = usePayloadCollection<PayloadFolder>({
    collection: 'payload-folders',
    limit: 100,
    sort: 'name',
    where: currentFolder ? { parent: { equals: currentFolder } } : { parent: { exists: false } },
  })

  // Calculate storage statistics
  const totalSize = mediaFiles.reduce((acc, file) => acc + (file.filesize || 0), 0)
  const imageFiles = mediaFiles.filter(f => f.mimeType?.startsWith('image/'))
  const videoFiles = mediaFiles.filter(f => f.mimeType?.startsWith('video/'))
  const documentFiles = mediaFiles.filter(f => 
    f.mimeType?.includes('pdf') || 
    f.mimeType?.includes('document') || 
    f.mimeType?.includes('text')
  )
  const otherFiles = mediaFiles.filter(f => 
    !f.mimeType?.startsWith('image/') && 
    !f.mimeType?.startsWith('video/') && 
    !f.mimeType?.includes('pdf') && 
    !f.mimeType?.includes('document') && 
    !f.mimeType?.includes('text')
  )

  // Update storage categories with real data
  const updatedStorageCategories = [
    {
      ...storageCategories[0],
      count: imageFiles.length,
      size: formatFileSize(imageFiles.reduce((acc, f) => acc + (f.filesize || 0), 0)),
      percentage: totalSize > 0 ? Math.round((imageFiles.reduce((acc, f) => acc + (f.filesize || 0), 0) / totalSize) * 100) : 0,
    },
    {
      ...storageCategories[1],
      count: documentFiles.length,
      size: formatFileSize(documentFiles.reduce((acc, f) => acc + (f.filesize || 0), 0)),
      percentage: totalSize > 0 ? Math.round((documentFiles.reduce((acc, f) => acc + (f.filesize || 0), 0) / totalSize) * 100) : 0,
    },
    {
      ...storageCategories[2],
      count: videoFiles.length,
      size: formatFileSize(videoFiles.reduce((acc, f) => acc + (f.filesize || 0), 0)),
      percentage: totalSize > 0 ? Math.round((videoFiles.reduce((acc, f) => acc + (f.filesize || 0), 0) / totalSize) * 100) : 0,
    },
    {
      ...storageCategories[3],
      count: otherFiles.length,
      size: formatFileSize(otherFiles.reduce((acc, f) => acc + (f.filesize || 0), 0)),
      percentage: totalSize > 0 ? Math.round((otherFiles.reduce((acc, f) => acc + (f.filesize || 0), 0) / totalSize) * 100) : 0,
    },
  ]

  // Define columns for media files DataTable
  const mediaColumns = [
    {
      accessorKey: 'filename',
      header: 'File Name',
      cell: (value: string, row: MediaFile) => (
        <div className="flex items-center space-x-3">
          {row.mimeType?.startsWith('image/') ? (
            <Avatar className="h-10 w-10 rounded-md">
              <AvatarImage src={row.url} alt={row.alt || row.filename} />
              <AvatarFallback className="rounded-md">
                {getFileIcon(row.mimeType)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
              {getFileIcon(row.mimeType)}
            </div>
          )}
          <div>
            <div className="font-medium">{value}</div>
            {row.alt && (
              <div className="text-sm text-muted-foreground">{row.alt}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'filesize',
      header: 'Size',
      cell: (value: number) => formatFileSize(value || 0),
      className: 'text-right',
    },
    {
      accessorKey: 'mimeType',
      header: 'Type',
      cell: (value: string) => (
        <Badge variant="outline" className="text-xs">
          {value?.split('/')[1]?.toUpperCase() || 'Unknown'}
        </Badge>
      ),
    },
    {
      accessorKey: 'folder',
      header: 'Folder',
      cell: (value: MediaFile['folder']) => (
        value ? (
          <Badge variant="secondary" className="text-xs">
            <Folder className="h-3 w-3 mr-1" />
            {value.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">Root</span>
        )
      ),
    },
    createColumn.date('updatedAt', 'Modified'),
  ]

  // Define columns for folders DataTable
  const folderColumns = [
    {
      accessorKey: 'name',
      header: 'Folder Name',
      cell: (value: string, row: PayloadFolder) => (
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:text-primary"
          onClick={() => setCurrentFolder(row.id)}
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <Folder className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{value}</div>
            {row.parent && (
              <div className="text-sm text-muted-foreground">
                in {row.parent.name}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'itemCount',
      header: 'Items',
      cell: () => {
        // TODO: Calculate actual item count per folder
        return <span className="text-muted-foreground">-</span>
      },
    },
    createColumn.date('updatedAt', 'Modified'),
  ]

  // Define actions for media files
  const mediaActions = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (file: MediaFile) => {
        window.open(file.url, '_blank')
      },
    },
    {
      label: 'Download',
      icon: <Download className="h-4 w-4" />,
      onClick: (file: MediaFile) => {
        const link = document.createElement('a')
        link.href = file.url
        link.download = file.filename
        link.click()
      },
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (file: MediaFile) => {
        window.location.href = `/admin/collections/media/${file.id}`
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: (file: MediaFile) => {
        if (confirm(`Are you sure you want to delete "${file.filename}"?`)) {
          // TODO: Implement delete functionality
          console.log('Delete file:', file.id)
        }
      },
    },
  ]

  // Define actions for folders
  const folderActions = [
    {
      label: 'Open',
      icon: <Eye className="h-4 w-4" />,
      onClick: (folder: PayloadFolder) => {
        setCurrentFolder(folder.id)
      },
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (folder: PayloadFolder) => {
        window.location.href = `/admin/collections/payload-folders/${folder.id}`
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: (folder: PayloadFolder) => {
        if (confirm(`Are you sure you want to delete folder "${folder.name}"?`)) {
          // TODO: Implement delete functionality
          console.log('Delete folder:', folder.id)
        }
      },
    },
  ]

  // Breadcrumb navigation
  const renderBreadcrumbs = () => {
    // TODO: Implement proper breadcrumb navigation based on current folder path
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentFolder(null)}
          className="h-8 px-2"
        >
          <Home className="h-4 w-4 mr-1" />
          Root
        </Button>
        {currentFolder && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span>Current Folder</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">File Manager</h1>
          <p className="text-muted-foreground">
            Manage your media files and folders with Payload CMS integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/collections/payload-folders">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/collections/media">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Link>
          </Button>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {updatedStorageCategories.map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                <div className={`p-2 rounded-md ${category.color} text-white`}>
                  {category.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{category.count.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mb-2">{category.size}</p>
                <div className="flex items-center gap-2">
                  <Progress value={category.percentage} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground">{category.percentage}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Usage */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Storage Usage</CardTitle>
                <p className="text-sm text-muted-foreground">Total: {formatFileSize(totalSize)}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/collections/media">
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatFileSize(totalSize)}</span>
                  <span className="text-sm text-muted-foreground">Used</span>
                </div>
                <Progress value={Math.min((totalSize / (1024 * 1024 * 1024)) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {mediaFiles.length} files across {folders.length} folders
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Activity Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>File Activity</CardTitle>
                  <p className="text-sm text-muted-foreground">Uploads and downloads over time</p>
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
                  <Bar dataKey="uploads" fill="hsl(var(--primary))" name="Uploads" />
                  <Bar dataKey="downloads" fill="hsl(var(--muted))" name="Downloads" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-sm">Uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-muted rounded-full" />
                  <span className="text-sm">Downloads</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* File Browser with Payload Folders Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>File Browser</CardTitle>
              {renderBreadcrumbs()}
            </div>
            <div className="flex items-center gap-2">
              {currentFolder && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentFolder(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Root
                </Button>
              )}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'folders')}>
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="folders">Folders Only</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <DataTable
                data={mediaFiles}
                columns={mediaColumns}
                actions={mediaActions}
                loading={mediaLoading}
                error={mediaError || undefined}
                onRefresh={refreshMedia}
                searchPlaceholder="Search files..."
                exportButton={true}
              />
            </TabsContent>
            
            <TabsContent value="folders" className="mt-6">
              <DataTable
                data={folders}
                columns={folderColumns}
                actions={folderActions}
                loading={foldersLoading}
                error={foldersError || undefined}
                onRefresh={refreshFolders}
                searchPlaceholder="Search folders..."
                addButton={{
                  label: "New Folder",
                  href: "/admin/collections/payload-folders"
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
