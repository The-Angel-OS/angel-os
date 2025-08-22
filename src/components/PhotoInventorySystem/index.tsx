"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Camera,
  Upload,
  Image as ImageIcon,
  MapPin,
  Car,
  Package,
  Archive,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface PhotoSequence {
  id: string
  photos: File[]
  type: 'mileage_log' | 'collection_inventory' | 'business_inventory' | 'general'
  metadata: {
    location?: string
    timestamp: Date
    description?: string
    tags?: string[]
  }
  analysis?: InventoryAnalysis
  status: 'pending' | 'analyzing' | 'completed' | 'error'
}

interface InventoryAnalysis {
  detected_items: InventoryItem[]
  category: string
  confidence: number
  summary: string
  mileage_data?: MileageLogEntry
  collection_data?: CollectionData
}

interface InventoryItem {
  name: string
  quantity: number
  condition: string
  estimated_value?: number
  location?: string
  confidence: number
}

interface MileageLogEntry {
  odometer_reading: number
  vehicle_identified: string
  location: string
  date: Date
  mileage_type: 'business' | 'personal'
  purpose?: string
}

interface CollectionData {
  collection_type: string
  total_items: number
  categorized_items: Record<string, number>
  estimated_total_value?: number
  condition_summary: string
}

interface PhotoInventorySystemProps {
  tenantId?: string
  guardianAngelId?: string
  onInventoryComplete?: (analysis: InventoryAnalysis) => void
}

