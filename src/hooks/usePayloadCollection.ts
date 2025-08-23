"use client"

import { useState, useEffect, useCallback } from 'react'

export interface PayloadCollectionOptions {
  collection: string
  limit?: number
  page?: number
  sort?: string
  where?: Record<string, any>
  depth?: number
  locale?: string
}

export interface PayloadCollectionResult<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage?: number
  prevPage?: number
}

export interface UsePayloadCollectionReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
  refresh: () => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSort: (sort: string) => void
  setWhere: (where: Record<string, any>) => void
}

export function usePayloadCollection<T = any>(
  options: PayloadCollectionOptions
): UsePayloadCollectionReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PayloadCollectionResult<T> | null>(null)
  
  // Internal state for query parameters
  const [queryParams, setQueryParams] = useState({
    limit: options.limit || 10,
    page: options.page || 1,
    sort: options.sort || '-updatedAt',
    where: options.where || {},
    depth: options.depth || 1,
    locale: options.locale || 'en',
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string
      const searchParams = new URLSearchParams()
      searchParams.append('limit', queryParams.limit.toString())
      searchParams.append('page', queryParams.page.toString())
      searchParams.append('sort', queryParams.sort)
      // Only add depth if it's different from default (1)
      if (queryParams.depth !== 1) {
        searchParams.append('depth', queryParams.depth.toString())
      }
      searchParams.append('locale', queryParams.locale)
      
      // Add where conditions
      if (Object.keys(queryParams.where).length > 0) {
        searchParams.append('where', JSON.stringify(queryParams.where))
      }

      const response = await fetch(`/api/${options.collection}?${searchParams.toString()}`, {
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(`Access denied. Please check your permissions for ${options.collection}.`)
        }
        if (response.status === 401) {
          throw new Error(`Authentication required. Please log in to access ${options.collection}.`)
        }
        throw new Error(`Failed to fetch ${options.collection}: ${response.statusText}`)
      }

      const result: PayloadCollectionResult<T> = await response.json()
      
      setResult(result)
      setData(result.docs || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error(`Error fetching ${options.collection}:`, err)
    } finally {
      setLoading(false)
    }
  }, [options.collection, queryParams])

  // Fetch data when component mounts or query params change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Control functions
  const setPage = useCallback((page: number) => {
    setQueryParams(prev => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setQueryParams(prev => ({ ...prev, limit, page: 1 })) // Reset to page 1 when changing limit
  }, [])

  const setSort = useCallback((sort: string) => {
    setQueryParams(prev => ({ ...prev, sort, page: 1 })) // Reset to page 1 when changing sort
  }, [])

  const setWhere = useCallback((where: Record<string, any>) => {
    setQueryParams(prev => ({ ...prev, where, page: 1 })) // Reset to page 1 when changing filters
  }, [])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    totalDocs: result?.totalDocs || 0,
    totalPages: result?.totalPages || 0,
    page: result?.page || 1,
    hasNextPage: result?.hasNextPage || false,
    hasPrevPage: result?.hasPrevPage || false,
    refresh,
    setPage,
    setLimit,
    setSort,
    setWhere,
  }
}

// Specialized hooks for common collections
export const useProducts = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'products',
    limit: 10,
    sort: '-updatedAt',
    ...options,
  })
}

export const useOrders = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'orders',
    limit: 10,
    sort: '-createdAt',
    ...options,
  })
}

export const useContacts = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'contacts',
    limit: 10,
    sort: 'name',
    ...options,
  })
}

export const useLeads = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'leads',
    limit: 10,
    sort: '-createdAt',
    ...options,
  })
}

export const useOpportunities = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'opportunities',
    limit: 10,
    sort: '-updatedAt',
    ...options,
  })
}

export const useProjects = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'projects',
    limit: 10,
    sort: '-updatedAt',
    ...options,
  })
}

export const useTasks = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'tasks',
    limit: 10,
    sort: 'dueDate',
    ...options,
  })
}

export const useCampaigns = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'campaigns',
    limit: 10,
    sort: '-startDate',
    ...options,
  })
}

export const useAppointments = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'appointments',
    limit: 10,
    sort: 'scheduling.startDateTime',
    ...options,
  })
}

export const useEvents = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'events',
    limit: 10,
    sort: 'scheduling.startDateTime',
    ...options,
  })
}

export const useRoadmapFeatures = (options?: Partial<PayloadCollectionOptions>) => {
  return usePayloadCollection({
    collection: 'roadmap-features',
    limit: 10,
    sort: '-voting.votes',
    ...options,
  })
}

// Hook for fetching individual documents by ID
export interface UsePayloadDocumentReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function usePayloadDocument<T = any>(
  collection: string,
  id: string,
  options?: {
    depth?: number
    locale?: string
  }
): UsePayloadDocumentReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocument = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      // Build query string for Payload's native API
      const searchParams = new URLSearchParams()
      if (options?.depth) {
        searchParams.append('depth', options.depth.toString())
      }
      if (options?.locale) {
        searchParams.append('locale', options.locale)
      }

      const queryString = searchParams.toString()
      const url = `/api/${collection}/${id}${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url, {
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Document not found')
        }
        if (response.status === 403) {
          throw new Error(`Access denied. Please check your permissions for ${collection}.`)
        }
        if (response.status === 401) {
          throw new Error(`Authentication required. Please log in to access ${collection}.`)
        }
        throw new Error(`Failed to fetch ${collection}: ${response.statusText}`)
      }

      const document: T = await response.json()
      setData(document)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error(`Error fetching ${collection}/${id}:`, err)
    } finally {
      setLoading(false)
    }
  }, [collection, id, options?.depth, options?.locale])

  useEffect(() => {
    fetchDocument()
  }, [fetchDocument])

  const refresh = useCallback(() => {
    fetchDocument()
  }, [fetchDocument])

  return {
    data,
    loading,
    error,
    refresh,
  }
}
