"use client"

import React from "react"
import type { Message } from "@/payload-types"
import { WidgetRegistry } from "./GenericWidgetSystem"

interface WidgetMessageProps {
  message: Message
  className?: string
}

// Default fallback widget for unregistered types
const DefaultWidget: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="bg-[#2f3136] border border-[#42464d] rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">W</span>
        </div>
        <div>
          <h4 className="text-white font-medium">{data.widgetTitle || "Widget"}</h4>
          <p className="text-gray-400 text-sm">Type: {data.widgetType}</p>
        </div>
      </div>
      <div className="text-gray-300 text-sm space-y-2">
        <div>Interactive: {data.isInteractive ? "✅ Yes" : "❌ No"}</div>
        <div>Properties: {Object.keys(data).length} available</div>
        <details className="mt-3">
          <summary className="cursor-pointer text-blue-400">Show Data</summary>
          <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}

export function WidgetMessage({ message, className }: WidgetMessageProps) {
  const widgetData = (message as any).widgetData

  if (!widgetData || !widgetData.widgetType) {
    return (
      <div className="text-gray-400 italic">
        Widget content unavailable
      </div>
    )
  }

  // Get the appropriate renderer from the registry (pluggable system)
  const WidgetRenderer = WidgetRegistry.getRenderer(widgetData.widgetType) || DefaultWidget

  return (
    <div className={className}>
      <WidgetRenderer data={widgetData.widgetData} />
    </div>
  )
}
