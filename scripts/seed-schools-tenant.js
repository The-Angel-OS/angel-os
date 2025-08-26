#!/usr/bin/env node

/**
 * SafeSchool|MAP℠ Multi-Tenant Seed Script
 * 
 * This script creates a dedicated tenant for the school safety platform
 * with sample schools, safety reviews, and realistic data for testing.
 * 
 * Usage: node scripts/seed-schools-tenant.js
 */

import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const SCHOOL_TENANT_ID = 2 // Use tenant ID 2 for schools
const SCHOOL_TENANT_SLUG = 'safeschool-map'

// Perfect seed data with comprehensive, realistic school information
const SAMPLE_SCHOOLS = [
  // Elementary Schools
  {
    name: 'Lincoln Elementary School',
    slug: 'lincoln-elementary',
    address: {
      street: '123 Oak Street',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90210',
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2437
      }
    },
    demographics: {
      schoolType: 'elementary',
      grades: 'K-5',
      enrollment: 485,
      studentTeacherRatio: 18,
      district: 'Springfield Unified School District'
    },
    safetyScores: {
      communityScore: {
        overall: 87,
        crimeData: 92,
        demographicSafety: 82,
        lastUpdated: new Date().toISOString(),
        dataSource: 'NCES, Census Bureau, Local Crime Statistics'
      },
      verifiedScore: {
        isVerified: true,
        overall: 89,
        verificationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        siteAssessment: {
          physicalSecurity: 85,
          emergencyPreparedness: 92,
          staffTraining: 88,
          studentWellbeing: 91
        }
      }
    },
    externalData: {
      ncesId: '06-1234567-001',
      stateId: 'CA-SPFD-001',
      website: 'https://lincoln-elem.springfield.k12.ca.us',
      phone: '(555) 123-4567'
    },
    status: 'active',
    featured: true
  },
  
  {
    name: 'Washington Elementary School',
    slug: 'washington-elementary',
    address: {
      street: '456 Maple Avenue',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90211',
      coordinates: {
        latitude: 34.0622,
        longitude: -118.2537
      }
    },
    demographics: {
      schoolType: 'elementary',
      grades: 'K-6',
      enrollment: 320,
      studentTeacherRatio: 16,
      district: 'Springfield Unified School District'
    },
    safetyScores: {
      communityScore: {
        overall: 73,
        crimeData: 78,
        demographicSafety: 68,
        lastUpdated: new Date().toISOString(),
        dataSource: 'NCES, Census Bureau, Local Crime Statistics'
      }
    },
    externalData: {
      ncesId: '06-1234567-002',
      stateId: 'CA-SPFD-002',
      website: 'https://washington-elem.springfield.k12.ca.us',
      phone: '(555) 123-4568'
    },
    status: 'active',
    featured: false
  },

  // Middle Schools
  {
    name: 'Jefferson Middle School',
    slug: 'jefferson-middle',
    address: {
      street: '789 Pine Street',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90212',
      coordinates: {
        latitude: 34.0722,
        longitude: -118.2637
      }
    },
    demographics: {
      schoolType: 'middle',
      grades: '6-8',
      enrollment: 650,
      studentTeacherRatio: 22,
      district: 'Springfield Unified School District'
    },
    safetyScores: {
      communityScore: {
        overall: 79,
        crimeData: 75,
        demographicSafety: 83,
        lastUpdated: new Date().toISOString(),
        dataSource: 'NCES, Census Bureau, Local Crime Statistics'
      },
      verifiedScore: {
        isVerified: true,
        overall: 81,
        verificationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
        siteAssessment: {
          physicalSecurity: 78,
          emergencyPreparedness: 85,
          staffTraining: 80,
          studentWellbeing: 82
        }
      }
    },
    externalData: {
      ncesId: '06-1234567-003',
      stateId: 'CA-SPFD-003',
      website: 'https://jefferson-middle.springfield.k12.ca.us',
      phone: '(555) 123-4569'
    },
    status: 'active',
    featured: true
  },

  // High Schools
  {
    name: 'Kennedy High School',
    slug: 'kennedy-high',
    address: {
      street: '1000 Cedar Boulevard',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90213',
      coordinates: {
        latitude: 34.0822,
        longitude: -118.2737
      }
    },
    demographics: {
      schoolType: 'high',
      grades: '9-12',
      enrollment: 1250,
      studentTeacherRatio: 25,
      district: 'Springfield Unified School District'
    },
    safetyScores: {
      communityScore: {
        overall: 84,
        crimeData: 81,
        demographicSafety: 87,
        lastUpdated: new Date().toISOString(),
        dataSource: 'NCES, Census Bureau, Local Crime Statistics'
      },
      verifiedScore: {
        isVerified: true,
        overall: 86,
        verificationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        siteAssessment: {
          physicalSecurity: 88,
          emergencyPreparedness: 89,
          staffTraining: 84,
          studentWellbeing: 83
        }
      }
    },
    externalData: {
      ncesId: '06-1234567-004',
      stateId: 'CA-SPFD-004',
      website: 'https://kennedy-high.springfield.k12.ca.us',
      phone: '(555) 123-4570'
    },
    status: 'active',
    featured: true
  },

  // Charter School
  {
    name: 'Innovation Charter Academy',
    slug: 'innovation-charter',
    address: {
      street: '2500 Innovation Drive',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90214',
      coordinates: {
        latitude: 34.0922,
        longitude: -118.2837
      }
    },
    demographics: {
      schoolType: 'charter',
      grades: 'K-12',
      enrollment: 800,
      studentTeacherRatio: 20,
      district: 'Independent Charter'
    },
    safetyScores: {
      communityScore: {
        overall: 91,
        crimeData: 95,
        demographicSafety: 87,
        lastUpdated: new Date().toISOString(),
        dataSource: 'NCES, Census Bureau, Local Crime Statistics'
      }
    },
    externalData: {
      ncesId: '06-1234567-005',
      stateId: 'CA-CHTR-001',
      website: 'https://innovationcharter.org',
      phone: '(555) 123-4571'
    },
    status: 'active',
    featured: false
  },

  // Private School
  {
    name: "St. Mary's Catholic School",
    slug: 'st-marys-catholic',
    address: {
      street: '300 Church Street',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90215',
      coordinates: {
        latitude: 34.1022,
        longitude: -118.2937
      }
    },
    demographics: {
      schoolType: 'private',
      grades: 'K-8',
      enrollment: 275,
      studentTeacherRatio: 15,
      district: 'Private/Independent'
    },
    safetyScores: {
      communityScore: {
        overall: 88,
        crimeData: 90,
        demographicSafety: 86,
        lastUpdated: new Date().toISOString(),
        dataSource: 'NCES, Census Bureau, Local Crime Statistics'
      },
      verifiedScore: {
        isVerified: true,
        overall: 92,
        verificationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        siteAssessment: {
          physicalSecurity: 90,
          emergencyPreparedness: 94,
          staffTraining: 91,
          studentWellbeing: 93
        }
      }
    },
    externalData: {
      stateId: 'CA-PRIV-001',
      website: 'https://stmarys-springfield.org',
      phone: '(555) 123-4572'
    },
    status: 'active',
    featured: false
  },

  // Additional Schools for Perfect Testing Coverage
  {
    name: 'Roosevelt High School',
    slug: 'roosevelt-high',
    address: {
      street: '1500 Roosevelt Avenue',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90216',
      coordinates: {
        latitude: 34.1122,
        longitude: -118.3037
      }
    },
    demographics: {
      schoolType: 'high',
      grades: '9-12',
      enrollment: 1850,
      studentTeacherRatio: 28,
      district: 'Springfield Unified School District'
    },
    safetyScores: {
      communityScore: {
        overall: 67,
        crimeData: 62,
        demographicSafety: 72,
        lastUpdated: new Date().toISOString(),
        dataSource: 'NCES, Census Bureau, Local Crime Statistics'
      }
    },
    externalData: {
      ncesId: '06-1234567-006',
      stateId: 'CA-SPFD-006',
      website: 'https://roosevelt-high.springfield.k12.ca.us',
      phone: '(555) 123-4573'
    },
    status: 'active',
    featured: false
  },

  {
    name: 'Sunshine Montessori Academy',
    slug: 'sunshine-montessori',
    address: {
      street: '789 Garden Lane',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90217',
      coordinates: {
        latitude: 34.0422,
        longitude: -118.2137
      }
    },
    demographics: {
      schoolType: 'private',
      grades: 'Pre-K-6',
      enrollment: 180,
      studentTeacherRatio: 12,
      district: 'Private/Independent'
    },
    safetyScores: {
      communityScore: {
        overall: 94,
        crimeData: 96,
        demographicSafety: 92,
        lastUpdated: new Date().toISOString(),
        dataSource: 'NCES, Census Bureau, Local Crime Statistics'
      },
      verifiedScore: {
        isVerified: true,
        overall: 95,
        verificationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        siteAssessment: {
          physicalSecurity: 93,
          emergencyPreparedness: 97,
          staffTraining: 95,
          studentWellbeing: 96
        }
      }
    },
    externalData: {
      stateId: 'CA-PRIV-002',
      website: 'https://sunshinemontessori.org',
      phone: '(555) 123-4574'
    },
    status: 'active',
    featured: true
  },

  {
    name: 'Valley View Middle School',
    slug: 'valley-view-middle',
    address: {
      street: '2200 Valley Road',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90218',
      coordinates: {
        latitude: 34.0322,
        longitude: -118.2237
      }
    },
    demographics: {
      schoolType: 'middle',
      grades: '6-8',
      enrollment: 420,
      studentTeacherRatio: 19,
      district: 'Springfield Unified School District'
    },
    safetyScores: {
      communityScore: {
        overall: 76,
        crimeData: 74,
        demographicSafety: 78,
        lastUpdated: new Date().toISOString(),
        dataSource: 'NCES, Census Bureau, Local Crime Statistics'
      }
    },
    externalData: {
      ncesId: '06-1234567-007',
      stateId: 'CA-SPFD-007',
      website: 'https://valleyview-middle.springfield.k12.ca.us',
      phone: '(555) 123-4575'
    },
    status: 'pending', // Some schools pending approval
    featured: false
  },

  {
    name: 'Tech Prep Charter High',
    slug: 'tech-prep-charter',
    address: {
      street: '3000 Technology Drive',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90219',
      coordinates: {
        latitude: 34.0222,
        longitude: -118.2337
      }
    },
    demographics: {
      schoolType: 'charter',
      grades: '9-12',
      enrollment: 650,
      studentTeacherRatio: 18,
      district: 'Independent Charter'
    },
    safetyScores: {
      communityScore: {
        overall: 82,
        crimeData: 85,
        demographicSafety: 79,
        lastUpdated: new Date().toISOString(),
        dataSource: 'NCES, Census Bureau, Local Crime Statistics'
      },
      verifiedScore: {
        isVerified: true,
        overall: 84,
        verificationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        siteAssessment: {
          physicalSecurity: 82,
          emergencyPreparedness: 86,
          staffTraining: 83,
          studentWellbeing: 85
        }
      }
    },
    externalData: {
      ncesId: '06-1234567-008',
      stateId: 'CA-CHTR-002',
      website: 'https://techprepcharter.org',
      phone: '(555) 123-4576'
    },
    status: 'active',
    featured: true
  }
]

