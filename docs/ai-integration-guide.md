# 🤖 AI Integration Guide for Angel OS

## Overview

This guide covers integrating the [Ashbuilds AI Plugin](https://github.com/ashbuilds/payload-ai) into Angel OS for enhanced content generation capabilities.

## Current Status

The AI plugin is currently **disabled** in `src/payload.config.ts` (line 9-10) due to:
- Beta status causing enum conflicts
- Version compatibility issues with lucide-react
- Need for proper environment variable configuration

## Installation Steps

### 1. Fix Dependencies

First, update the conflicting lucide-react version:

```bash
pnpm update lucide-react@latest
```

### 2. Install AI Plugin

```bash
pnpm add @ai-stack/payloadcms
```

### 3. Environment Variables

Add to your `.env` file:

```env
# Required for text and image generation
OPENAI_API_KEY=your-openai-api-key

# Required if using gpt-image-1 model
OPENAI_ORG_ID=your-org-id

# Optional: Other supported providers
ANTHROPIC_API_KEY=your-anthropic-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Optional: Custom OpenAI Endpoint
OPENAI_BASE_URL=https://api.openai.com/v1
```

### 4. Payload Configuration

Update `src/payload.config.ts`:

```typescript
import { payloadAiPlugin } from '@ai-stack/payloadcms'

export default buildConfig({
  plugins: [
    // ... existing plugins
    payloadAiPlugin({
      collections: {
        [Posts.slug]: true,
        [Products.slug]: true,
        [Pages.slug]: true,
      },
      globals: {
        [Header.slug]: true,
        [Footer.slug]: true,
      },
      debugging: process.env.NODE_ENV === 'development',
      disableSponsorMessage: false,
      generatePromptOnInit: process.env.NODE_ENV !== 'production',
      uploadCollectionSlug: "media",
      
      // Multi-tenant access control
      access: {
        generate: ({ req }) => {
          // Only authenticated users can generate AI content
          if (!req.user) return false
          
          // Super admins can always generate
          if (req.user.globalRole === 'super_admin') return true
          
          // Tenant admins can generate for their tenant
          if (req.user.globalRole === 'tenant_admin') return true
          
          // Regular users can generate if tenant allows it
          return req.user.tenant?.features?.aiGeneration === true
        },
        settings: ({ req }) => {
          // Only admins can modify AI settings
          return req.user?.globalRole === 'super_admin' || 
                 req.user?.globalRole === 'tenant_admin'
        },
      },
      
      options: {
        enabledLanguages: ["en-US", "es-ES", "fr-FR", "de-DE", "zh-CN"],
      },
      
      // Multi-tenant media upload handling
      mediaUpload: async (result, { request, collection }) => {
        const tenantId = request.user?.tenant?.id
        
        return request.payload.create({
          collection,
          data: {
            ...result.data,
            tenant: tenantId, // Associate with tenant
          },
          file: result.file,
        })
      },
    }),
  ],
  // ... rest of config
})
```

### 5. Enable AI in Collections

Update your collections to support AI features:

```typescript
// src/collections/Posts/index.ts
import { PayloadAiPluginLexicalEditorFeature } from '@ai-stack/payloadcms'

export const Posts: CollectionConfig = {
  // ... existing config
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            // Add AI features
            PayloadAiPluginLexicalEditorFeature(),
          ]
        },
      }),
    },
    // ... other fields
  ],
}
```

## AI Features Available

### 📝 Text Generation
- **Compose**: Generate content from prompts
- **Proofread**: Grammar and style checking
- **Translate**: Multi-language translation
- **Expand**: Elaborate on existing content
- **Summarize**: Create concise summaries
- **Simplify**: Make complex content accessible
- **Rephrase**: Alternative wording

### 🖼️ Image Generation
- **OpenAI DALL-E**: AI-generated images
- **GPT-Image-1**: Advanced image generation

### 🎙️ Voice Generation
- **ElevenLabs**: Text-to-speech conversion
- **OpenAI**: Voice synthesis

## Multi-Tenant Considerations

### Tenant-Specific AI Settings

Add AI configuration to your Tenant collection:

```typescript
// src/collections/Tenants.ts
{
  name: 'aiSettings',
  type: 'group',
  fields: [
    {
      name: 'enableAI',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'allowedModels',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'GPT-4', value: 'gpt-4' },
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'Claude', value: 'claude' },
      ],
    },
    {
      name: 'monthlyTokenLimit',
      type: 'number',
      defaultValue: 100000,
    },
  ],
}
```

### Usage Tracking

Implement usage tracking for billing:

```typescript
// src/collections/AIUsage.ts
export const AIUsage: CollectionConfig = {
  slug: 'ai-usage',
  access: {
    read: ({ req }) => req.user?.globalRole === 'super_admin',
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'model',
      type: 'text',
      required: true,
    },
    {
      name: 'tokensUsed',
      type: 'number',
      required: true,
    },
    {
      name: 'cost',
      type: 'number',
      required: true,
    },
    {
      name: 'operation',
      type: 'select',
      options: [
        { label: 'Text Generation', value: 'text_generation' },
        { label: 'Image Generation', value: 'image_generation' },
        { label: 'Voice Generation', value: 'voice_generation' },
      ],
    },
  ],
  timestamps: true,
}
```

## Integration with LEO

Enhance LEO's capabilities with AI plugin features:

```typescript
// src/services/BusinessAgent.ts
export class BusinessAgent {
  async generateIntelligentResponse(message: string, context: any) {
    // Use AI plugin for enhanced responses
    if (this.hasAIAccess()) {
      return await this.generateAIResponse(message, context)
    }
    
    // Fallback to existing logic
    return this.generateFallbackResponse(message, context)
  }
  
  private async generateAIResponse(message: string, context: any) {
    // Integration with AI plugin's generation capabilities
    // This would use the same AI models configured in the plugin
  }
}
```

## Testing and Validation

### 1. Test AI Generation
```bash
# Start dev server
pnpm dev

# Test AI features in admin panel
# Navigate to Posts > Create New > Use AI Compose feature
```

### 2. Validate Multi-Tenant Isolation
- Ensure AI-generated content is properly scoped to tenants
- Test access controls for different user roles
- Verify usage tracking works correctly

## Troubleshooting

### Common Issues

1. **Enum Conflicts**: The AI plugin may conflict with existing enum types
   - Solution: Review and resolve enum naming conflicts

2. **Version Incompatibility**: lucide-react version conflicts
   - Solution: Update to compatible versions

3. **API Key Issues**: Missing or invalid API keys
   - Solution: Verify all required environment variables

4. **Memory Issues**: Large AI operations may cause memory problems
   - Solution: Increase Node.js memory limit in scripts

### Debug Mode

Enable debugging in development:

```typescript
payloadAiPlugin({
  debugging: true, // Shows AI-enabled fields in console
  generatePromptOnInit: true, // Pre-generates prompts
})
```

## Future Enhancements

1. **Custom AI Prompts**: Tenant-specific prompt templates
2. **AI Workflow Automation**: Integration with n8n workflows  
3. **Voice AI Integration**: Connection with VAPI for voice generation
4. **Multi-language Support**: Enhanced translation capabilities
5. **AI Analytics**: Detailed usage and performance metrics

## Cost Management

Implement cost controls:

```typescript
// Check token limits before AI operations
async function checkAILimits(tenantId: number, operation: string) {
  const usage = await getMonthlyUsage(tenantId)
  const limits = await getTenantLimits(tenantId)
  
  if (usage.tokens >= limits.monthlyTokenLimit) {
    throw new Error('Monthly AI token limit exceeded')
  }
}
```

## Conclusion

The Ashbuilds AI Plugin provides powerful content generation capabilities that can significantly enhance the Angel OS user experience. Proper implementation with multi-tenant considerations ensures scalable and secure AI integration across all tenant workspaces.

