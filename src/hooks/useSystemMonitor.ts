'use client'

import { useEffect, useState } from 'react'
import { systemMonitor, SystemLog } from '@/services/SystemMonitorService'

export function useSystemMonitor() {
  const [logs, setLogs] = useState<SystemLog[]>([])

  useEffect(() => {
    // Subscribe to system monitor updates
    const unsubscribe = systemMonitor.subscribe((updatedLogs) => {
      setLogs(updatedLogs)
    })

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [])

  return {
    logs,
    addLog: systemMonitor.addLog.bind(systemMonitor),
    clearLogs: systemMonitor.clearLogs.bind(systemMonitor),
    metrics: systemMonitor.getMetrics(),
  }
}



















