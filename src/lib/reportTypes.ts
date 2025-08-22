export interface ReportTypeDefinition {
  id: string
  name: string
  description: string
  category: string
  metaSchema: Record<string, any>
  queryFields: string[]
  displayFields: string[]
  reportTemplate: string
  calculatedFields?: Record<string, string>
  validationRules?: Record<string, any>
}

export const REPORT_TYPES: Record<string, ReportTypeDefinition> = {
  mileage_log: {
    id: 'mileage_log',
    name: 'Mileage Log',
    description: 'Track vehicle mileage for business and personal use',
    category: 'business',
    metaSchema: {
      startMileage: { type: 'number', required: true, description: 'Starting odometer reading' },
      endMileage: { type: 'number', required: true, description: 'Ending odometer reading' },
      distance: { type: 'number', calculated: true, formula: 'endMileage - startMileage' },
      vehicle: { type: 'string', required: true, description: 'Vehicle identifier' },
      purpose: { type: 'string', required: true, description: 'Business purpose of trip' },
      rate: { type: 'number', default: 0.655, description: 'IRS mileage rate' },
      deduction: { type: 'number', calculated: true, formula: 'distance * rate' },
      tripType: { type: 'enum', values: ['business', 'personal'], default: 'business' },
    },
    queryFields: ['vehicle', 'purpose', 'tripType', 'startMileage', 'endMileage'],
    displayFields: ['vehicle', 'distance', 'purpose', 'deduction'],
    reportTemplate: 'mileage_summary',
    calculatedFields: {
      distance: 'meta.endMileage - meta.startMileage',
      deduction: '(meta.endMileage - meta.startMileage) * meta.rate',
    },
  },
  
  collection_inventory: {
    id: 'collection_inventory',
    name: 'Collection Inventory',
    description: 'Catalog items in collections (butterflies, coins, etc.)',
    category: 'inventory',
    metaSchema: {
      speciesName: { type: 'string', required: true, description: 'Scientific or common name' },
      collectionName: { type: 'string', required: true, description: 'Collection category' },
      condition: { type: 'enum', values: ['excellent', 'good', 'fair', 'poor'], required: true },
      rarity: { type: 'enum', values: ['common', 'uncommon', 'rare', 'very_rare'], default: 'common' },
      estimatedValue: { type: 'number', description: 'Estimated value in USD' },
      acquisitionDate: { type: 'date', description: 'Date acquired' },
      acquisitionMethod: { type: 'enum', values: ['purchased', 'found', 'gifted', 'traded'] },
      dimensions: { type: 'object', properties: { length: 'number', width: 'number', height: 'number' } },
      weight: { type: 'number', description: 'Weight in grams' },
      notes: { type: 'string', description: 'Additional notes' },
    },
    queryFields: ['speciesName', 'collectionName', 'condition', 'rarity', 'estimatedValue'],
    displayFields: ['speciesName', 'collectionName', 'condition', 'rarity', 'estimatedValue'],
    reportTemplate: 'collection_catalog',
  },

  business_inventory: {
    id: 'business_inventory',
    name: 'Business Inventory',
    description: 'Track business assets and inventory',
    category: 'business',
    metaSchema: {
      itemName: { type: 'string', required: true, description: 'Item name' },
      sku: { type: 'string', description: 'Stock keeping unit' },
      category: { type: 'string', required: true, description: 'Inventory category' },
      quantity: { type: 'number', required: true, description: 'Current quantity' },
      unitPrice: { type: 'number', description: 'Price per unit' },
      totalValue: { type: 'number', calculated: true, formula: 'quantity * unitPrice' },
      supplier: { type: 'string', description: 'Supplier name' },
      reorderLevel: { type: 'number', description: 'Minimum quantity before reorder' },
      expirationDate: { type: 'date', description: 'Expiration date if applicable' },
      condition: { type: 'enum', values: ['new', 'good', 'fair', 'damaged'] },
      serialNumber: { type: 'string', description: 'Serial number if applicable' },
    },
    queryFields: ['itemName', 'sku', 'category', 'quantity', 'supplier'],
    displayFields: ['itemName', 'sku', 'quantity', 'unitPrice', 'totalValue'],
    reportTemplate: 'inventory_summary',
    calculatedFields: {
      totalValue: 'meta.quantity * meta.unitPrice',
    },
  },

  equipment_status: {
    id: 'equipment_status',
    name: 'Equipment Status',
    description: 'Monitor equipment condition and performance',
    category: 'maintenance',
    metaSchema: {
      equipmentId: { type: 'string', required: true, description: 'Equipment identifier' },
      equipmentType: { type: 'string', required: true, description: 'Type of equipment' },
      status: { type: 'enum', values: ['operational', 'maintenance', 'broken', 'retired'], required: true },
      lastMaintenance: { type: 'date', description: 'Last maintenance date' },
      nextMaintenance: { type: 'date', description: 'Next scheduled maintenance' },
      hoursUsed: { type: 'number', description: 'Total hours of operation' },
      maintenanceNotes: { type: 'string', description: 'Maintenance notes' },
      efficiency: { type: 'number', min: 0, max: 100, description: 'Equipment efficiency percentage' },
    },
    queryFields: ['equipmentId', 'equipmentType', 'status', 'lastMaintenance'],
    displayFields: ['equipmentId', 'equipmentType', 'status', 'efficiency'],
    reportTemplate: 'equipment_report',
  },

  asset_tracking: {
    id: 'asset_tracking',
    name: 'Asset Tracking',
    description: 'Track valuable assets and their locations',
    category: 'assets',
    metaSchema: {
      assetId: { type: 'string', required: true, description: 'Asset identifier' },
      assetType: { type: 'string', required: true, description: 'Type of asset' },
      currentLocation: { type: 'string', required: true, description: 'Current location' },
      assignedTo: { type: 'string', description: 'Person assigned to' },
      purchaseDate: { type: 'date', description: 'Purchase date' },
      purchasePrice: { type: 'number', description: 'Purchase price' },
      currentValue: { type: 'number', description: 'Current estimated value' },
      depreciation: { type: 'number', calculated: true, formula: 'purchasePrice - currentValue' },
      warrantyExpires: { type: 'date', description: 'Warranty expiration date' },
      condition: { type: 'enum', values: ['excellent', 'good', 'fair', 'poor'] },
    },
    queryFields: ['assetId', 'assetType', 'currentLocation', 'assignedTo'],
    displayFields: ['assetId', 'assetType', 'currentLocation', 'currentValue'],
    reportTemplate: 'asset_summary',
  },

  quality_control: {
    id: 'quality_control',
    name: 'Quality Control',
    description: 'Track quality inspections and compliance',
    category: 'quality',
    metaSchema: {
      inspectionId: { type: 'string', required: true, description: 'Inspection ID' },
      inspectionType: { type: 'string', required: true, description: 'Type of inspection' },
      inspector: { type: 'string', required: true, description: 'Inspector name' },
      result: { type: 'enum', values: ['passed', 'failed', 'conditional'], required: true },
      score: { type: 'number', min: 0, max: 100, description: 'Quality score' },
      defectsFound: { type: 'number', default: 0, description: 'Number of defects' },
      correctionRequired: { type: 'boolean', default: false, description: 'Correction needed' },
      correctionDeadline: { type: 'date', description: 'Deadline for corrections' },
      standardsChecked: { type: 'array', items: { type: 'string' }, description: 'Standards verified' },
    },
    queryFields: ['inspectionType', 'inspector', 'result', 'score'],
    displayFields: ['inspectionId', 'inspectionType', 'result', 'score'],
    reportTemplate: 'quality_report',
  },

  maintenance_log: {
    id: 'maintenance_log',
    name: 'Maintenance Log',
    description: 'Log maintenance activities and repairs',
    category: 'maintenance',
    metaSchema: {
      maintenanceId: { type: 'string', required: true, description: 'Maintenance ID' },
      equipmentId: { type: 'string', required: true, description: 'Equipment serviced' },
      maintenanceType: { type: 'enum', values: ['preventive', 'corrective', 'emergency'], required: true },
      technician: { type: 'string', required: true, description: 'Technician name' },
      workPerformed: { type: 'string', required: true, description: 'Work performed' },
      partsUsed: { type: 'array', items: { type: 'object' }, description: 'Parts and materials used' },
      laborHours: { type: 'number', description: 'Labor hours' },
      laborCost: { type: 'number', description: 'Labor cost' },
      partsCost: { type: 'number', description: 'Parts cost' },
      totalCost: { type: 'number', calculated: true, formula: 'laborCost + partsCost' },
      nextMaintenance: { type: 'date', description: 'Next maintenance due' },
    },
    queryFields: ['equipmentId', 'maintenanceType', 'technician', 'workPerformed'],
    displayFields: ['maintenanceId', 'equipmentId', 'maintenanceType', 'totalCost'],
    reportTemplate: 'maintenance_summary',
  },

  customer_interaction: {
    id: 'customer_interaction',
    name: 'Customer Interaction',
    description: 'Track customer service interactions',
    category: 'customer_service',
    metaSchema: {
      interactionId: { type: 'string', required: true, description: 'Interaction ID' },
      customerId: { type: 'string', required: true, description: 'Customer ID' },
      interactionType: { type: 'enum', values: ['inquiry', 'complaint', 'compliment', 'support'], required: true },
      channel: { type: 'enum', values: ['phone', 'email', 'chat', 'in_person'], required: true },
      agent: { type: 'string', required: true, description: 'Agent handling interaction' },
      priority: { type: 'enum', values: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
      resolution: { type: 'string', description: 'Resolution provided' },
      resolutionTime: { type: 'number', description: 'Time to resolution in minutes' },
      satisfactionScore: { type: 'number', min: 1, max: 5, description: 'Customer satisfaction score' },
      followUpRequired: { type: 'boolean', default: false, description: 'Follow-up needed' },
    },
    queryFields: ['customerId', 'interactionType', 'channel', 'agent', 'priority'],
    displayFields: ['interactionId', 'customerId', 'interactionType', 'satisfactionScore'],
    reportTemplate: 'customer_service_report',
  },
}

export const getReportType = (messageType: string): ReportTypeDefinition | null => {
  return REPORT_TYPES[messageType] || null
}

export const getReportTypesByCategory = (category: string): ReportTypeDefinition[] => {
  return Object.values(REPORT_TYPES).filter(type => type.category === category)
}

export const getAllReportTypes = (): ReportTypeDefinition[] => {
  return Object.values(REPORT_TYPES)
}

export const validateMessageMeta = (messageType: string, meta: any): { valid: boolean; errors: string[] } => {
  const reportType = getReportType(messageType)
  if (!reportType) {
    return { valid: false, errors: ['Invalid message type'] }
  }

  const errors: string[] = []
  const schema = reportType.metaSchema

  // Check required fields
  for (const [field, config] of Object.entries(schema)) {
    if (config.required && (!meta[field] || meta[field] === '')) {
      errors.push(`Required field '${field}' is missing`)
    }
  }

  // Check field types and constraints
  for (const [field, value] of Object.entries(meta)) {
    const config = schema[field]
    if (!config) continue

    // Type validation
    if (config.type === 'number' && typeof value !== 'number') {
      errors.push(`Field '${field}' must be a number`)
    } else if (config.type === 'string' && typeof value !== 'string') {
      errors.push(`Field '${field}' must be a string`)
    } else if (config.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Field '${field}' must be a boolean`)
    } else if (config.type === 'date' && !(value instanceof Date)) {
      errors.push(`Field '${field}' must be a date`)
    }

    // Enum validation
    if (config.type === 'enum' && !config.values.includes(value)) {
      errors.push(`Field '${field}' must be one of: ${config.values.join(', ')}`)
    }

    // Range validation
    if (config.type === 'number' && typeof value === 'number') {
      if (config.min !== undefined && value < config.min) {
        errors.push(`Field '${field}' must be at least ${config.min}`)
      }
      if (config.max !== undefined && value > config.max) {
        errors.push(`Field '${field}' must be at most ${config.max}`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

export const calculateFields = (messageType: string, meta: any): any => {
  const reportType = getReportType(messageType)
  if (!reportType || !reportType.calculatedFields) {
    return meta
  }

  const calculatedMeta = { ...meta }
  
  for (const [field, formula] of Object.entries(reportType.calculatedFields)) {
    try {
      // Simple calculation for common patterns
      if (formula.includes('meta.endMileage - meta.startMileage')) {
        calculatedMeta[field] = (meta.endMileage || 0) - (meta.startMileage || 0)
      } else if (formula.includes('* meta.rate')) {
        const distance = (meta.endMileage || 0) - (meta.startMileage || 0)
        calculatedMeta[field] = distance * (meta.rate || 0)
      } else if (formula.includes('meta.quantity * meta.unitPrice')) {
        calculatedMeta[field] = (meta.quantity || 0) * (meta.unitPrice || 0)
      } else if (formula.includes('purchasePrice - currentValue')) {
        calculatedMeta[field] = (meta.purchasePrice || 0) - (meta.currentValue || 0)
      } else if (formula.includes('laborCost + partsCost')) {
        calculatedMeta[field] = (meta.laborCost || 0) + (meta.partsCost || 0)
      }
    } catch (error) {
      console.error(`Error calculating field ${field}:`, error)
    }
  }

  return calculatedMeta
}
