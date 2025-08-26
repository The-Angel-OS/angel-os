"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Users, CheckCircle, AlertTriangle, Info } from "lucide-react"

interface SafetyScore {
  overall: number
  categories?: {
    physical?: number
    emotional?: number
    digital?: number
    environmental?: number
  }
}

interface VerifiedScore {
  isVerified?: boolean | null
  overall?: number | null
  categories?: {
    physical?: number | null
    emotional?: number | null
    digital?: number | null
    environmental?: number | null
  }
  lastVerified?: string | null
}

interface SafetyScoreCardProps {
  communityScore: SafetyScore
  verifiedScore?: VerifiedScore
}

export function SafetyScoreCard({ communityScore, verifiedScore }: SafetyScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Safety Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Community Score */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Community Safety Score</span>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(communityScore.overall)}`}>
                {communityScore.overall}
              </div>
              <div className={`text-sm ${getScoreColor(communityScore.overall)}`}>
                {getScoreLabel(communityScore.overall)}
              </div>
            </div>
          </div>
          
          <Progress 
            value={communityScore.overall} 
            className="h-2 mb-4"
            style={{
              '--progress-background': getProgressColor(communityScore.overall)
            } as React.CSSProperties}
          />

          {/* Category Breakdown */}
          {communityScore.categories && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(communityScore.categories).map(([category, score]) => (
                <div key={category} className="flex justify-between">
                  <span className="capitalize text-gray-600">{category}:</span>
                  <span className={`font-medium ${getScoreColor(score)}`}>
                    {score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Score */}
        {verifiedScore?.isVerified && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">SITE|SAFETYNET℠ Verified</span>
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                  Official
                </Badge>
              </div>
              {verifiedScore.overall && (
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(verifiedScore.overall)}`}>
                    {verifiedScore.overall}
                  </div>
                  <div className={`text-sm ${getScoreColor(verifiedScore.overall)}`}>
                    {getScoreLabel(verifiedScore.overall)}
                  </div>
                </div>
              )}
            </div>

            {verifiedScore.overall && (
              <>
                <Progress 
                  value={verifiedScore.overall} 
                  className="h-2 mb-4"
                  style={{
                    '--progress-background': getProgressColor(verifiedScore.overall)
                  } as React.CSSProperties}
                />

                {/* Verified Category Breakdown */}
                {verifiedScore.categories && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    {Object.entries(verifiedScore.categories).map(([category, score]) => (
                  <div key={category} className="flex justify-between">
                    <span className="capitalize text-gray-600">{category}:</span>
                    <span className={`font-medium ${score ? getScoreColor(score) : 'text-gray-400'}`}>
                      {score || 'N/A'}
                    </span>
                  </div>
                ))}
                  </div>
                )}
              </>
            )}

            {verifiedScore.lastVerified && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                <Info className="h-3 w-3" />
                <span>Last verified: {new Date(verifiedScore.lastVerified).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Score Explanation */}
        <div className="bg-blue-50 rounded-lg p-4 text-sm">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-900 font-medium mb-1">How Safety Scores Work</p>
              <p className="text-blue-800 text-xs leading-relaxed">
                Community scores are based on parent and community member reviews. 
                SITE|SAFETYNET℠ verified scores are based on official assessments, 
                incident reports, and safety infrastructure evaluations.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {!verifiedScore?.isVerified && (
          <div className="bg-yellow-50 rounded-lg p-4 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-900 font-medium mb-1">Not Yet Verified</p>
                <p className="text-yellow-800 text-xs leading-relaxed">
                  This school has not undergone SITE|SAFETYNET℠ verification. 
                  Encourage your school administration to participate in our comprehensive safety assessment program.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
