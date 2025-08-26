"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Users, GraduationCap, Calendar, MapPin, Phone, Globe, Mail } from "lucide-react"

import { School } from '@/payload-types'

interface SchoolDetailsCardProps {
  school: School
}

export function SchoolDetailsCard({ school }: SchoolDetailsCardProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600" />
          School Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* School Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">School Type</span>
          <Badge 
            variant="outline" 
            className={getSchoolTypeColor(school.demographics.schoolType)}
          >
            {school.demographics.schoolType}
          </Badge>
        </div>

        {/* Grades */}
        {school.demographics.grades && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Grade Levels</span>
            <div className="flex items-center gap-1 text-sm">
              <GraduationCap className="h-4 w-4 text-gray-500" />
              <span>Grades {school.demographics.grades}</span>
            </div>
          </div>
        )}

        {/* Enrollment */}
        {school.demographics.enrollment && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Enrollment</span>
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{school.demographics.enrollment.toLocaleString()} students</span>
            </div>
          </div>
        )}

        {/* District */}
        {school.demographics.district && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">District</span>
            <span className="text-sm text-right max-w-48 truncate" title={school.demographics.district}>
              {school.demographics.district}
            </span>
          </div>
        )}

        {/* Note: Established date not available in current schema */}

        {/* Address */}
        <div className="border-t pt-4">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-gray-700 mb-1">Address</div>
              <div className="text-gray-600 leading-relaxed">
                {school.address.street && (
                  <div>{school.address.street}</div>
                )}
                <div>
                  {school.address.city}, {school.address.state}
                  {school.address.zipCode && ` ${school.address.zipCode}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {(school.contact?.phone || school.contact?.website || school.externalData?.phone || school.externalData?.website) && (
          <div className="border-t pt-4 space-y-3">
            <div className="font-medium text-gray-700 text-sm mb-2">Contact Information</div>
            
            {(school.contact?.phone || school.externalData?.phone) && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <a 
                  href={`tel:${school.contact?.phone || school.externalData?.phone}`}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {school.contact?.phone || school.externalData?.phone}
                </a>
              </div>
            )}

            {(school.contact?.website || school.externalData?.website) && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <a 
                  href={school.contact?.website || school.externalData?.website || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors truncate"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
        )}

        {/* Note: Principal info not available in current schema */}

        {/* Status Badges */}
        <div className="border-t pt-4 flex flex-wrap gap-2">
          {school.featured && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Featured School
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className={school.schoolStatus === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}
          >
            {school.schoolStatus === 'active' ? 'Active Profile' : `Status: ${school.schoolStatus}`}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
