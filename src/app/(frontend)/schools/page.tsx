"use client"

import { useState, useEffect } from "react"
import { SchoolSearchForm } from "./_components/SchoolSearchForm"
import { SchoolSearchResults } from "./_components/SchoolSearchResults"
import { SchoolFilters } from "./_components/SchoolFilters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Search, Plus, TrendingUp, Users, Award } from "lucide-react"

interface School {
  id: string
  name: string
  slug: string
  address: {
    city: string
    state: string
    zipCode?: string
  }
  demographics: {
    schoolType: string
    grades?: string
    enrollment?: number
    district?: string
  }
  safetyScores: {
    communityScore: {
      overall: number
    }
    verifiedScore?: {
      isVerified: boolean
      overall?: number
    }
  }
  featured: boolean
  status: string
}

interface SearchFilters {
  search: string
  city: string
  state: string
  schoolType: string
  district: string
  minCommunityScore: number
  verifiedOnly: boolean
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalSchools, setTotalSchools] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasSearched, setHasSearched] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    city: '',
    state: '',
    schoolType: '',
    district: '',
    minCommunityScore: 0,
    verifiedOnly: false
  })

  // Load featured schools on initial page load
  useEffect(() => {
    loadFeaturedSchools()
  }, [])

  const loadFeaturedSchools = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/schools?featured=true&limit=6&sort=-safetyScores.communityScore.overall')
      if (response.ok) {
        const data = await response.json()
        setSchools(data.docs || [])
        setTotalSchools(data.totalDocs || 0)
      }
    } catch (error) {
      console.error('Failed to load featured schools:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (searchFilters: SearchFilters, page = 1) => {
    setIsLoading(true)
    setHasSearched(true)
    setCurrentPage(page)
    
    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '12')
      
      if (searchFilters.search) params.set('search', searchFilters.search)
      if (searchFilters.city) params.set('city', searchFilters.city)
      if (searchFilters.state) params.set('state', searchFilters.state)
      if (searchFilters.schoolType) params.set('schoolType', searchFilters.schoolType)
      if (searchFilters.district) params.set('district', searchFilters.district)
      if (searchFilters.minCommunityScore > 0) params.set('minCommunityScore', searchFilters.minCommunityScore.toString())
      if (searchFilters.verifiedOnly) params.set('verifiedOnly', 'true')
      
      const response = await fetch(`/api/schools?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSchools(data.docs || [])
        setTotalSchools(data.totalDocs || 0)
        setFilters(searchFilters)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    handleSearch(filters, page)
  }

  const handleRegisterSchool = () => {
    // TODO: Implement school registration modal
    alert('School registration feature coming soon!')
  }

  return (
    <div className="pt-16 pb-24">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="h-12 w-12" />
              <h1 className="text-4xl lg:text-5xl font-bold">SafeSchool|MAP℠</h1>
            </div>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100">
              Find and compare school safety profiles across the nation
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                Real-time Safety Data
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                Community Reviews
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                Verified Assessments
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Schools
            </CardTitle>
            <CardDescription>
              Find schools by name, location, or district. Filter by safety scores and verification status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SchoolSearchForm onSearch={handleSearch} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={handleRegisterSchool} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Register a New School
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/schools/claim'}>
            <Shield className="h-4 w-4 mr-2" />
            Claim Your School's Profile
          </Button>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SchoolFilters 
              filters={filters}
              onFiltersChange={handleSearch}
              totalResults={totalSchools}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!hasSearched ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Featured Schools</h2>
                  <Badge variant="outline">
                    {totalSchools} schools
                  </Badge>
                </div>
                <SchoolSearchResults 
                  schools={schools}
                  isLoading={isLoading}
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalSchools / 12)}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Search Results</h2>
                  <Badge variant="outline">
                    {totalSchools} schools found
                  </Badge>
                </div>
                <SchoolSearchResults 
                  schools={schools}
                  isLoading={isLoading}
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalSchools / 12)}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Make an Impact on School Safety
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Your voice matters. Share your experience to help families choose safer schools, 
                help schools improve their environments, and keep communities informed and proactive.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Add a Safety Review
                </Button>
                <Button variant="outline" size="lg">
                  <Shield className="h-5 w-5 mr-2" />
                  Learn About SITE|SAFETYNET℠
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


