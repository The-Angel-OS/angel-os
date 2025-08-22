import type { CollectionConfig } from 'payload'

export const AngelOSNodes: CollectionConfig = {
  slug: 'angel-os-nodes',
  admin: {
    useAsTitle: 'name',
    description: 'Angel OS Network nodes in the distributed federation',
    defaultColumns: ['name', 'region', 'status', 'nodeType', 'lastSeen'],
    group: 'Platform Management',
    hidden: ({ user }) => {
      // Only show to Host (Super Admin) users, like DNN
      return (user as any)?.globalRole !== 'super_admin'
    },
  },
  access: {
    // Only super admins can manage the network registry
    create: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
    read: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
    update: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
    delete: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
  },
  fields: [
    // Core Node Identity
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Human-readable node name (e.g., "Angel OS US-East-1")',
      },
    },
    {
      name: 'nodeId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique node identifier (UUID)',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) {
              return crypto.randomUUID()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'atProtocolDID',
      type: 'text',
      unique: true,
      admin: {
        description: 'AT Protocol Decentralized Identifier for this node',
      },
    },

    // Network Configuration
    {
      name: 'endpoint',
      type: 'text',
      required: true,
      admin: {
        description: 'Base URL for this Angel OS node (e.g., https://us-east.angel-os.com)',
      },
    },
    {
      name: 'apiEndpoint',
      type: 'text',
      required: true,
      admin: {
        description: 'API endpoint for federation communication',
      },
    },
    {
      name: 'publicKey',
      type: 'textarea',
      admin: {
        description: 'Public key for secure inter-node communication',
      },
    },

    // Geographic & Network Topology
    {
      name: 'region',
      type: 'select',
      required: true,
      options: [
        { label: 'US East', value: 'us-east' },
        { label: 'US West', value: 'us-west' },
        { label: 'EU West', value: 'eu-west' },
        { label: 'EU Central', value: 'eu-central' },
        { label: 'Asia Pacific', value: 'asia-pacific' },
        { label: 'Australia', value: 'australia' },
        { label: 'Canada', value: 'canada' },
        { label: 'South America', value: 'south-america' },
      ],
    },
    {
      name: 'coordinates',
      type: 'group',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          admin: {
            description: 'Geographic latitude for proximity calculations',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          admin: {
            description: 'Geographic longitude for proximity calculations',
          },
        },
      ],
    },

    // Node Characteristics
    {
      name: 'nodeType',
      type: 'select',
      required: true,
      options: [
        { label: 'Genesis Node', value: 'genesis' },
        { label: 'Production Cluster', value: 'production_cluster' },
        { label: 'Single Instance', value: 'single_instance' },
        { label: 'Edge Cluster', value: 'edge_cluster' },
        { label: 'Development Node', value: 'development' },
        { label: 'AI Specialized Node', value: 'ai_specialized' },
      ],
      defaultValue: 'production_cluster',
    },
    {
      name: 'scalingModel',
      type: 'select',
      required: true,
      options: [
        { label: 'Vercel Serverless', value: 'vercel_serverless' },
        { label: 'Cloudflare Load Balanced', value: 'cloudflare_lb' },
        { label: 'Kubernetes Cluster', value: 'k8s_cluster' },
        { label: 'Single Server', value: 'single_server' },
      ],
      defaultValue: 'vercel_serverless',
    },
    {
      name: 'capabilities',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Tenant Hosting', value: 'tenant_hosting' },
        { label: 'AI Processing', value: 'ai_processing' },
        { label: 'Media Storage', value: 'media_storage' },
        { label: 'Real-time Communication', value: 'realtime_comm' },
        { label: 'Blockchain Integration', value: 'blockchain' },
        { label: 'Edge Computing', value: 'edge_computing' },
      ],
      defaultValue: ['tenant_hosting'],
    },

    // Network Health & Status
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Online', value: 'online' },
        { label: 'Degraded', value: 'degraded' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Offline', value: 'offline' },
        { label: 'Quarantined', value: 'quarantined' },
      ],
      defaultValue: 'online',
    },
    {
      name: 'health',
      type: 'group',
      fields: [
        {
          name: 'lastSeen',
          type: 'date',
          admin: {
            description: 'Last heartbeat from this node',
            readOnly: true,
          },
        },
        {
          name: 'responseTime',
          type: 'number',
          admin: {
            description: 'Average response time in milliseconds',
            readOnly: true,
          },
        },
        {
          name: 'uptime',
          type: 'number',
          admin: {
            description: 'Uptime percentage over last 30 days',
            readOnly: true,
          },
        },
        {
          name: 'loadScore',
          type: 'number',
          admin: {
            description: 'Current load score (0-100)',
            readOnly: true,
          },
        },
      ],
    },

    // Resource & Capacity Management
    {
      name: 'resources',
      type: 'group',
      fields: [
        {
          name: 'maxTenants',
          type: 'number',
          defaultValue: 1000,
          admin: {
            description: 'Maximum number of tenants this node can host',
          },
        },
        {
          name: 'currentTenants',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Current number of hosted tenants',
            readOnly: true,
          },
        },
        {
          name: 'maxUsers',
          type: 'number',
          defaultValue: 100000,
          admin: {
            description: 'Maximum concurrent users',
          },
        },
        {
          name: 'storageCapacity',
          type: 'number',
          admin: {
            description: 'Storage capacity in GB',
          },
        },
      ],
    },

    // Network Topology & Relationships
    {
      name: 'connectedNodes',
      type: 'relationship',
      relationTo: 'angel-os-nodes',
      hasMany: true,
      admin: {
        description: 'Direct network connections to other nodes',
      },
    },
    {
      name: 'parentNode',
      type: 'relationship',
      relationTo: 'angel-os-nodes',
      admin: {
        description: 'Parent node in hierarchical topology (if applicable)',
      },
    },

    // Governance & Evolution
    {
      name: 'governanceRules',
      type: 'richText',
      admin: {
        description: 'Node-specific governance and evolution rules',
      },
    },
    {
      name: 'evolutionHistory',
      type: 'array',
      fields: [
        {
          name: 'timestamp',
          type: 'date',
          required: true,
        },
        {
          name: 'event',
          type: 'select',
          required: true,
          options: [
            { label: 'Node Created', value: 'created' },
            { label: 'Tenant Migration', value: 'tenant_migration' },
            { label: 'Capability Added', value: 'capability_added' },
            { label: 'Network Split', value: 'network_split' },
            { label: 'Network Merge', value: 'network_merge' },
            { label: 'AI Agent Spawned', value: 'ai_agent_spawned' },
          ],
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'data',
          type: 'json',
          admin: {
            description: 'Event-specific data payload',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          // Update health timestamp
          if (!data.health) data.health = {}
          data.health.lastSeen = new Date().toISOString()
          
          // Auto-generate API endpoint if not provided
          if (!data.apiEndpoint && data.endpoint) {
            data.apiEndpoint = `${data.endpoint}/api/federation`
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Log network evolution event
        if (operation === 'create') {
          console.log(`🌟 Angel OS Network: New node "${doc.name}" joined the federation`)
          
          // TODO: Notify other nodes of new network member
          // TODO: Trigger network topology recalculation
        }
      },
    ],
  },
}
