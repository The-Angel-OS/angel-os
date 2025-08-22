/**
 * System Monitor Service
 * Captures and manages system logs, errors, and heartbeats for the Angel OS System Console
 */

export interface SystemLog {
  id: string
  type: 'info' | 'warning' | 'error' | 'success' | 'heartbeat' | 'business'
  message: string
  timestamp: Date
  source?: string
  details?: any
}

export interface SystemMetrics {
  cpu?: number
  memory?: number
  activeConnections?: number
  responseTime?: number
  errorRate?: number
}

class SystemMonitorService {
  private static instance: SystemMonitorService
  private logs: SystemLog[] = []
  private listeners: ((logs: SystemLog[]) => void)[] = []
  private metrics: SystemMetrics = {}
  private maxLogs = 1000

  private constructor() {
    // Initialize with startup log
    this.addLog({
      type: 'info',
      message: 'Angel OS System Monitor initialized',
      source: 'SystemMonitor'
    })

    // Start heartbeat monitoring
    this.startHeartbeat()

    // Intercept console errors
    this.interceptConsoleErrors()

    // Monitor window errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleWindowError)
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
    }
  }

  static getInstance(): SystemMonitorService {
    if (!SystemMonitorService.instance) {
      SystemMonitorService.instance = new SystemMonitorService()
    }
    return SystemMonitorService.instance
  }

  // Add a log entry
  addLog(log: Omit<SystemLog, 'id' | 'timestamp'>) {
    const newLog: SystemLog = {
      ...log,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    this.logs = [...this.logs.slice(-this.maxLogs + 1), newLog]
    this.notifyListeners()
  }

  // Subscribe to log updates
  subscribe(listener: (logs: SystemLog[]) => void) {
    this.listeners.push(listener)
    // Send current logs immediately
    listener(this.logs)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Unsubscribe from log updates
  unsubscribe(listener: (logs: SystemLog[]) => void) {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  // Get all logs
  getLogs(): SystemLog[] {
    return this.logs
  }

  // Clear logs
  clearLogs() {
    this.logs = []
    this.notifyListeners()
  }

  // Update system metrics
  updateMetrics(metrics: Partial<SystemMetrics>) {
    this.metrics = { ...this.metrics, ...metrics }
  }

  // Get current metrics
  getMetrics(): SystemMetrics {
    return this.metrics
  }

  // Log business activity
  logBusinessActivity(activity: string, details?: any) {
    this.addLog({
      type: 'business',
      message: activity,
      source: 'Business',
      details
    })
  }

  // Log API activity
  logApiActivity(method: string, endpoint: string, status: number, duration?: number) {
    const message = `${method} ${endpoint} - ${status} ${duration ? `(${duration}ms)` : ''}`
    this.addLog({
      type: status >= 400 ? 'error' : 'info',
      message,
      source: 'API',
      details: { method, endpoint, status, duration }
    })
  }

  // Private methods
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.logs)
      } catch (error) {
        console.error('Error notifying listener:', error)
      }
    })
  }

  private startHeartbeat() {
    // Initial heartbeat
    this.sendHeartbeat()

    // Regular heartbeats every 30 seconds
    setInterval(() => {
      this.sendHeartbeat()
    }, 30000)
  }

  private sendHeartbeat() {
    // Simulate system metrics (in production, these would come from actual monitoring)
    const cpu = Math.floor(Math.random() * 20 + 10)
    const memory = Math.floor(Math.random() * 30 + 40)
    const activeConnections = Math.floor(Math.random() * 50 + 100)
    const responseTime = Math.floor(Math.random() * 50 + 20)
    const errorRate = Math.random() * 2

    this.updateMetrics({ cpu, memory, activeConnections, responseTime, errorRate })

    this.addLog({
      type: 'heartbeat',
      message: `System heartbeat: CPU ${cpu}%, Memory ${memory}%, Active connections: ${activeConnections}, Response time: ${responseTime}ms, Error rate: ${errorRate.toFixed(2)}%`,
      source: 'Monitor',
      details: this.metrics
    })
  }

  private interceptConsoleErrors() {
    const originalError = console.error
    console.error = (...args) => {
      this.addLog({
        type: 'error',
        message: args.map(arg => String(arg)).join(' '),
        source: 'Console',
        details: args.length > 1 ? args : undefined
      })
      originalError.apply(console, args)
    }
  }

  private handleWindowError = (event: ErrorEvent) => {
    this.addLog({
      type: 'error',
      message: event.message,
      source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : 'Window',
      details: {
        error: event.error,
        stack: event.error?.stack
      }
    })
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.addLog({
      type: 'error',
      message: `Unhandled Promise Rejection: ${event.reason}`,
      source: 'Promise',
      details: {
        reason: event.reason,
        promise: event.promise
      }
    })
  }
}

// Export singleton instance
export const systemMonitor = SystemMonitorService.getInstance()

// Helper functions for easy logging
export const logInfo = (message: string, source?: string, details?: any) => 
  systemMonitor.addLog({ type: 'info', message, source, details })

export const logWarning = (message: string, source?: string, details?: any) => 
  systemMonitor.addLog({ type: 'warning', message, source, details })

export const logError = (message: string, source?: string, details?: any) => 
  systemMonitor.addLog({ type: 'error', message, source, details })

export const logSuccess = (message: string, source?: string, details?: any) => 
  systemMonitor.addLog({ type: 'success', message, source, details })

export const logBusiness = (activity: string, details?: any) => 
  systemMonitor.logBusinessActivity(activity, details)

export const logApi = (method: string, endpoint: string, status: number, duration?: number) => 
  systemMonitor.logApiActivity(method, endpoint, status, duration)

export const clearLogs = () => systemMonitor.clearLogs()

export const subscribe = (callback: (logs: SystemLog[]) => void) => 
  systemMonitor.subscribe(callback)

export const unsubscribe = (callback: (logs: SystemLog[]) => void) => 
  systemMonitor.unsubscribe(callback)

export const getLogs = () => systemMonitor.getLogs()