export default function PhotoInventorySystem({
  tenantId,
  guardianAngelId,
  onInventoryComplete
}: PhotoInventorySystemProps) {
  const [sequences, setSequences] = useState<PhotoSequence[]>([])
  const [activeSequence, setActiveSequence] = useState<PhotoSequence | null>(null)
  const [inventoryType, setInventoryType] = useState<string>('auto_detect')
  const [location, setLocation] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic']
    },
    multiple: true,
    onDrop: useCallback((acceptedFiles: File[]) => {
      handlePhotoDrop(acceptedFiles)
    }, [])
  })

  const handlePhotoDrop = (files: File[]) => {
    const newSequence: PhotoSequence = {
      id: `seq-${Date.now()}`,
      photos: files,
      type: inventoryType as any || 'general',
      metadata: {
        location,
        timestamp: new Date(),
        description,
        tags: []
      },
      status: 'pending'
    }

    setSequences(prev => [newSequence, ...prev])
    setActiveSequence(newSequence)
  }

  const analyzePhotoSequence = async (sequence: PhotoSequence) => {
    try {
      setSequences(prev => 
        prev.map(seq => 
          seq.id === sequence.id 
            ? { ...seq, status: 'analyzing' }
            : seq
        )
      )

      const formData = new FormData()
      sequence.photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo)
      })
      formData.append('sequence_type', sequence.type)
      formData.append('location', sequence.metadata.location || '')
      formData.append('description', sequence.metadata.description || '')
      formData.append('tenant_id', tenantId || '')
      formData.append('guardian_angel_id', guardianAngelId || '')

      const response = await fetch('/api/photo-inventory/analyze', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const analysis: InventoryAnalysis = await response.json()

      setSequences(prev => 
        prev.map(seq => 
          seq.id === sequence.id 
            ? { ...seq, analysis, status: 'completed' }
            : seq
        )
      )

      if (onInventoryComplete) {
        onInventoryComplete(analysis)
      }

      // Create appropriate database records based on analysis type
      await createInventoryRecords(sequence, analysis)

    } catch (error) {
      console.error('Photo analysis error:', error)
      setSequences(prev => 
        prev.map(seq => 
          seq.id === sequence.id 
            ? { ...seq, status: 'error' }
            : seq
        )
      )
    }
  }

  const createInventoryRecords = async (sequence: PhotoSequence, analysis: InventoryAnalysis) => {
    try {
      if (analysis.mileage_data) {
        // Create mileage log entry
        await fetch('/api/mileage-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: tenantId,
            odometer_reading: analysis.mileage_data.odometer_reading,
            vehicle: analysis.mileage_data.vehicle_identified,
            location: analysis.mileage_data.location,
            date: analysis.mileage_data.date,
            type: analysis.mileage_data.mileage_type,
            purpose: analysis.mileage_data.purpose,
            photos: sequence.photos.map(p => p.name)
          })
        })
      }

      if (analysis.collection_data) {
        // Create collection inventory record
        await fetch('/api/collections/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: tenantId,
            collection_type: analysis.collection_data.collection_type,
            items: analysis.detected_items,
            total_value: analysis.collection_data.estimated_total_value,
            condition: analysis.collection_data.condition_summary,
            photos: sequence.photos.map(p => p.name)
          })
        })
      }

      // Always create general inventory record
      await fetch('/api/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          sequence_id: sequence.id,
          items: analysis.detected_items,
          category: analysis.category,
          confidence: analysis.confidence,
          summary: analysis.summary,
          photos: sequence.photos.map(p => p.name)
        })
      })

    } catch (error) {
      console.error('Error creating inventory records:', error)
    }
  }

  const getStatusIcon = (status: PhotoSequence['status']) => {
    switch (status) {
      case 'analyzing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Camera className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: PhotoSequence['status']) => {
    const variants = {
      pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
      analyzing: { color: 'bg-blue-100 text-blue-800', label: 'Analyzing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      error: { color: 'bg-red-100 text-red-800', label: 'Error' }
    }
    
    const variant = variants[status]
    return (
      <Badge className={variant.color}>
        {getStatusIcon(status)}
        <span className="ml-1">{variant.label}</span>
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600" />
            Photo Inventory System
          </h2>
          <p className="text-gray-600">
            AI-powered inventory management from photo sequences
          </p>
        </div>
      </div>

      {/* Upload Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Photo Upload & Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="inventory_type">Inventory Type</Label>
              <Select value={inventoryType} onValueChange={setInventoryType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_detect">Auto Detect</SelectItem>
                  <SelectItem value="mileage_log">Mileage Log (Odometer + Location)</SelectItem>
                  <SelectItem value="collection_inventory">Collection Inventory</SelectItem>
                  <SelectItem value="business_inventory">Business Inventory</SelectItem>
                  <SelectItem value="general">General Inventory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Current location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Photo Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop photos here...</p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">
                  Drop photos here or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Upload multiple photos for sequence analysis
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Sequences */}
      {sequences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Photo Sequences ({sequences.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sequences.map((sequence) => (
                <div
                  key={sequence.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {sequence.photos.length} photos • {sequence.type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sequence.metadata.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(sequence.status)}
                      {sequence.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => analyzePhotoSequence(sequence)}
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Analyze
                        </Button>
                      )}
                    </div>
                  </div>

                  {sequence.metadata.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      {sequence.metadata.location}
                    </div>
                  )}

                  {sequence.analysis && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Analysis Results</h4>
                      <p className="text-sm text-gray-600 mb-3">{sequence.analysis.summary}</p>
                      
                      {sequence.analysis.mileage_data && (
                        <div className="mb-3">
                          <Badge className="bg-blue-100 text-blue-800">
                            <Car className="w-3 h-3 mr-1" />
                            Mileage: {sequence.analysis.mileage_data.odometer_reading.toLocaleString()} miles
                          </Badge>
                        </div>
                      )}
                      
                      {sequence.analysis.detected_items.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Detected Items:</p>
                          <div className="flex flex-wrap gap-1">
                            {sequence.analysis.detected_items.slice(0, 5).map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item.name} ({item.quantity})
                              </Badge>
                            ))}
                            {sequence.analysis.detected_items.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{sequence.analysis.detected_items.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="p-4 h-auto flex-col gap-2"
              onClick={() => setInventoryType('mileage_log')}
            >
              <Car className="w-6 h-6" />
              <span>Mileage Log</span>
              <span className="text-xs text-gray-500">Odometer + Location</span>
            </Button>
            
            <Button
              variant="outline"
              className="p-4 h-auto flex-col gap-2"
              onClick={() => setInventoryType('collection_inventory')}
            >
              <Archive className="w-6 h-6" />
              <span>Collection</span>
              <span className="text-xs text-gray-500">Organize & catalog</span>
            </Button>
            
            <Button
              variant="outline"
              className="p-4 h-auto flex-col gap-2"
              onClick={() => setInventoryType('business_inventory')}
            >
              <Package className="w-6 h-6" />
              <span>Business Inventory</span>
              <span className="text-xs text-gray-500">Stock & products</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 