"use client"

import { useState, useEffect } from 'react'

interface PayloadResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

interface UsePayloadDataOptions {
  limit?: number
  page?: number
  where?: Record<string, any>
  sort?: string
  populate?: string[]
}

export function usePayloadData<T = any>(
  collection: string,
  options: UsePayloadDataOptions = {}
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalDocs, setTotalDocs] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const searchParams = new URLSearchParams()
        
        if (options.limit) searchParams.append('limit', options.limit.toString())
        if (options.page) searchParams.append('page', options.page.toString())
        if (options.sort) searchParams.append('sort', options.sort)
        if (options.where) searchParams.append('where', JSON.stringify(options.where))
        if (options.populate) {
          options.populate.forEach(field => searchParams.append('populate', field))
        }

        const response = await fetch(`/api/${collection}?${searchParams.toString()}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${collection}: ${response.statusText}`)
        }

        const result: PayloadResponse<T> = await response.json()
        setData(result.docs)
        setTotalDocs(result.totalDocs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error(`Error fetching ${collection}:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collection, JSON.stringify(options)])

  return { data, loading, error, totalDocs }
}

// Specific hooks for common collections
export function useTenants(options?: UsePayloadDataOptions) {
  return usePayloadData('tenants', options)
}

export function useProducts(options?: UsePayloadDataOptions) {
  return usePayloadData('products', options)
}

export function useOrders(options?: UsePayloadDataOptions) {
  return usePayloadData('orders', options)
}

export function useUsers(options?: UsePayloadDataOptions) {
  return usePayloadData('users', options)
}

export function useContacts(options?: UsePayloadDataOptions) {
  return usePayloadData('contacts', options)
}

// Hook for dashboard metrics
export function useDashboardMetrics(tenantId?: string) {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    recentOrders: [],
    topProducts: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        setError(null)

        const where = tenantId ? { tenant: { equals: tenantId } } : {}
        
        // Fetch orders for revenue calculation
        const ordersResponse = await fetch(`/api/orders?where=${JSON.stringify(where)}&limit=1000`)
        const ordersData = await ordersResponse.json()
        
        // Fetch products count
        const productsResponse = await fetch(`/api/products?where=${JSON.stringify(where)}&limit=0`)
        const productsData = await productsResponse.json()
        
        // Fetch users count
        const usersResponse = await fetch(`/api/users?limit=0`)
        const usersData = await usersResponse.json()

        // Calculate metrics
        const totalRevenue = ordersData.docs?.reduce((sum: number, order: any) => {
          return sum + (order.total || 0)
        }, 0) || 0

        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const monthlyRevenue = ordersData.docs?.filter((order: any) => {
          const orderDate = new Date(order.createdAt)
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
        }).reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0

        setMetrics({
          totalRevenue,
          totalOrders: ordersData.totalDocs || 0,
          totalProducts: productsData.totalDocs || 0,
          totalUsers: usersData.totalDocs || 0,
          monthlyRevenue,
          recentOrders: ordersData.docs?.slice(0, 5) || [],
          topProducts: [] // TODO: Implement top products logic
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
        console.error('Error fetching dashboard metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [tenantId])

  return { metrics, loading, error }
}

