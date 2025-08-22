// Angel OS Karma System - Benevolent Growth-Oriented Reputation
// "Everybody has their idiosyncrasies" - No punishment, only growth

import { getPayload } from 'payload'
import config from '@payload-config'

interface KarmaProfile {
  userId: string
  totalKarma: number
  karmaBreakdown: {
    kindness: number        // Helping others, positive interactions
    creativity: number      // Contributing ideas, solutions, art
    wisdom: number         // Teaching, mentoring, sharing knowledge
    courage: number        // Taking positive risks, standing up for others
    humor: number          // Bringing joy, lightening mood appropriately
    growth: number         // Learning, improving, overcoming challenges
    connection: number     // Building relationships, community building
    authenticity: number   // Being genuine, honest, true to self
  }
  quirks: string[]         // Celebrated idiosyncrasies and unique traits
  achievements: KarmaAchievement[]
  currentLevel: KarmaLevel
  karmaHistory: KarmaEvent[]
  preferences: {
    publicProfile: boolean
    shareQuirks: boolean
    mentorshipAvailable: boolean
    collaborationInterests: string[]
  }
}

interface KarmaAchievement {
  id: string
  title: string
  description: string
  category: keyof KarmaProfile['karmaBreakdown']
  earnedAt: Date
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}

interface KarmaLevel {
  level: number
  title: string
  description: string
  privileges: string[]
  nextLevelRequirement: number
}

interface KarmaEvent {
  id: string
  action: string
  karmaChange: number
  category: keyof KarmaProfile['karmaBreakdown']
  description: string
  timestamp: Date
  context?: {
    helpedUserId?: string
    projectId?: string
    communityId?: string
    quirkCelebrated?: string
  }
}

interface KarmaAction {
  actionType: string
  karmaReward: number
  category: keyof KarmaProfile['karmaBreakdown']
  description: string
  cooldown?: number // Minutes before same action can earn karma again
  maxPerDay?: number
}

export class AngelOSKarmaSystem {
  
  // Karma Levels - Inspired by wisdom traditions
  private static readonly KARMA_LEVELS: KarmaLevel[] = [
    {
      level: 1,
      title: "Curious Wanderer",
      description: "Just beginning your journey through the Angel OS universe",
      privileges: ["basic_features", "community_access"],
      nextLevelRequirement: 100
    },
    {
      level: 2,
      title: "Helpful Companion",
      description: "Your kindness is noticed and appreciated",
      privileges: ["basic_features", "community_access", "help_others"],
      nextLevelRequirement: 300
    },
    {
      level: 3,
      title: "Creative Contributor",
      description: "Your ideas and solutions inspire others",
      privileges: ["basic_features", "community_access", "help_others", "create_content"],
      nextLevelRequirement: 600
    },
    {
      level: 4,
      title: "Wise Mentor",
      description: "Others seek your guidance and wisdom",
      privileges: ["basic_features", "community_access", "help_others", "create_content", "mentor_others"],
      nextLevelRequirement: 1000
    },
    {
      level: 5,
      title: "Courageous Leader",
      description: "You inspire positive change in your community",
      privileges: ["basic_features", "community_access", "help_others", "create_content", "mentor_others", "lead_initiatives"],
      nextLevelRequirement: 1500
    },
    {
      level: 6,
      title: "Authentic Sage",
      description: "Your genuine nature and wisdom guide many",
      privileges: ["basic_features", "community_access", "help_others", "create_content", "mentor_others", "lead_initiatives", "influence_direction"],
      nextLevelRequirement: 2500
    },
    {
      level: 7,
      title: "Connected Guardian",
      description: "You weave the community together with care",
      privileges: ["basic_features", "community_access", "help_others", "create_content", "mentor_others", "lead_initiatives", "influence_direction", "community_guardian"],
      nextLevelRequirement: 4000
    },
    {
      level: 8,
      title: "Enlightened Guide",
      description: "Your presence elevates everyone around you",
      privileges: ["basic_features", "community_access", "help_others", "create_content", "mentor_others", "lead_initiatives", "influence_direction", "community_guardian", "system_influence"],
      nextLevelRequirement: 6000
    },
    {
      level: 9,
      title: "Transcendent Angel",
      description: "You embody the highest ideals of Angel OS",
      privileges: ["all_features", "unlimited_access"],
      nextLevelRequirement: 10000
    }
  ]
  
