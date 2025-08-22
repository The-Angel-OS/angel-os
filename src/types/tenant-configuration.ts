// src/types/tenant-configuration.ts

export interface TenantConfiguration {
  memberships?: {
    userId: string;
    role: 'admin' | 'member' | 'viewer' | 'tenant_admin' | 'tenant_manager' | 'tenant_member'; // Expanded roles
    permissions?: string[]; // Specific permissions if not fully covered by role
    joinedAt: string;
    status?: 'active' | 'pending' | 'suspended' | 'revoked'; // Added from TenantMemberships
    // Consider adding tenant-specific profile info if needed directly here, like 'displayName' from TenantMemberships.tenantProfile
  }[];

  revenue?: { // This was RevenueSharing in the consolidation plan
    platformFee?: number; // This might be global or overridden here
    referralRate?: number; // Default referral rate for this tenant
    paymentMethods?: string[]; // Accepted payment methods (e.g., 'stripe', 'paypal')
    stripeAccountId?: string; // If tenant has their own Stripe Connect account for direct payouts

    // Fields from current Tenants.revenueSharing
    setupFee?: number;
    revenueShareRate?: number; // This seems more specific than platformFee
    partnershipTier?: 'standard' | 'preferred' | 'strategic' | 'enterprise' | 'referral_source';
    negotiatedTerms?: string;
    minimumMonthlyRevenue?: number;
    volumeDiscounts?: {
      threshold: number;
      discountRate: number;
    }[];
  };

  integrations?: {
    type: string; // e.g., 'google_analytics', 'mailchimp', 'slack'
    config: Record<string, any>; // API keys, settings, etc.
    isActive: boolean;
    lastSync?: string;
    // Consider adding fields specific to common integrations if they need to be queried
    // Example: googleAnalyticsId, mailchimpListId
  }[];

  businessSettings?: { // From original Tenants.configuration and other general settings
    businessType?: string; // e.g., 'dumpster-rental', 'salon', 'cactus-farm' (from Tenants.businessType)
    industry?: string; // Might overlap with businessType or be more specific
    features?: string[]; // Enabled features for the tenant (e.g., 'e-commerce', 'crm') (from Tenants.features)
    theme?: string; // Theme identifier or primary color (from Tenants.configuration.primaryColor)
    logoUrl?: string; // URL to tenant logo (from Tenants.configuration.logo)
    contactEmail?: string; // (from Tenants.configuration.contactEmail)
    contactPhone?: string; // (from Tenants.configuration.contactPhone)
    address?: { // (from Tenants.configuration.address)
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };

  // Fields from current Tenants.referralProgram
  referralProgram?: {
    referredByUserId?: string;
    referralCode?: string;
    referralCommissionRate?: number;
    referralTerms?: 'lifetime' | '12_months' | '24_months' | 'first_year';
    referralStatus?: 'active' | 'expired' | 'suspended';
  };

  // Fields from current Tenants.limits
  limits?: {
    maxUsers?: number;
    maxProducts?: number;
    maxStorageMb?: number; // Renamed for clarity
  }

  // Other general configuration for the tenant can be added here.
  // e.g., localization settings, notification preferences, etc.
}
