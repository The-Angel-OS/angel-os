import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile, stat } from 'fs/promises'
import { join, relative, extname } from 'path'

interface DocFile {
  name: string
  path: string
  relativePath: string
  isDirectory: boolean
  size?: number
  lastModified?: Date
  content?: string
}

const DOCS_DIR = join(process.cwd(), 'docs')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const filePath = searchParams.get('file')

    switch (action) {
      case 'list':
        return await listDocs()

      case 'read':
        if (!filePath) {
          return NextResponse.json(
            { error: 'File path is required for read action' },
            { status: 400 }
          )
        }
        return await readDoc(filePath)

      default:
        return NextResponse.json({
          success: true,
          message: 'Documentation API',
          endpoints: {
            'GET ?action=list': 'List all documentation files',
            'GET ?action=read&file=path': 'Read specific documentation file'
          }
        })
    }

  } catch (error) {
    console.error('[Docs API] Error:', error)
    return NextResponse.json(
      {
        error: 'Documentation API failed',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

async function listDocs(): Promise<NextResponse> {
  try {
    const files = await scanDirectory(DOCS_DIR)

    return NextResponse.json({
      success: true,
      docs: files,
      totalFiles: files.length,
      lastScanned: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Docs API] Failed to list docs:', error)
    return NextResponse.json(
      { error: 'Failed to list documentation files' },
      { status: 500 }
    )
  }
}

async function readDoc(filePath: string): Promise<NextResponse> {
  try {
    // Security: Ensure file is within docs directory
    const fullPath = join(DOCS_DIR, filePath)
    const relativePath = relative(DOCS_DIR, fullPath)

    if (relativePath.startsWith('..') || !relativePath) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    // Check if file exists and is markdown
    const stats = await stat(fullPath)
    if (!stats.isFile() || extname(fullPath) !== '.md') {
      return NextResponse.json(
        { error: 'File not found or not a markdown file' },
        { status: 404 }
      )
    }

    const content = await readFile(fullPath, 'utf-8')

    // Extract metadata from content
    const metadata = extractMarkdownMetadata(content)

    return NextResponse.json({
      success: true,
      file: {
        name: filePath,
        path: fullPath,
        relativePath: filePath,
        content,
        size: stats.size,
        lastModified: stats.mtime,
        metadata
      }
    })

  } catch (error) {
    console.error(`[Docs API] Failed to read file ${filePath}:`, error)
    return NextResponse.json(
      { error: 'Failed to read documentation file' },
      { status: 500 }
    )
  }
}

async function scanDirectory(dirPath: string, baseDir: string = dirPath): Promise<DocFile[]> {
  const files: DocFile[] = []

  try {
    const entries = await readdir(dirPath)

    for (const entry of entries) {
      const fullPath = join(dirPath, entry)
      const stats = await stat(fullPath)
      const relativePath = relative(baseDir, fullPath)

      if (stats.isDirectory()) {
        // Skip hidden directories and node_modules
        if (!entry.startsWith('.') && entry !== 'node_modules') {
          files.push({
            name: entry,
            path: fullPath,
            relativePath,
            isDirectory: true,
            lastModified: stats.mtime
          })

          // Recursively scan subdirectories
          const subFiles = await scanDirectory(fullPath, baseDir)
          files.push(...subFiles)
        }
      } else if (extname(entry) === '.md') {
        // Only include markdown files
        const content = await readFile(fullPath, 'utf-8')
        const metadata = extractMarkdownMetadata(content)

        files.push({
          name: entry,
          path: fullPath,
          relativePath,
          isDirectory: false,
          size: stats.size,
          lastModified: stats.mtime,
          content: metadata.title || entry.replace('.md', '')
        })
      }
    }

    return files.sort((a, b) => {
      // Directories first, then files, both alphabetically
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

  } catch (error) {
    console.error(`[Docs API] Failed to scan directory ${dirPath}:`, error)
    return []
  }
}

function extractMarkdownMetadata(content: string): { title?: string; description?: string; lastUpdated?: string } {
  const metadata: { title?: string; description?: string; lastUpdated?: string } = {}

  // Extract title from first H1
  const titleMatch = content.match(/^#\s+(.+)$/m)
  if (titleMatch) {
    metadata.title = titleMatch[1]?.trim()
  }

  // Extract description from first paragraph after title
  const lines = content.split('\n')
  let foundTitle = false
  for (const line of lines) {
    if (line.startsWith('# ')) {
      foundTitle = true
      continue
    }
    if (foundTitle && line.trim() && !line.startsWith('#') && !line.startsWith('*') && !line.startsWith('-')) {
      metadata.description = line.trim().substring(0, 150) + (line.length > 150 ? '...' : '')
      break
    }
  }

  // Extract last updated date if present
  const lastUpdatedMatch = content.match(/\*Last Updated[:\s]+([^*\n]+)\*/i)
  if (lastUpdatedMatch) {
    metadata.lastUpdated = lastUpdatedMatch[1]?.trim()
  }

  return metadata
}