// Sample safety reviews for the schools
const SAMPLE_REVIEWS = [
  // Lincoln Elementary Reviews
  {
    schoolSlug: 'lincoln-elementary',
    reviews: [
      {
        customerName: 'Sarah Johnson',
        isAnonymous: false,
        reviewerRole: 'parent',
        safetyFeeling: 5,
        safetyHandling: 5,
        wouldRecommend: 'yes',
        content: 'Lincoln Elementary has an excellent safety program. The staff is well-trained in emergency procedures, and they communicate regularly with parents about safety measures. My daughter feels very secure at school.',
        category: 'general'
      },
      {
        customerName: 'Anonymous',
        isAnonymous: true,
        reviewerRole: 'teacher',
        safetyFeeling: 4,
        safetyHandling: 5,
        wouldRecommend: 'yes',
        content: 'As a teacher here, I can say the administration takes safety very seriously. We have regular drills, updated security systems, and a strong anti-bullying program.',
        category: 'staff'
      },
      {
        customerName: 'Anonymous',
        isAnonymous: true,
        reviewerRole: 'parent',
        safetyFeeling: 5,
        safetyHandling: 4,
        wouldRecommend: 'yes',
        content: 'Great school with a focus on student wellbeing. The playground equipment is well-maintained and the pickup/drop-off procedures are very organized.',
        category: 'facilities'
      }
    ]
  },

  // Jefferson Middle School Reviews
  {
    schoolSlug: 'jefferson-middle',
    reviews: [
      {
        customerName: 'Anonymous',
        isAnonymous: true,
        reviewerRole: 'parent',
        safetyFeeling: 4,
        safetyHandling: 4,
        wouldRecommend: 'yes',
        content: 'Jefferson Middle has made significant improvements to their safety protocols over the past year. The new security cameras and improved lighting make a big difference.',
        category: 'security'
      },
      {
        customerName: 'Mike Rodriguez',
        isAnonymous: false,
        reviewerRole: 'community',
        safetyFeeling: 3,
        safetyHandling: 4,
        wouldRecommend: 'undecided',
        content: 'The school is working hard on their anti-bullying initiatives. There have been some incidents, but the administration responds quickly and appropriately.',
        category: 'bullying'
      }
    ]
  },

  // Kennedy High School Reviews
  {
    schoolSlug: 'kennedy-high',
    reviews: [
      {
        customerName: 'Anonymous',
        isAnonymous: true,
        reviewerRole: 'student',
        safetyFeeling: 4,
        safetyHandling: 4,
        wouldRecommend: 'yes',
        content: 'Kennedy High has good security measures. The campus supervisors are visible and approachable. Emergency drills are taken seriously.',
        category: 'security'
      },
      {
        customerName: 'Lisa Chen',
        isAnonymous: false,
        reviewerRole: 'parent',
        safetyFeeling: 5,
        safetyHandling: 5,
        wouldRecommend: 'yes',
        content: 'Excellent communication from the school about safety measures. They have a comprehensive emergency response plan and the staff is well-prepared.',
        category: 'emergency'
      }
    ]
  },

  // Roosevelt High School Reviews (Lower scores)
  {
    schoolSlug: 'roosevelt-high',
    reviews: [
      {
        customerName: 'Anonymous',
        isAnonymous: true,
        reviewerRole: 'parent',
        safetyFeeling: 2,
        safetyHandling: 3,
        wouldRecommend: 'no',
        content: 'Concerned about the lack of security presence during pickup and drop-off times. There have been several incidents that could have been prevented with better supervision.',
        category: 'security'
      },
      {
        customerName: 'Mark Thompson',
        isAnonymous: false,
        reviewerRole: 'teacher',
        safetyFeeling: 3,
        safetyHandling: 3,
        wouldRecommend: 'undecided',
        content: 'The administration is working on improvements, but we need more resources for proper safety measures. Staff training has been inconsistent.',
        category: 'staff'
      },
      {
        customerName: 'Anonymous',
        isAnonymous: true,
        reviewerRole: 'student',
        safetyFeeling: 3,
        safetyHandling: 2,
        wouldRecommend: 'undecided',
        content: 'Some areas of the campus feel unsafe, especially after school hours. Bullying incidents are not always handled promptly.',
        category: 'bullying'
      }
    ]
  },

  // Sunshine Montessori Reviews (Excellent scores)
  {
    schoolSlug: 'sunshine-montessori',
    reviews: [
      {
        customerName: 'Jennifer Martinez',
        isAnonymous: false,
        reviewerRole: 'parent',
        safetyFeeling: 5,
        safetyHandling: 5,
        wouldRecommend: 'yes',
        content: 'Outstanding safety protocols! The small class sizes allow for excellent supervision. My child feels completely safe and happy here.',
        category: 'general'
      },
      {
        customerName: 'Dr. Amanda Foster',
        isAnonymous: false,
        reviewerRole: 'parent',
        safetyFeeling: 5,
        safetyHandling: 5,
        wouldRecommend: 'yes',
        content: 'As a pediatrician, I appreciate their attention to health and safety details. The playground is well-maintained and age-appropriate.',
        category: 'facilities'
      },
      {
        customerName: 'Anonymous',
        isAnonymous: true,
        reviewerRole: 'teacher',
        safetyFeeling: 5,
        safetyHandling: 5,
        wouldRecommend: 'yes',
        content: 'Working here for 8 years - the safety culture is embedded in everything we do. Regular training, clear protocols, and supportive administration.',
        category: 'staff'
      }
    ]
  },

  // Valley View Middle School Reviews (Pending status school)
  {
    schoolSlug: 'valley-view-middle',
    reviews: [
      {
        customerName: 'Anonymous',
        isAnonymous: true,
        reviewerRole: 'parent',
        safetyFeeling: 4,
        safetyHandling: 3,
        wouldRecommend: 'yes',
        content: 'Good school overall, but could use better communication about safety incidents. The new principal seems committed to improvements.',
        category: 'general'
      }
    ]
  },

  // Tech Prep Charter Reviews
  {
    schoolSlug: 'tech-prep-charter',
    reviews: [
      {
        customerName: 'Carlos Rodriguez',
        isAnonymous: false,
        reviewerRole: 'parent',
        safetyFeeling: 4,
        safetyHandling: 4,
        wouldRecommend: 'yes',
        content: 'Great focus on both technology and safety. The building is modern with good security systems. Staff is well-trained and responsive.',
        category: 'security'
      },
      {
        customerName: 'Anonymous',
        isAnonymous: true,
        reviewerRole: 'student',
        safetyFeeling: 4,
        safetyHandling: 4,
        wouldRecommend: 'yes',
        content: 'Feel safe at school. The tech focus means good digital safety education too. Teachers are approachable about any concerns.',
        category: 'general'
      }
    ]
  },

  // St. Mary's Reviews
  {
    schoolSlug: 'st-marys-catholic',
    reviews: [
      {
        customerName: 'Maria Gonzalez',
        isAnonymous: false,
        reviewerRole: 'parent',
        safetyFeeling: 5,
        safetyHandling: 5,
        wouldRecommend: 'yes',
        content: 'Exceptional safety standards. The small school community means everyone knows each other, creating a very secure environment.',
        category: 'general'
      },
      {
        customerName: 'Anonymous',
        isAnonymous: true,
        reviewerRole: 'parent',
        safetyFeeling: 4,
        safetyHandling: 5,
        wouldRecommend: 'yes',
        content: 'Strong values-based approach to safety and discipline. Children learn respect and responsibility alongside academic subjects.',
        category: 'culture'
      }
    ]
  }
]

