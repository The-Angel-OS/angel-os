"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { UniversalModal } from '@/components/ui/universal-modal'
import { Building, ChevronDown, Search, Plus, Users, Globe, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Space {
  id: string | number
  name: string
  slug: string
  description?: string
  image?: {
    url: string
    alt?: string
  }
  memberCount: number
  isPublic: boolean
  status: 'active' | 'archived' | 'private'
  createdAt: string
  updatedAt: string
}

interface SpacesChooserProps {
  className?: string
  userId?: string | number
  onSpaceSelect?: (space: Space) => void
  currentSpace?: Space | null
}

export function SpacesChooser({ 
  className = "", 
  userId, 
  onSpaceSelect,
  currentSpace 
}: SpacesChooserProps) {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadSpaces()
  }, [userId])

  const loadSpaces = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/spaces')
      if (response.ok) {
        const data = await response.json()
        setSpaces(data.docs || [])
      } else {
        setError('Failed to load spaces')
      }
    } catch (error) {
      console.error('Failed to load spaces:', error)
      setError('Failed to load spaces')
    } finally {
      setLoading(false)
    }
  }

  const handleSpaceSelect = (space: Space) => {
    onSpaceSelect?.(space)
    setIsOpen(false)
  }

  const handleCreateSpace = async (data: any) => {
    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          isPublic: data.isPublic || false,
          image: data.image
        })
      })

      if (response.ok) {
        const newSpace = await response.json()
        setSpaces(prev => [newSpace, ...prev])
        handleSpaceSelect(newSpace)
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Failed to create space:', error)
    }
  }

  const createSpaceFields = useMemo(() => [
    {
      name: 'name',
      label: 'Space Name',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., Project Alpha, Marketing Team'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      placeholder: 'What is this space for?'
    },
    {
      name: 'isPublic',
      label: 'Public Space',
      type: 'checkbox' as const,
      description: 'Allow anyone in your organization to join'
    },
    {
      name: 'image',
      label: 'Space Image',
      type: 'text' as const,
      placeholder: 'Image URL (optional)'
    }
  ], [])

  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
      case 'private': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
      case 'archived': return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
    }
  }

  const SpaceAvatar = ({ space, size = "md" }: { space: Space, size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
      sm: "w-6 h-6 text-xs",
      md: "w-10 h-10 text-sm", 
      lg: "w-12 h-12 text-base"
    }

    if (space.image?.url) {
      return (
        <img 
          src={space.image.url} 
          alt={space.image.alt || space.name}
          className={`${sizeClasses[size]} rounded-lg object-cover shadow-sm`}
        />
      )
    }

    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-primary/80 to-primary rounded-lg flex items-center justify-center shadow-sm`}>
        <span className="text-primary-foreground font-bold">
          {space.name.substring(0, 2).toUpperCase()}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        <span className="text-sm text-muted-foreground">Loading spaces...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-xs">!</span>
        </div>
        <span className="text-sm text-red-600">{error}</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 h-auto p-3 hover:bg-sidebar-accent/50 rounded-lg w-full"
      >
        <SpaceAvatar space={currentSpace || spaces[0] || { 
          id: '1', 
          name: 'Default Space', 
          slug: 'default', 
          status: 'active',
          memberCount: 0,
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }} />
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-sm text-sidebar-foreground truncate">
            {currentSpace?.name || 'Select Space'}
          </div>
          <div className="text-xs text-sidebar-foreground/60">
            {spaces.length} space{spaces.length !== 1 ? 's' : ''} available
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-sidebar-foreground/60 flex-shrink-0" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <Card className="w-96 shadow-xl border-2 bg-popover/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-popover-foreground">Choose Space</h3>
                        <p className="text-xs text-muted-foreground">
                          Switch between your collaborative spaces
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowCreateModal(true)}
                      className="h-8 px-3"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      New
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search spaces..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>

                  {/* Spaces List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredSpaces.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No spaces found</p>
                        {searchQuery && (
                          <p className="text-xs mt-1">Try adjusting your search</p>
                        )}
                      </div>
                    ) : (
                      filteredSpaces.map((space) => (
                        <Button
                          key={space.id}
                          variant="ghost"
                          onClick={() => handleSpaceSelect(space)}
                          className={`w-full p-4 h-auto justify-start ${
                            currentSpace?.id === space.id
                              ? 'bg-primary/15 border border-primary/30 text-primary shadow-sm' 
                              : 'hover:bg-muted/80 text-popover-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-4 w-full">
                            <SpaceAvatar space={space} />
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-semibold text-sm truncate">{space.name}</div>
                              {space.description && (
                                <div className="text-xs text-muted-foreground/90 mt-1 truncate">
                                  {space.description}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className={getStatusColor(space.status)}>
                                  {space.status}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="w-3 h-3" />
                                  {space.memberCount}
                                </div>
                                {space.isPublic && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Globe className="w-3 h-3" />
                                    Public
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Space Modal */}
      <UniversalModal
        title="Create New Space"
        description="Create a collaborative space for your team or project"
        fields={createSpaceFields}
        onSubmit={handleCreateSpace}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        submitLabel="Create Space"
        size="md"
      />

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default SpacesChooser
