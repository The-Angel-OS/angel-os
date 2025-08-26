"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share, Flag, Heart, MapPin, Phone, Globe, Shield, Award } from "lucide-react"
import Image from "next/image"

import { School } from '@/payload-types'

interface SchoolProfileHeaderProps {
  school: School
  onShare: () => void
  onReport: () => void
  onFavorite: () => void
  isFavorited: boolean
}

export function SchoolProfileHeader({ 
  school, 
  onShare, 
  onReport, 
  onFavorite, 
  isFavorited 
}: SchoolProfileHeaderProps) {
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

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* School Image */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-lg overflow-hidden bg-white border-2 border-white shadow-lg">
              {school.media?.profileImage && typeof school.media.profileImage === 'object' && school.media.profileImage.url ? (
                <Image
                  src={school.media.profileImage.url}
                  alt={school.name}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Shield className="h-12 w-12 lg:h-16 lg:w-16 text-blue-500" />
                </div>
              )}
            </div>
          </div>

          {/* School Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* School Name & Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {school.name}
                  </h1>
                  {school.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {school.safetyScores.verifiedScore?.isVerified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    {school.address.street && `${school.address.street}, `}
                    {school.address.city}, {school.address.state}
                    {school.address.zipCode && ` ${school.address.zipCode}`}
                  </span>
                </div>

                {/* School Type & Details */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
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
                  {school.demographics.enrollment && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      {school.demographics.enrollment.toLocaleString()} students
                    </Badge>
                  )}
                </div>

                {/* District */}
                {school.demographics.district && (
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>District:</strong> {school.demographics.district}
                  </p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {(school.contact?.phone || school.externalData?.phone) && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <a 
                        href={`tel:${school.contact?.phone || school.externalData?.phone}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {school.contact?.phone || school.externalData?.phone}
                      </a>
                    </div>
                  )}
                  {(school.contact?.website || school.externalData?.website) && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <a 
                        href={school.contact?.website || school.externalData?.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety Score & Actions */}
              <div className="flex flex-col items-end gap-4">
                {/* Community Safety Score */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Community Safety Score</div>
                  <div className={`text-3xl font-bold ${getSafetyScoreColor(school.safetyScores.communityScore.overall)}`}>
                    {school.safetyScores.communityScore.overall}
                  </div>
                  <div className={`text-sm font-medium ${getSafetyScoreColor(school.safetyScores.communityScore.overall)}`}>
                    {getSafetyScoreLabel(school.safetyScores.communityScore.overall)}
                  </div>
                </div>

                {/* Verified Score (if available) */}
                {school.safetyScores.verifiedScore?.isVerified && school.safetyScores.verifiedScore.overall && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Verified Score</div>
                    <div className={`text-2xl font-bold ${getSafetyScoreColor(school.safetyScores.verifiedScore.overall)}`}>
                      {school.safetyScores.verifiedScore.overall}
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      SITE|SAFETYNET℠
                    </Badge>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={onShare}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={onFavorite}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                  <Button
                    onClick={onReport}
                    variant="outline"
                    size="sm"
                    className="px-3 text-gray-500"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