async function createSchoolsTenant() {
  console.log('🏫 Creating SafeSchool|MAP℠ Tenant...')
  
  const payload = await getPayload({ config })

  try {
    // 1. Create or update the schools tenant
    let schoolsTenant
    try {
      // Try to find existing tenant
      const existingTenant = await payload.find({
        collection: 'tenants',
        where: { id: { equals: SCHOOL_TENANT_ID } },
        limit: 1
      })

      if (existingTenant.docs.length > 0) {
        console.log('📝 Updating existing schools tenant...')
        schoolsTenant = await payload.update({
          collection: 'tenants',
          id: SCHOOL_TENANT_ID,
          data: {
            name: 'SafeSchool|MAP℠',
            slug: SCHOOL_TENANT_SLUG,
            domain: 'safeschool.local',
            description: 'School safety rating and review platform',
            settings: {
              theme: 'school-safety',
              features: ['schools', 'safety-reviews', 'verification'],
              branding: {
                primaryColor: '#2563eb',
                logo: '/safeschool-logo.svg'
              }
            },
            status: 'active'
          }
        })
      } else {
        console.log('🆕 Creating new schools tenant...')
        schoolsTenant = await payload.create({
          collection: 'tenants',
          data: {
            id: SCHOOL_TENANT_ID,
            name: 'SafeSchool|MAP℠',
            slug: SCHOOL_TENANT_SLUG,
            domain: 'safeschool.local',
            description: 'School safety rating and review platform',
            settings: {
              theme: 'school-safety',
              features: ['schools', 'safety-reviews', 'verification'],
              branding: {
                primaryColor: '#2563eb',
                logo: '/safeschool-logo.svg'
              }
            },
            status: 'active'
          }
        })
      }
    } catch (error) {
      console.error('Error with tenant:', error)
      // If tenant creation fails, continue with default tenant
      schoolsTenant = { id: 1 }
    }

    console.log(`✅ Schools tenant ready: ${schoolsTenant.id}`)

    // 2. Create sample schools
    console.log('🏫 Creating sample schools...')
    const createdSchools = []

    for (const schoolData of SAMPLE_SCHOOLS) {
      try {
        // Check if school already exists
        const existing = await payload.find({
          collection: 'schools',
          where: { slug: { equals: schoolData.slug } },
          limit: 1
        })

        let school
        if (existing.docs.length > 0) {
          console.log(`📝 Updating school: ${schoolData.name}`)
          school = await payload.update({
            collection: 'schools',
            id: existing.docs[0].id,
            data: schoolData
          })
        } else {
          console.log(`🆕 Creating school: ${schoolData.name}`)
          school = await payload.create({
            collection: 'schools',
            data: schoolData
          })
        }
        
        createdSchools.push(school)
      } catch (error) {
        console.error(`❌ Error creating school ${schoolData.name}:`, error)
      }
    }

    console.log(`✅ Created ${createdSchools.length} schools`)

    // 3. Create sample safety reviews
    console.log('📝 Creating sample safety reviews...')
    let totalReviews = 0

    for (const schoolReviews of SAMPLE_REVIEWS) {
      // Find the school
      const school = createdSchools.find(s => s.slug === schoolReviews.schoolSlug)
      if (!school) {
        console.log(`⚠️ School not found for reviews: ${schoolReviews.schoolSlug}`)
        continue
      }

      for (const reviewData of schoolReviews.reviews) {
        try {
          // Prepare context responses for school-specific questions
          const contextResponses = [
            {
              question: "How safe do you or your child feel at school?",
              answer: reviewData.safetyFeeling.toString(),
              answerType: "rating",
              numericValue: reviewData.safetyFeeling
            },
            {
              question: "How well does your school handle safety concerns?",
              answer: reviewData.safetyHandling.toString(),
              answerType: "rating", 
              numericValue: reviewData.safetyHandling
            },
            {
              question: "Would you recommend this school based on its safety measures?",
              answer: reviewData.wouldRecommend,
              answerType: "choice"
            },
            {
              question: "What is your role?",
              answer: reviewData.reviewerRole,
              answerType: "choice"
            }
          ]

          // Calculate overall rating
          const overallRating = Math.round((reviewData.safetyFeeling + reviewData.safetyHandling) / 2)

          const feedbackData = {
            entityType: 'school',
            entityId: school.id.toString(),
            entityTitle: school.name,
            customerName: reviewData.customerName,
            isAnonymous: reviewData.isAnonymous,
            ratings: {
              overall: overallRating,
              quality: reviewData.safetyFeeling,
              service: reviewData.safetyHandling,
              recommendationScore: reviewData.wouldRecommend === 'yes' ? 10 : reviewData.wouldRecommend === 'no' ? 0 : 5
            },
            content: {
              review: reviewData.content
            },
            contextResponses: contextResponses,
            status: 'approved', // Pre-approve sample reviews
            isPublic: true,
            isFeatured: false,
            metadata: {
              platform: 'web',
              source: 'seed-script'
            },
            followUp: {
              required: overallRating <= 2,
              responseStatus: 'pending'
            }
          }

          await payload.create({
            collection: 'feedback',
            data: feedbackData
          })

          totalReviews++
        } catch (error) {
          console.error(`❌ Error creating review for ${school.name}:`, error)
        }
      }
    }

    console.log(`✅ Created ${totalReviews} safety reviews`)

    // 4. Summary
    console.log('\n🎉 SafeSchool|MAP℠ Tenant Setup Complete!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 Tenant: ${schoolsTenant.name} (ID: ${schoolsTenant.id})`)
    console.log(`🏫 Schools Created: ${createdSchools.length}`)
    console.log(`📝 Reviews Created: ${totalReviews}`)
    console.log(`🌐 Local URL: http://safeschool.local:3000/schools`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📋 Next Steps:')
    console.log('1. Add hosts file entries (see script comments)')
    console.log('2. Start dev server: pnpm dev')
    console.log('3. Visit: http://safeschool.local:3000/schools')
    console.log('4. Test school search and profile pages')
    console.log('5. Test safety review submission')

  } catch (error) {
    console.error('❌ Error setting up schools tenant:', error)
    process.exit(1)
  }
}

// Run the seed script
if (require.main === module) {
  createSchoolsTenant()
    .then(() => {
      console.log('\n✅ Seed script completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Seed script failed:', error)
      process.exit(1)
    })
}

module.exports = { createSchoolsTenant, SAMPLE_SCHOOLS, SAMPLE_REVIEWS }
