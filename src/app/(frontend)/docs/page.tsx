'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Search,
  FileText,
  Clock,
  ArrowLeft,
  Download,
  Eye,
  BookOpen,
} from 'lucide-react'

interface DocFile {
  name: string
  path: string
  relativePath: string
  isDirectory: boolean
  size?: number
  lastModified?: Date
  content?: string
  metadata?: {
    title?: string
    description?: string
    lastUpdated?: string
  }
}

interface DocContent {
  name: string
  path: string
  relativePath: string
  content: string
  size: number
  lastModified: Date
  metadata?: {
    title?: string
    description?: string
    lastUpdated?: string
  }
}

export default function DocsViewer() {
  const [docs, setDocs] = useState<DocFile[]>([])
  const [filteredDocs, setFilteredDocs] = useState<DocFile[]>([])
  const [selectedDoc, setSelectedDoc] = useState<DocContent | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDocsList()
  }, [])

  useEffect(() => {
    filterDocs()
  }, [docs, searchTerm])

  const loadDocsList = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/docs?action=list')
      const data = await response.json()

      if (data.success) {
        const sortedDocs = data.docs.sort((a: DocFile, b: DocFile) => {
          // Prioritize important docs
          const priorities = [
            'README.md',
            'SPACES_PLATFORM_OVERVIEW.md',
            'GETTING_STARTED.md',
            'TECHNICAL_ARCHITECTURE.md',
            'BUSINESS_MODEL_DETAILED.md',
            'INTERNATIONALIZATION_GUIDE.md'
          ]

          const aPriority = priorities.indexOf(a.name)
          const bPriority = priorities.indexOf(b.name)

          if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority
          if (aPriority !== -1) return -1
          if (bPriority !== -1) return 1

          return a.name.localeCompare(b.name)
        })

        setDocs(sortedDocs)
      } else {
        setError('Failed to load documentation files')
      }
    } catch (error) {
      console.error('Failed to load docs:', error)
      setError('Failed to load documentation files')
    } finally {
      setLoading(false)
    }
  }

  const loadDocContent = async (filePath: string) => {
    try {
      setLoadingContent(true)
      const response = await fetch(`/api/docs?action=read&file=${encodeURIComponent(filePath)}`)
      const data = await response.json()

      if (data.success) {
        setSelectedDoc(data.file)
      } else {
        setError('Failed to load document content')
      }
    } catch (error) {
      console.error('Failed to load doc content:', error)
      setError('Failed to load document content')
    } finally {
      setLoadingContent(false)
    }
  }

  const filterDocs = () => {
    if (!searchTerm.trim()) {
      setFilteredDocs(docs.filter(doc => !doc.isDirectory))
      return
    }

    const filtered = docs.filter(doc => {
      if (doc.isDirectory) return false

      const searchLower = searchTerm.toLowerCase()
      const nameMatch = doc.name.toLowerCase().includes(searchLower)
      const contentMatch = doc.content?.toLowerCase().includes(searchLower)
      const metadataMatch = doc.metadata?.title?.toLowerCase().includes(searchLower) ||
                           doc.metadata?.description?.toLowerCase().includes(searchLower)

      return nameMatch || contentMatch || metadataMatch
    })

    setFilteredDocs(filtered)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const kb = bytes / 1024
    return kb > 1 ? `${kb.toFixed(1)} KB` : `${bytes} bytes`
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Unknown'
    const d = new Date(date)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getDocIcon = (filename: string) => {
    const important = ['README.md', 'SPACES_PLATFORM_OVERVIEW.md', 'GETTING_STARTED.md']
    if (important.includes(filename)) return '⭐'
    if (filename.includes('ARCHITECTURE')) return '🏗️'
    if (filename.includes('BUSINESS') || filename.includes('REVENUE')) return '💼'
    if (filename.includes('API') || filename.includes('TECHNICAL')) return '🔧'
    if (filename.includes('GUIDE') || filename.includes('TUTORIAL')) return '📚'
    if (filename.includes('DEPLOYMENT') || filename.includes('SETUP')) return '🚀'
    if (filename.includes('SECURITY') || filename.includes('AUTH')) return '🔒'
    if (filename.includes('I18N') || filename.includes('INTERNATIONAL')) return '🌐'
    if (filename.includes('AI') || filename.includes('AGENT')) return '🤖'
    return '📄'
  }

  const getDocCategory = (filename: string) => {
    if (filename.includes('BUSINESS') || filename.includes('REVENUE')) return 'Business'
    if (filename.includes('TECHNICAL') || filename.includes('ARCHITECTURE')) return 'Technical'
    if (filename.includes('API') || filename.includes('ENDPOINT')) return 'API'
    if (filename.includes('GUIDE') || filename.includes('TUTORIAL')) return 'Guide'
    if (filename.includes('SETUP') || filename.includes('DEPLOYMENT')) return 'Setup'
    if (filename.includes('AI') || filename.includes('AGENT')) return 'AI & Automation'
    if (filename.includes('SECURITY') || filename.includes('AUTH')) return 'Security'
    if (filename.includes('I18N') || filename.includes('INTERNATIONAL')) return 'Internationalization'
    return 'General'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={loadDocsList}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documentation Center</h1>
              <p className="text-gray-600">Browse and search all platform documentation</p>
            </div>
          </div>
          {selectedDoc && (
            <Button
              variant="outline"
              onClick={() => setSelectedDoc(null)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to List</span>
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {!selectedDoc ? (
          <>
            {/* Search and Stats */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{filteredDocs.length} documents</span>
                </span>
                {loading && (
                  <span className="flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Start</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: 'README.md',
                    title: 'Platform Overview',
                    description: 'Start here for complete documentation index'
                  },
                  {
                    name: 'GETTING_STARTED.md',
                    title: 'Getting Started',
                    description: 'Setup and initial configuration guide'
                  },
                  {
                    name: 'SPACES_PLATFORM_OVERVIEW.md',
                    title: 'Platform Architecture',
                    description: 'Complete system overview and capabilities'
                  }
                ].map((quickDoc) => {
                  const doc = docs.find(d => d.name === quickDoc.name)
                  return doc ? (
                    <Card
                      key={quickDoc.name}
                      className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 bg-blue-50/50"
                      onClick={() => loadDocContent(doc.relativePath)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                          <span>{getDocIcon(quickDoc.name)}</span>
                          <span>{quickDoc.title}</span>
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {quickDoc.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ) : null
                })}
              </div>
            </div>

            {/* Documentation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => (
                <Card
                  key={doc.relativePath}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => loadDocContent(doc.relativePath)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className="text-lg">{getDocIcon(doc.name)}</span>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base truncate">
                            {doc.metadata?.title || doc.name.replace('.md', '')}
                          </CardTitle>
                          <div className="text-xs text-blue-600 mt-1">
                            {getDocCategory(doc.name)}
                          </div>
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                    {doc.metadata?.description && (
                      <CardDescription className="text-sm line-clamp-2">
                        {doc.metadata.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(doc.lastModified)}</span>
                      </div>
                      <span>{formatFileSize(doc.size)}</span>
                    </div>
                    {doc.metadata?.lastUpdated && (
                      <div className="mt-2 text-xs text-blue-600">
                        Last updated: {doc.metadata.lastUpdated}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDocs.length === 0 && !loading && (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? `No documents match "${searchTerm}". Try a different search term.`
                      : 'No documentation files are available.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Document Viewer */
          <div className="bg-white rounded-lg shadow-sm border">
            {loadingContent ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            ) : (
              <>
                {/* Document Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedDoc.metadata?.title || selectedDoc.name.replace('.md', '')}
                      </h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{selectedDoc.name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(selectedDoc.lastModified)}</span>
                        </span>
                        <span>{formatFileSize(selectedDoc.size)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([selectedDoc.content], { type: 'text/markdown' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = selectedDoc.name
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Document Content */}
                <div className="p-6">
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">{children}</h1>,
                        h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">{children}</h2>,
                        h3: ({children}) => <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">{children}</h3>,
                        table: ({children}) => <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">{children}</table></div>,
                        th: ({children}) => <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">{children}</th>,
                        td: ({children}) => <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{children}</td>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg my-4">{children}</blockquote>,
                        a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                        code: ({children, className}) => {
                          const isInline = !className
                          return isInline ? (
                            <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                          ) : (
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                              <code className="text-sm font-mono">{children}</code>
                            </pre>
                          )
                        }
                      }}
                    >
                      {selectedDoc.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
