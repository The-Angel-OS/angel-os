"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  isVisible: boolean
  onDismiss?: () => void
}

export function Notification({ type, message, isVisible, onDismiss }: NotificationProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const Icon = icons[type]

  // Use CSS custom properties that automatically update with theme
  const getNotificationClasses = (type: string) => {
    const baseClasses = "p-4 rounded-lg border backdrop-blur-sm"
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400`
      case 'error':
        return `${baseClasses} bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400`
      case 'warning':
        return `${baseClasses} bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400`
      case 'info':
        return `${baseClasses} bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400`
      default:
        return `${baseClasses} bg-muted/50 border-border text-foreground`
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`mb-4 ${getNotificationClasses(type)}`}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            {onDismiss && (
              <button
                title="Dismiss Notification"
                onClick={onDismiss}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
