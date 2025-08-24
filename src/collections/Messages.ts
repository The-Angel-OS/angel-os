import type { CollectionConfig } from 'payload'
// Import the newly created types
import {
  MessageContent,
  // DynamicWidget, // Included in MessageContent
  // SystemMessageData, // Included in MessageContent
  // ActionMessageData, // Included in MessageContent
  // MessageMetadata, // Included in MessageContent
} from '../types/messages'
import { ConversationContext } from '../types/conversation'
import { BusinessIntelligenceData } from '../types/business-intelligence'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'id', // Changed from 'content' as content is now a JSON object
    defaultColumns: ['messageType', 'sender', 'space', 'channel', 'priority', 'createdAt'],
    group: 'Communication',
    description: 'Enhanced messaging system with rich JSON content, conversation context, and BI.',
  },
  access: {
    create: ({ req }) => {
      // Authenticated users can create messages
      return Boolean(req.user);
    },
    read: ({ req }) => {
      // Authenticated users can read messages
      if (!req.user) return false;
      
      // Super admins can read all messages
      if ((req.user as any)?.globalRole === 'super_admin') return true;
      
      // Regular users can read all messages (tenant isolation handled at space level)
      return true;
    },
    update: ({ req }) => {
      // Users can only update their own messages
      // Super admins might have different rules, adjust if necessary
      if ((req.user as any)?.globalRole === 'super_admin') return true;
      return {
        sender: {
          equals: req.user?.id,
        },
      };
    },
    delete: ({ req }) => {
      // Similar to update, users can only delete their own messages
      // Or specific roles like space admins / super_admins
      if ((req.user as any)?.globalRole === 'super_admin') return true;
      // Add more role-based delete permissions if needed, e.g. space admins
      return {
        sender: {
          equals: req.user?.id,
        },
      };
    },
  },
  fields: [
    // Core Message Fields from requirements
    {
      name: 'content', // Enhanced JSON content structure
      type: 'json', // Storing as JSON, validation via hooks or Payload's JSON field validation
      required: true,
      // admin: {
      //   description: 'Rich JSON content of the message (text, widgets, system data, etc.)',
      //   components: { // Potentially add a custom component for better JSON editing/viewing
      //     Field: CustomJsonViewComponent, // Example
      //   },
      // },
      // TODO: Add Payload JSON validation if possible, or rely on hooks
      // validate: (value: MessageContent) => {
      //   // Use MessageProcessor.validateContent(value) here
      //   // This requires MessageProcessor to be available in this scope
      //   // For now, basic validation:
      //   if (!value || !value.type) return "Content type is required.";
      //   return true;
      // }
    },
    {
      name: 'conversationContext', // Conversation state and context
      type: 'json',
      // admin: {
      //   description: 'Context of the conversation (intent, phase, history).',
      //   components: {
      //     Field: CustomJsonViewComponent, // Example
      //   },
      // }
      // validate: (value: ConversationContext) => { /* Basic validation */ return true; }
    },
    {
      name: 'businessIntelligence', // Business metrics and insights
      type: 'json',
      // admin: {
      //   description: 'Embedded Business Intelligence data.',
      //   components: {
      //     Field: CustomJsonViewComponent, // Example
      //   },
      // }
      // validate: (value: BusinessIntelligenceData) => { /* Basic validation */ return true; }
    },
    {
      name: 'sender', // Renamed from 'author' to match requirements
      type: 'relationship',
      relationTo: 'users',
      required: true,
      // admin: {
      //   description: 'User who sent this message.',
      // },
      // Retaining auto-set hook from original, but changing name from 'author' to 'sender'
      hooks: {
        beforeValidate: [
          ({ req, data }) => {
            if (data && !data.sender && req.user?.id) {
              return req.user.id;
            }
            return data?.sender;
          },
        ],
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      // admin: {
      //   description: 'Space this message belongs to.',
      // },
    },
    {
      name: 'channel', // Kept as relationship from requirements, was text previously
      type: 'relationship',
      relationTo: 'channels', // Assuming a 'channels' collection exists
      // admin: {
      //   description: 'Channel within the space (optional).',
      // },
    },
    {
      name: 'messageType',
      type: 'select',
      options: [
        { label: 'User Message', value: 'user' }, // User-generated content
        { label: 'Leo AI Response', value: 'leo' }, // AI-generated response
        { label: 'System Message', value: 'system' }, // Automated system event
        { label: 'Action Result', value: 'action' }, // Outcome of an automated action
        { label: 'Business Intelligence', value: 'intelligence' } // BI data embed
      ],
      required: true,
      defaultValue: 'user',
      // admin: {
      //   description: 'Primary classification of the message content.',
      // },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' }
      ],
      defaultValue: 'normal',
      // admin: {
      //   description: 'Priority level of the message.',
      // },
    },
    {
      name: 'readBy', // Users who have read this message
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      // admin: {
      //   description: 'Users who have marked this message as read.',
      // },
    },
    {
      name: 'reactions', // User reactions and feedback (e.g., emoji, likes)
      type: 'json', // Flexible structure for reactions
      // admin: {
      //   description: 'User reactions to the message (e.g., emojis, upvotes).',
      //   components: {
      //     Field: CustomJsonViewComponent, // Example
      //   },
      // }
      // Example structure for reactions:
      // { "👍": ["userId1", "userId2"], "❤️": ["userId3"] }
      // or [{ emoji: "👍", users: ["userId1"], count: 1 }] like original
    },
    {
      name: 'threadId', // For message threading (can be ID of the root message in a thread)
      type: 'text', // Could also be a relationship to itself if we want strict parent-child
      index: true,
      // admin: {
      //   description: 'Identifier for the message thread this message belongs to.',
      // },
    },
    {
      name: 'replyToId', // For message replies
      type: 'relationship',
      relationTo: 'messages', // Self-relation for replies
      // admin: {
      //   description: 'The specific message ID this message is a reply to.',
      // },
    },

    // Retaining some potentially useful fields from the original structure,
    // if they don't conflict and add value.
    // AT Protocol fields seem specific, keeping them for now.
    {
      name: 'atProtocol',
      type: 'group',
      label: 'AT Protocol Data',
      admin: {
        description: 'BlueSky/AT Protocol compatibility fields',
        position: 'sidebar', // Moving to sidebar to de-clutter main form
      },
      fields: [
        { name: 'type', type: 'text', defaultValue: 'co.kendev.spaces.message', admin: { readOnly: true } },
        { name: 'did', type: 'text', admin: { readOnly: true } },
        { name: 'uri', type: 'text', admin: { readOnly: true } },
        { name: 'cid', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      name: 'attachments', // This can store references to media/files
      type: 'relationship',
      relationTo: 'media', // Assuming a 'media' collection for uploads
      hasMany: true,
      // admin: {
      //   description: 'Files or media attached to this message, referenced in content.metadata.attachments.',
      // },
    },
    // The 'timestamp' field is automatically handled by `timestamps: true` below.
    // The 'metadata' field in the original can be covered by content.metadata or other specific fields.
    // Removing original 'widgetData', 'parentMessage', 'threadReplies', 'mentions',
    // 'isEdited', 'editHistory', 'isDeleted', etc. as the new structure aims to consolidate
    // or handle these differently (e.g., content.widgets, threadId/replyToId).
  ],
  hooks: {
    beforeChange: [
      // TODO: Validate JSON content structure (using MessageProcessor.validateContent)
      // TODO: Generate conversation context (using MessageProcessor.generateConversationContext)
      // TODO: Process business intelligence data (using MessageProcessor.extractBusinessIntelligence)

      // Retaining AT Protocol hook from original, ensuring it uses 'sender' if that's the new field name for author
      async ({ data, operation, req }) => {
        if (operation === 'create' && data) {
          if (!data.sender && req.user?.id) { // Auto-set sender if not present
            data.sender = req.user.id;
          }
          // AT Protocol specific logic from original
          if (!data.atProtocol?.did && req.user) {
            data.atProtocol = {
              ...data.atProtocol,
              did: `did:plc:${req.user.id}`, // Assuming req.user.id is appropriate for DID
              type: 'co.kendev.spaces.message', // Ensure this is the desired type
            };
          }
        }
        return data;
      },
    ],
    afterChange: [
      // TODO: Trigger Leo AI response if needed
      // TODO: Update conversation state
      // TODO: Notify relevant users

      // Retaining AT Protocol hook from original
      async ({ doc, operation, req }) => { // Added req here
        if (operation === 'create' && doc) {
          // Generate URI and CID based on doc ID and other data
          // Ensure doc.atProtocol.did is populated correctly by beforeChange hook or is already set
          if (doc.atProtocol?.did && doc.id) {
            const uri = `at://${doc.atProtocol.did}/co.kendev.spaces.message/${doc.id}`;
            // Simplified CID, real implementation might involve hashing content
            const cid = `bafyrei${doc.id.toString().padStart(50, '0')}`; // Example CID

            // This hook runs after the document is created/updated.
            // To update the document itself with URI and CID, you'd typically use another update operation,
            // but be careful of triggering infinite loops.
            // For now, just logging as in the original.
            // In a real scenario, this might be handled by a separate process or a direct DB update
            // if Payload's hooks don't easily support self-update post-creation without recursion.
            console.log(`Generated AT Protocol URI: ${uri}, CID: ${cid} for doc ID ${doc.id}. Consider updating the record.`);

            // Example of how one might try to update (use with caution due to potential loops):
            // await req.payload.update({
            //   collection: 'messages',
            //   id: doc.id,
            //   data: {
            //     atProtocol: {
            //       ...doc.atProtocol,
            //       uri,
            //       cid,
            //     },
            //   },
            // });
          }
        }
      },
    ],
    // Retaining beforeValidate from original author hook, but adapting for 'sender'
    // This is now merged into the beforeChange hook above to keep logic together.
  },
  timestamps: true, // Enables createdAt and updatedAt fields automatically
  // Existing features like 'versions' could be added if needed.
};
