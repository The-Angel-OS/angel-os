"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Star, Plus, Shield, AlertCircle } from "lucide-react"

interface AddReviewModalProps {
  schoolId: string
  schoolName: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (review: any) => void
}

export function AddReviewModal({ 
  schoolId, 
  schoolName, 
  isOpen, 
  onOpenChange, 
  onSubmit 
}: AddReviewModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorRole: '',
    overallRating: 5,
    categories: {
      physical: 5,
      emotional: 5,
      digital: 5,
      environmental: 5
    },
    anonymous: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Here you would typically submit to your API
      await onSubmit({
        ...formData,
        schoolId,
        createdAt: new Date().toISOString()
      })
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        authorRole: '',
        overallRating: 5,
        categories: {
          physical: 5,
          emotional: 5,
          digital: 5,
          environmental: 5
        },
        anonymous: false
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateCategory = (category: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }))
  }

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'physical':
        return 'Building security, emergency procedures, playground safety'
      case 'emotional':
        return 'Bullying prevention, mental health support, inclusive environment'
      case 'digital':
        return 'Cyberbullying prevention, online safety education, digital citizenship'
      case 'environmental':
        return 'Air quality, cleanliness, noise levels, lighting'
      default:
        return ''
    }
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Needs Improvement'
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    if (score >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Add Safety Review for {schoolName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Author Role */}
          <div className="space-y-2">
            <Label htmlFor="authorRole">Your Role *</Label>
            <Select 
              value={formData.authorRole} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, authorRole: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent/Guardian</SelectItem>
                <SelectItem value="teacher">Teacher/Staff</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="community">Community Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience in a few words"
              required
            />
          </div>

          {/* Overall Rating */}
          <div className="space-y-3">
            <Label>Overall Safety Rating *</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, overallRating: i + 1 }))}
                    className={`p-1 rounded ${
                      i < formData.overallRating 
                        ? 'text-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                    aria-label={`Rate ${i + 1} out of 10 stars`}
                    title={`Rate ${i + 1} out of 10 stars`}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{formData.overallRating}</span>
                <Badge variant="outline" className={getScoreColor(formData.overallRating)}>
                  {getScoreLabel(formData.overallRating)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <Label>Category Ratings</Label>
            {Object.entries(formData.categories).map(([category, rating]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium capitalize">{category} Safety</div>
                    <div className="text-sm text-gray-600">
                      {getCategoryDescription(category)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(rating)}`}>
                      {rating}
                    </div>
                    <div className={`text-xs ${getScoreColor(rating)}`}>
                      {getScoreLabel(rating)}
                    </div>
                  </div>
                </div>
                <Slider
                  value={[rating]}
                  onValueChange={(value) => updateCategory(category, value[0] || 1)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 - Poor</span>
                  <span>10 - Excellent</span>
                </div>
              </div>
            ))}
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Review *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your detailed experience with this school's safety environment. What specific aspects stood out to you?"
              rows={6}
              required
            />
            <div className="text-sm text-gray-500">
              Minimum 50 characters. Be specific and constructive in your feedback.
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">Review Guidelines</div>
                <ul className="text-blue-800 text-xs space-y-1 list-disc list-inside">
                  <li>Focus on safety-related aspects of the school environment</li>
                  <li>Be respectful and constructive in your feedback</li>
                  <li>Avoid naming specific individuals</li>
                  <li>Reviews are moderated before publication</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.content || !formData.authorRole}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
