import type { CallToActionBlock } from '@/payload-types'

// Lexical content builder utilities
const createLexicalContent = (children: any[]): any => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1
  }
})

const createLexicalParagraph = (text: string, format: number = 0): any => ({
  type: 'paragraph',
  children: [
    {
      type: 'text',
      detail: 0,
      format,
      mode: 'normal',
      style: '',
      text,
      version: 1,
    }
  ],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: format,
  version: 1,
})

const createLexicalHeading = (text: string, tag: 'h1' | 'h2' | 'h3' | 'h4' = 'h2'): any => ({
  type: 'heading',
  children: [
    {
      type: 'text',
      detail: 0,
      format: 0,
      mode: 'normal',
      style: '',
      text,
      version: 1,
    }
  ],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})

// Dumpster Rental CTA
export const dumpsterRentalCTA: Partial<CallToActionBlock> = {
  blockType: 'cta',
  blockName: 'Dumpster Rental Booking',
  richText: createLexicalContent([
    createLexicalHeading('Need a Dumpster? Book Now!', 'h2'),
    createLexicalParagraph('Same-day delivery available. Get your project started with our reliable dumpster rental service. Competitive pricing, flexible terms, and exceptional service.')
  ]),
  links: [
    {
      link: {
        type: 'custom',
        url: '/book-dumpster',
        label: 'Book Dumpster Now',
        appearance: 'default'
      }
    },
    {
      link: {
        type: 'custom',
        url: '/dumpster-pricing',
        label: 'View Pricing',
        appearance: 'outline'
      }
    }
  ]
}

// Tour Guide CTA
export const tourGuideCTA: Partial<CallToActionBlock> = {
  blockType: 'cta',
  blockName: 'Tour Guide Booking',
  richText: createLexicalContent([
    createLexicalHeading('Discover Local Hidden Gems', 'h2'),
    createLexicalParagraph('Book your private tour today! Expert local guides, customized experiences, and unforgettable memories. Available daily with flexible scheduling.')
  ]),
  links: [
    {
      link: {
        type: 'custom',
        url: '/book-tour',
        label: 'Book Your Tour',
        appearance: 'default'
      }
    },
    {
      link: {
        type: 'custom',
        url: '/tour-calendar',
        label: 'Check Availability',
        appearance: 'outline'
      }
    }
  ]
}

// General Service Booking CTA
export const serviceBookingCTA: Partial<CallToActionBlock> = {
  blockType: 'cta',
  blockName: 'Service Booking',
  richText: createLexicalContent([
    createLexicalHeading('Ready to Get Started?', 'h2'),
    createLexicalParagraph('Schedule your service appointment today. Our experienced professionals are ready to help with your project. Free estimates available.')
  ]),
  links: [
    {
      link: {
        type: 'custom',
        url: '/book-service',
        label: 'Book Service',
        appearance: 'default'
      }
    },
    {
      link: {
        type: 'custom',
        url: '/get-quote',
        label: 'Get Free Quote',
        appearance: 'outline'
      }
    }
  ]
}

// Home Services CTA (Plumbing, HVAC, etc.)
export const homeServicesCTA: Partial<CallToActionBlock> = {
  blockType: 'cta',
  blockName: 'Home Services Booking',
  richText: createLexicalContent([
    createLexicalHeading('Home Service Emergency? We\'re Here!', 'h2'),
    createLexicalParagraph('24/7 emergency service available. Licensed, insured, and experienced technicians. Same-day appointments for urgent repairs.')
  ]),
  links: [
    {
      link: {
        type: 'custom',
        url: '/emergency-booking',
        label: 'Emergency Service',
        appearance: 'default'
      }
    },
    {
      link: {
        type: 'custom',
        url: '/schedule-maintenance',
        label: 'Schedule Maintenance',
        appearance: 'outline'
      }
    }
  ]
}

// Event Planning CTA
export const eventPlanningCTA: Partial<CallToActionBlock> = {
  blockType: 'cta',
  blockName: 'Event Planning Booking',
  richText: createLexicalContent([
    createLexicalHeading('Planning Your Perfect Event?', 'h2'),
    createLexicalParagraph('Let our expert event planners make your vision a reality. From intimate gatherings to large celebrations, we handle every detail.')
  ]),
  links: [
    {
      link: {
        type: 'custom',
        url: '/book-consultation',
        label: 'Book Consultation',
        appearance: 'default'
      }
    },
    {
      link: {
        type: 'custom',
        url: '/event-packages',
        label: 'View Packages',
        appearance: 'outline'
      }
    }
  ]
}

