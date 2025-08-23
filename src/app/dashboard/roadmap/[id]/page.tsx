"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { FeedbackSystem } from "@/components/ui/feedback-system"
import { ArrowLeft, Edit, Share, Heart, ThumbsUp, Star, Users, Calendar, Target, TrendingUp, MessageSquare, Flag } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useParams } from "next/navigation"
import { usePayloadDocument } from "@/hooks/usePayloadCollection"

interface RoadmapFeature {
  id: string
  title: string
  description?: string
  status: 'idea' | 'planned' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  estimatedEffort?: {
    hours?: number
    complexity?: 'simple' | 'moderate' | 'complex' | 'epic'
  }
  voting: {
    votes: number
    voterCount: number
    averageScore: number
  }
  timeline?: {
    targetQuarter?: string
    estimatedCompletion?: string
  }
  assignedTo?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  tags?: Array<{ tag: string }>
  feedback?: Array<{
    comment: string
    author: {
      id: string
      email: string
      firstName?: string
      lastName?: string
    }
    type: 'feedback' | 'use-case' | 'technical' | 'design' | 'question'
    isPublic: boolean
    adminResponse?: string
  }>
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export default function RoadmapFeatureDetailPage() {
  const params = useParams()
  const featureId = params.id as string

  const { data: feature, loading, error } = usePayloadDocument<RoadmapFeature>('roadmap-features', featureId)

  useEffect(() => {
    if (feature) {
      document.title = `Angel OS: ${feature.title}`
    }
  }, [feature])

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !feature) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Feature Not Found</h2>
          <p className="text-gray-600 mb-4">The roadmap feature you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/dashboard/roadmap">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roadmap
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idea': return 'bg-gray-100 text-gray-800'
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplexityIcon = (complexity?: string) => {
    switch (complexity) {
      case 'simple': return '🟢'
      case 'moderate': return '🟡'
      case 'complex': return '🟠'
      case 'epic': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/roadmap">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roadmap
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{feature.title}</h1>
            <p className="text-muted-foreground">
              Feature #{feature.id.slice(-8)} • Created {new Date(feature.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feature Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Feature Details</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getPriorityColor(feature.priority)}>
                    {feature.priority.toUpperCase()} PRIORITY
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {feature.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Category</h4>
                  <Badge variant="outline">{feature.category}</Badge>
                </div>
                {feature.estimatedEffort?.complexity && (
                  <div>
                    <h4 className="font-medium mb-2">Complexity</h4>
                    <div className="flex items-center space-x-2">
                      <span>{getComplexityIcon(feature.estimatedEffort.complexity)}</span>
                      <span className="capitalize">{feature.estimatedEffort.complexity}</span>
                    </div>
                  </div>
                )}
              </div>

              {feature.estimatedEffort?.hours && (
                <div>
                  <h4 className="font-medium mb-2">Estimated Effort</h4>
                  <p className="text-muted-foreground">{feature.estimatedEffort.hours} hours</p>
                </div>
              )}

              {feature.tags && feature.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Feedback */}
          {feature.feedback && feature.feedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Community Feedback</span>
                  <Badge variant="outline">{feature.feedback.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feature.feedback.map((feedback, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {feedback.author.firstName?.[0] || feedback.author.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {feedback.author.firstName && feedback.author.lastName 
                                ? `${feedback.author.firstName} ${feedback.author.lastName}` 
                                : feedback.author.email}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {feedback.type.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        {!feedback.isPublic && (
                          <Badge variant="secondary" className="text-xs">Private</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{feedback.comment}</p>
                      {feedback.adminResponse && (
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                          <p className="text-sm font-medium text-blue-700 mb-1">Admin Response:</p>
                          <p className="text-sm text-blue-600">{feedback.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Community Voting</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{feature.voting.votes}</div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-semibold">{feature.voting.voterCount}</div>
                  <p className="text-xs text-muted-foreground">Voters</p>
                </div>
                <div>
                  <div className="text-xl font-semibold">{feature.voting.averageScore.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </div>
              <Button className="w-full">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Vote for this Feature
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          {feature.timeline && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feature.timeline.targetQuarter && (
                  <div>
                    <p className="text-sm font-medium">Target Quarter</p>
                    <p className="text-muted-foreground">{feature.timeline.targetQuarter}</p>
                  </div>
                )}
                {feature.timeline.estimatedCompletion && (
                  <div>
                    <p className="text-sm font-medium">Estimated Completion</p>
                    <p className="text-muted-foreground">
                      {new Date(feature.timeline.estimatedCompletion).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assignment */}
          {feature.assignedTo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Assignment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {feature.assignedTo.firstName?.[0] || feature.assignedTo.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {feature.assignedTo.firstName && feature.assignedTo.lastName 
                        ? `${feature.assignedTo.firstName} ${feature.assignedTo.lastName}` 
                        : feature.assignedTo.email}
                    </p>
                    <p className="text-sm text-muted-foreground">Assigned Developer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Feedback System */}
      <FeedbackSystem
        entityType="post"
        entityId={feature.id}
        entityTitle={feature.title}
        showRatings={false}
        showRecommendation={true}
        allowAnonymous={false}
        requireVerification={false}
        className="mt-6"
        onFeedbackSubmit={(feedback) => {
          console.log('New roadmap feature feedback:', feedback)
        }}
      />
    </div>
  )
}
