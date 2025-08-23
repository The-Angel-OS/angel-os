"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { usePayloadCollection } from "@/hooks/usePayloadCollection"
import { TrendingUp, Eye, Edit, Trash2, File, Image, Video, Music, FileText, Download, Upload, Folder, Link as LinkIcon } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

// Media type interface based on Payload schema
interface MediaFile {
  id: string
  filename: string
  alt?: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  url: string
  thumbnailURL?: string
  focalX?: number
  focalY?: number
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

// Hook for media files
const useMediaFiles = (options?: any) => {
  return usePayloadCollection<MediaFile>({
    collection: 'media',
    limit: 50,
    sort: '-updatedAt',
    ...options,
  })
}

export default function FilesPage() {
  useEffect(() => {
    document.title = "Angel OS: Files"
  }, [])

  const { data: files, loading, error, refresh } = useMediaFiles()

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.startsWith('video/')) return Video
    if (mimeType.startsWith('audio/')) return Music
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText
    return File
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const columns = [
    {
      accessorKey: 'filename',
      header: 'File',
      cell: (value: string, row: MediaFile) => {
        const IconComponent = getFileIcon(row.mimeType)
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {row.mimeType.startsWith('image/') ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={row.thumbnailURL || row.url}
                    alt={row.alt || row.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <div>
              <Link href={row.url} target="_blank" className="font-medium hover:underline">
                {value}
              </Link>
              {row.alt && (
                <p className="text-sm text-muted-foreground">{row.alt}</p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'mimeType',
      header: 'Type',
      cell: (value: string) => {
        const type = value.split('/')[0]
        const subtype = value.split('/')[1]
        return (
          <div>
            <Badge variant="outline" className="capitalize">
              {type}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1 uppercase">{subtype}</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'filesize',
      header: 'Size',
      cell: (value: number) => (
        <span className="text-sm font-mono">{formatFileSize(value)}</span>
      ),
    },
    {
      accessorKey: 'width',
      header: 'Dimensions',
      cell: (value: number, row: MediaFile) => {
        if (!value || !row.height) return <span className="text-muted-foreground">-</span>
        return (
          <span className="text-sm font-mono">
            {value} × {row.height}
          </span>
        )
      },
    },
    createColumn.date('updatedAt', 'Modified'),
    createColumn.date('createdAt', 'Created'),
  ]

  const actions = [
    {
      label: 'View File',
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
      label: 'Copy URL',
      icon: <LinkIcon className="h-4 w-4" />,
      onClick: (file: MediaFile) => {
        navigator.clipboard.writeText(file.url)
        // TODO: Show toast notification
        console.log('URL copied to clipboard')
      },
    },
    {
      label: 'Edit Details',
      icon: <Edit className="h-4 w-4" />,
      onClick: (file: MediaFile) => {
        // TODO: Implement edit modal
        console.log('Edit file:', file.id)
      },
    },
    {
      label: 'Delete File',
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

  // Calculate metrics
  const totalFiles = files.length
  const totalSize = files.reduce((sum, file) => sum + file.filesize, 0)
  const imageFiles = files.filter(f => f.mimeType.startsWith('image/')).length
  const videoFiles = files.filter(f => f.mimeType.startsWith('video/')).length
  const documentFiles = files.filter(f => 
    f.mimeType.includes('pdf') || 
    f.mimeType.includes('document') || 
    f.mimeType.includes('text')
  ).length

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Files</h2>
          <p className="text-muted-foreground">
            Browse and manage your media files
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <File className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFiles}</div>
              <div className="flex items-center text-xs text-slate-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                {formatFileSize(totalSize)} total
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Images</CardTitle>
              <Image className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{imageFiles}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Photos & graphics
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videoFiles}</div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Video files
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentFiles}</div>
              <div className="flex items-center text-xs text-purple-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                PDFs & docs
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Upload className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium">Upload Files</h3>
                  <p className="text-sm text-muted-foreground">Add new files</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Image className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Images Only</h3>
                  <p className="text-sm text-muted-foreground">Filter images</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Video className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Videos Only</h3>
                  <p className="text-sm text-muted-foreground">Filter videos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Folder className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">File Manager</h3>
                  <p className="text-sm text-muted-foreground">Advanced view</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Files DataTable */}
      <DataTable
        data={files}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error || undefined}
        onRefresh={refresh}
        searchPlaceholder="Search files..."
        exportButton={true}
        className="mt-6"
      />
    </div>
  )
}