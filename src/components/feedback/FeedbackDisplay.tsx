"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Star, ThumbsUp, MessageSquare, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import FeedbackWidget from './FeedbackWidget'

interface FeedbackDisplayProps {
  entityType: string
  entityId: string
  entityTitle: string
  tenantId: string
  spaceId?: string
  showAddFeedback?: boolean
  limit?: number
  className?: string
}

interface FeedbackItem {
  id: string
  ratings: {
    overall: number
    quality: number
    value: number
    service: number
    recommendationScore: number
  }
  content: {
    review: string
    positives: string
    improvements: string
    testimonial: string
  }
  customerName: string
  isAnonymous: boolean
  mediaAttachments: any[]
  createdAt: string
  aiAnalysis?: {
    sentiment: string
    keyTopics: string[]
  }
}

interface FeedbackSummary {
  totalFeedback: number
  averageRating: number
  ratingDistribution: Record<string, number>
  npsScore: number
}

export function FeedbackDisplay({
  entityType,
  entityId,
  entityTitle,
  tenantId,
  spaceId,
  showAddFeedback = true,
  limit = 10,
  className = ""
}: FeedbackDisplayProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [summary, setSummary] = useState<FeedbackSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadFeedback()
  }, [entityType, entityId])

  const loadFeedback = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/feedback?entityType=${entityType}&entityId=${entityId}&limit=${limit}&public=true`)
      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedback || [])
        setSummary(data.summary || null)
      }
    } catch (error) {
      console.error('Error loading feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )

  const displayedFeedback = showAll ? feedback : feedback.slice(0, 3)

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Customer Feedback</span>
              {showAddFeedback && (
                <FeedbackWidget
                  entityType={entityType as any}
                  entityId={entityId}
                  entityTitle={entityTitle}
                  tenantId={tenantId}
                  spaceId={spaceId}
                  onSubmit={loadFeedback}
                />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.averageRating.toFixed(1)}</div>
                <StarDisplay rating={Math.round(summary.averageRating)} />
                <div className="text-sm text-muted-foreground">{summary.totalFeedback} reviews</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.npsScore}</div>
                <div className="text-sm text-muted-foreground">NPS Score</div>
              </div>
              
              <div className="col-span-2">
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-4">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ 
                            width: `${((summary.ratingDistribution[rating] || 0) / summary.totalFeedback) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-muted-foreground w-8">{summary.ratingDistribution[rating] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Individual Feedback Items */}
      <div className="space-y-4">
        {displayedFeedback.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {item.isAnonymous ? '?' : (item.customerName?.[0] || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {item.isAnonymous ? 'Anonymous' : (item.customerName || 'Customer')}
                    </div>
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={item.ratings.overall} />
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {item.aiAnalysis && (
                  <Badge variant={
                    item.aiAnalysis.sentiment === 'positive' ? 'default' :
                    item.aiAnalysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                  }>
                    {item.aiAnalysis.sentiment}
                  </Badge>
                )}
              </div>
              
              {/* Review Content */}
              {item.content.review && (
                <p className="text-sm mb-3">{item.content.review}</p>
              )}
              
              {/* Positives and Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {item.content.positives && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <ThumbsUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-600">What went well</span>
                    </div>
                    <p className="text-xs text-green-800 dark:text-green-200">{item.content.positives}</p>
                  </div>
                )}
                
                {item.content.improvements && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Suggestions</span>
                    </div>
                    <p className="text-xs text-blue-800 dark:text-blue-200">{item.content.improvements}</p>
                  </div>
                )}
              </div>
              
              {/* Media Attachments */}
              {item.mediaAttachments && item.mediaAttachments.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {item.mediaAttachments.slice(0, 3).map((media, index) => (
                    <div key={index} className="relative">
                      <img
                        src={media.url}
                        alt={media.alt || 'Feedback photo'}
                        className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                        onClick={() => {
                          // TODO: Open image in modal
                        }}
                      />
                    </div>
                  ))}
                  {item.mediaAttachments.length > 3 && (
                    <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                      <span className="text-xs">+{item.mediaAttachments.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Testimonial */}
              {item.content.testimonial && (
                <div className="p-3 bg-muted/50 rounded border-l-4 border-primary">
                  <p className="text-sm italic">"{item.content.testimonial}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {/* Show More Button */}
        {feedback.length > 3 && !showAll && (
          <Button 
            variant="outline" 
            onClick={() => setShowAll(true)}
            className="w-full"
          >
            Show All {feedback.length} Reviews
          </Button>
        )}
      </div>
    </div>
  )
}

export default FeedbackDisplay
