"use client"

import { useEffect, useRef, useCallback } from "react"
import { cn } from "@/utilities/ui"

interface InfiniteScrollProps {
  children: React.ReactNode
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  className?: string
  threshold?: number
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
  threshold = 100
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading && onLoadMore) {
      onLoadMore()
    }
  }, [hasMore, isLoading, onLoadMore])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create intersection observer for bottom of scroll area
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          handleLoadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`,
      }
    )

    // Create a sentinel element at the bottom
    const sentinel = document.createElement('div')
    sentinel.style.height = '1px'
    container.appendChild(sentinel)
    observerRef.current.observe(sentinel)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (container.contains(sentinel)) {
        container.removeChild(sentinel)
      }
    }
  }, [handleLoadMore, threshold])

  return (
    <div
      ref={containerRef}
      className={cn("overflow-y-auto", className)}
    >
      {children}

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-[#5865f2] border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  )
}
