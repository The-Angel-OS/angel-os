"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter, Shield, X } from "lucide-react"

interface SearchFilters {
  search: string
  city: string
  state: string
  schoolType: string
  district: string
  minCommunityScore: number
  verifiedOnly: boolean
}

interface SchoolFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  totalResults: number
}

export function SchoolFilters({ filters, onFiltersChange, totalResults }: SchoolFiltersProps) {
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      city: '',
      state: '',
      schoolType: '',
      district: '',
      minCommunityScore: 0,
      verifiedOnly: false
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.city) count++
    if (filters.state) count++
    if (filters.schoolType) count++
    if (filters.district) count++
    if (filters.minCommunityScore > 0) count++
    if (filters.verifiedOnly) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {totalResults.toLocaleString()} schools found
        </div>

        {/* Safety Score Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Minimum Safety Score</Label>
          <div className="px-2">
            <Slider
              value={[filters.minCommunityScore]}
              onValueChange={(value: number[]) => updateFilter('minCommunityScore', value[0])}
              max={100}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span className="font-medium">
                {filters.minCommunityScore}+
              </span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Verification Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Verification Status</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => updateFilter('verifiedOnly', !!checked)}
            />
            <Label htmlFor="verified" className="text-sm flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-600" />
              SITE|SAFETYNET℠ Verified Only
            </Label>
          </div>
        </div>

        {/* School Type Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">School Type</Label>
          <div className="space-y-2">
            {[
              { value: '', label: 'All Types' },
              { value: 'elementary', label: 'Elementary' },
              { value: 'middle', label: 'Middle School' },
              { value: 'high', label: 'High School' },
              { value: 'k12', label: 'K-12' },
              { value: 'charter', label: 'Charter' },
              { value: 'private', label: 'Private' },
              { value: 'magnet', label: 'Magnet' }
            ].map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={filters.schoolType === type.value}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilter('schoolType', type.value)
                    } else if (filters.schoolType === type.value) {
                      updateFilter('schoolType', '')
                    }
                  }}
                />
                <Label htmlFor={`type-${type.value}`} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-2 block">Active Filters</Label>
            <div className="space-y-2">
              {filters.search && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Search:</span>
                  <Badge variant="outline" className="max-w-24 truncate">
                    {filters.search}
                  </Badge>
                </div>
              )}
              {filters.city && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">City:</span>
                  <Badge variant="outline">{filters.city}</Badge>
                </div>
              )}
              {filters.state && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">State:</span>
                  <Badge variant="outline">{filters.state}</Badge>
                </div>
              )}
              {filters.schoolType && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="outline">{filters.schoolType}</Badge>
                </div>
              )}
              {filters.district && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">District:</span>
                  <Badge variant="outline" className="max-w-24 truncate">
                    {filters.district}
                  </Badge>
                </div>
              )}
              {filters.minCommunityScore > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Min Score:</span>
                  <Badge variant="outline">{filters.minCommunityScore}+</Badge>
                </div>
              )}
              {filters.verifiedOnly && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Verified:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Filter Presets */}
        <div className="border-t pt-4">
          <Label className="text-sm font-medium mb-3 block">Quick Filters</Label>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onFiltersChange({ ...filters, minCommunityScore: 80, verifiedOnly: false })}
            >
              <Shield className="h-4 w-4 mr-2 text-green-600" />
              High Safety Score (80+)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onFiltersChange({ ...filters, verifiedOnly: true, minCommunityScore: 0 })}
            >
              <Shield className="h-4 w-4 mr-2 text-blue-600" />
              Verified Schools Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onFiltersChange({ ...filters, schoolType: 'elementary', minCommunityScore: 0, verifiedOnly: false })}
            >
              Elementary Schools
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onFiltersChange({ ...filters, schoolType: 'high', minCommunityScore: 0, verifiedOnly: false })}
            >
              High Schools
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
