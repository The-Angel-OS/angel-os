#!/usr/bin/env node

/**
 * SafeSchool Site Crawler
 * 
 * This script crawls safeschoolmap.org to analyze its structure,
 * content, and functionality for replication in Angel OS.
 * 
 * Usage: node scripts/crawl-safeschool-site.js
 */

const https = require('https')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')

// Configuration
const BASE_URL = 'https://safeschoolmap.org'
const OUTPUT_DIR = './crawled-content'
const MAX_PAGES = 50
const DELAY_MS = 1000 // Be respectful with requests

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Track visited URLs and discovered content
const visitedUrls = new Set()
const discoveredPages = []
const siteStructure = {
  navigation: [],
  pages: {},
  forms: [],
  components: [],
  assets: []
}

/**
 * Make HTTP request with error handling
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = ''
      
      response.on('data', (chunk) => {
        data += chunk
      })
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data
        })
      })
    })
    
    request.on('error', (error) => {
      reject(error)
    })
    
    request.setTimeout(10000, () => {
      request.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

/**
 * Extract links from HTML content
 */
function extractLinks(html, baseUrl) {
  const links = []
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
  let match
  
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl)
      if (url.hostname === new URL(baseUrl).hostname) {
        links.push(url.href)
      }
    } catch (e) {
      // Invalid URL, skip
    }
  }
  
  return [...new Set(links)] // Remove duplicates
}

/**
 * Extract navigation structure
 */
function extractNavigation(html) {
  const navItems = []
  
  // Look for common navigation patterns
  const navPatterns = [
    /<nav[^>]*>(.*?)<\/nav>/gis,
    /<ul[^>]*class="[^"]*nav[^"]*"[^>]*>(.*?)<\/ul>/gis,
    /<div[^>]*class="[^"]*menu[^"]*"[^>]*>(.*?)<\/div>/gis
  ]
  
  navPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(html)) !== null) {
      const navContent = match[1]
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)</gi
      let linkMatch
      
      while ((linkMatch = linkRegex.exec(navContent)) !== null) {
        navItems.push({
          url: linkMatch[1],
          text: linkMatch[2].trim(),
          type: 'navigation'
        })
      }
    }
  })
  
  return navItems
}

/**
 * Extract forms and their structure
 */
function extractForms(html, url) {
  const forms = []
  const formRegex = /<form[^>]*>(.*?)<\/form>/gis
  let match
  
  while ((match = formRegex.exec(html)) !== null) {
    const formHtml = match[0]
    const formContent = match[1]
    
    // Extract form attributes
    const actionMatch = /action=["']([^"']+)["']/i.exec(formHtml)
    const methodMatch = /method=["']([^"']+)["']/i.exec(formHtml)
    
    // Extract form fields
    const fields = []
    const fieldRegex = /<(input|select|textarea)[^>]*>/gi
    let fieldMatch
    
    while ((fieldMatch = fieldRegex.exec(formContent)) !== null) {
      const fieldHtml = fieldMatch[0]
      const typeMatch = /type=["']([^"']+)["']/i.exec(fieldHtml)
      const nameMatch = /name=["']([^"']+)["']/i.exec(fieldHtml)
      const idMatch = /id=["']([^"']+)["']/i.exec(fieldHtml)
      
      fields.push({
        tag: fieldMatch[1],
        type: typeMatch ? typeMatch[1] : null,
        name: nameMatch ? nameMatch[1] : null,
        id: idMatch ? idMatch[1] : null,
        html: fieldHtml
      })
    }
    
    forms.push({
      url: url,
      action: actionMatch ? actionMatch[1] : null,
      method: methodMatch ? methodMatch[1] : 'GET',
      fields: fields,
      html: formHtml
    })
  }
  
  return forms
}

/**
 * Extract page metadata and content structure
 */
