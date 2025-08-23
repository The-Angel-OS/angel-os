#!/usr/bin/env node

/**
 * Script to populate slug fields for existing events
 * Run this after adding the slug field to the Events collection
 */

const { getPayload } = require('payload')
const config = require('../src/payload.config.ts')

async function populateEventSlugs() {
  console.log('🔄 Starting event slug population...')
  
  try {
    const payload = await getPayload({ config })
    
    // Get all events without slugs
    const events = await payload.find({
      collection: 'events',
      limit: 1000,
      where: {
        or: [
          { slug: { exists: false } },
          { slug: { equals: '' } },
          { slug: { equals: null } }
        ]
      }
    })
    
    console.log(`📊 Found ${events.docs.length} events without slugs`)
    
    if (events.docs.length === 0) {
      console.log('✅ All events already have slugs!')
      return
    }
    
    // Update each event with a generated slug
    for (const event of events.docs) {
      if (event.title) {
        const slug = event.title
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '')
          .substring(0, 50) // Limit length
        
        try {
          await payload.update({
            collection: 'events',
            id: event.id,
            data: { slug }
          })
          
          console.log(`✅ Updated event "${event.title}" with slug: "${slug}"`)
        } catch (error) {
          console.error(`❌ Failed to update event "${event.title}":`, error.message)
        }
      } else {
        console.warn(`⚠️  Event ${event.id} has no title, skipping...`)
      }
    }
    
    console.log('🎉 Event slug population completed!')
    
  } catch (error) {
    console.error('❌ Error populating event slugs:', error)
    process.exit(1)
  }
}

// Run the script
populateEventSlugs()
  .then(() => {
    console.log('✨ Script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