  // Positive Actions That Earn Karma
  private static readonly KARMA_ACTIONS: KarmaAction[] = [
    // Kindness Actions
    { actionType: 'help_user', karmaReward: 10, category: 'kindness', description: 'Helped another user solve a problem', cooldown: 5 },
    { actionType: 'positive_feedback', karmaReward: 5, category: 'kindness', description: 'Gave encouraging feedback', maxPerDay: 20 },
    { actionType: 'welcome_newcomer', karmaReward: 8, category: 'kindness', description: 'Welcomed a new community member', cooldown: 30 },
    { actionType: 'comfort_frustrated', karmaReward: 12, category: 'kindness', description: 'Helped someone through frustration', cooldown: 10 },
    
    // Creativity Actions
    { actionType: 'share_solution', karmaReward: 15, category: 'creativity', description: 'Shared a creative solution', cooldown: 15 },
    { actionType: 'create_content', karmaReward: 20, category: 'creativity', description: 'Created helpful content', cooldown: 60 },
    { actionType: 'innovative_idea', karmaReward: 25, category: 'creativity', description: 'Contributed an innovative idea', cooldown: 120 },
    
    // Wisdom Actions
    { actionType: 'teach_skill', karmaReward: 18, category: 'wisdom', description: 'Taught someone a new skill', cooldown: 30 },
    { actionType: 'share_knowledge', karmaReward: 12, category: 'wisdom', description: 'Shared valuable knowledge', cooldown: 10 },
    { actionType: 'mentor_session', karmaReward: 30, category: 'wisdom', description: 'Conducted a mentoring session', cooldown: 240 },
    
    // Courage Actions
    { actionType: 'defend_others', karmaReward: 20, category: 'courage', description: 'Stood up for someone', cooldown: 60 },
    { actionType: 'try_new_thing', karmaReward: 8, category: 'courage', description: 'Courageously tried something new', maxPerDay: 5 },
    { actionType: 'lead_initiative', karmaReward: 35, category: 'courage', description: 'Led a positive initiative', cooldown: 480 },
    
    // Humor Actions
    { actionType: 'appropriate_humor', karmaReward: 6, category: 'humor', description: 'Brought joy with appropriate humor', maxPerDay: 10 },
    { actionType: 'lighten_mood', karmaReward: 10, category: 'humor', description: 'Helped lighten a tense situation', cooldown: 30 },
    
    // Growth Actions
    { actionType: 'learn_skill', karmaReward: 10, category: 'growth', description: 'Learned a new skill', maxPerDay: 3 },
    { actionType: 'overcome_challenge', karmaReward: 15, category: 'growth', description: 'Overcame a personal challenge', cooldown: 60 },
    { actionType: 'accept_feedback', karmaReward: 8, category: 'growth', description: 'Gracefully accepted constructive feedback', maxPerDay: 5 },
    
    // Connection Actions
    { actionType: 'introduce_people', karmaReward: 12, category: 'connection', description: 'Introduced people who could help each other', cooldown: 60 },
    { actionType: 'build_community', karmaReward: 25, category: 'connection', description: 'Helped build community connections', cooldown: 180 },
    { actionType: 'bridge_differences', karmaReward: 20, category: 'connection', description: 'Helped bridge differences between people', cooldown: 120 },
    
    // Authenticity Actions
    { actionType: 'honest_feedback', karmaReward: 10, category: 'authenticity', description: 'Gave honest, constructive feedback', cooldown: 30 },
    { actionType: 'admit_mistake', karmaReward: 12, category: 'authenticity', description: 'Honestly admitted and learned from a mistake', cooldown: 60 },
    { actionType: 'share_vulnerability', karmaReward: 15, category: 'authenticity', description: 'Shared vulnerability to help others', cooldown: 120 },
    { actionType: 'celebrate_quirk', karmaReward: 8, category: 'authenticity', description: 'Celebrated someone\'s unique quirk', maxPerDay: 10 }
  ]
  
