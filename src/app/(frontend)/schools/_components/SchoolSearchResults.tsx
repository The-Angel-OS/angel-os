"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Users, Shield, Award, ChevronLeft, ChevronRight } from "lucide-react"

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

interface SchoolSearchResultsProps {
  schools: School[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function SchoolSearchResults({ 
  schools, 
  isLoading, 
  currentPage, 
  totalPages, 
  onPageChange 
}: SchoolSearchResultsProps) {
  const getSchoolTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'elementary': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'middle': return 'bg-green-100 text-green-800 border-green-200'
      case 'high': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'k12': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'charter': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'private': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'magnet': return 'bg-teal-100 text-teal-800 border-teal-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getSafetyScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (schools.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No schools found</h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your search criteria or browse all schools.
        </p>
        <Button variant="outline">
          Browse All Schools
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* School Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg leading-tight">
                    <Link 
                      href={`/schools/${school.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {school.name}
                    </Link>
                  </h3>
                  {school.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 ml-2">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                
                {/* Location */}
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>
                    {school.address.city}, {school.address.state}
                    {school.address.zipCode && ` ${school.address.zipCode}`}
                  </span>
                </div>

                {/* School Type & Details */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge 
                    variant="outline" 
                    className={getSchoolTypeColor(school.demographics.schoolType)}
                  >
                    {school.demographics.schoolType}
                  </Badge>
                  {school.demographics.grades && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      Grades {school.demographics.grades}
                    </Badge>
                  )}
                </div>

                {/* Enrollment */}
                {school.demographics.enrollment && (
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{school.demographics.enrollment.toLocaleString()} students</span>
                  </div>
                )}

                {/* District */}
                {school.demographics.district && (
                  <div className="text-sm text-gray-600 mb-4">
                    <strong>District:</strong> {school.demographics.district}
                  </div>
                )}
              </div>

              {/* Safety Scores */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Community Safety Score</span>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getSafetyScoreColor(school.safetyScores.communityScore.overall)}`}>
                      {school.safetyScores.communityScore.overall}
                    </div>
                    <div className={`text-xs ${getSafetyScoreColor(school.safetyScores.communityScore.overall)}`}>
                      {getSafetyScoreLabel(school.safetyScores.communityScore.overall)}
                    </div>
                  </div>
                </div>

                {/* Verified Score */}
                {school.safetyScores.verifiedScore?.isVerified && school.safetyScores.verifiedScore.overall && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Verified Score</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getSafetyScoreColor(school.safetyScores.verifiedScore.overall)}`}>
                        {school.safetyScores.verifiedScore.overall}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* View Profile Button */}
              <div className="mt-4">
                <Link href={`/schools/${school.slug}`}>
                  <Button className="w-full" size="sm">
                    View Safety Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              )
            })}
            
            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  className="w-10"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}


