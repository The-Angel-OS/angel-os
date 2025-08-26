'use client'

import React from 'react'

interface TenantCellProps {
  cellData: any
  rowData: any
}

export const TenantCell: React.FC<TenantCellProps> = ({ cellData }) => {
  // Handle different data structures
  if (!cellData) {
    return <span className="text-gray-400">No tenant</span>
  }

  // If cellData is an object with name property
  if (typeof cellData === 'object' && cellData.name) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{cellData.name}</span>
        <span className="text-xs text-gray-500">({cellData.id})</span>
      </div>
    )
  }

  // If cellData is just an ID string
  if (typeof cellData === 'string') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Tenant</span>
        <span className="text-xs text-gray-500">({cellData})</span>
      </div>
    )
  }

  // Fallback
  return <span className="text-gray-400">{String(cellData)}</span>
}

export default TenantCell



