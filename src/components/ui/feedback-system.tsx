"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UniversalModal, FormField } from "./universal-modal"
import { Star, MessageSquare, Flag, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, Clock, Bot, User, Plus, Filter } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

export interface FeedbackItem {
  id: string
  entityType: string
  entityId: string
  entityTitle?: string
  customerName?: string
  customerEmail?: string
  ratings?: {
    overall?: number
    quality?: number
    service?: number
    value?: number
  }
  content?: {
    review?: string
    pros?: string
    cons?: string
    recommendation?: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  moderationStatus: 'pending' | 'ai_approved' | 'ai_flagged' | 'human_reviewed'
  aiModerationScore?: number
  aiModerationReason?: string
  isPublic: boolean
  isVerified: boolean
  helpfulVotes: number
  unhelpfulVotes: number
  adminResponse?: string
  createdAt: string
  updatedAt: string
}

export interface FeedbackSystemProps {
  entityType: 'product' | 'event' | 'post' | 'appointment' | 'service'
  entityId: string
  entityTitle?: string
  allowAnonymous?: boolean
  requireVerification?: boolean
  showRatings?: boolean
  showRecommendation?: boolean
  className?: string
  onFeedbackSubmit?: (feedback: any) => void
}

export function FeedbackSystem({
  entityType,
  entityId,
  entityTitle,
  allowAnonymous = true,
  requireVerification = false,
  showRatings = true,
  showRecommendation = true,
  className,
  onFeedbackSubmit
}: FeedbackSystemProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'flagged'>('approved')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'helpful'>('newest')

  // Refresh function
  const refreshFeedbacks = async () => {
    try {
      setLoading(true)
      let url = `/api/feedback?entityType=${entityType}&entityId=${entityId}`
      
      // Add filter to API call
      if (filter !== 'all') {
        url += `&where[status][equals]=${filter}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setFeedbacks(data.docs || [])
      } else {
        console.error('Failed to fetch feedbacks:', response.statusText)
        setFeedbacks([])
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch feedback from API on mount and when filter changes
  useEffect(() => {
    refreshFeedbacks()
  }, [entityType, entityId, filter])

  const feedbackModalFields: FormField[] = [
    ...(allowAnonymous ? [] : [
      {
        name: 'customerName',
        label: 'Your Name',
        type: 'text' as const,
        required: true,
        placeholder: 'Enter your full name'
      },
      {
        name: 'customerEmail',
        label: 'Email Address',
        type: 'email' as const,
        required: true,
        placeholder: 'your@email.com'
      }
    ]),
    ...(showRatings ? [
      {
        name: 'ratings.overall',
        label: 'Overall Rating',
        type: 'select' as const,
        required: true,
        options: [
          { label: '⭐ 1 Star - Poor', value: '1' },
          { label: '⭐⭐ 2 Stars - Fair', value: '2' },
          { label: '⭐⭐⭐ 3 Stars - Good', value: '3' },
          { label: '⭐⭐⭐⭐ 4 Stars - Very Good', value: '4' },
          { label: '⭐⭐⭐⭐⭐ 5 Stars - Excellent', value: '5' }
        ]
      },
      {
        name: 'ratings.quality',
        label: 'Quality Rating',
        type: 'select' as const,
        options: [
          { label: '1 Star', value: '1' },
          { label: '2 Stars', value: '2' },
          { label: '3 Stars', value: '3' },
          { label: '4 Stars', value: '4' },
          { label: '5 Stars', value: '5' }
        ]
      },
      {
        name: 'ratings.service',
        label: 'Service Rating',
        type: 'select' as const,
        options: [
          { label: '1 Star', value: '1' },
          { label: '2 Stars', value: '2' },
          { label: '3 Stars', value: '3' },
          { label: '4 Stars', value: '4' },
          { label: '5 Stars', value: '5' }
        ]
      },
      {
        name: 'ratings.value',
        label: 'Value Rating',
        type: 'select' as const,
        options: [
          { label: '1 Star', value: '1' },
          { label: '2 Stars', value: '2' },
          { label: '3 Stars', value: '3' },
          { label: '4 Stars', value: '4' },
          { label: '5 Stars', value: '5' }
        ]
      }
    ] : []),
    {
      name: 'content.review',
      label: 'Your Review',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Share your experience...'
    },
    {
      name: 'content.pros',
      label: 'What did you like?',
      type: 'textarea' as const,
      placeholder: 'Highlight the positives...'
    },
    {
      name: 'content.cons',
      label: 'What could be improved?',
      type: 'textarea' as const,
      placeholder: 'Constructive feedback...'
    },
    ...(showRecommendation ? [
      {
        name: 'content.recommendation',
        label: 'Would you recommend this?',
        type: 'textarea' as const,
        placeholder: 'Your recommendation to others...'
      }
    ] : []),
    {
      name: 'isPublic',
      label: 'Make this review public',
      type: 'checkbox' as const,
      defaultValue: true,
      description: 'Allow others to see this review'
    }
  ]

  const handleFeedbackSubmit = async (data: any) => {
    // Process nested field names (e.g., 'ratings.overall' -> { ratings: { overall: value } })
    const processedData: any = { ...data }
    Object.keys(data).forEach(key => {
      if (key.includes('.')) {
        const [parent, child] = key.split('.')
        if (parent && child) {
          if (!processedData[parent]) processedData[parent] = {}
          processedData[parent][child] = data[key]
          delete processedData[key]
        }
      }
    })

    // Add metadata
    const feedbackData = {
      ...processedData,
      entityType,
      entityId,
      entityTitle,
      status: 'pending',
      moderationStatus: 'pending',
      isVerified: requireVerification ? false : true,
      helpfulVotes: 0,
      unhelpfulVotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      // Submit to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      })

      if (response.ok) {
        const newFeedback = await response.json()
        console.log('Feedback submitted successfully:', newFeedback)
        
        // Add to local state if approved (for immediate display)
        if (newFeedback.status === 'approved') {
          setFeedbacks(prev => [newFeedback, ...prev])
        }
        
        onFeedbackSubmit?.(newFeedback)
      } else {
        console.error('Failed to submit feedback:', response.statusText)
        throw new Error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // You might want to show a toast notification here
      throw error
    }
  }

  // Handle helpful/unhelpful votes
  const handleVote = async (feedbackId: string, voteType: 'helpful' | 'unhelpful') => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      })

      if (response.ok) {
        const updatedFeedback = await response.json()
        // Update local state
        setFeedbacks(prev => 
          prev.map(f => f.id === feedbackId ? updatedFeedback : f)
        )
      } else {
        console.error('Failed to vote:', response.statusText)
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>
      </div>
    )
  }

  const getModerationBadge = (feedback: FeedbackItem) => {
    switch (feedback.moderationStatus) {
      case 'ai_approved':
        return <Badge variant="secondary" className="text-xs"><Bot className="h-3 w-3 mr-1" />AI Approved</Badge>
      case 'ai_flagged':
        return <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />AI Flagged</Badge>
      case 'human_reviewed':
        return <Badge variant="default" className="text-xs"><User className="h-3 w-3 mr-1" />Human Reviewed</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="text-xs"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>
      case 'flagged':
        return <Badge variant="destructive" className="text-xs"><Flag className="h-3 w-3 mr-1" />Flagged</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return null
    }
  }

  // Sort feedbacks (filtering is done server-side)
  const sortedFeedbacks = feedbacks.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'rating':
        return (b.ratings?.overall || 0) - (a.ratings?.overall || 0)
      case 'helpful':
        return b.helpfulVotes - a.helpfulVotes
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Feedback & Reviews</span>
              <Badge variant="outline">{feedbacks.length}</Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Review
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4 pt-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
                aria-label="Filter reviews by status"
              >
                <option value="all">All Reviews</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
              aria-label="Sort reviews by"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence>
            {sortedFeedbacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedFeedbacks.map((feedback) => (
                  <motion.div
                    key={feedback.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {feedback.customerName?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">
                              {feedback.customerName || 'Anonymous'}
                            </p>
                            {feedback.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getModerationBadge(feedback)}
                        {getStatusBadge(feedback.status)}
                      </div>
                    </div>

                    {/* Ratings */}
                    {feedback.ratings && (
                      <div className="space-y-2">
                        {renderStars(feedback.ratings.overall || 0)}
                        {(feedback.ratings.quality || feedback.ratings.service || feedback.ratings.value) && (
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            {feedback.ratings.quality && (
                              <div>
                                <span className="text-muted-foreground">Quality:</span>
                                <div className="flex items-center space-x-1 mt-1">
                                  {renderStars(feedback.ratings.quality)}
                                </div>
                              </div>
                            )}
                            {feedback.ratings.service && (
                              <div>
                                <span className="text-muted-foreground">Service:</span>
                                <div className="flex items-center space-x-1 mt-1">
                                  {renderStars(feedback.ratings.service)}
                                </div>
                              </div>
                            )}
                            {feedback.ratings.value && (
                              <div>
                                <span className="text-muted-foreground">Value:</span>
                                <div className="flex items-center space-x-1 mt-1">
                                  {renderStars(feedback.ratings.value)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="space-y-3">
                      {feedback.content?.review && (
                        <p className="text-sm leading-relaxed">{feedback.content.review}</p>
                      )}
                      
                      {(feedback.content?.pros || feedback.content?.cons) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {feedback.content.pros && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-green-700">👍 Pros:</p>
                              <p className="text-sm text-muted-foreground">{feedback.content.pros}</p>
                            </div>
                          )}
                          {feedback.content.cons && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-red-700">👎 Cons:</p>
                              <p className="text-sm text-muted-foreground">{feedback.content.cons}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {feedback.content?.recommendation && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-700 mb-1">💡 Recommendation:</p>
                          <p className="text-sm text-blue-600">{feedback.content.recommendation}</p>
                        </div>
                      )}
                    </div>

                    {/* Admin Response */}
                    {feedback.adminResponse && (
                      <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm font-medium text-gray-700 mb-1">📝 Admin Response:</p>
                        <p className="text-sm text-gray-600">{feedback.adminResponse}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground hover:text-green-600"
                          onClick={() => handleVote(feedback.id, 'helpful')}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful ({feedback.helpfulVotes})
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground hover:text-red-600"
                          onClick={() => handleVote(feedback.id, 'unhelpful')}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Not Helpful ({feedback.unhelpfulVotes})
                        </Button>
                      </div>
                      {feedback.aiModerationScore && (
                        <div className="text-xs text-muted-foreground">
                          AI Score: {(feedback.aiModerationScore * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Feedback Modal */}
      <UniversalModal
        title="Share Your Feedback"
        description={`Help others by sharing your experience with ${entityTitle || 'this item'}`}
        fields={feedbackModalFields}
        onSubmit={handleFeedbackSubmit}
        open={showModal}
        onOpenChange={setShowModal}
        submitLabel="Submit Review"
        size="lg"
      />
    </div>
  )
}
