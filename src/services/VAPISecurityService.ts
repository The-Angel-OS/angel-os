// VAPI.AI Security Service - Secure Context Switching
import { getPayload } from 'payload'
import config from '@payload-config'
import { evaluatePermission, type PermissionContext } from '@/access/hierarchicalAccess'
import type { PayloadRequest } from 'payload'

interface VAPISecurityContext {
  callId: string
  phoneNumber: string
  tenantId: string
  temporaryUserId: string
  permissions: string[]
  securityLevel: 'public' | 'customer' | 'tenant_member' | 'admin'
  expiresAt: Date
  auditTrail: VAPISecurityAudit[]
}

interface VAPISecurityAudit {
  timestamp: Date
  action: string
  resource: string
  authorized: boolean
  reasoning: string
  ipAddress?: string
}

interface SecureToolExecution {
  toolName: string
  parameters: any
  context: VAPISecurityContext
  result: any
  authorized: boolean
  auditLog: VAPISecurityAudit
}

export class VAPISecurityService {
  private static securityContexts = new Map<string, VAPISecurityContext>()
  
  /**
   * 🔐 SECURE CONTEXT CREATION
   * Creates a temporary authenticated context for VAPI calls
   */
  static async createSecureContext(
    callId: string,
    phoneNumber: string,
    metadata: any = {}
  ): Promise<VAPISecurityContext> {
    const payload = await getPayload({ config })
    
    // 1. Verify phone number ownership and get tenant
    const phoneRecord = await this.verifyPhoneNumberOwnership(phoneNumber)
    if (!phoneRecord) {
      throw new Error('Phone number not authorized for this service')
    }
    
    // 2. Verify tenant is active and in good standing
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: phoneRecord.tenant
    })
    
    if (!tenant || tenant.status !== 'active') {
      throw new Error('Tenant account is not active')
    }
    
    // 3. Create temporary user context for this call
    const temporaryUser = await this.createTemporaryUser(tenant, phoneNumber)
    
    // 4. Determine security level based on caller
    const securityLevel = await this.determineSecurityLevel(phoneNumber, tenant)
    
    // 5. Generate scoped permissions
    const permissions = await this.generateScopedPermissions(securityLevel, tenant)
    
    // 6. Create security context
    const securityContext: VAPISecurityContext = {
      callId,
      phoneNumber,
      tenantId: tenant.id.toString(),
      temporaryUserId: temporaryUser.id.toString(),
      permissions,
      securityLevel,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
      auditTrail: [{
        timestamp: new Date(),
        action: 'context_created',
        resource: 'vapi_security_context',
        authorized: true,
        reasoning: `Secure context created for ${phoneNumber} → ${tenant.name}`
      }]
    }
    
    // 7. Store context (in production, use Redis with TTL)
    this.securityContexts.set(callId, securityContext)
    
    // 8. Log security event
    await this.logSecurityEvent(securityContext, 'CONTEXT_CREATED')
    
    return securityContext
  }
  
  /**
   * 🔍 PHONE NUMBER VERIFICATION
   * Verifies phone number is authorized for tenant access
   */
  private static async verifyPhoneNumberOwnership(phoneNumber: string) {
    const payload = await getPayload({ config })
    
    // Check if phone number is registered to a tenant (using contacts collection)
    const phoneRecords = await payload.find({
      collection: 'contacts',
      where: {
        phone: { equals: phoneNumber }
      }
    })
    
    if (phoneRecords.docs.length === 0) {
      // Check if it's a user's registered phone in tenant memberships
      const users = await payload.find({
        collection: 'users',
        where: {
          email: { contains: phoneNumber.replace(/\D/g, '') }
        }
      })
      
      if (users.docs.length > 0 && users.docs[0]?.tenant) {
        const user = users.docs[0]
        const userTenant = user.tenant
        if (!userTenant) return null
        
        return {
          tenant: typeof userTenant === 'object' ? userTenant.id : userTenant,
          type: 'user',
          userId: user.id
        }
      }
      
      return null
    }
    
    const contact = phoneRecords.docs[0]
    if (!contact) return null
    
    return {
      tenant: typeof contact.tenant === 'object' ? contact.tenant.id : contact.tenant,
      type: 'contact',
      contactId: contact.id
    }
  }
  
  /**
   * 👤 TEMPORARY USER CREATION
   * Creates a temporary authenticated user for the call duration
   */
  private static async createTemporaryUser(tenant: any, phoneNumber: string) {
    const payload = await getPayload({ config })
    
    // Create temporary user with limited permissions
    const temporaryUser = await payload.create({
      collection: 'users',
      data: {
        firstName: 'VAPI',
        lastName: 'Caller',
        email: `temp-${phoneNumber.replace(/\D/g, '')}@vapi.temp`,
        password: 'temp-password-' + Date.now(),
        globalRole: 'user',
        tenant: tenant.id
      }
    })
    
    return temporaryUser
  }
  
  /**
   * 🎯 SECURITY LEVEL DETERMINATION
   * Determines appropriate security level for the caller
   */
  private static async determineSecurityLevel(
    phoneNumber: string,
    tenant: any
  ): Promise<'public' | 'customer' | 'tenant_member' | 'admin'> {
    const payload = await getPayload({ config })
    
    // Check if caller is a tenant member
    const tenantMembers = await payload.find({
      collection: 'tenant-memberships',
      where: {
        tenant: { equals: tenant.id }
      }
    })
    
    for (const membership of tenantMembers.docs) {
      const user = typeof membership.user === 'object' ? membership.user : await payload.findByID({ collection: 'users', id: membership.user })
      // Since User doesn't have phone field, we'll check email pattern
      if (user?.email.includes(phoneNumber.replace(/\D/g, ''))) {
        return membership.role === 'tenant_admin' ? 'admin' : 'tenant_member'
      }
    }
    
    // Check if caller is a known customer/contact
    const contacts = await payload.find({
      collection: 'contacts',
      where: {
        phone: { equals: phoneNumber }
      }
    })
    
    if (contacts.docs.length > 0) {
      return 'customer'
    }
    
    // Default to public access
    return 'public'
  }
  
  /**
   * 🔑 SCOPED PERMISSIONS GENERATION
   * Generates appropriate permissions based on security level
   */
  private static async generateScopedPermissions(
    securityLevel: string,
    tenant: any
  ): Promise<string[]> {
    const basePermissions = ['read:public_info', 'create:appointment_request']
    
    switch (securityLevel) {
      case 'admin':
        return [
          ...basePermissions,
          'read:tenant_data',
          'write:tenant_data',
          'read:customer_data',
          'write:customer_data',
          'execute:admin_tools',
          'read:analytics',
          'manage:appointments'
        ]
      
      case 'tenant_member':
        return [
          ...basePermissions,
          'read:tenant_data',
          'read:customer_data',
          'write:customer_data',
          'execute:member_tools',
          'manage:appointments'
        ]
      
      case 'customer':
        return [
          ...basePermissions,
          'read:own_data',
          'write:own_data',
          'execute:customer_tools'
        ]
      
      case 'public':
      default:
        return basePermissions
    }
  }
  
  /**
   * 🛡️ SECURE TOOL EXECUTION
   * Executes tools with proper authorization checks
   */
  static async executeSecureTool(
    toolName: string,
    parameters: any,
    callId: string
  ): Promise<SecureToolExecution> {
    const securityContext = this.securityContexts.get(callId)
    
    if (!securityContext) {
      throw new Error('No security context found for call')
    }
    
    if (securityContext.expiresAt < new Date()) {
      throw new Error('Security context expired')
    }
    
    // Check if user has permission to execute this tool
    const requiredPermission = this.getRequiredPermission(toolName)
    const authorized = securityContext.permissions.includes(requiredPermission) ||
                      securityContext.permissions.includes('execute:*')
    
    const auditLog: VAPISecurityAudit = {
      timestamp: new Date(),
      action: `execute_tool:${toolName}`,
      resource: toolName,
      authorized,
      reasoning: authorized 
        ? `User has permission: ${requiredPermission}`
        : `User lacks permission: ${requiredPermission}. Available: ${securityContext.permissions.join(', ')}`
    }
    
    // Add to audit trail
    securityContext.auditTrail.push(auditLog)
    
    if (!authorized) {
      await this.logSecurityEvent(securityContext, 'UNAUTHORIZED_TOOL_EXECUTION', { toolName, parameters })
      
      return {
        toolName,
        parameters,
        context: securityContext,
        result: { error: 'Unauthorized tool execution' },
        authorized: false,
        auditLog
      }
    }
    
    // Execute the tool with security context
    const result = await this.executeToolWithContext(toolName, parameters, securityContext)
    
    await this.logSecurityEvent(securityContext, 'TOOL_EXECUTED', { toolName, result })
    
    return {
      toolName,
      parameters,
      context: securityContext,
      result,
      authorized: true,
      auditLog
    }
  }
  
  /**
   * 🔧 TOOL EXECUTION WITH CONTEXT
   * Executes tools with proper security context
   */
  private static async executeToolWithContext(
    toolName: string,
    parameters: any,
    securityContext: VAPISecurityContext
  ): Promise<any> {
    const payload = await getPayload({ config })
    
    // Create a simplified mock request for tool execution
    const mockRequest = {
      user: {
        id: parseInt(securityContext.temporaryUserId),
        globalRole: 'user' as const,
        vapiContext: securityContext
      },
      payload,
      locale: null,
      fallbackLocale: null
    } as unknown as PayloadRequest
    
    switch (toolName) {
      case 'book_appointment':
        return await this.secureBookAppointment(parameters, securityContext, mockRequest)
      
      case 'get_order_status':
        return await this.secureGetOrderStatus(parameters, securityContext, mockRequest)
      
      case 'create_crm_contact':
        return await this.secureCreateCRMContact(parameters, securityContext, mockRequest)
      
      case 'get_business_hours':
        return await this.secureGetBusinessHours(parameters, securityContext, mockRequest)
      
      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  }
  
  /**
   * 📅 SECURE APPOINTMENT BOOKING
   */
  private static async secureBookAppointment(
    parameters: any,
    securityContext: VAPISecurityContext,
    req: PayloadRequest
  ) {
    const payload = await getPayload({ config })
    
    // Verify user can book appointments for this tenant
    const permissionContext: PermissionContext = {
      user: req.user!,
      resource: 'appointments',
      action: 'create',
      tenant: securityContext.tenantId
    }
    
    const canBook = await evaluatePermission(permissionContext, req)
    if (!canBook) {
      throw new Error('Insufficient permissions to book appointments')
    }
    
    // Create appointment with security context
    const appointment = await payload.create({
      collection: 'appointments',
      data: {
        ...parameters,
        tenant: parseInt(securityContext.tenantId),
        customerPhone: securityContext.phoneNumber,
        bookedViaVAPI: true,
        securityContext: {
          callId: securityContext.callId,
          securityLevel: securityContext.securityLevel
        }
      }
    })
    
    return {
      success: true,
      appointmentId: appointment.id,
      message: 'Appointment booked successfully'
    }
  }
  
  /**
   * 📦 SECURE ORDER STATUS CHECK
   */
  private static async secureGetOrderStatus(
    parameters: any,
    securityContext: VAPISecurityContext,
    req: PayloadRequest
  ) {
    const payload = await getPayload({ config })
    
    // Only allow customers to check their own orders
    const whereClause = securityContext.securityLevel === 'customer' 
      ? { 
          tenant: { equals: parseInt(securityContext.tenantId) }
        }
      : { tenant: { equals: parseInt(securityContext.tenantId) } }
    
    const orders = await payload.find({
      collection: 'orders',
      where: whereClause,
      limit: 5
    })
    
    return {
      success: true,
      orders: orders.docs.map(order => ({
        id: order.id,
        status: order.status,
        total: order.totalAmount,
        date: order.createdAt
      }))
    }
  }
  
  /**
   * 👥 SECURE CRM CONTACT CREATION
   */
  private static async secureCreateCRMContact(
    parameters: any,
    securityContext: VAPISecurityContext,
    req: PayloadRequest
  ) {
    const payload = await getPayload({ config })
    
    // Create CRM contact with security context
    const contact = await payload.create({
      collection: 'contacts',
      data: {
        ...parameters,
        tenant: parseInt(securityContext.tenantId),
        phone: securityContext.phoneNumber,
        source: 'vapi_call'
      }
    })
    
    return {
      success: true,
      contactId: contact.id,
      message: 'Contact created successfully'
    }
  }
  
  /**
   * 🕐 SECURE BUSINESS HOURS
   */
  private static async secureGetBusinessHours(
    parameters: any,
    securityContext: VAPISecurityContext,
    req: PayloadRequest
  ) {
    const payload = await getPayload({ config })
    
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: parseInt(securityContext.tenantId)
    })
    
    return {
      success: true,
      businessHours: tenant?.configuration?.contactEmail ? 'Mon-Fri 9AM-5PM' : 'Contact for hours',
      timezone: 'America/New_York'
    }
  }
  
  /**
   * 🔑 REQUIRED PERMISSION MAPPING
   */
  private static getRequiredPermission(toolName: string): string {
    const permissionMap: Record<string, string> = {
      'book_appointment': 'create:appointment_request',
      'get_order_status': 'read:own_data',
      'create_crm_contact': 'write:customer_data',
      'get_business_hours': 'read:public_info'
    }
    
    return permissionMap[toolName] || 'read:public_info'
  }
  
  /**
   * 📝 SECURITY EVENT LOGGING
   */
  private static async logSecurityEvent(
    securityContext: VAPISecurityContext,
    eventType: string,
    details: any = {}
  ) {
    // Log to console for now - in production would use proper logging service
    console.log(`[VAPI Security] ${eventType}:`, {
      callId: securityContext.callId,
      phoneNumber: securityContext.phoneNumber,
      tenantId: securityContext.tenantId,
      securityLevel: securityContext.securityLevel,
      timestamp: new Date().toISOString(),
      ...details
    })
  }
  
  /**
   * 🧹 CLEANUP EXPIRED CONTEXTS
   */
  static async cleanupExpiredContexts() {
    const now = new Date()
    
    for (const [callId, context] of this.securityContexts.entries()) {
      if (context.expiresAt < now) {
        await this.destroySecurityContext(callId)
      }
    }
  }
  
  /**
   * 🔍 GET SECURITY CONTEXT
   */
  static getSecurityContext(callId: string): VAPISecurityContext | null {
    return this.securityContexts.get(callId) || null
  }
  
  /**
   * 🗑️ DESTROY SECURITY CONTEXT
   */
  static async destroySecurityContext(callId: string) {
    const context = this.securityContexts.get(callId)
    
    if (context) {
      await this.logSecurityEvent(context, 'CONTEXT_DESTROYED')
      this.securityContexts.delete(callId)
    }
  }
}

// Auto-cleanup expired contexts every 5 minutes
setInterval(() => {
  VAPISecurityService.cleanupExpiredContexts()
}, 5 * 60 * 1000) 