function analyzePage(html, url) {
  const analysis = {
    url: url,
    title: '',
    description: '',
    headings: [],
    content: '',
    components: [],
    scripts: [],
    styles: []
  }
  
  // Extract title
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html)
  if (titleMatch) {
    analysis.title = titleMatch[1].trim()
  }
  
  // Extract meta description
  const descMatch = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i.exec(html)
  if (descMatch) {
    analysis.description = descMatch[1].trim()
  }
  
  // Extract headings
  const headingRegex = /<(h[1-6])[^>]*>([^<]+)<\/h[1-6]>/gi
  let headingMatch
  while ((headingMatch = headingRegex.exec(html)) !== null) {
    analysis.headings.push({
      level: headingMatch[1],
      text: headingMatch[2].trim()
    })
  }
  
  // Extract scripts
  const scriptRegex = /<script[^>]*src=["']([^"']+)["']/gi
  let scriptMatch
  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    analysis.scripts.push(scriptMatch[1])
  }
  
  // Extract stylesheets
  const styleRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi
  let styleMatch
  while ((styleMatch = styleRegex.exec(html)) !== null) {
    analysis.styles.push(styleMatch[1])
  }
  
  return analysis
}

/**
 * Save content to file
 */
function saveContent(filename, content) {
  const filePath = path.join(OUTPUT_DIR, filename)
  fs.writeFileSync(filePath, typeof content === 'string' ? content : JSON.stringify(content, null, 2))
  console.log(`💾 Saved: ${filename}`)
}

/**
 * Main crawling function
 */
async function crawlSite() {
  console.log('🕷️  Starting SafeSchool site crawl...')
  console.log(`📍 Base URL: ${BASE_URL}`)
  console.log(`📁 Output: ${OUTPUT_DIR}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const urlsToVisit = [BASE_URL]
  let pageCount = 0
  
  while (urlsToVisit.length > 0 && pageCount < MAX_PAGES) {
    const currentUrl = urlsToVisit.shift()
    
    if (visitedUrls.has(currentUrl)) {
      continue
    }
    
    visitedUrls.add(currentUrl)
    pageCount++
    
    try {
      console.log(`🔍 Crawling [${pageCount}/${MAX_PAGES}]: ${currentUrl}`)
      
      const response = await makeRequest(currentUrl)
      
      if (response.statusCode !== 200) {
        console.log(`⚠️  Status ${response.statusCode}: ${currentUrl}`)
        continue
      }
      
      const html = response.body
      
      // Save raw HTML
      const urlPath = new URL(currentUrl).pathname.replace(/\//g, '_') || 'index'
      saveContent(`${urlPath}.html`, html)
      
      // Analyze page structure
      const pageAnalysis = analyzePage(html, currentUrl)
      siteStructure.pages[currentUrl] = pageAnalysis
      
      // Extract navigation
      const navItems = extractNavigation(html)
      siteStructure.navigation.push(...navItems)
      
      // Extract forms
      const forms = extractForms(html, currentUrl)
      siteStructure.forms.push(...forms)
      
      // Find new URLs to crawl
      const links = extractLinks(html, currentUrl)
      for (const link of links) {
        if (!visitedUrls.has(link) && !urlsToVisit.includes(link)) {
          urlsToVisit.push(link)
        }
      }
      
      // Be respectful - add delay
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
      
    } catch (error) {
      console.error(`❌ Error crawling ${currentUrl}:`, error.message)
    }
  }
  
  // Remove duplicates and clean up navigation
  siteStructure.navigation = [...new Map(
    siteStructure.navigation.map(item => [item.url, item])
  ).values()]
  
  // Save site structure analysis
  saveContent('site-structure.json', siteStructure)
  
  // Generate summary report
  const summary = {
    crawlDate: new Date().toISOString(),
    totalPages: pageCount,
    totalUrls: visitedUrls.size,
    navigationItems: siteStructure.navigation.length,
    formsFound: siteStructure.forms.length,
    commonPages: Object.keys(siteStructure.pages).map(url => ({
      url,
      title: siteStructure.pages[url].title,
      headings: siteStructure.pages[url].headings.length
    }))
  }
  
  saveContent('crawl-summary.json', summary)
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Crawl Complete!')
  console.log(`📊 Pages crawled: ${pageCount}`)
  console.log(`🔗 Navigation items: ${siteStructure.navigation.length}`)
  console.log(`📝 Forms found: ${siteStructure.forms.length}`)
  console.log(`📁 Files saved to: ${OUTPUT_DIR}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

// Run the crawler
if (require.main === module) {
  crawlSite()
    .then(() => {
      console.log('\n✅ Crawl completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Crawl failed:', error)
      process.exit(1)
    })
}

module.exports = { crawlSite }


