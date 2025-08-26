"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Plus, Star, ThumbsUp, Flag, Filter } from "lucide-react"

interface Review {
  id: string
  author: {
    name: string
    avatar?: string
    role: string // parent, teacher, student, community
  }
  rating: number
  title: string
  content: string
  categories: {
    physical: number
    emotional: number
    digital: number
    environmental: number
  }
  helpful: number
  createdAt: string
  verified: boolean
}

interface SchoolReviewsSectionProps {
  reviews: Review[]
  schoolId: string | number
  onAddReview: () => void
}

export function SchoolReviewsSection({ reviews, schoolId, onAddReview }: SchoolReviewsSectionProps) {
  const [filter, setFilter] = useState<'all' | 'parent' | 'teacher' | 'student' | 'community'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest')

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'parent': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'teacher': return 'bg-green-100 text-green-800 border-green-200'
      case 'student': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'community': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStarColor = (rating: number, starIndex: number) => {
    return starIndex < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
  }

  const filteredReviews = reviews.filter(review => 
    filter === 'all' || review.author.role.toLowerCase() === filter
  )

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'helpful':
        return b.helpful - a.helpful
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Safety Reviews ({reviews.length})
          </CardTitle>
          <Button onClick={onAddReview} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filter by:</span>
            <div className="flex gap-1">
              {['all', 'parent', 'teacher', 'student', 'community'].map((filterOption) => (
                <Button
                  key={filterOption}
                  variant={filter === filterOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterOption as any)}
                  className="capitalize text-xs"
                >
                  {filterOption}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
              aria-label="Sort reviews by"
              title="Sort reviews by"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your experience with this school's safety environment.
            </p>
            <Button onClick={onAddReview}>
              <Plus className="h-4 w-4 mr-2" />
              Write the First Review
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.author.avatar} />
                      <AvatarFallback>
                        {review.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.author.name}</span>
                        <Badge 
                          variant="outline" 
                          className={getRoleColor(review.author.role)}
                        >
                          {review.author.role}
                        </Badge>
                        {review.verified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Overall Rating */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${getStarColor(review.rating, i)}`}
                      />
                    ))}
                    <span className="ml-1 text-sm font-medium">{review.rating}</span>
                  </div>
                </div>

                {/* Review Title */}
                <h4 className="font-semibold text-lg mb-2">{review.title}</h4>

                {/* Review Content */}
                <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

                {/* Category Ratings */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {Object.entries(review.categories).map(([category, rating]) => (
                    <div key={category} className="text-center">
                      <div className="text-sm font-medium text-gray-700 capitalize mb-1">
                        {category}
                      </div>
                      <div className="text-lg font-bold text-blue-600">{rating}</div>
                    </div>
                  ))}
                </div>

                {/* Review Actions */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-red-600 transition-colors">
                    <Flag className="h-4 w-4" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Share Your Experience</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Help other families make informed decisions by sharing your perspective on this school's safety environment.
          </p>
          <Button onClick={onAddReview}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your Safety Review
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