// Rental Equipment CTA
export const equipmentRentalCTA: Partial<CallToActionBlock> = {
  blockType: 'cta',
  blockName: 'Equipment Rental Booking',
  richText: createLexicalContent([
    createLexicalHeading('Rent Professional Equipment Today', 'h2'),
    createLexicalParagraph('High-quality equipment rentals for contractors and DIY enthusiasts. Competitive daily, weekly, and monthly rates. Delivery available.')
  ]),
  links: [
    {
      link: {
        type: 'custom',
        url: '/rent-equipment',
        label: 'Rent Equipment',
        appearance: 'default'
      }
    },
    {
      link: {
        type: 'custom',
        url: '/equipment-catalog',
        label: 'Browse Catalog',
        appearance: 'outline'
      }
    }
  ]
}

// Fitness/Personal Training CTA
export const fitnessTrainingCTA: Partial<CallToActionBlock> = {
  blockType: 'cta',
  blockName: 'Fitness Training Booking',
  richText: createLexicalContent([
    createLexicalHeading('Transform Your Fitness Journey', 'h2'),
    createLexicalParagraph('Personal training sessions tailored to your goals. Certified trainers, flexible scheduling, and proven results. Start your transformation today!')
  ]),
  links: [
    {
      link: {
        type: 'custom',
        url: '/book-training',
        label: 'Book Training Session',
        appearance: 'default'
      }
    },
    {
      link: {
        type: 'custom',
        url: '/free-consultation',
        label: 'Free Consultation',
        appearance: 'outline'
      }
    }
  ]
}

// Food Catering CTA
export const cateringCTA: Partial<CallToActionBlock> = {
  blockType: 'cta',
  blockName: 'Catering Booking',
  richText: createLexicalContent([
    createLexicalHeading('Delicious Catering for Any Occasion', 'h2'),
    createLexicalParagraph('From corporate events to family celebrations, our catering service delivers exceptional food and service. Custom menus available.')
  ]),
  links: [
    {
      link: {
        type: 'custom',
        url: '/book-catering',
        label: 'Book Catering',
        appearance: 'default'
      }
    },
    {
      link: {
        type: 'custom',
        url: '/catering-menu',
        label: 'View Menu',
        appearance: 'outline'
      }
    }
  ]
}

// Spa/Wellness CTA
export const spaCTA: Partial<CallToActionBlock> = {
  blockType: 'cta',
  blockName: 'Spa Booking',
  richText: createLexicalContent([
    createLexicalHeading('Relax & Rejuvenate Today', 'h2'),
    createLexicalParagraph('Escape the stress of daily life with our premium spa services. Professional therapists, luxury treatments, and a peaceful environment await you.')
  ]),
  links: [
    {
      link: {
        type: 'custom',
        url: '/book-spa',
        label: 'Book Appointment',
        appearance: 'default'
      }
    },
    {
      link: {
        type: 'custom',
        url: '/spa-packages',
        label: 'View Packages',
        appearance: 'outline'
      }
    }
  ]
}

// Photography CTA
export const photographyCTA: Partial<CallToActionBlock> = {
  blockType: 'cta',
  blockName: 'Photography Booking',
  richText: createLexicalContent([
    createLexicalHeading('Capture Your Perfect Moments', 'h2'),
    createLexicalParagraph('Professional photography for weddings, portraits, events, and more. Experienced photographers, stunning results, and packages to fit any budget.')
  ]),
  links: [
    {
      link: {
        type: 'custom',
        url: '/book-photography',
        label: 'Book Session',
        appearance: 'default'
      }
    },
    {
      link: {
        type: 'custom',
        url: '/photography-portfolio',
        label: 'View Portfolio',
        appearance: 'outline'
      }
    }
  ]
}

// All booking CTAs exported as a collection
export const bookingCTAs = {
  dumpsterRental: dumpsterRentalCTA,
  tourGuide: tourGuideCTA,
  serviceBooking: serviceBookingCTA,
  homeServices: homeServicesCTA,
  eventPlanning: eventPlanningCTA,
  equipmentRental: equipmentRentalCTA,
  fitnessTraining: fitnessTrainingCTA,
  catering: cateringCTA,
  spa: spaCTA,
  photography: photographyCTA
}
