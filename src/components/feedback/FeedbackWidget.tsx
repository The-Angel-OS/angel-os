"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  MessageSquare, 
  Camera, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react'

interface FeedbackWidgetProps {
  entityType: 'product' | 'appointment' | 'class' | 'event' | 'subscription' | 'post' | 'page' | 'support' | 'leo_interaction' | 'platform'
  entityId: string
  entityTitle: string
  tenantId: string
  spaceId?: string
  
  // UI Configuration
  compact?: boolean
  showRatings?: boolean
  showMediaUpload?: boolean
  customQuestions?: Array<{
    question: string
    type: 'text' | 'rating' | 'boolean' | 'choice'
    options?: string[]
    required?: boolean
  }>
  
  // Callbacks
  onSubmit?: (feedback: any) => void
  onClose?: () => void
  
  className?: string
}

interface FeedbackData {
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
    suggestions: string
    testimonial: string
  }
  customerInfo: {
    name: string
    email: string
    isAnonymous: boolean
  }
  mediaAttachments: File[]
  contextResponses: Array<{
    question: string
    answer: string
    answerType: string
    numericValue?: number
  }>
}

export function FeedbackWidget({
  entityType,
  entityId,
  entityTitle,
  tenantId,
  spaceId,
  compact = false,
  showRatings = true,
  showMediaUpload = true,
  customQuestions = [],
  onSubmit,
  onClose,
  className = ""
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({
    ratings: {
      overall: 0,
      quality: 0,
      value: 0,
      service: 0,
      recommendationScore: 0
    },
    content: {
      review: '',
      positives: '',
      improvements: '',
      suggestions: '',
      testimonial: ''
    },
    customerInfo: {
      name: '',
      email: '',
      isAnonymous: false
    },
    mediaAttachments: [],
    contextResponses: []
  })

  const totalSteps = compact ? 2 : 3

  const handleRatingChange = (category: keyof typeof feedback.ratings, value: number) => {
    setFeedback(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: value
      }
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      
      // Add feedback data
      formData.append('entityType', entityType)
      formData.append('entityId', entityId)
      formData.append('entityTitle', entityTitle)
      formData.append('tenant', tenantId)
      if (spaceId) formData.append('space', spaceId)
      
      // Add ratings
      Object.entries(feedback.ratings).forEach(([key, value]) => {
        formData.append(`ratings.${key}`, value.toString())
      })
      
      // Add content
      Object.entries(feedback.content).forEach(([key, value]) => {
        if (value) formData.append(`content.${key}`, value)
      })
      
      // Add customer info
      Object.entries(feedback.customerInfo).forEach(([key, value]) => {
        formData.append(`customerInfo.${key}`, value.toString())
      })
      
      // Add media attachments
      feedback.mediaAttachments.forEach((file, index) => {
        formData.append(`media_${index}`, file)
      })
      
      // Add context responses
      feedback.contextResponses.forEach((response, index) => {
        formData.append(`contextResponses.${index}.question`, response.question)
        formData.append(`contextResponses.${index}.answer`, response.answer)
        formData.append(`contextResponses.${index}.answerType`, response.answerType)
        if (response.numericValue) {
          formData.append(`contextResponses.${index}.numericValue`, response.numericValue.toString())
        }
      })
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        onSubmit?.(feedback)
        setIsOpen(false)
        // Show success message
      } else {
        throw new Error('Failed to submit feedback')
      }
      
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // Show error message
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (rating: number) => void, label: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
                      <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="transition-colors"
              aria-label={`Rate ${star} out of 5 stars`}
              title={`${star} star${star !== 1 ? 's' : ''}`}
            >
            <Star
              className={`w-6 h-6 ${
                star <= value 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Rate Your Experience</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <ThumbsUp className="w-4 h-4 mr-1" />
              Good
            </Button>
            <Button size="sm" variant="outline">
              <ThumbsDown className="w-4 h-4 mr-1" />
              Poor
            </Button>
          </div>
        </div>
        
        <Textarea
          placeholder="Share your thoughts about this experience..."
          value={feedback.content.review}
          onChange={(e) => setFeedback(prev => ({
            ...prev,
            content: { ...prev.content, review: e.target.value }
          }))}
        />
        
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Feedback Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className={className}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Leave Feedback
      </Button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <Card className="border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Share Your Feedback</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Help us improve: {entityTitle}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="flex gap-2 mt-4">
                    {Array.from({ length: totalSteps }, (_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Step 1: Ratings */}
                  {currentStep === 1 && showRatings && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold">How was your experience?</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StarRating
                          label="Overall Experience"
                          value={feedback.ratings.overall}
                          onChange={(rating) => handleRatingChange('overall', rating)}
                        />
                        <StarRating
                          label="Quality"
                          value={feedback.ratings.quality}
                          onChange={(rating) => handleRatingChange('quality', rating)}
                        />
                        <StarRating
                          label="Value for Money"
                          value={feedback.ratings.value}
                          onChange={(rating) => handleRatingChange('value', rating)}
                        />
                        <StarRating
                          label="Service"
                          value={feedback.ratings.service}
                          onChange={(rating) => handleRatingChange('service', rating)}
                        />
                      </div>
                      
                      {/* NPS Question */}
                      <div className="space-y-2">
                        <Label>How likely are you to recommend this to a friend? (0-10)</Label>
                        <div className="flex gap-1">
                          {[0,1,2,3,4,5,6,7,8,9,10].map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => handleRatingChange('recommendationScore', score)}
                              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                                score === feedback.ratings.recommendationScore
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Not likely</span>
                          <span>Extremely likely</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 2: Written Feedback */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold">Tell us more</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="review">Overall Review</Label>
                          <Textarea
                            id="review"
                            placeholder="Share your overall experience..."
                            value={feedback.content.review}
                            onChange={(e) => setFeedback(prev => ({
                              ...prev,
                              content: { ...prev.content, review: e.target.value }
                            }))}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="positives">What went well?</Label>
                            <Textarea
                              id="positives"
                              placeholder="Highlight the positives..."
                              value={feedback.content.positives}
                              onChange={(e) => setFeedback(prev => ({
                                ...prev,
                                content: { ...prev.content, positives: e.target.value }
                              }))}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="improvements">What could be better?</Label>
                            <Textarea
                              id="improvements"
                              placeholder="Suggestions for improvement..."
                              value={feedback.content.improvements}
                              onChange={(e) => setFeedback(prev => ({
                                ...prev,
                                content: { ...prev.content, improvements: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        
                        {/* Custom Questions */}
                        {customQuestions.map((question, index) => (
                          <div key={index}>
                            <Label>{question.question}</Label>
                            {question.type === 'text' ? (
                              <Textarea
                                placeholder="Your answer..."
                                onChange={(e) => {
                                  const newResponses = [...feedback.contextResponses]
                                  newResponses[index] = {
                                    question: question.question,
                                    answer: e.target.value,
                                    answerType: 'text'
                                  }
                                  setFeedback(prev => ({ ...prev, contextResponses: newResponses }))
                                }}
                              />
                            ) : question.type === 'rating' ? (
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map((rating) => (
                                                              <button
                              key={rating}
                              type="button"
                              onClick={() => {
                                const newResponses = [...feedback.contextResponses]
                                newResponses[index] = {
                                  question: question.question,
                                  answer: rating.toString(),
                                  answerType: 'rating',
                                  numericValue: rating
                                }
                                setFeedback(prev => ({ ...prev, contextResponses: newResponses }))
                              }}
                              className="w-8 h-8"
                              aria-label={`Rate ${rating} out of 5 for: ${question.question}`}
                              title={`${rating} star rating`}
                            >
                                    <Star className={`w-6 h-6 ${rating <= (feedback.contextResponses[index]?.numericValue || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 3: Media & Contact */}
                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold">Photos & Contact</h3>
                      
                      {/* Media Upload */}
                      {showMediaUpload && (
                        <div>
                          <Label>Add Photos (Optional)</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Upload photos of your experience
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || [])
                                setFeedback(prev => ({
                                  ...prev,
                                  mediaAttachments: [...prev.mediaAttachments, ...files]
                                }))
                              }}
                              className="hidden"
                              id="media-upload"
                              aria-label="Upload photos for feedback"
                              title="Choose photos to upload"
                            />
                            <Label htmlFor="media-upload" className="cursor-pointer">
                              <Button variant="outline" asChild>
                                <span>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose Photos
                                </span>
                              </Button>
                            </Label>
                          </div>
                          
                          {/* Preview uploaded images */}
                          {feedback.mediaAttachments.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {feedback.mediaAttachments.map((file, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Upload ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                  <button
                                    onClick={() => {
                                      const newFiles = feedback.mediaAttachments.filter((_, i) => i !== index)
                                      setFeedback(prev => ({ ...prev, mediaAttachments: newFiles }))
                                    }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Your Name (Optional)</Label>
                          <Input
                            id="name"
                            placeholder="Enter your name"
                            value={feedback.customerInfo.name}
                            onChange={(e) => setFeedback(prev => ({
                              ...prev,
                              customerInfo: { ...prev.customerInfo, name: e.target.value }
                            }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email for Follow-up (Optional)</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={feedback.customerInfo.email}
                            onChange={(e) => setFeedback(prev => ({
                              ...prev,
                              customerInfo: { ...prev.customerInfo, email: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      
                      {/* Testimonial opt-in */}
                      <div>
                        <Label htmlFor="testimonial">Public Testimonial (Optional)</Label>
                        <Textarea
                          id="testimonial"
                          placeholder="Write a testimonial we can share publicly..."
                          value={feedback.content.testimonial}
                          onChange={(e) => setFeedback(prev => ({
                            ...prev,
                            content: { ...prev.content, testimonial: e.target.value }
                          }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This will be used for marketing with your permission
                        </p>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                    >
                      Previous
                    </Button>
                    
                    {currentStep < totalSteps ? (
                      <Button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={currentStep === 1 && feedback.ratings.overall === 0}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || feedback.ratings.overall === 0}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FeedbackWidget
