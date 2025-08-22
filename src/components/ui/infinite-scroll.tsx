import React, { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InfiniteScrollProps {
  children: ReactNode
  hasMore: boolean
  isLoading: boolean
  next?: () => void | Promise<void>
  threshold?: number
  className?: string
  loader?: ReactNode
}

export function InfiniteScroll({ 
  children, 
  hasMore, 
  isLoading, 
  next, 
  threshold = 100, 
  className,
  loader 
}: InfiniteScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      if (isLoading || !hasMore || !next) return

      const { scrollTop } = scrollElement

      // Check if we're near the top (for loading older messages)
      if (scrollTop <= threshold) {
        next()
      }
    }

    scrollElement.addEventListener("scroll", handleScroll)
    return () => scrollElement.removeEventListener("scroll", handleScroll)
  }, [hasMore, isLoading, next, threshold])

  const defaultLoader = (
    <div className="flex justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-muted-foreground">Loading older messages...</span>
    </div>
  )

  return (
    <div ref={scrollRef} className={cn("overflow-y-auto", className)}>
      {isLoading && (loader || defaultLoader)}
      {children}
    </div>
  )
}