  /**
   * 🌟 AWARD KARMA
   * Award karma for positive actions - no punishment, only growth
   */
  static async awardKarma(
    userId: string,
    actionType: string,
    context?: any
  ): Promise<{ success: boolean; karmaAwarded: number; newTotal: number; levelUp?: boolean }> {
    const payload = await getPayload({ config })
    
    // Find the karma action
    const karmaAction = this.KARMA_ACTIONS.find(action => action.actionType === actionType)
    if (!karmaAction) {
      return { success: false, karmaAwarded: 0, newTotal: 0 }
    }
    
    // Check cooldown and daily limits
    const canAward = await this.checkKarmaEligibility(userId, actionType, karmaAction)
    if (!canAward) {
      return { success: false, karmaAwarded: 0, newTotal: 0 }
    }
    
    // Get or create karma profile
    let karmaProfile = await this.getKarmaProfile(userId)
    if (!karmaProfile) {
      karmaProfile = await this.createKarmaProfile(userId)
    }
    
    // Award karma
    const karmaAwarded = karmaAction.karmaReward
    karmaProfile.totalKarma += karmaAwarded
    karmaProfile.karmaBreakdown[karmaAction.category] += karmaAwarded
    
    // Create karma event
    const karmaEvent: KarmaEvent = {
      id: `karma_${Date.now()}`,
      action: actionType,
      karmaChange: karmaAwarded,
      category: karmaAction.category,
      description: karmaAction.description,
      timestamp: new Date(),
      context
    }
    
    karmaProfile.karmaHistory.push(karmaEvent)
    
    // Check for level up
    const oldLevel = karmaProfile.currentLevel.level
    karmaProfile.currentLevel = this.calculateLevel(karmaProfile.totalKarma)
    const levelUp = karmaProfile.currentLevel.level > oldLevel
    
    // Check for achievements
    const newAchievements = await this.checkAchievements(karmaProfile, karmaEvent)
    karmaProfile.achievements.push(...newAchievements)
    
    // Save karma profile
    await this.saveKarmaProfile(karmaProfile)
    
    // Log karma event
    await this.logKarmaEvent(karmaEvent, userId)
    
    return {
      success: true,
      karmaAwarded,
      newTotal: karmaProfile.totalKarma,
      levelUp
    }
  }
  
  /**
   * 🎭 CELEBRATE QUIRK
   * Celebrate user's unique idiosyncrasies - no judgment, only appreciation
   */
  static async celebrateQuirk(
    userId: string,
    quirkDescription: string,
    celebratedBy?: string
  ): Promise<{ success: boolean; message: string }> {
    const karmaProfile = await this.getKarmaProfile(userId)
    if (!karmaProfile) {
      return { success: false, message: 'User not found' }
    }
    
    // Add quirk if not already celebrated
    if (!karmaProfile.quirks.includes(quirkDescription)) {
      karmaProfile.quirks.push(quirkDescription)
      
      // Award karma for authenticity
      await this.awardKarma(userId, 'celebrate_quirk', {
        quirkCelebrated: quirkDescription,
        celebratedBy
      })
      
      await this.saveKarmaProfile(karmaProfile)
      
      return {
        success: true,
        message: `🎉 Quirk celebrated! "${quirkDescription}" - Your uniqueness makes Angel OS more wonderful!`
      }
    }
    
    return {
      success: true,
      message: `This wonderful quirk is already celebrated! "${quirkDescription}"`
    }
  }
  
  /**
   * 📊 GET KARMA PROFILE
   */
  static async getKarmaProfile(userId: string): Promise<KarmaProfile | null> {
    // Simplified for demo - in production would use actual collection
    try {
      // Mock implementation - would connect to actual karma-profiles collection
      return null // New users start fresh
    } catch (error) {
      console.error('Error fetching karma profile:', error)
      return null
    }
  }
  
  /**
   * 🌱 CREATE KARMA PROFILE
   */
  private static async createKarmaProfile(userId: string): Promise<KarmaProfile> {
    const newProfile: KarmaProfile = {
      userId,
      totalKarma: 0,
      karmaBreakdown: {
        kindness: 0,
        creativity: 0,
        wisdom: 0,
        courage: 0,
        humor: 0,
        growth: 0,
        connection: 0,
        authenticity: 0
      },
      quirks: [],
      achievements: [],
      currentLevel: this.KARMA_LEVELS[0]!,
      karmaHistory: [],
      preferences: {
        publicProfile: true,
        shareQuirks: true,
        mentorshipAvailable: false,
        collaborationInterests: []
      }
    }
    
    // In production, would save to karma-profiles collection
    console.log(`Created karma profile for user ${userId}`)
    
    return newProfile
  }
  
  /**
   * 🎯 CALCULATE LEVEL
   */
  private static calculateLevel(totalKarma: number): KarmaLevel {
    for (let i = this.KARMA_LEVELS.length - 1; i >= 0; i--) {
      const level = this.KARMA_LEVELS[i]
      if (totalKarma >= (level?.nextLevelRequirement || 0) || i === 0) {
        return level || this.KARMA_LEVELS[0]!
      }
    }
    return this.KARMA_LEVELS[0]!
  }
  
