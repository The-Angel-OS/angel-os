"use client"

import React from "react"
import { cn } from "@/utilities/ui"

// Generic Widget Interface
export interface BaseWidgetData {
  widgetType: string
  widgetTitle: string
  timestamp: string
  isInteractive: boolean
  allowedRoles: string[]
  expiresAt?: string
  [key: string]: any
}

// Widget Registry for pluggable widget types
export class WidgetRegistry {
  private static renderers: Map<string, React.ComponentType<any>> = new Map()

  static register(widgetType: string, renderer: React.ComponentType<any>) {
    this.renderers.set(widgetType, renderer)
  }

  static getRenderer(widgetType: string): React.ComponentType<any> | null {
    return this.renderers.get(widgetType) || null
  }

  static listTypes(): string[] {
    return Array.from(this.renderers.keys())
  }
}

// CORE BUSINESS WIDGET: Payment Collection for Displaced Persons
export const PaymentCollectionWidget: React.FC<{ data: any }> = ({ data }) => {
  const { amount, purpose, urgency, beneficiary, paymentMethods, progress } = data

  return (
    <div className="max-w-2xl bg-[#2f3136] border border-[#42464d] rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💳</span>
          <div>
            <h3 className="text-lg font-semibold text-white">Emergency Payment Collection</h3>
            <p className="text-blue-100 text-sm">
              {new Date(data.timestamp).toLocaleString()} • Payment Request
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className={cn(
          "p-4 rounded-lg border-l-4",
          urgency === 'critical' ? "bg-red-900/30 border-red-500" :
          urgency === 'high' ? "bg-orange-900/30 border-orange-500" :
          "bg-blue-900/30 border-blue-500"
        )}>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-white">{purpose}</h4>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">${progress?.raised || 0}</div>
              <div className="text-sm text-gray-400">of ${amount} goal</div>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-3">For: {beneficiary}</p>

          {progress && (
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((progress.raised / amount) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 100, 250].map(amt => (
            <button key={amt} className="p-2 bg-[#404249] hover:bg-green-600 rounded text-white text-sm font-medium">
              ${amt}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-400 border-t border-gray-600 pt-3">
          🔒 Secure payment • Direct to beneficiary • Tax receipt • {progress?.donors || 0} donors
        </div>
      </div>
    </div>
  )
}

// WEB CAPTURE WIDGET: GoFullPage Integration
export const WebCaptureWidget: React.FC<{ data: any }> = ({ data }) => {
  const {
    id,
    url,
    title,
    description,
    captureType,
    timestamp,
    author,
    imageUrl,
    pdfUrl,
    content,
    tags = [],
    source,
    metadata = {}
  } = data

  const getCaptureIcon = (type: string) => {
    switch (type) {
      case 'screenshot': return '📸'
      case 'pdf': return '📄'
      case 'full_page': return '🖼️'
      case 'selection': return '✂️'
      case 'article': return '📰'
      default: return '🌐'
    }
  }

  const getSourceBadge = (src: string) => {
    switch (src) {
      case 'gofullpage': return { label: 'GoFullPage', color: 'bg-blue-600' }
      case 'browser_extension': return { label: 'Extension', color: 'bg-green-600' }
      case 'automation': return { label: 'Auto', color: 'bg-purple-600' }
      case 'manual': return { label: 'Manual', color: 'bg-gray-600' }
      default: return { label: 'Web', color: 'bg-blue-600' }
    }
  }

  const sourceBadge = getSourceBadge(source)

  return (
    <div className="max-w-2xl bg-[#2f3136] border border-[#42464d] rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getCaptureIcon(captureType)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-blue-100 text-sm truncate">
                {metadata.domain || new URL(url).hostname}
              </span>
              <span className={`px-2 py-1 rounded text-xs text-white ${sourceBadge.color}`}>
                {sourceBadge.label}
              </span>
            </div>
          </div>
          <div className="text-right text-blue-100 text-xs">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
        {description && (
          <p className="text-blue-100 text-sm mt-2">{description}</p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Image Preview */}
        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-gray-600">
            <img
              src={imageUrl}
              alt={`Web capture of ${title}`}
              className="w-full h-auto max-h-96 object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                {captureType.replace('_', ' ').toUpperCase()}
              </span>
              {metadata.fileSize && (
                <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {Math.round(metadata.fileSize / 1024)}KB
                </span>
              )}
            </div>
          </div>
        )}

        {/* Text Content Preview */}
        {content && !imageUrl && (
          <div className="bg-[#36393f] rounded-lg p-4 border border-gray-600">
            <p className="text-gray-300 text-sm line-clamp-4">{content}</p>
          </div>
        )}

        {/* Metadata */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 bg-[#36393f] p-3 rounded">
            <div>
              <span className="font-medium">Device:</span> {metadata.deviceType || 'Desktop'}
            </div>
            <div>
              <span className="font-medium">Viewport:</span> {
                metadata.viewport ?
                `${metadata.viewport.width}×${metadata.viewport.height}` :
                'Standard'
              }
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-[#404249] text-gray-300 text-xs rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author */}
        {author && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-600">
            <div className="w-6 h-6 bg-[#5865f2] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {author.name?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              Captured by {author.name || 'Anonymous'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-600">
          <button
            onClick={() => window.open(url, '_blank')}
            className="px-3 py-1 bg-[#404249] hover:bg-[#5865f2] text-white text-sm rounded"
          >
            🔗 Visit Page
          </button>

          {imageUrl && (
            <button
              onClick={() => {
                const link = document.createElement('a')
                link.href = imageUrl
                link.download = `capture-${id}.png`
                link.click()
              }}
              className="px-3 py-1 bg-[#404249] hover:bg-green-600 text-white text-sm rounded"
            >
              ⬇️ Download
            </button>
          )}

          <button className="px-3 py-1 bg-[#404249] hover:bg-yellow-600 text-white text-sm rounded">
            💬 Comment
          </button>

          <button className="px-3 py-1 bg-[#404249] hover:bg-purple-600 text-white text-sm rounded">
            📤 Share
          </button>
        </div>
      </div>
    </div>
  )
}

// Auto-register core widget types
WidgetRegistry.register('payment_collection', PaymentCollectionWidget)
WidgetRegistry.register('emergency_payment', PaymentCollectionWidget)
WidgetRegistry.register('housing_assistance', PaymentCollectionWidget)
WidgetRegistry.register('web_capture', WebCaptureWidget)