  /**
   * ✅ CHECK KARMA ELIGIBILITY
   */
  private static async checkKarmaEligibility(
    userId: string,
    actionType: string,
    karmaAction: KarmaAction
  ): Promise<boolean> {
    const karmaProfile = await this.getKarmaProfile(userId)
    if (!karmaProfile) return true // New users always eligible
    
    const now = new Date()
    const recentEvents = karmaProfile.karmaHistory.filter(event => 
      event.action === actionType &&
      event.timestamp > new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
    )
    
    // Check daily limit
    if (karmaAction.maxPerDay && recentEvents.length >= karmaAction.maxPerDay) {
      return false
    }
    
    // Check cooldown
    if (karmaAction.cooldown) {
      const cooldownMs = karmaAction.cooldown * 60 * 1000
      const lastEvent = recentEvents[recentEvents.length - 1]
      if (lastEvent && (now.getTime() - lastEvent.timestamp.getTime()) < cooldownMs) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * 🏆 CHECK ACHIEVEMENTS
   */
  private static async checkAchievements(
    karmaProfile: KarmaProfile,
    karmaEvent: KarmaEvent
  ): Promise<KarmaAchievement[]> {
    const newAchievements: KarmaAchievement[] = []
    
    // First help achievement
    if (karmaEvent.action === 'help_user' && karmaProfile.karmaBreakdown.kindness === 10) {
      newAchievements.push({
        id: 'first_help',
        title: 'First Helper',
        description: 'Helped your first fellow Angel OS user',
        category: 'kindness',
        earnedAt: new Date(),
        icon: '🤝',
        rarity: 'common'
      })
    }
    
    // Quirk collector
    if (karmaProfile.quirks.length >= 5) {
      const hasAchievement = karmaProfile.achievements.some(a => a.id === 'quirk_collector')
      if (!hasAchievement) {
        newAchievements.push({
          id: 'quirk_collector',
          title: 'Quirk Collector',
          description: 'Celebrated for 5 unique quirks - authenticity at its finest!',
          category: 'authenticity',
          earnedAt: new Date(),
          icon: '🎭',
          rarity: 'uncommon'
        })
      }
    }
    
    // Wisdom keeper
    if (karmaProfile.karmaBreakdown.wisdom >= 100) {
      const hasAchievement = karmaProfile.achievements.some(a => a.id === 'wisdom_keeper')
      if (!hasAchievement) {
        newAchievements.push({
          id: 'wisdom_keeper',
          title: 'Wisdom Keeper',
          description: 'Shared knowledge and wisdom to help others grow',
          category: 'wisdom',
          earnedAt: new Date(),
          icon: '🧠',
          rarity: 'rare'
        })
      }
    }
    
    return newAchievements
  }
  
  /**
   * 💾 SAVE KARMA PROFILE
   */
  private static async saveKarmaProfile(karmaProfile: KarmaProfile): Promise<void> {
    // In production, would save to karma-profiles collection
    console.log(`Saved karma profile for user ${karmaProfile.userId}: ${karmaProfile.totalKarma} total karma`)
  }
  
  /**
   * 📝 LOG KARMA EVENT
   */
  private static async logKarmaEvent(karmaEvent: KarmaEvent, userId: string): Promise<void> {
    // In production, would log to activity-logs collection
    console.log(`Karma event logged: ${karmaEvent.karmaChange} karma awarded to ${userId} for ${karmaEvent.description}`)
  }
  
  /**
   * 🌈 GET KARMA LEADERBOARD
   * Celebrate top contributors (opt-in only)
   */
  static async getKarmaLeaderboard(
    category?: keyof KarmaProfile['karmaBreakdown'],
    limit: number = 10
  ): Promise<Array<{
    userId: string,
    username: string,
    totalKarma: number,
    level: string,
    categoryKarma?: number,
    favoriteQuirk?: string
  }>> {
    // In production, would fetch from karma-profiles collection
    console.log(`Fetching karma leaderboard for category: ${category || 'all'}, limit: ${limit}`)
    
    // Mock leaderboard data for demo
    return [
      {
        userId: 'user1',
        username: 'Helpful Angel',
        totalKarma: 1500,
        level: 'Courageous Leader',
        categoryKarma: category ? 300 : undefined,
        favoriteQuirk: 'Always brings snacks to meetings'
      }
    ]
  }
}

// No punishment system - only growth and celebration
// "Everybody has their idiosyncrasies" - Angel OS Philosophy 