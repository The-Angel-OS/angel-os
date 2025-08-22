import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."content_access" AS ENUM('premium_posts', 'exclusive_videos', 'private_messages', 'live_streams', 'custom_content', 'early_access');
  CREATE TYPE "public"."ai_factors" AS ENUM('velocity', 'engagement', 'quality', 'platform-value', 'market', 'competitive');
  CREATE TYPE "public"."enum_tenants_business_type" AS ENUM('dumpster-rental', 'bedbug-treatment', 'salon', 'cactus-farm', 'retail', 'service', 'other');
  CREATE TYPE "public"."enum_tenants_revenue_sharing_partnership_tier" AS ENUM('standard', 'preferred', 'strategic', 'enterprise', 'referral_source');
  CREATE TYPE "public"."enum_tenants_referral_program_referral_terms" AS ENUM('lifetime', '12_months', '24_months', 'first_year');
  CREATE TYPE "public"."enum_tenants_referral_program_referral_status" AS ENUM('active', 'expired', 'suspended');
  CREATE TYPE "public"."enum_tenants_status" AS ENUM('active', 'setup', 'suspended', 'archived');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor', 'contributor', 'subscriber', 'guardian_angel');
  CREATE TYPE "public"."enum_users_karma_contribution_types" AS ENUM('content_creation', 'community_support', 'technical_contribution', 'mentorship', 'justice_advocacy', 'guardian_angel');
  CREATE TYPE "public"."enum_users_karma_recognitions_type" AS ENUM('helpful_response', 'quality_content', 'community_leadership', 'technical_excellence', 'guardian_angel_action');
  CREATE TYPE "public"."enum_users_tenant_memberships_permissions" AS ENUM('manage_content', 'manage_products', 'manage_forms', 'view_analytics', 'manage_users', 'manage_settings');
  CREATE TYPE "public"."enum_users_tenant_memberships_role" AS ENUM('owner', 'admin', 'editor', 'contributor', 'viewer');
  CREATE TYPE "public"."enum_users_preferences_privacy_profile_visibility" AS ENUM('public', 'members', 'private');
  CREATE TYPE "public"."enum_workflows_steps_type" AS ENUM('create_record', 'update_record', 'send_email', 'send_sms', 'api_call', 'ai_analysis', 'conditional', 'delay', 'custom_function');
  CREATE TYPE "public"."enum_workflows_steps_target_collection" AS ENUM('posts', 'pages', 'products', 'messages', 'forms', 'users', 'orders');
  CREATE TYPE "public"."enum_workflows_steps_automation" AS ENUM('automated', 'human_review', 'ai_assisted', 'manual');
  CREATE TYPE "public"."enum_workflows_ethical_framework_value_alignment" AS ENUM('guardian_angel', 'justice_advocacy', 'economic_empowerment', 'community_building', 'transparency', 'privacy_protection');
  CREATE TYPE "public"."enum_workflows_status" AS ENUM('active', 'paused', 'draft', 'archived');
  CREATE TYPE "public"."enum_workflows_trigger_collection" AS ENUM('posts', 'pages', 'products', 'messages', 'forms', 'users', 'orders');
  CREATE TYPE "public"."enum_workflows_trigger_event" AS ENUM('created', 'updated', 'deleted', 'published', 'status_changed', 'custom');
  CREATE TYPE "public"."enum_workflows_business_context_department" AS ENUM('sales', 'marketing', 'operations', 'support', 'finance', 'hr');
  CREATE TYPE "public"."enum_workflows_business_context_process" AS ENUM('lead_generation', 'customer_onboarding', 'order_processing', 'content_publishing', 'customer_support', 'project_management', 'quality_assurance', 'compliance');
  CREATE TYPE "public"."enum_workflows_business_context_priority" AS ENUM('low', 'normal', 'high', 'critical');
  CREATE TYPE "public"."enum_workflows_scheduling_timezone" AS ENUM('UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles');
  CREATE TYPE "public"."enum_tenant_memberships_permissions" AS ENUM('manage_users', 'manage_spaces', 'manage_content', 'manage_products', 'manage_orders', 'view_analytics', 'manage_settings', 'manage_billing', 'export_data');
  CREATE TYPE "public"."enum_tenant_memberships_role" AS ENUM('tenant_admin', 'tenant_manager', 'tenant_member');
  CREATE TYPE "public"."enum_tenant_memberships_status" AS ENUM('active', 'pending', 'suspended', 'revoked');
  CREATE TYPE "public"."enum_space_memberships_custom_permissions" AS ENUM('post_messages', 'upload_files', 'create_events', 'moderate_content', 'manage_members', 'view_analytics', 'manage_bookings', 'access_private');
  CREATE TYPE "public"."enum_space_memberships_role" AS ENUM('space_admin', 'moderator', 'member', 'guest');
  CREATE TYPE "public"."enum_space_memberships_status" AS ENUM('active', 'pending', 'suspended', 'left', 'banned');
  CREATE TYPE "public"."enum_space_memberships_crm_data_customer_tier" AS ENUM('prospect', 'lead', 'customer', 'vip');
  CREATE TYPE "public"."enum_appointments_timezone" AS ENUM('America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'UTC', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo');
  CREATE TYPE "public"."enum_appointments_recurrence_type" AS ENUM('daily', 'weekly', 'monthly');
  CREATE TYPE "public"."enum_appointments_meeting_type" AS ENUM('in_person', 'video_call', 'phone_call', 'hybrid');
  CREATE TYPE "public"."enum_appointments_appointment_type" AS ENUM('standard_install', 'custom_install', 'quote_consultation', 'mobile_service', 'beauty_service', 'barber_service', 'auto_repair', 'diagnostic', 'general_meeting', 'consultation');
  CREATE TYPE "public"."enum_appointments_status" AS ENUM('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show');
  CREATE TYPE "public"."enum_appointments_revenue_tracking_source" AS ENUM('system_generated', 'pickup_job', 'referral_source', 'repeat_customer');
  CREATE TYPE "public"."enum_appointments_payment_currency" AS ENUM('usd', 'eur', 'gbp', 'cad');
  CREATE TYPE "public"."enum_appointments_payment_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');
  CREATE TYPE "public"."enum_contacts_addresses_type" AS ENUM('billing', 'shipping', 'office', 'home', 'other');
  CREATE TYPE "public"."enum_contacts_addresses_country" AS ENUM('US', 'CA', 'GB', 'AU');
  CREATE TYPE "public"."enum_contacts_type" AS ENUM('customer', 'lead', 'partner', 'vendor', 'team', 'other');
  CREATE TYPE "public"."enum_contacts_preferences_preferred_contact_time" AS ENUM('morning', 'afternoon', 'evening', 'anytime');
  CREATE TYPE "public"."enum_contacts_crm_status" AS ENUM('cold', 'warm', 'hot', 'customer', 'inactive');
  CREATE TYPE "public"."enum_contacts_crm_source" AS ENUM('website', 'referral', 'social', 'event', 'advertisement', 'direct', 'other');
  CREATE TYPE "public"."enum_messages_message_type" AS ENUM('user', 'leo', 'system', 'action', 'intelligence');
  CREATE TYPE "public"."enum_messages_priority" AS ENUM('low', 'normal', 'high', 'urgent');
  CREATE TYPE "public"."enum_spaces_commerce_settings_payment_methods" AS ENUM('credit_cards', 'paypal', 'bank_transfer', 'cod', 'crypto');
  CREATE TYPE "public"."enum_spaces_commerce_settings_shipping_zones" AS ENUM('local', 'domestic', 'international', 'pickup');
  CREATE TYPE "public"."enum_sub_tiers_currency" AS ENUM('usd', 'eur', 'gbp');
  CREATE TYPE "public"."enum_spaces_integrations_print_partners_product_catalog" AS ENUM('tshirts', 'mugs', 'stickers', 'posters', 'hoodies');
  CREATE TYPE "public"."enum_spaces_integrations_social_bots_platforms" AS ENUM('facebook', 'instagram', 'twitter', 'bluesky', 'threads', 'linkedin', 'angellist', 'crunchbase', 'youtube', 'tiktok', 'snapchat', 'pinterest', 'patreon', 'onlyfans', 'substack', 'whatsapp', 'telegram', 'discord', 'slack', 'mastodon', 'bereal', 'clubhouse', 'twitch', 'wechat', 'line', 'weibo', 'vkontakte', 'shopify_social', 'etsy', 'amazon_seller', 'ebay', 'medium', 'dev_to', 'hashnode', 'reddit', 'quora', 'vimeo', 'rumble', 'odysee', 'perplexity', 'character_ai', 'poe');
  CREATE TYPE "public"."enum_spaces_business_identity_type" AS ENUM('business', 'creator', 'service', 'retail', 'manufacturing');
  CREATE TYPE "public"."enum_spaces_business_identity_industry" AS ENUM('general', 'content-creation', 'automotive', 'agriculture', 'food-beverage', 'professional-services', 'retail', 'technology', 'healthcare', 'education');
  CREATE TYPE "public"."enum_spaces_business_identity_company_size" AS ENUM('solo', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_spaces_business_identity_target_market" AS ENUM('local', 'national', 'international', 'online');
  CREATE TYPE "public"."rev_type" AS ENUM('standard', 'negotiated', 'performance', 'volume', 'ai-optimized');
  CREATE TYPE "public"."enum_spaces_integrations_scheduling_time_slots" AS ENUM('30', '60', '120', '240');
  CREATE TYPE "public"."enum_spaces_visibility" AS ENUM('public', 'invite_only', 'private');
  CREATE TYPE "public"."enum_spaces_member_approval" AS ENUM('automatic', 'manual', 'disabled');
  CREATE TYPE "public"."enum_web_chat_sessions_status" AS ENUM('active', 'waiting', 'agent_connected', 'resolved', 'abandoned');
  CREATE TYPE "public"."enum_channel_management_channel_type" AS ENUM('customer_support', 'sales_inquiries', 'technical_support', 'billing', 'general');
  CREATE TYPE "public"."enum_channel_management_status" AS ENUM('active', 'inactive', 'maintenance');
  CREATE TYPE "public"."enum_channel_management_category" AS ENUM('business', 'customer_service', 'collections', 'logs', 'system', 'custom');
  CREATE TYPE "public"."enum_channel_management_color" AS ENUM('blue', 'green', 'orange', 'purple', 'red', 'yellow', 'gray');
  CREATE TYPE "public"."enum_social_media_bots_status" AS ENUM('active', 'paused', 'inactive', 'error');
  CREATE TYPE "public"."enum_linked_accounts_provider" AS ENUM('twitter', 'linkedin', 'facebook', 'instagram', 'youtube', 'tiktok', 'discord', 'whatsapp', 'telegram', 'github');
  CREATE TYPE "public"."enum_linked_accounts_status" AS ENUM('active', 'expired', 'revoked', 'error');
  CREATE TYPE "public"."enum_invoices_payment_methods" AS ENUM('card', 'bank_transfer', 'paypal', 'crypto');
  CREATE TYPE "public"."enum_invoices_status" AS ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled');
  CREATE TYPE "public"."enum_documents_signers_role" AS ENUM('tenant', 'landlord', 'client', 'contractor', 'custom');
  CREATE TYPE "public"."enum_documents_signers_status" AS ENUM('pending', 'signed', 'declined');
  CREATE TYPE "public"."enum_documents_signers_signature_type" AS ENUM('drawn', 'typed', 'uploaded');
  CREATE TYPE "public"."enum_documents_type" AS ENUM('rental_agreement', 'service_contract', 'nda', 'custom');
  CREATE TYPE "public"."enum_documents_status" AS ENUM('draft', 'sent', 'partially_signed', 'completed', 'expired', 'cancelled');
  CREATE TYPE "public"."enum_donations_cause" AS ENUM('disaster_relief', 'education', 'healthcare', 'environment', 'community', 'creator', 'general');
  CREATE TYPE "public"."enum_donations_payment_method" AS ENUM('card', 'paypal', 'bank_transfer', 'crypto');
  CREATE TYPE "public"."enum_donations_status" AS ENUM('pending', 'completed', 'failed', 'refunded');
  CREATE TYPE "public"."enum_donations_recurring_frequency" AS ENUM('monthly', 'quarterly', 'annually');
  CREATE TYPE "public"."enum_products_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_products_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_products_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_products_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_products_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_products_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_products_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_products_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_products_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum_products_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_products_product_type" AS ENUM('ai_print_demand', 'consultation_solo', 'group_event', 'livekit_stream', 'digital_download', 'physical', 'subscription', 'course_training', 'business_service', 'automation');
  CREATE TYPE "public"."enum_products_pricing_currency" AS ENUM('USD', 'EUR', 'GBP', 'CAD');
  CREATE TYPE "public"."enum_products_details_dimensions_unit" AS ENUM('in', 'cm', 'ft', 'm');
  CREATE TYPE "public"."enum_products_service_details_location" AS ENUM('onsite', 'remote', 'customer', 'flexible');
  CREATE TYPE "public"."enum_products_shipping_shipping_class" AS ENUM('standard', 'heavy', 'fragile', 'hazardous', 'cold');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__products_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__products_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__products_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__products_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__products_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__products_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__products_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__products_v_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum__products_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__products_v_version_product_type" AS ENUM('ai_print_demand', 'consultation_solo', 'group_event', 'livekit_stream', 'digital_download', 'physical', 'subscription', 'course_training', 'business_service', 'automation');
  CREATE TYPE "public"."enum__products_v_version_pricing_currency" AS ENUM('USD', 'EUR', 'GBP', 'CAD');
  CREATE TYPE "public"."enum__products_v_version_details_dimensions_unit" AS ENUM('in', 'cm', 'ft', 'm');
  CREATE TYPE "public"."enum__products_v_version_service_details_location" AS ENUM('onsite', 'remote', 'customer', 'flexible');
  CREATE TYPE "public"."enum__products_v_version_shipping_shipping_class" AS ENUM('standard', 'heavy', 'fragile', 'hazardous', 'cold');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('pending', 'authorized', 'captured', 'partially_refunded', 'refunded', 'failed');
  CREATE TYPE "public"."enum_orders_payment_details_payment_method" AS ENUM('credit_card', 'paypal', 'stripe', 'bank_transfer', 'crypto');
  CREATE TYPE "public"."enum_orders_fulfillment_method" AS ENUM('digital', 'physical', 'service', 'pickup');
  CREATE TYPE "public"."enum_orders_fulfillment_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'completed');
  CREATE TYPE "public"."enum_orders_fulfillment_carrier" AS ENUM('ups', 'fedex', 'usps', 'dhl', 'other');
  CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_categories_business_type" AS ENUM('physical', 'digital', 'services', 'experiences', 'consultations', 'mixed');
  CREATE TYPE "public"."enum_categories_settings_default_sort" AS ENUM('featured', 'newest', 'price_asc', 'price_desc', 'name');
  CREATE TYPE "public"."enum_organizations_members_role" AS ENUM('org_admin', 'location_manager', 'provider', 'staff', 'viewer');
  CREATE TYPE "public"."enum_organizations_members_access_level" AS ENUM('full', 'limited', 'readonly');
  CREATE TYPE "public"."enum_organizations_ops_settings_hours_schedule_day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_organizations_integration_websites_purpose" AS ENUM('main', 'booking', 'directory', 'patient_portal', 'mobile', 'admin');
  CREATE TYPE "public"."enum_organizations_organization_type" AS ENUM('medical_network', 'franchise_system', 'mobile_service', 'multi_location', 'service_marketplace', 'professional_services');
  CREATE TYPE "public"."enum_organizations_crm_integration_crm_type" AS ENUM('epic', 'salesforce', 'hubspot', 'custom', 'other');
  CREATE TYPE "public"."enum_organizations_crm_integration_sync_schedule" AS ENUM('realtime', 'hourly', 'daily', 'weekly', 'manual');
  CREATE TYPE "public"."enum_organizations_crm_integration_sync_status" AS ENUM('success', 'warning', 'error', 'never');
  CREATE TYPE "public"."enum_organizations_analytics_frequency" AS ENUM('realtime', 'daily', 'weekly', 'monthly');
  CREATE TYPE "public"."enum_organizations_status" AS ENUM('active', 'inactive', 'suspended', 'pending');
  CREATE TYPE "public"."enum_venues_business_hours_schedule_day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_venues_staff_schedule_availability_day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_venues_staff_role" AS ENUM('venue_manager', 'car_audio_installer', 'beauty_technician', 'barber_stylist', 'auto_mechanic', 'medical_provider', 'nurse', 'admin_staff', 'technician', 'service_provider', 'sales_rep', 'customer_service');
  CREATE TYPE "public"."enum_venues_services_service_type" AS ENUM('standard_install', 'custom_install', 'quote_consultation', 'mobile_service', 'beauty_service', 'barber_service', 'auto_repair', 'diagnostic', 'general_service');
  CREATE TYPE "public"."enum_venues_bay_management_bays_bay_type" AS ENUM('install_bay', 'service_bay', 'beauty_chair', 'barber_chair', 'wash_station', 'diagnostic_station', 'general_workstation');
  CREATE TYPE "public"."enum_venues_integrations_payment_methods_type" AS ENUM('credit_card', 'debit_card', 'ach', 'cash', 'check', 'insurance');
  CREATE TYPE "public"."enum_venues_venue_type" AS ENUM('car_audio_shop', 'beauty_shop', 'barber_shop', 'auto_shop', 'medical_practice', 'franchise_location', 'service_territory', 'mobile_route', 'corporate_office', 'warehouse', 'retail', 'virtual');
  CREATE TYPE "public"."enum_venues_integrations_booking_system_booking_system_type" AS ENUM('internal', 'epic', 'inquicker', 'acuity', 'calendly', 'custom');
  CREATE TYPE "public"."enum_venues_status" AS ENUM('active', 'inactive', 'temp_closed', 'under_construction', 'pending', 'suspended');
  CREATE TYPE "public"."enum_business_agents_ops_hours_schedule_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_business_agents_ops_handoff_triggers_trigger" AS ENUM('human_request', 'technical_issue', 'complaint', 'custom_order', 'price_negotiation', 'after_hours');
  CREATE TYPE "public"."enum_business_agents_humanitarian_legal_databases" AS ENUM('court_records', 'precedents', 'appeals', 'innocence', 'reform');
  CREATE TYPE "public"."enum_business_agents_humanitarian_news_curation_content_filters" AS ENUM('legal_reform', 'success_stories', 'educational', 'mental_health', 'family', 'employment');
  CREATE TYPE "public"."enum_business_agents_humanitarian_resources_vendors_type" AS ENUM('books', 'education', 'legal', 'care', 'communication');
  CREATE TYPE "public"."enum_business_agents_humanitarian_avatar_scope" AS ENUM('family', 'legal', 'education', 'social', 'employment', 'housing');
  CREATE TYPE "public"."enum_business_agents_vapi_integration_allowed_actions" AS ENUM('book_appointments', 'take_orders', 'answer_questions', 'transfer_human', 'schedule_callbacks', 'collect_leads');
  CREATE TYPE "public"."enum_business_agents_spirit_type" AS ENUM('primary', 'service', 'product', 'creative', 'community', 'support');
  CREATE TYPE "public"."enum_business_agents_personality_communication_style" AS ENUM('professional', 'friendly', 'nurturing', 'energetic', 'wise', 'creative', 'direct');
  CREATE TYPE "public"."enum_business_agents_ai_style_formality" AS ENUM('very_casual', 'casual', 'semi_formal', 'formal', 'very_formal');
  CREATE TYPE "public"."enum_business_agents_agent_type" AS ENUM('business', 'customer_service', 'sales', 'content', 'community', 'legal_advocate', 'incarcerated_angel', 'displaced_support', 'crisis', 'guardian');
  CREATE TYPE "public"."enum_business_agents_humanitarian_news_curation_positivity_bias" AS ENUM('balanced', 'hopeful', 'solutions', 'inspiring');
  CREATE TYPE "public"."enum_business_agents_vapi_integration_voice_id" AS ENUM('pNInz6obpgDQGcFmaJgB', 'EXAVITQu4vr4xnSDxMaL', 'ErXwobaYiN019PkySvjV', 'VR6AewLTigWG4xSOukaG');
  CREATE TYPE "public"."enum_business_agents_vapi_integration_status" AS ENUM('active', 'inactive', 'acquiring', 'error');
  CREATE TYPE "public"."enum_humanitarian_agents_legal_advocacy_legal_databases" AS ENUM('court_records', 'appeals', 'innocence', 'legal_aid');
  CREATE TYPE "public"."enum_humanitarian_agents_spirit_type" AS ENUM('incarcerated_angel', 'displaced_support', 'legal_advocate', 'crisis', 'guardian');
  CREATE TYPE "public"."enum_humanitarian_agents_news_curation_hope_bias" AS ENUM('maximum_hope', 'balanced_hope', 'solutions');
  CREATE TYPE "public"."enum_ai_generation_queue_parameters_text_elements_emphasis" AS ENUM('primary', 'secondary', 'accent');
  CREATE TYPE "public"."enum_ai_generation_queue_generation_type" AS ENUM('merchandise_design', 'social_content', 'product_description', 'blog_post', 'marketing_copy');
  CREATE TYPE "public"."enum_ai_generation_queue_parameters_product_type" AS ENUM('coffee_mug', 't_shirt', 'sticker_pack', 'poster', 'hoodie', 'phone_case');
  CREATE TYPE "public"."enum_ai_generation_queue_parameters_style_guide" AS ENUM('modern', 'vintage', 'bold', 'minimalist', 'handdrawn');
  CREATE TYPE "public"."enum_ai_generation_queue_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'cancelled');
  CREATE TYPE "public"."enum_ai_generation_queue_approval_status" AS ENUM('pending', 'approved', 'revision', 'rejected');
  CREATE TYPE "public"."enum_job_queue_status" AS ENUM('pending', 'processing', 'completed', 'failed');
  CREATE TYPE "public"."enum_channels_channel_type" AS ENUM('photo_analysis', 'document_processing', 'data_collection', 'monitoring', 'intelligence_gathering', 'economic_analysis');
  CREATE TYPE "public"."enum_channels_report_type" AS ENUM('mileage_log', 'collection_inventory', 'business_inventory', 'equipment_status', 'asset_tracking', 'quality_control', 'maintenance_log', 'customer_interaction', 'general');
  CREATE TYPE "public"."enum_channels_feed_configuration_feed_source" AS ENUM('google_photos', 'google_drive', 'onedrive', 'dropbox', 'amazon_s3', 'manual_upload', 'api_webhook');
  CREATE TYPE "public"."enum_channels_economics_phyle_affiliation" AS ENUM('collector_phyle', 'logistics_phyle', 'analyst_phyle', 'maintenance_phyle', 'quality_phyle', 'customer_service_phyle', 'independent_agent');
  CREATE TYPE "public"."enum_channels_economics_model_sharing" AS ENUM('fixed_fee', 'percentage_split', 'performance_based', 'subscription', 'phyle_collective');
  CREATE TYPE "public"."enum_channels_processing_rules_output_format" AS ENUM('json', 'csv', 'pdf', 'excel');
  CREATE TYPE "public"."enum_channels_status" AS ENUM('active', 'paused', 'maintenance', 'deprecated');
  CREATE TYPE "public"."enum_phyles_membership_criteria_skill_requirements_level" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');
  CREATE TYPE "public"."enum_phyles_inter_phyle_relations_alliances_alliance_type" AS ENUM('trade_partnership', 'service_exchange', 'information_sharing', 'mutual_defense', 'research_collaboration');
  CREATE TYPE "public"."enum_phyles_phyle_type" AS ENUM('collector_phyle', 'logistics_phyle', 'analyst_phyle', 'maintenance_phyle', 'quality_phyle', 'customer_service_phyle', 'research_phyle', 'security_phyle');
  CREATE TYPE "public"."enum_phyles_economic_structure_taxation_model" AS ENUM('flat_fee', 'percentage_tax', 'progressive_tax', 'contribution_based', 'collective_ownership');
  CREATE TYPE "public"."enum_phyles_economic_structure_wealth_distribution" AS ENUM('merit_based', 'equal_distribution', 'rank_hierarchy', 'contribution_weighted', 'reputation_weighted');
  CREATE TYPE "public"."enum_phyles_governance_governance_model" AS ENUM('democratic', 'meritocratic', 'hierarchical', 'consensus', 'algorithmic');
  CREATE TYPE "public"."enum_phyles_status" AS ENUM('active', 'forming', 'restructuring', 'dormant', 'dissolved');
  CREATE TYPE "public"."enum_agent_reputation_reputation_history_event_type" AS ENUM('quality_work', 'fast_completion', 'customer_satisfaction', 'peer_recognition', 'leadership', 'innovation', 'reliability', 'collaboration');
  CREATE TYPE "public"."enum_agent_reputation_achievements_achievement" AS ENUM('first_task', 'hundred_tasks', 'thousand_tasks', 'perfect_week', 'speed_demon', 'customer_favorite', 'mentor', 'innovator', 'phyle_champion');
  CREATE TYPE "public"."enum_agent_reputation_specializations_proficiency_level" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');
  CREATE TYPE "public"."enum_agent_reputation_rank" AS ENUM('legendary', 'master', 'expert', 'professional', 'competent', 'apprentice', 'novice', 'beginner');
  CREATE TYPE "public"."enum_agent_reputation_status" AS ENUM('active', 'inactive', 'probation', 'suspended', 'retired');
  CREATE TYPE "public"."enum_inventory_messages_message_type" AS ENUM('mileage_log', 'collection_inventory', 'business_inventory', 'equipment_status', 'asset_tracking', 'quality_control', 'maintenance_log', 'customer_interaction', 'general');
  CREATE TYPE "public"."enum_inventory_messages_status" AS ENUM('pending', 'processed', 'verified', 'archived');
  CREATE TYPE "public"."enum_inventory_messages_priority" AS ENUM('low', 'normal', 'high', 'critical');
  CREATE TYPE "public"."enum_photo_analysis_sequence_type" AS ENUM('mileage_log', 'collection_inventory', 'business_inventory', 'general');
  CREATE TYPE "public"."enum_mileage_logs_type" AS ENUM('business', 'personal');
  CREATE TYPE "public"."enum_quote_requests_service_type" AS ENUM('junk_removal', 'handyman', 'cleaning', 'moving', 'other');
  CREATE TYPE "public"."enum_quote_requests_status" AS ENUM('pending', 'quoted', 'accepted', 'declined', 'expired');
  CREATE TYPE "public"."enum_quote_requests_priority" AS ENUM('low', 'normal', 'high', 'urgent');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "tenants_revenue_sharing_volume_discounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"threshold" numeric NOT NULL,
  	"discount_rate" numeric NOT NULL
  );
  
  CREATE TABLE "tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"domain" varchar,
  	"subdomain" varchar,
  	"business_type" "enum_tenants_business_type" DEFAULT 'other' NOT NULL,
  	"revenue_sharing_setup_fee" numeric DEFAULT 299,
  	"revenue_sharing_revenue_share_rate" numeric DEFAULT 3,
  	"revenue_sharing_partnership_tier" "enum_tenants_revenue_sharing_partnership_tier" DEFAULT 'standard',
  	"revenue_sharing_negotiated_terms" varchar,
  	"revenue_sharing_minimum_monthly_revenue" numeric,
  	"referral_program_referred_by_id" integer,
  	"referral_program_referral_code" varchar,
  	"referral_program_referral_commission_rate" numeric DEFAULT 30,
  	"referral_program_referral_terms" "enum_tenants_referral_program_referral_terms" DEFAULT 'lifetime',
  	"referral_program_referral_status" "enum_tenants_referral_program_referral_status" DEFAULT 'active',
  	"revenue_tracking_monthly_revenue" numeric,
  	"revenue_tracking_total_revenue" numeric,
  	"revenue_tracking_last_revenue_calculation" timestamp(3) with time zone,
  	"revenue_tracking_commissions_paid" numeric,
  	"revenue_tracking_current_effective_rate" numeric,
  	"status" "enum_tenants_status" DEFAULT 'setup' NOT NULL,
  	"configuration_primary_color" varchar DEFAULT '#3b82f6',
  	"configuration_logo_id" integer,
  	"configuration_favicon_id" integer,
  	"configuration_contact_email" varchar,
  	"configuration_contact_phone" varchar,
  	"configuration_address_street" varchar,
  	"configuration_address_city" varchar,
  	"configuration_address_state" varchar,
  	"configuration_address_zip_code" varchar,
  	"configuration_address_country" varchar DEFAULT 'US',
  	"features_ecommerce" boolean DEFAULT true,
  	"features_spaces" boolean DEFAULT true,
  	"features_crm" boolean DEFAULT true,
  	"features_vapi" boolean DEFAULT false,
  	"features_n8n" boolean DEFAULT false,
  	"features_member_portal" boolean DEFAULT false,
  	"limits_max_users" numeric DEFAULT 10,
  	"limits_max_products" numeric DEFAULT 100,
  	"limits_max_storage" numeric DEFAULT 1000,
  	"json_data" jsonb,
  	"_migrationstatus_json_migrated" boolean DEFAULT false,
  	"_migrationstatus_migrated_at" timestamp(3) with time zone,
  	"_migrationstatus_migration_version" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_karma_contribution_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_karma_contribution_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_karma_recognitions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_users_karma_recognitions_type" NOT NULL,
  	"points" numeric NOT NULL,
  	"reason" varchar,
  	"awarded_by_id" integer,
  	"awarded_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_tenant_memberships_permissions" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_users_tenant_memberships_permissions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_tenant_memberships" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"role" "enum_users_tenant_memberships_role",
  	"joined_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"profile_image_id" integer,
  	"tenant_id" integer,
  	"karma_score" numeric DEFAULT 0,
  	"karma_guardian_angel_status" boolean DEFAULT false,
  	"preferences_notifications_email" boolean DEFAULT true,
  	"preferences_notifications_in_app" boolean DEFAULT true,
  	"preferences_notifications_guardian_angel_alerts" boolean DEFAULT false,
  	"preferences_privacy_profile_visibility" "enum_users_preferences_privacy_profile_visibility" DEFAULT 'members',
  	"preferences_privacy_karma_score_visible" boolean DEFAULT true,
  	"last_login_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"_verified" boolean,
  	"_verificationtoken" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "workflows_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_workflows_steps_type" NOT NULL,
  	"config" jsonb NOT NULL,
  	"target_collection" "enum_workflows_steps_target_collection",
  	"automation" "enum_workflows_steps_automation" DEFAULT 'human_review' NOT NULL,
  	"ai_assisted" boolean DEFAULT false,
  	"retry_config_max_retries" numeric DEFAULT 3,
  	"retry_config_retry_delay" numeric DEFAULT 300,
  	"order" numeric NOT NULL
  );
  
  CREATE TABLE "workflows_ethical_framework_bias_checkpoints" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"checkpoint" varchar NOT NULL,
  	"step_number" numeric NOT NULL
  );
  
  CREATE TABLE "workflows_ethical_framework_value_alignment" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_workflows_ethical_framework_value_alignment",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "workflows_change_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"version" numeric NOT NULL,
  	"changes" varchar NOT NULL,
  	"changed_by_id" integer NOT NULL,
  	"changed_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "workflows" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"tenant_id" integer NOT NULL,
  	"status" "enum_workflows_status" DEFAULT 'draft' NOT NULL,
  	"trigger_collection" "enum_workflows_trigger_collection" NOT NULL,
  	"trigger_event" "enum_workflows_trigger_event" NOT NULL,
  	"trigger_conditions" jsonb,
  	"trigger_custom_event_name" varchar,
  	"business_context_department" "enum_workflows_business_context_department",
  	"business_context_process" "enum_workflows_business_context_process",
  	"business_context_priority" "enum_workflows_business_context_priority" DEFAULT 'normal' NOT NULL,
  	"ethical_framework_human_approval_required" boolean DEFAULT false,
  	"ethical_framework_guardian_angel_trigger" boolean DEFAULT false,
  	"performance_execution_count" numeric DEFAULT 0,
  	"performance_success_count" numeric DEFAULT 0,
  	"performance_failure_count" numeric DEFAULT 0,
  	"performance_average_execution_time" numeric DEFAULT 0,
  	"performance_last_executed_at" timestamp(3) with time zone,
  	"notifications_notify_on_success" boolean DEFAULT false,
  	"notifications_notify_on_failure" boolean DEFAULT true,
  	"notifications_slack_webhook" varchar,
  	"scheduling_is_scheduled" boolean DEFAULT false,
  	"scheduling_cron_expression" varchar,
  	"scheduling_timezone" "enum_workflows_scheduling_timezone" DEFAULT 'UTC',
  	"version" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workflows_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "tenant_memberships_permissions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_tenant_memberships_permissions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "tenant_memberships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"role" "enum_tenant_memberships_role" DEFAULT 'tenant_member' NOT NULL,
  	"joined_at" timestamp(3) with time zone NOT NULL,
  	"invited_by_id" integer,
  	"status" "enum_tenant_memberships_status" DEFAULT 'pending' NOT NULL,
  	"tenant_profile_display_name" varchar,
  	"tenant_profile_tenant_bio" varchar,
  	"tenant_profile_department" varchar,
  	"tenant_profile_position" varchar,
  	"invitation_details_invitation_token" varchar,
  	"invitation_details_invitation_expires_at" timestamp(3) with time zone,
  	"invitation_details_invitation_message" varchar,
  	"last_active_at" timestamp(3) with time zone,
  	"activity_metrics_login_count" numeric DEFAULT 0,
  	"activity_metrics_spaces_joined" numeric DEFAULT 0,
  	"activity_metrics_content_created" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "space_memberships_custom_permissions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_space_memberships_custom_permissions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "space_memberships_crm_data_conversion_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"event" varchar NOT NULL,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"value" numeric
  );
  
  CREATE TABLE "space_memberships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"space_id" integer NOT NULL,
  	"tenant_membership_id" integer,
  	"role" "enum_space_memberships_role" DEFAULT 'member' NOT NULL,
  	"status" "enum_space_memberships_status" DEFAULT 'pending' NOT NULL,
  	"joined_at" timestamp(3) with time zone NOT NULL,
  	"crm_data_lead_score" numeric,
  	"crm_data_customer_tier" "enum_space_memberships_crm_data_customer_tier",
  	"crm_data_notes" varchar,
  	"crm_data_last_interaction" timestamp(3) with time zone,
  	"engagement_metrics_messages_count" numeric DEFAULT 0,
  	"engagement_metrics_last_active" timestamp(3) with time zone,
  	"engagement_metrics_total_time_spent" numeric DEFAULT 0,
  	"engagement_metrics_content_created" numeric DEFAULT 0,
  	"engagement_metrics_events_attended" numeric DEFAULT 0,
  	"engagement_metrics_engagement_score" numeric,
  	"notification_settings_mentions" boolean DEFAULT true,
  	"notification_settings_direct_messages" boolean DEFAULT true,
  	"notification_settings_announcements" boolean DEFAULT true,
  	"notification_settings_events" boolean DEFAULT true,
  	"space_profile_display_name" varchar,
  	"space_profile_space_bio" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "space_memberships_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "appointments_reminders_sent" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sent_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "appointments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"organizer_id" integer NOT NULL,
  	"space_id" integer,
  	"venue_id" integer,
  	"bay_assignment_assigned_bay" varchar,
  	"bay_assignment_bay_required" boolean DEFAULT false,
  	"bay_assignment_can_float_bays" boolean DEFAULT true,
  	"tenant_id" integer NOT NULL,
  	"start_time" timestamp(3) with time zone NOT NULL,
  	"end_time" timestamp(3) with time zone NOT NULL,
  	"timezone" "enum_appointments_timezone" DEFAULT 'America/New_York' NOT NULL,
  	"recurrence_enabled" boolean DEFAULT false,
  	"recurrence_type" "enum_appointments_recurrence_type",
  	"recurrence_interval" numeric DEFAULT 1,
  	"recurrence_end_date" timestamp(3) with time zone,
  	"location" varchar,
  	"meeting_link" varchar,
  	"meeting_type" "enum_appointments_meeting_type" DEFAULT 'video_call' NOT NULL,
  	"appointment_type" "enum_appointments_appointment_type" DEFAULT 'general_meeting' NOT NULL,
  	"booking_settings_allow_rescheduling" boolean DEFAULT true,
  	"booking_settings_allow_cancellation" boolean DEFAULT true,
  	"booking_settings_require_confirmation" boolean DEFAULT false,
  	"booking_settings_buffer_time" numeric DEFAULT 15,
  	"booking_settings_max_attendees" numeric,
  	"status" "enum_appointments_status" DEFAULT 'scheduled' NOT NULL,
  	"notes" varchar,
  	"calendar_event_id" varchar,
  	"revenue_tracking_source" "enum_appointments_revenue_tracking_source" DEFAULT 'system_generated' NOT NULL,
  	"revenue_tracking_commission_rate" numeric,
  	"revenue_tracking_commission_amount" numeric,
  	"payment_required" boolean DEFAULT false,
  	"payment_amount" numeric,
  	"payment_currency" "enum_appointments_payment_currency" DEFAULT 'usd',
  	"payment_stripe_payment_intent_id" varchar,
  	"payment_payment_status" "enum_appointments_payment_payment_status",
  	"feedback_organizer_rating" numeric,
  	"feedback_attendee_rating" numeric,
  	"feedback_organizer_notes" varchar,
  	"feedback_follow_up_required" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "appointments_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "contacts_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_contacts_addresses_type" DEFAULT 'billing' NOT NULL,
  	"street" varchar NOT NULL,
  	"street2" varchar,
  	"city" varchar NOT NULL,
  	"state" varchar NOT NULL,
  	"zip_code" varchar NOT NULL,
  	"country" "enum_contacts_addresses_country" DEFAULT 'US' NOT NULL,
  	"is_default" boolean DEFAULT false
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"display_name" varchar,
  	"phone" varchar,
  	"company" varchar,
  	"tenant_id" integer NOT NULL,
  	"user_id" integer,
  	"type" "enum_contacts_type" DEFAULT 'customer' NOT NULL,
  	"preferences_allow_email" boolean DEFAULT true,
  	"preferences_allow_s_m_s" boolean DEFAULT false,
  	"preferences_allow_calls" boolean DEFAULT true,
  	"preferences_preferred_contact_time" "enum_contacts_preferences_preferred_contact_time" DEFAULT 'anytime',
  	"crm_status" "enum_contacts_crm_status" DEFAULT 'cold',
  	"crm_lead_score" numeric DEFAULT 0,
  	"crm_source" "enum_contacts_crm_source" DEFAULT 'website',
  	"crm_assigned_to_id" integer,
  	"crm_deal_value" numeric,
  	"activity_first_contact_date" timestamp(3) with time zone,
  	"activity_last_contact_date" timestamp(3) with time zone,
  	"activity_total_orders" numeric DEFAULT 0,
  	"activity_total_spent" numeric DEFAULT 0,
  	"activity_total_interactions" numeric DEFAULT 0,
  	"custom_fields" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contacts_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"conversation_context" jsonb,
  	"business_intelligence" jsonb,
  	"sender_id" integer NOT NULL,
  	"space_id" integer NOT NULL,
  	"channel_id" integer,
  	"message_type" "enum_messages_message_type" DEFAULT 'user' NOT NULL,
  	"priority" "enum_messages_priority" DEFAULT 'normal',
  	"reactions" jsonb,
  	"thread_id" varchar,
  	"reply_to_id_id" integer,
  	"at_protocol_type" varchar DEFAULT 'co.kendev.spaces.message',
  	"at_protocol_did" varchar,
  	"at_protocol_uri" varchar,
  	"at_protocol_cid" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "messages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "spaces_commerce_settings_payment_methods" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_spaces_commerce_settings_payment_methods",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "spaces_commerce_settings_shipping_zones" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_spaces_commerce_settings_shipping_zones",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "sub_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"price" numeric,
  	"currency" "enum_sub_tiers_currency" DEFAULT 'usd',
  	"stripe_price_id" varchar
  );
  
  CREATE TABLE "spaces_integrations_print_partners_product_catalog" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_spaces_integrations_print_partners_product_catalog",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "spaces_integrations_print_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"api_endpoint" varchar
  );
  
  CREATE TABLE "spaces_integrations_social_bots_platforms" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_spaces_integrations_social_bots_platforms",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "spaces" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"at_protocol_did" varchar,
  	"at_protocol_handle" varchar,
  	"tenant_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"business_identity_type" "enum_spaces_business_identity_type" DEFAULT 'business' NOT NULL,
  	"business_identity_industry" "enum_spaces_business_identity_industry" DEFAULT 'general' NOT NULL,
  	"business_identity_company_size" "enum_spaces_business_identity_company_size" DEFAULT 'small',
  	"business_identity_target_market" "enum_spaces_business_identity_target_market" DEFAULT 'local',
  	"commerce_settings_enable_ecommerce" boolean DEFAULT false,
  	"commerce_settings_enable_services" boolean DEFAULT false,
  	"commerce_settings_enable_merchandise" boolean DEFAULT false,
  	"commerce_settings_enable_subscriptions" boolean DEFAULT false,
  	"monetization_enabled" boolean DEFAULT false,
  	"monetization_donations_enabled" boolean DEFAULT false,
  	"monetization_custom_pricing_enabled" boolean DEFAULT false,
  	"monetization_custom_pricing_default_price" numeric,
  	"monetization_custom_pricing_minimum_tip" numeric,
  	"monetization_merchant_account" varchar,
  	"monetization_revenue_agreement_type" "rev_type" DEFAULT 'standard',
  	"monetization_revenue_platform_fee" numeric DEFAULT 20,
  	"monetization_revenue_contract_id" varchar,
  	"monetization_revenue_effective_date" timestamp(3) with time zone,
  	"monetization_revenue_review_date" timestamp(3) with time zone,
  	"monetization_ai_opt_enabled" boolean DEFAULT false,
  	"monetization_ai_opt_version" varchar,
  	"monetization_ai_opt_fee_min" numeric DEFAULT 8,
  	"monetization_ai_opt_fee_max" numeric DEFAULT 25,
  	"monetization_ai_opt_params" varchar,
  	"monetization_revenue_processing_fee" numeric DEFAULT 2.9,
  	"monetization_revenue_calculated_fee" numeric,
  	"integrations_youtube_channel_id" varchar,
  	"integrations_youtube_api_key" varchar,
  	"integrations_youtube_auto_sync" boolean DEFAULT false,
  	"integrations_scheduling_enabled" boolean DEFAULT false,
  	"integrations_scheduling_resource_count" numeric DEFAULT 1,
  	"integrations_scheduling_time_slots" "enum_spaces_integrations_scheduling_time_slots" DEFAULT '60',
  	"integrations_social_bots_auto_post" boolean DEFAULT false,
  	"theme_logo_id" integer,
  	"theme_banner_id" integer,
  	"theme_primary_color" varchar DEFAULT '#3b82f6',
  	"theme_secondary_color" varchar,
  	"theme_custom_c_s_s" varchar,
  	"visibility" "enum_spaces_visibility" DEFAULT 'invite_only' NOT NULL,
  	"member_approval" "enum_spaces_member_approval" DEFAULT 'manual' NOT NULL,
  	"invite_settings_members_can_invite" boolean DEFAULT true,
  	"invite_settings_require_invite_code" boolean DEFAULT false,
  	"invite_settings_invite_code" varchar,
  	"stats_member_count" numeric DEFAULT 0,
  	"stats_message_count" numeric DEFAULT 0,
  	"stats_last_activity" timestamp(3) with time zone,
  	"stats_engagement_score" numeric,
  	"data" jsonb,
  	"_migrationstatus_json_migrated" boolean DEFAULT false,
  	"_migrationstatus_migrated_at" timestamp(3) with time zone,
  	"_migrationstatus_migration_version" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "spaces_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "web_chat_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_id" varchar NOT NULL,
  	"space_id" integer NOT NULL,
  	"visitor_info_ip_address" varchar,
  	"visitor_info_user_agent" varchar,
  	"visitor_info_referrer" varchar,
  	"visitor_info_page_url" varchar,
  	"visitor_info_country" varchar,
  	"visitor_info_city" varchar,
  	"customer_id" integer,
  	"status" "enum_web_chat_sessions_status" DEFAULT 'active' NOT NULL,
  	"assigned_agent_id" integer,
  	"tenant_id" integer NOT NULL,
  	"analytics_start_time" timestamp(3) with time zone,
  	"analytics_end_time" timestamp(3) with time zone,
  	"analytics_duration" numeric,
  	"analytics_message_count" numeric DEFAULT 0,
  	"analytics_response_time" numeric,
  	"analytics_satisfaction_score" numeric,
  	"analytics_lead_qualified" boolean DEFAULT false,
  	"analytics_appointment_booked" boolean DEFAULT false,
  	"analytics_sale_generated" numeric,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "web_chat_sessions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"messages_id" integer
  );
  
  CREATE TABLE "channel_management" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"space_id" integer NOT NULL,
  	"channel_type" "enum_channel_management_channel_type" NOT NULL,
  	"status" "enum_channel_management_status" DEFAULT 'active' NOT NULL,
  	"auto_assignment" boolean DEFAULT true,
  	"n8n_workflow_id" varchar,
  	"vapi_enabled" boolean DEFAULT false,
  	"web_chat_enabled" boolean DEFAULT true,
  	"metadata" jsonb,
  	"category" "enum_channel_management_category" DEFAULT 'business',
  	"sort_order" numeric DEFAULT 0,
  	"icon" varchar,
  	"color" "enum_channel_management_color" DEFAULT 'blue',
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "channel_management_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "social_media_bots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"status" "enum_social_media_bots_status" DEFAULT 'active' NOT NULL,
  	"platforms_facebook_enabled" boolean DEFAULT false,
  	"platforms_facebook_page_id" varchar,
  	"platforms_facebook_access_token" varchar,
  	"platforms_instagram_enabled" boolean DEFAULT false,
  	"platforms_instagram_account_id" varchar,
  	"platforms_instagram_access_token" varchar,
  	"analytics_tracking_enabled" boolean DEFAULT true,
  	"analytics_metrics" jsonb,
  	"space_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "linked_accounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"provider" "enum_linked_accounts_provider" NOT NULL,
  	"access_token" varchar NOT NULL,
  	"refresh_token" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"scope" varchar,
  	"provider_account_id" varchar,
  	"provider_account_data" jsonb,
  	"user_id" integer NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"status" "enum_linked_accounts_status" DEFAULT 'active' NOT NULL,
  	"last_used" timestamp(3) with time zone,
  	"error_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "invoices_itemized_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"quantity" numeric NOT NULL,
  	"rate" numeric NOT NULL,
  	"amount" numeric NOT NULL
  );
  
  CREATE TABLE "invoices_payment_methods" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_invoices_payment_methods",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "invoices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"invoice_number" varchar NOT NULL,
  	"recipient_name" varchar NOT NULL,
  	"recipient_email" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" varchar DEFAULT 'USD',
  	"description" varchar NOT NULL,
  	"business_name" varchar,
  	"business_address" varchar,
  	"notes" varchar,
  	"status" "enum_invoices_status" DEFAULT 'draft' NOT NULL,
  	"due_date" timestamp(3) with time zone NOT NULL,
  	"sent_at" timestamp(3) with time zone,
  	"paid_at" timestamp(3) with time zone,
  	"payment_method" varchar,
  	"payment_id" varchar,
  	"payment_link" varchar,
  	"tenant_id" integer,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "documents_signers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"role" "enum_documents_signers_role" NOT NULL,
  	"signature_required" boolean DEFAULT true,
  	"status" "enum_documents_signers_status" DEFAULT 'pending' NOT NULL,
  	"signed_at" timestamp(3) with time zone,
  	"signature" varchar,
  	"signature_type" "enum_documents_signers_signature_type",
  	"ip_address" varchar
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_documents_type" NOT NULL,
  	"content" varchar NOT NULL,
  	"status" "enum_documents_status" DEFAULT 'draft' NOT NULL,
  	"expiration_date" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone,
  	"security_hash" varchar,
  	"tenant_id" integer,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "donations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"donation_id" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" varchar DEFAULT 'USD',
  	"donor_name" varchar DEFAULT 'Anonymous',
  	"donor_email" varchar,
  	"is_anonymous" boolean DEFAULT false,
  	"campaign" varchar,
  	"cause" "enum_donations_cause",
  	"message" varchar,
  	"payment_method" "enum_donations_payment_method" NOT NULL,
  	"payment_id" varchar,
  	"transaction_id" varchar,
  	"status" "enum_donations_status" DEFAULT 'pending' NOT NULL,
  	"is_recurring" boolean DEFAULT false,
  	"recurring_frequency" "enum_donations_recurring_frequency",
  	"donated_at" timestamp(3) with time zone NOT NULL,
  	"tenant_id" integer,
  	"space_id" integer,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_products_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_products_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "products_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_products_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_products_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "products_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_products_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_products_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_products_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "products_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_products_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_products_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_digital_assets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"name" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "products_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_type" "enum_products_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"description" varchar,
  	"product_type" "enum_products_product_type" DEFAULT 'business_service',
  	"pricing_base_price" numeric,
  	"pricing_sale_price" numeric,
  	"pricing_compare_at_price" numeric,
  	"pricing_currency" "enum_products_pricing_currency" DEFAULT 'USD',
  	"inventory_track_quantity" boolean DEFAULT true,
  	"inventory_quantity" numeric DEFAULT 0,
  	"inventory_low_stock_threshold" numeric DEFAULT 5,
  	"inventory_allow_backorder" boolean DEFAULT false,
  	"sku" varchar,
  	"commission_template_default_rate" numeric,
  	"commission_template_rationale" varchar,
  	"commission_use_custom_rate" boolean DEFAULT false,
  	"commission_custom_commission_rate" numeric,
  	"commission_source_multipliers_system_generated" numeric DEFAULT 1,
  	"commission_source_multipliers_pickup_job" numeric DEFAULT 0.5,
  	"commission_source_multipliers_referral_source" numeric DEFAULT 1.5,
  	"details_weight" numeric,
  	"details_dimensions_length" numeric,
  	"details_dimensions_width" numeric,
  	"details_dimensions_height" numeric,
  	"details_dimensions_unit" "enum_products_details_dimensions_unit" DEFAULT 'in',
  	"service_details_duration" numeric,
  	"service_details_location" "enum_products_service_details_location",
  	"service_details_max_participants" numeric,
  	"service_details_booking_required" boolean DEFAULT true,
  	"shipping_requires_shipping" boolean DEFAULT true,
  	"shipping_free_shipping" boolean DEFAULT false,
  	"shipping_shipping_class" "enum_products_shipping_shipping_class",
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_keywords" varchar,
  	"published_at" timestamp(3) with time zone,
  	"status" "enum_products_status" DEFAULT 'draft',
  	"featured" boolean DEFAULT false,
  	"tenant_id" integer,
  	"has_variants" boolean DEFAULT false,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"products_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_products_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__products_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__products_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__products_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__products_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_products_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__products_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__products_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__products_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_products_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_products_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__products_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__products_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_products_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_products_v_version_digital_assets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"name" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_type" "enum__products_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_description" varchar,
  	"version_product_type" "enum__products_v_version_product_type" DEFAULT 'business_service',
  	"version_pricing_base_price" numeric,
  	"version_pricing_sale_price" numeric,
  	"version_pricing_compare_at_price" numeric,
  	"version_pricing_currency" "enum__products_v_version_pricing_currency" DEFAULT 'USD',
  	"version_inventory_track_quantity" boolean DEFAULT true,
  	"version_inventory_quantity" numeric DEFAULT 0,
  	"version_inventory_low_stock_threshold" numeric DEFAULT 5,
  	"version_inventory_allow_backorder" boolean DEFAULT false,
  	"version_sku" varchar,
  	"version_commission_template_default_rate" numeric,
  	"version_commission_template_rationale" varchar,
  	"version_commission_use_custom_rate" boolean DEFAULT false,
  	"version_commission_custom_commission_rate" numeric,
  	"version_commission_source_multipliers_system_generated" numeric DEFAULT 1,
  	"version_commission_source_multipliers_pickup_job" numeric DEFAULT 0.5,
  	"version_commission_source_multipliers_referral_source" numeric DEFAULT 1.5,
  	"version_details_weight" numeric,
  	"version_details_dimensions_length" numeric,
  	"version_details_dimensions_width" numeric,
  	"version_details_dimensions_height" numeric,
  	"version_details_dimensions_unit" "enum__products_v_version_details_dimensions_unit" DEFAULT 'in',
  	"version_service_details_duration" numeric,
  	"version_service_details_location" "enum__products_v_version_service_details_location",
  	"version_service_details_max_participants" numeric,
  	"version_service_details_booking_required" boolean DEFAULT true,
  	"version_shipping_requires_shipping" boolean DEFAULT true,
  	"version_shipping_free_shipping" boolean DEFAULT false,
  	"version_shipping_shipping_class" "enum__products_v_version_shipping_shipping_class",
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_keywords" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_status" "enum__products_v_version_status" DEFAULT 'draft',
  	"version_featured" boolean DEFAULT false,
  	"version_tenant_id" integer,
  	"version_has_variants" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"products_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "orders_line_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"quantity" numeric NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"total_price" numeric NOT NULL,
  	"product_snapshot" jsonb
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"customer_id" integer NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"subtotal" numeric NOT NULL,
  	"tax_amount" numeric DEFAULT 0,
  	"shipping_amount" numeric DEFAULT 0,
  	"discount_amount" numeric DEFAULT 0,
  	"total_amount" numeric NOT NULL,
  	"currency" varchar DEFAULT 'USD' NOT NULL,
  	"revenue_distribution_ai_partner" numeric NOT NULL,
  	"revenue_distribution_human_partner" numeric NOT NULL,
  	"revenue_distribution_platform_operations" numeric NOT NULL,
  	"revenue_distribution_justice_rund" numeric NOT NULL,
  	"revenue_distribution_calculated_at" timestamp(3) with time zone NOT NULL,
  	"payment_status" "enum_orders_payment_status" DEFAULT 'pending' NOT NULL,
  	"payment_details_payment_method" "enum_orders_payment_details_payment_method",
  	"payment_details_transaction_id" varchar,
  	"payment_details_last4" varchar,
  	"payment_details_payment_processed_at" timestamp(3) with time zone,
  	"fulfillment_method" "enum_orders_fulfillment_method" NOT NULL,
  	"fulfillment_status" "enum_orders_fulfillment_status" DEFAULT 'pending',
  	"fulfillment_tracking_number" varchar,
  	"fulfillment_carrier" "enum_orders_fulfillment_carrier",
  	"fulfillment_shipped_at" timestamp(3) with time zone,
  	"fulfillment_delivered_at" timestamp(3) with time zone,
  	"fulfillment_estimated_delivery" timestamp(3) with time zone,
  	"shipping_address_name" varchar,
  	"shipping_address_company" varchar,
  	"shipping_address_address1" varchar,
  	"shipping_address_address2" varchar,
  	"shipping_address_city" varchar,
  	"shipping_address_state" varchar,
  	"shipping_address_postal_code" varchar,
  	"shipping_address_country" varchar DEFAULT 'US',
  	"shipping_address_phone" varchar,
  	"billing_address_same_as_shipping" boolean DEFAULT true,
  	"billing_address_name" varchar,
  	"billing_address_company" varchar,
  	"billing_address_address1" varchar,
  	"billing_address_address2" varchar,
  	"billing_address_city" varchar,
  	"billing_address_state" varchar,
  	"billing_address_postal_code" varchar,
  	"billing_address_country" varchar DEFAULT 'US',
  	"customer_notes" varchar,
  	"internal_notes" varchar,
  	"metadata" jsonb,
  	"placed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone,
  	"cancelled_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_pages_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_pages_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"products_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__pages_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__pages_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"products_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "posts_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_posts_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"description" varchar,
  	"image_id" integer,
  	"parent_id" integer,
  	"display_order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"product_count" numeric DEFAULT 0,
  	"business_type" "enum_categories_business_type" DEFAULT 'physical',
  	"featured" boolean DEFAULT false,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_keywords" varchar,
  	"meta_image_id" integer,
  	"tenant_id" integer NOT NULL,
  	"settings_show_product_count" boolean DEFAULT true,
  	"settings_default_sort" "enum_categories_settings_default_sort" DEFAULT 'featured',
  	"settings_products_per_page" numeric DEFAULT 12,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "organizations_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"role" "enum_organizations_members_role" DEFAULT 'viewer',
  	"access_level" "enum_organizations_members_access_level" DEFAULT 'limited'
  );
  
  CREATE TABLE "organizations_billing_settings_sharing_discounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min_locs" numeric NOT NULL,
  	"percent" numeric NOT NULL
  );
  
  CREATE TABLE "organizations_ops_settings_hours_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day_of_week" "enum_organizations_ops_settings_hours_schedule_day_of_week",
  	"open_time" varchar,
  	"close_time" varchar,
  	"is_closed" boolean DEFAULT false
  );
  
  CREATE TABLE "organizations_integration_websites" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"domain" varchar NOT NULL,
  	"purpose" "enum_organizations_integration_websites_purpose" DEFAULT 'main',
  	"is_active" boolean DEFAULT true,
  	"integration_notes" varchar
  );
  
  CREATE TABLE "organizations_analytics_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"role" varchar
  );
  
  CREATE TABLE "organizations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"organization_type" "enum_organizations_organization_type" DEFAULT 'multi_location' NOT NULL,
  	"primary_domain" varchar,
  	"description" varchar,
  	"logo_id" integer,
  	"crm_integration_enabled" boolean DEFAULT false,
  	"crm_integration_crm_type" "enum_organizations_crm_integration_crm_type",
  	"crm_integration_sync_schedule" "enum_organizations_crm_integration_sync_schedule" DEFAULT 'daily',
  	"crm_integration_api_endpoint" varchar,
  	"crm_integration_last_sync" timestamp(3) with time zone,
  	"crm_integration_sync_status" "enum_organizations_crm_integration_sync_status" DEFAULT 'never',
  	"billing_settings_consolidated_billing" boolean DEFAULT true,
  	"billing_settings_billing_contact_name" varchar,
  	"billing_settings_billing_contact_email" varchar,
  	"billing_settings_billing_contact_phone" varchar,
  	"billing_settings_sharing_org_rate" numeric DEFAULT 2,
  	"billing_settings_sharing_loc_rate" numeric DEFAULT 1,
  	"ops_settings_timezone" varchar DEFAULT 'America/New_York',
  	"ops_settings_contact_info_main_phone" varchar,
  	"ops_settings_contact_info_main_email" varchar,
  	"ops_settings_contact_info_support_email" varchar,
  	"ops_settings_contact_info_emergency_contact" varchar,
  	"integration_api_access_has_api_key" boolean DEFAULT false,
  	"integration_api_access_api_key_created_at" timestamp(3) with time zone,
  	"integration_api_access_webhook_url" varchar,
  	"analytics_enabled" boolean DEFAULT true,
  	"analytics_frequency" "enum_organizations_analytics_frequency" DEFAULT 'weekly',
  	"status" "enum_organizations_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "venues_business_hours_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day_of_week" "enum_venues_business_hours_schedule_day_of_week",
  	"open_time" varchar,
  	"close_time" varchar,
  	"is_closed" boolean DEFAULT false,
  	"is_emergency_only" boolean DEFAULT false
  );
  
  CREATE TABLE "venues_business_hours_special_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"description" varchar,
  	"open_time" varchar,
  	"close_time" varchar,
  	"is_closed" boolean DEFAULT false
  );
  
  CREATE TABLE "venues_staff_specialties" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"specialty" varchar
  );
  
  CREATE TABLE "venues_staff_schedule_availability" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day_of_week" "enum_venues_staff_schedule_availability_day_of_week",
  	"start_time" varchar,
  	"end_time" varchar,
  	"is_available" boolean DEFAULT true
  );
  
  CREATE TABLE "venues_staff" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"role" "enum_venues_staff_role" DEFAULT 'admin_staff',
  	"title" varchar,
  	"contact_info_direct_phone" varchar,
  	"contact_info_direct_email" varchar,
  	"contact_info_pager" varchar,
  	"work_station_assigned_bay" varchar,
  	"work_station_can_float_bays" boolean DEFAULT false,
  	"work_station_primary_bay" boolean DEFAULT true,
  	"freelance_settings_can_freelance" boolean DEFAULT false,
  	"freelance_settings_freelance_booking_url" varchar,
  	"freelance_settings_freelance_commission_rate" numeric,
  	"freelance_settings_on_clock_priority" boolean DEFAULT true,
  	"is_active" boolean DEFAULT true
  );
  
  CREATE TABLE "venues_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service_name" varchar NOT NULL,
  	"description" varchar,
  	"duration" numeric,
  	"price" numeric,
  	"is_active" boolean DEFAULT true,
  	"requires_appointment" boolean DEFAULT true,
  	"category" varchar,
  	"service_type" "enum_venues_services_service_type",
  	"requires_bay" boolean DEFAULT false
  );
  
  CREATE TABLE "venues_bay_management_bays" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"bay_name" varchar,
  	"bay_type" "enum_venues_bay_management_bays_bay_type" DEFAULT 'general_workstation',
  	"is_active" boolean DEFAULT true,
  	"equipment" varchar,
  	"notes" varchar
  );
  
  CREATE TABLE "venues_integrations_payment_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_venues_integrations_payment_methods_type"
  );
  
  CREATE TABLE "venues_guardian_angel_custom_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "venues" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"organization_id" integer NOT NULL,
  	"venue_type" "enum_venues_venue_type" DEFAULT 'franchise_location' NOT NULL,
  	"display_name" varchar,
  	"description" varchar,
  	"website" varchar,
  	"location_address_street" varchar NOT NULL,
  	"location_address_suite" varchar,
  	"location_address_city" varchar NOT NULL,
  	"location_address_state" varchar NOT NULL,
  	"location_address_zip_code" varchar NOT NULL,
  	"location_address_country" varchar DEFAULT 'USA',
  	"location_coordinates_latitude" numeric,
  	"location_coordinates_longitude" numeric,
  	"location_service_radius" numeric,
  	"location_timezone" varchar DEFAULT 'America/New_York',
  	"contact_info_phone" varchar,
  	"contact_info_fax" varchar,
  	"contact_info_email" varchar,
  	"contact_info_emergency_contact" varchar,
  	"contact_info_after_hours_contact" varchar,
  	"bay_management_total_bays" numeric DEFAULT 1,
  	"bay_management_allow_multiple_bays" boolean DEFAULT true,
  	"bay_management_bay_booking_buffer" numeric DEFAULT 15,
  	"integrations_crm_settings_crm_location_id" varchar,
  	"integrations_crm_settings_sync_enabled" boolean DEFAULT true,
  	"integrations_crm_settings_last_sync" timestamp(3) with time zone,
  	"integrations_booking_system_external_booking_url" varchar,
  	"integrations_booking_system_booking_system_type" "enum_venues_integrations_booking_system_booking_system_type" DEFAULT 'internal',
  	"integrations_booking_system_inquicker_location_id" varchar,
  	"integrations_booking_system_inquicker_api_endpoint" varchar,
  	"integrations_booking_system_inquicker_real_time_sync" boolean DEFAULT true,
  	"integrations_booking_system_inquicker_angel_booking" boolean DEFAULT true,
  	"integrations_booking_system_inquicker_waitlist" boolean DEFAULT true,
  	"integrations_booking_system_inquicker_cancel_policy" varchar,
  	"integrations_payment_accepts" boolean DEFAULT true,
  	"integrations_payment_stripe_account_id" varchar,
  	"analytics_enable_analytics" boolean DEFAULT true,
  	"analytics_metrics_avg_rating" numeric,
  	"analytics_metrics_total_reviews" numeric,
  	"analytics_metrics_monthly_revenue" numeric,
  	"analytics_metrics_appointments" numeric,
  	"guardian_angel_assigned_angel_id" integer,
  	"guardian_angel_custom_greeting" varchar,
  	"is_active" boolean DEFAULT true,
  	"status" "enum_venues_status" DEFAULT 'active' NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "business_agents_business_knowledge_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"pricing" varchar,
  	"duration" varchar,
  	"spirit_notes" varchar
  );
  
  CREATE TABLE "business_agents_business_knowledge_customer_stories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"scenario" varchar NOT NULL,
  	"approach" varchar,
  	"outcome" varchar
  );
  
  CREATE TABLE "business_agents_business_knowledge_frequent_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"spirit_response" varchar NOT NULL,
  	"follow_up_actions" varchar
  );
  
  CREATE TABLE "business_agents_ops_hours_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_business_agents_ops_hours_schedule_day",
  	"start_time" varchar,
  	"end_time" varchar
  );
  
  CREATE TABLE "business_agents_ops_handoff_triggers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"trigger" "enum_business_agents_ops_handoff_triggers_trigger",
  	"handoff_message" varchar
  );
  
  CREATE TABLE "business_agents_humanitarian_legal_databases" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_business_agents_humanitarian_legal_databases",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "business_agents_humanitarian_news_curation_content_filters" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_business_agents_humanitarian_news_curation_content_filters",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "business_agents_humanitarian_resources_vendors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"type" "enum_business_agents_humanitarian_resources_vendors_type",
  	"monthly_budget" numeric
  );
  
  CREATE TABLE "business_agents_humanitarian_avatar_scope" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_business_agents_humanitarian_avatar_scope",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "business_agents_vapi_integration_allowed_actions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_business_agents_vapi_integration_allowed_actions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "business_agents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"avatar_id" integer,
  	"spirit_type" "enum_business_agents_spirit_type" DEFAULT 'primary' NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"space_id" integer,
  	"human_partner_id" integer NOT NULL,
  	"personality_core_values" varchar,
  	"personality_communication_style" "enum_business_agents_personality_communication_style" DEFAULT 'friendly',
  	"personality_special_expertise" varchar,
  	"personality_brand_voice" varchar,
  	"ops_is_active" boolean DEFAULT true,
  	"ops_hours_timezone" varchar DEFAULT 'America/New_York',
  	"ai_system_prompt" varchar,
  	"ai_context_instructions" varchar,
  	"ai_style_max_response_length" numeric DEFAULT 500,
  	"ai_style_include_emojis" boolean DEFAULT true,
  	"ai_style_formality" "enum_business_agents_ai_style_formality" DEFAULT 'casual',
  	"analytics_total_interactions" numeric DEFAULT 0,
  	"analytics_successful_handoffs" numeric DEFAULT 0,
  	"analytics_customer_satisfaction_score" numeric,
  	"analytics_last_interaction" timestamp(3) with time zone,
  	"agent_type" "enum_business_agents_agent_type" DEFAULT 'business',
  	"humanitarian_legal_enabled" boolean DEFAULT false,
  	"humanitarian_legal_ethical_guidelines" varchar,
  	"humanitarian_news_curation_enabled" boolean DEFAULT false,
  	"humanitarian_news_curation_positivity_bias" "enum_business_agents_humanitarian_news_curation_positivity_bias" DEFAULT 'hopeful',
  	"humanitarian_resources_enabled" boolean DEFAULT false,
  	"humanitarian_resources_auto_approval_limit" numeric DEFAULT 25,
  	"humanitarian_avatar_enabled" boolean DEFAULT false,
  	"humanitarian_avatar_communication_style" varchar,
  	"humanitarian_avatar_consent_boundaries" varchar,
  	"vapi_integration_phone_number" varchar,
  	"vapi_integration_assistant_id" varchar,
  	"vapi_integration_voice_id" "enum_business_agents_vapi_integration_voice_id" DEFAULT 'EXAVITQu4vr4xnSDxMaL',
  	"vapi_integration_status" "enum_business_agents_vapi_integration_status" DEFAULT 'inactive',
  	"vapi_integration_call_stats_total_calls" numeric DEFAULT 0,
  	"vapi_integration_call_stats_total_minutes" numeric DEFAULT 0,
  	"vapi_integration_call_stats_last_call_date" timestamp(3) with time zone,
  	"vapi_integration_call_stats_success_rate" numeric DEFAULT 0,
  	"vapi_integration_voice_prompt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "humanitarian_agents_legal_advocacy_legal_databases" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_humanitarian_agents_legal_advocacy_legal_databases",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "humanitarian_agents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"spirit_type" "enum_humanitarian_agents_spirit_type" NOT NULL,
  	"legal_advocacy_case_research" boolean DEFAULT true,
  	"resource_ordering_can_order_books" boolean DEFAULT true,
  	"resource_ordering_monthly_budget" numeric DEFAULT 100,
  	"news_curation_provides_news" boolean DEFAULT true,
  	"news_curation_hope_bias" "enum_humanitarian_agents_news_curation_hope_bias" DEFAULT 'maximum_hope',
  	"avatar_powers_can_represent" boolean DEFAULT true,
  	"avatar_powers_voice_style" varchar,
  	"system_prompt" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ai_generation_queue_source_data_content_themes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" varchar NOT NULL
  );
  
  CREATE TABLE "ai_generation_queue_parameters_color_scheme" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color" varchar NOT NULL
  );
  
  CREATE TABLE "ai_generation_queue_parameters_text_elements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"emphasis" "enum_ai_generation_queue_parameters_text_elements_emphasis" DEFAULT 'primary'
  );
  
  CREATE TABLE "ai_generation_queue" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"space_id" integer NOT NULL,
  	"generation_type" "enum_ai_generation_queue_generation_type" NOT NULL,
  	"source_data_youtube_channel_id" varchar,
  	"source_data_branding_guidelines" varchar,
  	"source_data_target_audience" varchar,
  	"parameters_product_type" "enum_ai_generation_queue_parameters_product_type",
  	"parameters_style_guide" "enum_ai_generation_queue_parameters_style_guide" DEFAULT 'modern',
  	"parameters_custom_prompt" varchar,
  	"status" "enum_ai_generation_queue_status" DEFAULT 'queued' NOT NULL,
  	"progress" numeric DEFAULT 0,
  	"generated_text" varchar,
  	"approval_status" "enum_ai_generation_queue_approval_status" DEFAULT 'pending',
  	"review_notes" varchar,
  	"quality_score" numeric,
  	"tenant_id" integer NOT NULL,
  	"processing_metadata_model_used" varchar,
  	"processing_metadata_processing_time" numeric,
  	"processing_metadata_tokens_used" numeric,
  	"processing_metadata_error_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ai_generation_queue_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"pages_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "job_queue" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL,
  	"job_type" varchar NOT NULL,
  	"data" jsonb NOT NULL,
  	"status" "enum_job_queue_status" DEFAULT 'pending' NOT NULL,
  	"priority" numeric DEFAULT 0,
  	"max_attempts" numeric DEFAULT 3,
  	"scheduled_for" timestamp(3) with time zone,
  	"attempts" numeric DEFAULT 0,
  	"started_at" timestamp(3) with time zone,
  	"processed_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"result" jsonb,
  	"error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "channels_feed_configuration_filters_file_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" varchar
  );
  
  CREATE TABLE "channels_feed_configuration_filters_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE "channels_economics_model_volume_discounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"threshold" numeric,
  	"discount" numeric
  );
  
  CREATE TABLE "channels_processing_rules_custom_prompts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"trigger" varchar,
  	"prompt" varchar
  );
  
  CREATE TABLE "channels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"guardian_angel_id" varchar,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"channel_type" "enum_channels_channel_type" NOT NULL,
  	"report_type" "enum_channels_report_type" NOT NULL,
  	"feed_configuration_feed_source" "enum_channels_feed_configuration_feed_source",
  	"feed_configuration_feed_settings" jsonb,
  	"feed_configuration_polling_interval" numeric DEFAULT 60,
  	"feed_configuration_filters_date_range_from" timestamp(3) with time zone,
  	"feed_configuration_filters_date_range_to" timestamp(3) with time zone,
  	"economics_phyle_affiliation" "enum_channels_economics_phyle_affiliation",
  	"economics_model_processing_fee" numeric,
  	"economics_model_accuracy_bonus" numeric,
  	"economics_model_speed_bonus" numeric,
  	"economics_model_sharing" "enum_channels_economics_model_sharing",
  	"economics_stats_total_earned" numeric,
  	"economics_stats_items_processed" numeric,
  	"economics_stats_accuracy_score" numeric,
  	"economics_stats_phyle_rank" numeric,
  	"economics_stats_reputation" numeric,
  	"processing_rules_auto_processing" boolean DEFAULT true,
  	"processing_rules_requires_human_review" boolean DEFAULT false,
  	"processing_rules_confidence_threshold" numeric DEFAULT 0.8,
  	"processing_rules_output_format" "enum_channels_processing_rules_output_format",
  	"status" "enum_channels_status" DEFAULT 'active',
  	"last_processed" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "phyles_charter_specializations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"specialization" varchar
  );
  
  CREATE TABLE "phyles_charter_core_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "phyles_governance_leadership_structure" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"responsibilities" varchar,
  	"selection_method" varchar
  );
  
  CREATE TABLE "phyles_membership_criteria_admission_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"requirement" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "phyles_membership_criteria_skill_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"skill" varchar,
  	"level" "enum_phyles_membership_criteria_skill_requirements_level"
  );
  
  CREATE TABLE "phyles_services_offered_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service" varchar,
  	"pricing" jsonb
  );
  
  CREATE TABLE "phyles_services_service_guarantees" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"guarantee" varchar
  );
  
  CREATE TABLE "phyles_inter_phyle_relations_alliances" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"phyle_id" varchar,
  	"alliance_type" "enum_phyles_inter_phyle_relations_alliances_alliance_type",
  	"terms" jsonb
  );
  
  CREATE TABLE "phyles_inter_phyle_relations_competitors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"phyle_id" varchar,
  	"competition_type" varchar
  );
  
  CREATE TABLE "phyles_cultural_aspects_traditions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tradition" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "phyles_cultural_aspects_celebrations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"celebration" varchar,
  	"date" timestamp(3) with time zone
  );
  
  CREATE TABLE "phyles_cultural_aspects_symbolism_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color" varchar
  );
  
  CREATE TABLE "phyles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" jsonb,
  	"phyle_type" "enum_phyles_phyle_type" NOT NULL,
  	"charter_mission" varchar NOT NULL,
  	"charter_operating_principles" jsonb,
  	"economic_structure_currency" varchar DEFAULT 'KenDevCoin',
  	"economic_structure_taxation_model" "enum_phyles_economic_structure_taxation_model",
  	"economic_structure_wealth_distribution" "enum_phyles_economic_structure_wealth_distribution",
  	"economic_structure_minimum_basic_income" numeric,
  	"economic_structure_profit_sharing_ratio" numeric,
  	"governance_governance_model" "enum_phyles_governance_governance_model",
  	"governance_decision_making_process" jsonb,
  	"governance_voting_rights" jsonb,
  	"membership_criteria_probation_period" numeric,
  	"membership_criteria_membership_fees_initiation" numeric,
  	"membership_criteria_membership_fees_monthly" numeric,
  	"membership_criteria_membership_fees_annual" numeric,
  	"services_quality_standards" jsonb,
  	"metrics_member_count" numeric,
  	"metrics_total_earnings" numeric,
  	"metrics_average_earnings_per_member" numeric,
  	"metrics_reputation_score" numeric,
  	"metrics_completion_rate" numeric,
  	"metrics_customer_satisfaction" numeric,
  	"metrics_growth_rate" numeric,
  	"cultural_aspects_symbolism_motto" varchar,
  	"cultural_aspects_symbolism_emblem" varchar,
  	"status" "enum_phyles_status" DEFAULT 'active',
  	"founded" timestamp(3) with time zone NOT NULL,
  	"last_activity" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "agent_reputation_reputation_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"event_type" "enum_agent_reputation_reputation_history_event_type",
  	"impact" numeric,
  	"description" varchar,
  	"timestamp" timestamp(3) with time zone,
  	"verified_by" varchar
  );
  
  CREATE TABLE "agent_reputation_achievements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"achievement" "enum_agent_reputation_achievements_achievement",
  	"earned_at" timestamp(3) with time zone,
  	"description" varchar
  );
  
  CREATE TABLE "agent_reputation_specializations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"specialization" varchar,
  	"proficiency_level" "enum_agent_reputation_specializations_proficiency_level",
  	"certified_by" varchar
  );
  
  CREATE TABLE "agent_reputation_social_network_mentor_of" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"agent_id" varchar
  );
  
  CREATE TABLE "agent_reputation_social_network_mentored_by" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"agent_id" varchar
  );
  
  CREATE TABLE "agent_reputation_social_network_collaborators" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"agent_id" varchar,
  	"collaboration_type" varchar
  );
  
  CREATE TABLE "agent_reputation_social_network_endorsements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from_agent_id" varchar,
  	"skill" varchar,
  	"endorsement_text" varchar,
  	"timestamp" timestamp(3) with time zone
  );
  
  CREATE TABLE "agent_reputation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"agent_id" varchar NOT NULL,
  	"phyle_id" varchar NOT NULL,
  	"display_name" varchar,
  	"score" numeric DEFAULT 500 NOT NULL,
  	"rank" "enum_agent_reputation_rank",
  	"performance_metrics_total_tasks_completed" numeric DEFAULT 0,
  	"performance_metrics_average_quality_score" numeric,
  	"performance_metrics_average_completion_time" numeric,
  	"performance_metrics_customer_satisfaction_score" numeric,
  	"performance_metrics_reliability_score" numeric,
  	"performance_metrics_collaboration_score" numeric,
  	"economic_impact_total_earned" numeric DEFAULT 0,
  	"economic_impact_total_contributed" numeric DEFAULT 0,
  	"economic_impact_phyle_rank" numeric,
  	"economic_impact_economic_efficiency" numeric,
  	"status" "enum_agent_reputation_status" DEFAULT 'active',
  	"joined_phyle_at" timestamp(3) with time zone,
  	"last_activity" timestamp(3) with time zone,
  	"last_updated" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inventory_messages_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"filename" varchar,
  	"url" varchar,
  	"google_photos_id" varchar,
  	"timestamp" timestamp(3) with time zone
  );
  
  CREATE TABLE "inventory_messages_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "inventory_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"guardian_angel_id" varchar,
  	"user_id" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"message_type" "enum_inventory_messages_message_type" NOT NULL,
  	"category" varchar,
  	"location" varchar,
  	"geo_coordinates_latitude" numeric,
  	"geo_coordinates_longitude" numeric,
  	"meta" jsonb NOT NULL,
  	"analysis" jsonb,
  	"confidence" numeric,
  	"status" "enum_inventory_messages_status" DEFAULT 'pending',
  	"priority" "enum_inventory_messages_priority" DEFAULT 'normal',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "photo_analysis" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"guardian_angel_id" varchar,
  	"sequence_type" "enum_photo_analysis_sequence_type" NOT NULL,
  	"location" varchar,
  	"description" varchar,
  	"photo_count" numeric NOT NULL,
  	"analysis" jsonb NOT NULL,
  	"confidence" numeric,
  	"category" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mileage_logs_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"filename" varchar
  );
  
  CREATE TABLE "mileage_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" varchar NOT NULL,
  	"odometer_reading" numeric NOT NULL,
  	"vehicle" varchar NOT NULL,
  	"location" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"type" "enum_mileage_logs_type" NOT NULL,
  	"purpose" varchar,
  	"miles" numeric,
  	"rate" numeric,
  	"deduction" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quote_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"submission_id" varchar NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"customer_email" varchar NOT NULL,
  	"customer_phone" varchar NOT NULL,
  	"service_address" varchar NOT NULL,
  	"service_description" varchar NOT NULL,
  	"service_type" "enum_quote_requests_service_type",
  	"estimated_value" numeric,
  	"status" "enum_quote_requests_status" DEFAULT 'pending' NOT NULL,
  	"priority" "enum_quote_requests_priority" DEFAULT 'normal',
  	"assigned_to" varchar,
  	"notes" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"quoted_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"message" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_state" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar,
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"submit_button_label" varchar,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"confirmation_message" jsonb,
  	"redirect_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"category_i_d" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tenants_id" integer,
  	"users_id" integer,
  	"workflows_id" integer,
  	"tenant_memberships_id" integer,
  	"space_memberships_id" integer,
  	"appointments_id" integer,
  	"contacts_id" integer,
  	"messages_id" integer,
  	"spaces_id" integer,
  	"web_chat_sessions_id" integer,
  	"channel_management_id" integer,
  	"social_media_bots_id" integer,
  	"linked_accounts_id" integer,
  	"invoices_id" integer,
  	"documents_id" integer,
  	"donations_id" integer,
  	"products_id" integer,
  	"orders_id" integer,
  	"pages_id" integer,
  	"posts_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"organizations_id" integer,
  	"venues_id" integer,
  	"business_agents_id" integer,
  	"humanitarian_agents_id" integer,
  	"ai_generation_queue_id" integer,
  	"job_queue_id" integer,
  	"channels_id" integer,
  	"phyles_id" integer,
  	"agent_reputation_id" integer,
  	"inventory_messages_id" integer,
  	"photo_analysis_id" integer,
  	"mileage_logs_id" integer,
  	"quote_requests_id" integer,
  	"redirects_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"search_id" integer,
  	"payload_jobs_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"products_id" integer
  );
  
  ALTER TABLE "tenants_revenue_sharing_volume_discounts" ADD CONSTRAINT "tenants_revenue_sharing_volume_discounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_referral_program_referred_by_id_users_id_fk" FOREIGN KEY ("referral_program_referred_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_configuration_logo_id_media_id_fk" FOREIGN KEY ("configuration_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_configuration_favicon_id_media_id_fk" FOREIGN KEY ("configuration_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_karma_contribution_types" ADD CONSTRAINT "users_karma_contribution_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_karma_recognitions" ADD CONSTRAINT "users_karma_recognitions_awarded_by_id_users_id_fk" FOREIGN KEY ("awarded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_karma_recognitions" ADD CONSTRAINT "users_karma_recognitions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenant_memberships_permissions" ADD CONSTRAINT "users_tenant_memberships_permissions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenant_memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenant_memberships" ADD CONSTRAINT "users_tenant_memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenant_memberships" ADD CONSTRAINT "users_tenant_memberships_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workflows_steps" ADD CONSTRAINT "workflows_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workflows_ethical_framework_bias_checkpoints" ADD CONSTRAINT "workflows_ethical_framework_bias_checkpoints_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workflows_ethical_framework_value_alignment" ADD CONSTRAINT "workflows_ethical_framework_value_alignment_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workflows_change_log" ADD CONSTRAINT "workflows_change_log_changed_by_id_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workflows_change_log" ADD CONSTRAINT "workflows_change_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workflows" ADD CONSTRAINT "workflows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workflows_rels" ADD CONSTRAINT "workflows_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workflows_rels" ADD CONSTRAINT "workflows_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenant_memberships_permissions" ADD CONSTRAINT "tenant_memberships_permissions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tenant_memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "space_memberships_custom_permissions" ADD CONSTRAINT "space_memberships_custom_permissions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."space_memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "space_memberships_crm_data_conversion_events" ADD CONSTRAINT "space_memberships_crm_data_conversion_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."space_memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "space_memberships" ADD CONSTRAINT "space_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "space_memberships" ADD CONSTRAINT "space_memberships_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "space_memberships" ADD CONSTRAINT "space_memberships_tenant_membership_id_tenant_memberships_id_fk" FOREIGN KEY ("tenant_membership_id") REFERENCES "public"."tenant_memberships"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "space_memberships_texts" ADD CONSTRAINT "space_memberships_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."space_memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appointments_reminders_sent" ADD CONSTRAINT "appointments_reminders_sent_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "appointments_rels" ADD CONSTRAINT "appointments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appointments_rels" ADD CONSTRAINT "appointments_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacts_addresses" ADD CONSTRAINT "contacts_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_crm_assigned_to_id_users_id_fk" FOREIGN KEY ("crm_assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts_texts" ADD CONSTRAINT "contacts_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_id_messages_id_fk" FOREIGN KEY ("reply_to_id_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages_rels" ADD CONSTRAINT "messages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "messages_rels" ADD CONSTRAINT "messages_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "messages_rels" ADD CONSTRAINT "messages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spaces_commerce_settings_payment_methods" ADD CONSTRAINT "spaces_commerce_settings_payment_methods_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spaces_commerce_settings_shipping_zones" ADD CONSTRAINT "spaces_commerce_settings_shipping_zones_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sub_tiers" ADD CONSTRAINT "sub_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spaces_integrations_print_partners_product_catalog" ADD CONSTRAINT "spaces_integrations_print_partners_product_catalog_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."spaces_integrations_print_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spaces_integrations_print_partners" ADD CONSTRAINT "spaces_integrations_print_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spaces_integrations_social_bots_platforms" ADD CONSTRAINT "spaces_integrations_social_bots_platforms_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spaces" ADD CONSTRAINT "spaces_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "spaces" ADD CONSTRAINT "spaces_theme_logo_id_media_id_fk" FOREIGN KEY ("theme_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "spaces" ADD CONSTRAINT "spaces_theme_banner_id_media_id_fk" FOREIGN KEY ("theme_banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "spaces_texts" ADD CONSTRAINT "spaces_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_chat_sessions" ADD CONSTRAINT "web_chat_sessions_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "web_chat_sessions" ADD CONSTRAINT "web_chat_sessions_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "web_chat_sessions" ADD CONSTRAINT "web_chat_sessions_assigned_agent_id_users_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "web_chat_sessions" ADD CONSTRAINT "web_chat_sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "web_chat_sessions_rels" ADD CONSTRAINT "web_chat_sessions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."web_chat_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "web_chat_sessions_rels" ADD CONSTRAINT "web_chat_sessions_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "channel_management" ADD CONSTRAINT "channel_management_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "channel_management_rels" ADD CONSTRAINT "channel_management_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."channel_management"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "channel_management_rels" ADD CONSTRAINT "channel_management_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_media_bots" ADD CONSTRAINT "social_media_bots_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_media_bots" ADD CONSTRAINT "social_media_bots_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "linked_accounts" ADD CONSTRAINT "linked_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "linked_accounts" ADD CONSTRAINT "linked_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "invoices_itemized_list" ADD CONSTRAINT "invoices_itemized_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "invoices_payment_methods" ADD CONSTRAINT "invoices_payment_methods_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents_signers" ADD CONSTRAINT "documents_signers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "donations" ADD CONSTRAINT "donations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "donations" ADD CONSTRAINT "donations_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_hero_links" ADD CONSTRAINT "products_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_cta_links" ADD CONSTRAINT "products_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_cta" ADD CONSTRAINT "products_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_content_columns" ADD CONSTRAINT "products_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_content" ADD CONSTRAINT "products_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_media_block" ADD CONSTRAINT "products_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_blocks_media_block" ADD CONSTRAINT "products_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_archive" ADD CONSTRAINT "products_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_form_block" ADD CONSTRAINT "products_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_blocks_form_block" ADD CONSTRAINT "products_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_digital_assets" ADD CONSTRAINT "products_digital_assets_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_digital_assets" ADD CONSTRAINT "products_digital_assets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_tags" ADD CONSTRAINT "products_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_hero_links" ADD CONSTRAINT "_products_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_cta_links" ADD CONSTRAINT "_products_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_cta" ADD CONSTRAINT "_products_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_content_columns" ADD CONSTRAINT "_products_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_content" ADD CONSTRAINT "_products_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_media_block" ADD CONSTRAINT "_products_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_media_block" ADD CONSTRAINT "_products_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_archive" ADD CONSTRAINT "_products_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_form_block" ADD CONSTRAINT "_products_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_form_block" ADD CONSTRAINT "_products_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_digital_assets" ADD CONSTRAINT "_products_v_version_digital_assets_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_digital_assets" ADD CONSTRAINT "_products_v_version_digital_assets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_tags" ADD CONSTRAINT "_products_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_line_items" ADD CONSTRAINT "orders_line_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_line_items" ADD CONSTRAINT "orders_line_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_archive" ADD CONSTRAINT "pages_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_archive" ADD CONSTRAINT "_pages_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "organizations_members" ADD CONSTRAINT "organizations_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "organizations_members" ADD CONSTRAINT "organizations_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations_billing_settings_sharing_discounts" ADD CONSTRAINT "organizations_billing_settings_sharing_discounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations_ops_settings_hours_schedule" ADD CONSTRAINT "organizations_ops_settings_hours_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations_integration_websites" ADD CONSTRAINT "organizations_integration_websites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations_analytics_recipients" ADD CONSTRAINT "organizations_analytics_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_business_hours_schedule" ADD CONSTRAINT "venues_business_hours_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_business_hours_special_hours" ADD CONSTRAINT "venues_business_hours_special_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_staff_specialties" ADD CONSTRAINT "venues_staff_specialties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_staff"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_staff_schedule_availability" ADD CONSTRAINT "venues_staff_schedule_availability_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues_staff"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_staff" ADD CONSTRAINT "venues_staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_staff" ADD CONSTRAINT "venues_staff_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_services" ADD CONSTRAINT "venues_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_bay_management_bays" ADD CONSTRAINT "venues_bay_management_bays_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_integrations_payment_methods" ADD CONSTRAINT "venues_integrations_payment_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_guardian_angel_custom_services" ADD CONSTRAINT "venues_guardian_angel_custom_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues" ADD CONSTRAINT "venues_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues" ADD CONSTRAINT "venues_guardian_angel_assigned_angel_id_business_agents_id_fk" FOREIGN KEY ("guardian_angel_assigned_angel_id") REFERENCES "public"."business_agents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "business_agents_business_knowledge_services" ADD CONSTRAINT "business_agents_business_knowledge_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_agents_business_knowledge_customer_stories" ADD CONSTRAINT "business_agents_business_knowledge_customer_stories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_agents_business_knowledge_frequent_questions" ADD CONSTRAINT "business_agents_business_knowledge_frequent_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_agents_ops_hours_schedule" ADD CONSTRAINT "business_agents_ops_hours_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_agents_ops_handoff_triggers" ADD CONSTRAINT "business_agents_ops_handoff_triggers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_agents_humanitarian_legal_databases" ADD CONSTRAINT "business_agents_humanitarian_legal_databases_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_agents_humanitarian_news_curation_content_filters" ADD CONSTRAINT "business_agents_humanitarian_news_curation_content_filters_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_agents_humanitarian_resources_vendors" ADD CONSTRAINT "business_agents_humanitarian_resources_vendors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_agents_humanitarian_avatar_scope" ADD CONSTRAINT "business_agents_humanitarian_avatar_scope_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_agents_vapi_integration_allowed_actions" ADD CONSTRAINT "business_agents_vapi_integration_allowed_actions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_agents" ADD CONSTRAINT "business_agents_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "business_agents" ADD CONSTRAINT "business_agents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "business_agents" ADD CONSTRAINT "business_agents_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "business_agents" ADD CONSTRAINT "business_agents_human_partner_id_users_id_fk" FOREIGN KEY ("human_partner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "humanitarian_agents_legal_advocacy_legal_databases" ADD CONSTRAINT "humanitarian_agents_legal_advocacy_legal_databases_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."humanitarian_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_generation_queue_source_data_content_themes" ADD CONSTRAINT "ai_generation_queue_source_data_content_themes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_generation_queue"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_generation_queue_parameters_color_scheme" ADD CONSTRAINT "ai_generation_queue_parameters_color_scheme_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_generation_queue"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_generation_queue_parameters_text_elements" ADD CONSTRAINT "ai_generation_queue_parameters_text_elements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_generation_queue"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_generation_queue" ADD CONSTRAINT "ai_generation_queue_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ai_generation_queue" ADD CONSTRAINT "ai_generation_queue_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ai_generation_queue_rels" ADD CONSTRAINT "ai_generation_queue_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ai_generation_queue"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_generation_queue_rels" ADD CONSTRAINT "ai_generation_queue_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_generation_queue_rels" ADD CONSTRAINT "ai_generation_queue_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_generation_queue_rels" ADD CONSTRAINT "ai_generation_queue_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "job_queue" ADD CONSTRAINT "job_queue_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "channels_feed_configuration_filters_file_types" ADD CONSTRAINT "channels_feed_configuration_filters_file_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "channels_feed_configuration_filters_keywords" ADD CONSTRAINT "channels_feed_configuration_filters_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "channels_economics_model_volume_discounts" ADD CONSTRAINT "channels_economics_model_volume_discounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "channels_processing_rules_custom_prompts" ADD CONSTRAINT "channels_processing_rules_custom_prompts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_charter_specializations" ADD CONSTRAINT "phyles_charter_specializations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_charter_core_values" ADD CONSTRAINT "phyles_charter_core_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_governance_leadership_structure" ADD CONSTRAINT "phyles_governance_leadership_structure_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_membership_criteria_admission_requirements" ADD CONSTRAINT "phyles_membership_criteria_admission_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_membership_criteria_skill_requirements" ADD CONSTRAINT "phyles_membership_criteria_skill_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_services_offered_services" ADD CONSTRAINT "phyles_services_offered_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_services_service_guarantees" ADD CONSTRAINT "phyles_services_service_guarantees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_inter_phyle_relations_alliances" ADD CONSTRAINT "phyles_inter_phyle_relations_alliances_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_inter_phyle_relations_competitors" ADD CONSTRAINT "phyles_inter_phyle_relations_competitors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_cultural_aspects_traditions" ADD CONSTRAINT "phyles_cultural_aspects_traditions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_cultural_aspects_celebrations" ADD CONSTRAINT "phyles_cultural_aspects_celebrations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "phyles_cultural_aspects_symbolism_colors" ADD CONSTRAINT "phyles_cultural_aspects_symbolism_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agent_reputation_reputation_history" ADD CONSTRAINT "agent_reputation_reputation_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."agent_reputation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agent_reputation_achievements" ADD CONSTRAINT "agent_reputation_achievements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."agent_reputation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agent_reputation_specializations" ADD CONSTRAINT "agent_reputation_specializations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."agent_reputation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agent_reputation_social_network_mentor_of" ADD CONSTRAINT "agent_reputation_social_network_mentor_of_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."agent_reputation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agent_reputation_social_network_mentored_by" ADD CONSTRAINT "agent_reputation_social_network_mentored_by_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."agent_reputation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agent_reputation_social_network_collaborators" ADD CONSTRAINT "agent_reputation_social_network_collaborators_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."agent_reputation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "agent_reputation_social_network_endorsements" ADD CONSTRAINT "agent_reputation_social_network_endorsements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."agent_reputation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inventory_messages_photos" ADD CONSTRAINT "inventory_messages_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inventory_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inventory_messages_tags" ADD CONSTRAINT "inventory_messages_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inventory_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mileage_logs_photos" ADD CONSTRAINT "mileage_logs_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mileage_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state" ADD CONSTRAINT "forms_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workflows_fk" FOREIGN KEY ("workflows_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenant_memberships_fk" FOREIGN KEY ("tenant_memberships_id") REFERENCES "public"."tenant_memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_space_memberships_fk" FOREIGN KEY ("space_memberships_id") REFERENCES "public"."space_memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_appointments_fk" FOREIGN KEY ("appointments_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_spaces_fk" FOREIGN KEY ("spaces_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_web_chat_sessions_fk" FOREIGN KEY ("web_chat_sessions_id") REFERENCES "public"."web_chat_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_channel_management_fk" FOREIGN KEY ("channel_management_id") REFERENCES "public"."channel_management"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_social_media_bots_fk" FOREIGN KEY ("social_media_bots_id") REFERENCES "public"."social_media_bots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_linked_accounts_fk" FOREIGN KEY ("linked_accounts_id") REFERENCES "public"."linked_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invoices_fk" FOREIGN KEY ("invoices_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_donations_fk" FOREIGN KEY ("donations_id") REFERENCES "public"."donations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_business_agents_fk" FOREIGN KEY ("business_agents_id") REFERENCES "public"."business_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_humanitarian_agents_fk" FOREIGN KEY ("humanitarian_agents_id") REFERENCES "public"."humanitarian_agents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_generation_queue_fk" FOREIGN KEY ("ai_generation_queue_id") REFERENCES "public"."ai_generation_queue"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_job_queue_fk" FOREIGN KEY ("job_queue_id") REFERENCES "public"."job_queue"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_channels_fk" FOREIGN KEY ("channels_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_phyles_fk" FOREIGN KEY ("phyles_id") REFERENCES "public"."phyles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_agent_reputation_fk" FOREIGN KEY ("agent_reputation_id") REFERENCES "public"."agent_reputation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inventory_messages_fk" FOREIGN KEY ("inventory_messages_id") REFERENCES "public"."inventory_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_photo_analysis_fk" FOREIGN KEY ("photo_analysis_id") REFERENCES "public"."photo_analysis"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mileage_logs_fk" FOREIGN KEY ("mileage_logs_id") REFERENCES "public"."mileage_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quote_requests_fk" FOREIGN KEY ("quote_requests_id") REFERENCES "public"."quote_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_jobs_fk" FOREIGN KEY ("payload_jobs_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "tenants_revenue_sharing_volume_discounts_order_idx" ON "tenants_revenue_sharing_volume_discounts" USING btree ("_order");
  CREATE INDEX "tenants_revenue_sharing_volume_discounts_parent_id_idx" ON "tenants_revenue_sharing_volume_discounts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");
  CREATE INDEX "tenants_referral_program_referral_program_referred_by_idx" ON "tenants" USING btree ("referral_program_referred_by_id");
  CREATE INDEX "tenants_configuration_configuration_logo_idx" ON "tenants" USING btree ("configuration_logo_id");
  CREATE INDEX "tenants_configuration_configuration_favicon_idx" ON "tenants" USING btree ("configuration_favicon_id");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_karma_contribution_types_order_idx" ON "users_karma_contribution_types" USING btree ("order");
  CREATE INDEX "users_karma_contribution_types_parent_idx" ON "users_karma_contribution_types" USING btree ("parent_id");
  CREATE INDEX "users_karma_recognitions_order_idx" ON "users_karma_recognitions" USING btree ("_order");
  CREATE INDEX "users_karma_recognitions_parent_id_idx" ON "users_karma_recognitions" USING btree ("_parent_id");
  CREATE INDEX "users_karma_recognitions_awarded_by_idx" ON "users_karma_recognitions" USING btree ("awarded_by_id");
  CREATE INDEX "users_tenant_memberships_permissions_order_idx" ON "users_tenant_memberships_permissions" USING btree ("order");
  CREATE INDEX "users_tenant_memberships_permissions_parent_idx" ON "users_tenant_memberships_permissions" USING btree ("parent_id");
  CREATE INDEX "users_tenant_memberships_order_idx" ON "users_tenant_memberships" USING btree ("_order");
  CREATE INDEX "users_tenant_memberships_parent_id_idx" ON "users_tenant_memberships" USING btree ("_parent_id");
  CREATE INDEX "users_tenant_memberships_tenant_idx" ON "users_tenant_memberships" USING btree ("tenant_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_profile_image_idx" ON "users" USING btree ("profile_image_id");
  CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "workflows_steps_order_idx" ON "workflows_steps" USING btree ("_order");
  CREATE INDEX "workflows_steps_parent_id_idx" ON "workflows_steps" USING btree ("_parent_id");
  CREATE INDEX "workflows_ethical_framework_bias_checkpoints_order_idx" ON "workflows_ethical_framework_bias_checkpoints" USING btree ("_order");
  CREATE INDEX "workflows_ethical_framework_bias_checkpoints_parent_id_idx" ON "workflows_ethical_framework_bias_checkpoints" USING btree ("_parent_id");
  CREATE INDEX "workflows_ethical_framework_value_alignment_order_idx" ON "workflows_ethical_framework_value_alignment" USING btree ("order");
  CREATE INDEX "workflows_ethical_framework_value_alignment_parent_idx" ON "workflows_ethical_framework_value_alignment" USING btree ("parent_id");
  CREATE INDEX "workflows_change_log_order_idx" ON "workflows_change_log" USING btree ("_order");
  CREATE INDEX "workflows_change_log_parent_id_idx" ON "workflows_change_log" USING btree ("_parent_id");
  CREATE INDEX "workflows_change_log_changed_by_idx" ON "workflows_change_log" USING btree ("changed_by_id");
  CREATE INDEX "workflows_tenant_idx" ON "workflows" USING btree ("tenant_id");
  CREATE INDEX "workflows_updated_at_idx" ON "workflows" USING btree ("updated_at");
  CREATE INDEX "workflows_created_at_idx" ON "workflows" USING btree ("created_at");
  CREATE INDEX "workflows_rels_order_idx" ON "workflows_rels" USING btree ("order");
  CREATE INDEX "workflows_rels_parent_idx" ON "workflows_rels" USING btree ("parent_id");
  CREATE INDEX "workflows_rels_path_idx" ON "workflows_rels" USING btree ("path");
  CREATE INDEX "workflows_rels_users_id_idx" ON "workflows_rels" USING btree ("users_id");
  CREATE INDEX "tenant_memberships_permissions_order_idx" ON "tenant_memberships_permissions" USING btree ("order");
  CREATE INDEX "tenant_memberships_permissions_parent_idx" ON "tenant_memberships_permissions" USING btree ("parent_id");
  CREATE INDEX "tenant_memberships_user_idx" ON "tenant_memberships" USING btree ("user_id");
  CREATE INDEX "tenant_memberships_tenant_idx" ON "tenant_memberships" USING btree ("tenant_id");
  CREATE INDEX "tenant_memberships_invited_by_idx" ON "tenant_memberships" USING btree ("invited_by_id");
  CREATE INDEX "tenant_memberships_updated_at_idx" ON "tenant_memberships" USING btree ("updated_at");
  CREATE INDEX "tenant_memberships_created_at_idx" ON "tenant_memberships" USING btree ("created_at");
  CREATE UNIQUE INDEX "user_tenant_idx" ON "tenant_memberships" USING btree ("user_id","tenant_id");
  CREATE INDEX "tenant_role_idx" ON "tenant_memberships" USING btree ("tenant_id","role");
  CREATE INDEX "status_idx" ON "tenant_memberships" USING btree ("status");
  CREATE INDEX "space_memberships_custom_permissions_order_idx" ON "space_memberships_custom_permissions" USING btree ("order");
  CREATE INDEX "space_memberships_custom_permissions_parent_idx" ON "space_memberships_custom_permissions" USING btree ("parent_id");
  CREATE INDEX "space_memberships_crm_data_conversion_events_order_idx" ON "space_memberships_crm_data_conversion_events" USING btree ("_order");
  CREATE INDEX "space_memberships_crm_data_conversion_events_parent_id_idx" ON "space_memberships_crm_data_conversion_events" USING btree ("_parent_id");
  CREATE INDEX "space_memberships_user_idx" ON "space_memberships" USING btree ("user_id");
  CREATE INDEX "space_memberships_space_idx" ON "space_memberships" USING btree ("space_id");
  CREATE INDEX "space_memberships_tenant_membership_idx" ON "space_memberships" USING btree ("tenant_membership_id");
  CREATE INDEX "space_memberships_updated_at_idx" ON "space_memberships" USING btree ("updated_at");
  CREATE INDEX "space_memberships_created_at_idx" ON "space_memberships" USING btree ("created_at");
  CREATE UNIQUE INDEX "user_space_idx" ON "space_memberships" USING btree ("user_id","space_id");
  CREATE INDEX "space_role_idx" ON "space_memberships" USING btree ("space_id","role");
  CREATE INDEX "status_1_idx" ON "space_memberships" USING btree ("status");
  CREATE INDEX "space_memberships_texts_order_parent_idx" ON "space_memberships_texts" USING btree ("order","parent_id");
  CREATE INDEX "appointments_reminders_sent_order_idx" ON "appointments_reminders_sent" USING btree ("_order");
  CREATE INDEX "appointments_reminders_sent_parent_id_idx" ON "appointments_reminders_sent" USING btree ("_parent_id");
  CREATE INDEX "appointments_organizer_idx" ON "appointments" USING btree ("organizer_id");
  CREATE INDEX "appointments_space_idx" ON "appointments" USING btree ("space_id");
  CREATE INDEX "appointments_venue_idx" ON "appointments" USING btree ("venue_id");
  CREATE INDEX "appointments_tenant_idx" ON "appointments" USING btree ("tenant_id");
  CREATE INDEX "appointments_updated_at_idx" ON "appointments" USING btree ("updated_at");
  CREATE INDEX "appointments_created_at_idx" ON "appointments" USING btree ("created_at");
  CREATE INDEX "tenant_organizer_idx" ON "appointments" USING btree ("tenant_id","organizer_id");
  CREATE INDEX "tenant_startTime_idx" ON "appointments" USING btree ("tenant_id","start_time");
  CREATE INDEX "status_2_idx" ON "appointments" USING btree ("status");
  CREATE INDEX "startTime_idx" ON "appointments" USING btree ("start_time");
  CREATE INDEX "space_idx" ON "appointments" USING btree ("space_id");
  CREATE INDEX "appointments_rels_order_idx" ON "appointments_rels" USING btree ("order");
  CREATE INDEX "appointments_rels_parent_idx" ON "appointments_rels" USING btree ("parent_id");
  CREATE INDEX "appointments_rels_path_idx" ON "appointments_rels" USING btree ("path");
  CREATE INDEX "appointments_rels_users_id_idx" ON "appointments_rels" USING btree ("users_id");
  CREATE INDEX "contacts_addresses_order_idx" ON "contacts_addresses" USING btree ("_order");
  CREATE INDEX "contacts_addresses_parent_id_idx" ON "contacts_addresses" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");
  CREATE INDEX "contacts_tenant_idx" ON "contacts" USING btree ("tenant_id");
  CREATE INDEX "contacts_user_idx" ON "contacts" USING btree ("user_id");
  CREATE INDEX "contacts_crm_crm_assigned_to_idx" ON "contacts" USING btree ("crm_assigned_to_id");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  CREATE UNIQUE INDEX "email_idx" ON "contacts" USING btree ("email");
  CREATE INDEX "tenant_type_idx" ON "contacts" USING btree ("tenant_id","type");
  CREATE INDEX "tenant_crm_status_idx" ON "contacts" USING btree ("tenant_id","crm_status");
  CREATE INDEX "contacts_texts_order_parent_idx" ON "contacts_texts" USING btree ("order","parent_id");
  CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");
  CREATE INDEX "messages_space_idx" ON "messages" USING btree ("space_id");
  CREATE INDEX "messages_channel_idx" ON "messages" USING btree ("channel_id");
  CREATE INDEX "messages_thread_id_idx" ON "messages" USING btree ("thread_id");
  CREATE INDEX "messages_reply_to_id_idx" ON "messages" USING btree ("reply_to_id_id");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE INDEX "messages_rels_order_idx" ON "messages_rels" USING btree ("order");
  CREATE INDEX "messages_rels_parent_idx" ON "messages_rels" USING btree ("parent_id");
  CREATE INDEX "messages_rels_path_idx" ON "messages_rels" USING btree ("path");
  CREATE INDEX "messages_rels_users_id_idx" ON "messages_rels" USING btree ("users_id");
  CREATE INDEX "messages_rels_media_id_idx" ON "messages_rels" USING btree ("media_id");
  CREATE INDEX "spaces_commerce_settings_payment_methods_order_idx" ON "spaces_commerce_settings_payment_methods" USING btree ("order");
  CREATE INDEX "spaces_commerce_settings_payment_methods_parent_idx" ON "spaces_commerce_settings_payment_methods" USING btree ("parent_id");
  CREATE INDEX "spaces_commerce_settings_shipping_zones_order_idx" ON "spaces_commerce_settings_shipping_zones" USING btree ("order");
  CREATE INDEX "spaces_commerce_settings_shipping_zones_parent_idx" ON "spaces_commerce_settings_shipping_zones" USING btree ("parent_id");
  CREATE INDEX "sub_tiers_order_idx" ON "sub_tiers" USING btree ("_order");
  CREATE INDEX "sub_tiers_parent_id_idx" ON "sub_tiers" USING btree ("_parent_id");
  CREATE INDEX "spaces_integrations_print_partners_product_catalog_order_idx" ON "spaces_integrations_print_partners_product_catalog" USING btree ("order");
  CREATE INDEX "spaces_integrations_print_partners_product_catalog_parent_idx" ON "spaces_integrations_print_partners_product_catalog" USING btree ("parent_id");
  CREATE INDEX "spaces_integrations_print_partners_order_idx" ON "spaces_integrations_print_partners" USING btree ("_order");
  CREATE INDEX "spaces_integrations_print_partners_parent_id_idx" ON "spaces_integrations_print_partners" USING btree ("_parent_id");
  CREATE INDEX "spaces_integrations_social_bots_platforms_order_idx" ON "spaces_integrations_social_bots_platforms" USING btree ("order");
  CREATE INDEX "spaces_integrations_social_bots_platforms_parent_idx" ON "spaces_integrations_social_bots_platforms" USING btree ("parent_id");
  CREATE INDEX "spaces_tenant_idx" ON "spaces" USING btree ("tenant_id");
  CREATE INDEX "spaces_theme_theme_logo_idx" ON "spaces" USING btree ("theme_logo_id");
  CREATE INDEX "spaces_theme_theme_banner_idx" ON "spaces" USING btree ("theme_banner_id");
  CREATE INDEX "spaces_updated_at_idx" ON "spaces" USING btree ("updated_at");
  CREATE INDEX "spaces_created_at_idx" ON "spaces" USING btree ("created_at");
  CREATE INDEX "spaces_texts_order_parent_idx" ON "spaces_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "web_chat_sessions_session_id_idx" ON "web_chat_sessions" USING btree ("session_id");
  CREATE INDEX "web_chat_sessions_space_idx" ON "web_chat_sessions" USING btree ("space_id");
  CREATE INDEX "web_chat_sessions_customer_idx" ON "web_chat_sessions" USING btree ("customer_id");
  CREATE INDEX "web_chat_sessions_assigned_agent_idx" ON "web_chat_sessions" USING btree ("assigned_agent_id");
  CREATE INDEX "web_chat_sessions_tenant_idx" ON "web_chat_sessions" USING btree ("tenant_id");
  CREATE INDEX "web_chat_sessions_updated_at_idx" ON "web_chat_sessions" USING btree ("updated_at");
  CREATE INDEX "web_chat_sessions_created_at_idx" ON "web_chat_sessions" USING btree ("created_at");
  CREATE INDEX "web_chat_sessions_rels_order_idx" ON "web_chat_sessions_rels" USING btree ("order");
  CREATE INDEX "web_chat_sessions_rels_parent_idx" ON "web_chat_sessions_rels" USING btree ("parent_id");
  CREATE INDEX "web_chat_sessions_rels_path_idx" ON "web_chat_sessions_rels" USING btree ("path");
  CREATE INDEX "web_chat_sessions_rels_messages_id_idx" ON "web_chat_sessions_rels" USING btree ("messages_id");
  CREATE INDEX "channel_management_space_idx" ON "channel_management" USING btree ("space_id");
  CREATE INDEX "channel_management_slug_idx" ON "channel_management" USING btree ("slug");
  CREATE INDEX "channel_management_updated_at_idx" ON "channel_management" USING btree ("updated_at");
  CREATE INDEX "channel_management_created_at_idx" ON "channel_management" USING btree ("created_at");
  CREATE INDEX "channel_management_rels_order_idx" ON "channel_management_rels" USING btree ("order");
  CREATE INDEX "channel_management_rels_parent_idx" ON "channel_management_rels" USING btree ("parent_id");
  CREATE INDEX "channel_management_rels_path_idx" ON "channel_management_rels" USING btree ("path");
  CREATE INDEX "channel_management_rels_users_id_idx" ON "channel_management_rels" USING btree ("users_id");
  CREATE INDEX "social_media_bots_tenant_idx" ON "social_media_bots" USING btree ("tenant_id");
  CREATE INDEX "social_media_bots_space_idx" ON "social_media_bots" USING btree ("space_id");
  CREATE INDEX "social_media_bots_updated_at_idx" ON "social_media_bots" USING btree ("updated_at");
  CREATE INDEX "social_media_bots_created_at_idx" ON "social_media_bots" USING btree ("created_at");
  CREATE INDEX "linked_accounts_provider_idx" ON "linked_accounts" USING btree ("provider");
  CREATE INDEX "linked_accounts_user_idx" ON "linked_accounts" USING btree ("user_id");
  CREATE INDEX "linked_accounts_tenant_idx" ON "linked_accounts" USING btree ("tenant_id");
  CREATE INDEX "linked_accounts_updated_at_idx" ON "linked_accounts" USING btree ("updated_at");
  CREATE INDEX "linked_accounts_created_at_idx" ON "linked_accounts" USING btree ("created_at");
  CREATE INDEX "invoices_itemized_list_order_idx" ON "invoices_itemized_list" USING btree ("_order");
  CREATE INDEX "invoices_itemized_list_parent_id_idx" ON "invoices_itemized_list" USING btree ("_parent_id");
  CREATE INDEX "invoices_payment_methods_order_idx" ON "invoices_payment_methods" USING btree ("order");
  CREATE INDEX "invoices_payment_methods_parent_idx" ON "invoices_payment_methods" USING btree ("parent_id");
  CREATE UNIQUE INDEX "invoices_invoice_number_idx" ON "invoices" USING btree ("invoice_number");
  CREATE INDEX "invoices_tenant_idx" ON "invoices" USING btree ("tenant_id");
  CREATE INDEX "invoices_updated_at_idx" ON "invoices" USING btree ("updated_at");
  CREATE INDEX "invoices_created_at_idx" ON "invoices" USING btree ("created_at");
  CREATE INDEX "documents_signers_order_idx" ON "documents_signers" USING btree ("_order");
  CREATE INDEX "documents_signers_parent_id_idx" ON "documents_signers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "documents_document_id_idx" ON "documents" USING btree ("document_id");
  CREATE INDEX "documents_tenant_idx" ON "documents" USING btree ("tenant_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "donations_donation_id_idx" ON "donations" USING btree ("donation_id");
  CREATE INDEX "donations_tenant_idx" ON "donations" USING btree ("tenant_id");
  CREATE INDEX "donations_space_idx" ON "donations" USING btree ("space_id");
  CREATE INDEX "donations_updated_at_idx" ON "donations" USING btree ("updated_at");
  CREATE INDEX "donations_created_at_idx" ON "donations" USING btree ("created_at");
  CREATE INDEX "products_hero_links_order_idx" ON "products_hero_links" USING btree ("_order");
  CREATE INDEX "products_hero_links_parent_id_idx" ON "products_hero_links" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE INDEX "products_blocks_cta_links_order_idx" ON "products_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "products_blocks_cta_links_parent_id_idx" ON "products_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_cta_order_idx" ON "products_blocks_cta" USING btree ("_order");
  CREATE INDEX "products_blocks_cta_parent_id_idx" ON "products_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_cta_path_idx" ON "products_blocks_cta" USING btree ("_path");
  CREATE INDEX "products_blocks_content_columns_order_idx" ON "products_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "products_blocks_content_columns_parent_id_idx" ON "products_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_content_order_idx" ON "products_blocks_content" USING btree ("_order");
  CREATE INDEX "products_blocks_content_parent_id_idx" ON "products_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_content_path_idx" ON "products_blocks_content" USING btree ("_path");
  CREATE INDEX "products_blocks_media_block_order_idx" ON "products_blocks_media_block" USING btree ("_order");
  CREATE INDEX "products_blocks_media_block_parent_id_idx" ON "products_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_media_block_path_idx" ON "products_blocks_media_block" USING btree ("_path");
  CREATE INDEX "products_blocks_media_block_media_idx" ON "products_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "products_blocks_archive_order_idx" ON "products_blocks_archive" USING btree ("_order");
  CREATE INDEX "products_blocks_archive_parent_id_idx" ON "products_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_archive_path_idx" ON "products_blocks_archive" USING btree ("_path");
  CREATE INDEX "products_blocks_form_block_order_idx" ON "products_blocks_form_block" USING btree ("_order");
  CREATE INDEX "products_blocks_form_block_parent_id_idx" ON "products_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_form_block_path_idx" ON "products_blocks_form_block" USING btree ("_path");
  CREATE INDEX "products_blocks_form_block_form_idx" ON "products_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "products_digital_assets_order_idx" ON "products_digital_assets" USING btree ("_order");
  CREATE INDEX "products_digital_assets_parent_id_idx" ON "products_digital_assets" USING btree ("_parent_id");
  CREATE INDEX "products_digital_assets_file_idx" ON "products_digital_assets" USING btree ("file_id");
  CREATE INDEX "products_tags_order_idx" ON "products_tags" USING btree ("_order");
  CREATE INDEX "products_tags_parent_id_idx" ON "products_tags" USING btree ("_parent_id");
  CREATE INDEX "products_hero_hero_media_idx" ON "products" USING btree ("hero_media_id");
  CREATE UNIQUE INDEX "products_sku_idx" ON "products" USING btree ("sku");
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE INDEX "products_tenant_idx" ON "products" USING btree ("tenant_id");
  CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_pages_id_idx" ON "products_rels" USING btree ("pages_id");
  CREATE INDEX "products_rels_posts_id_idx" ON "products_rels" USING btree ("posts_id");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "products_rels_categories_id_idx" ON "products_rels" USING btree ("categories_id");
  CREATE INDEX "_products_v_version_hero_links_order_idx" ON "_products_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_products_v_version_hero_links_parent_id_idx" ON "_products_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_products_v_blocks_cta_links_order_idx" ON "_products_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_cta_links_parent_id_idx" ON "_products_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_cta_order_idx" ON "_products_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_cta_parent_id_idx" ON "_products_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_cta_path_idx" ON "_products_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_products_v_blocks_content_columns_order_idx" ON "_products_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_content_columns_parent_id_idx" ON "_products_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_content_order_idx" ON "_products_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_content_parent_id_idx" ON "_products_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_content_path_idx" ON "_products_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_products_v_blocks_media_block_order_idx" ON "_products_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_media_block_parent_id_idx" ON "_products_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_media_block_path_idx" ON "_products_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_products_v_blocks_media_block_media_idx" ON "_products_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_products_v_blocks_archive_order_idx" ON "_products_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_archive_parent_id_idx" ON "_products_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_archive_path_idx" ON "_products_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_products_v_blocks_form_block_order_idx" ON "_products_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_form_block_parent_id_idx" ON "_products_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_form_block_path_idx" ON "_products_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_products_v_blocks_form_block_form_idx" ON "_products_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_products_v_version_digital_assets_order_idx" ON "_products_v_version_digital_assets" USING btree ("_order");
  CREATE INDEX "_products_v_version_digital_assets_parent_id_idx" ON "_products_v_version_digital_assets" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_digital_assets_file_idx" ON "_products_v_version_digital_assets" USING btree ("file_id");
  CREATE INDEX "_products_v_version_tags_order_idx" ON "_products_v_version_tags" USING btree ("_order");
  CREATE INDEX "_products_v_version_tags_parent_id_idx" ON "_products_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_hero_version_hero_media_idx" ON "_products_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_products_v_version_version_sku_idx" ON "_products_v" USING btree ("version_sku");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_products_v_version_version_tenant_idx" ON "_products_v" USING btree ("version_tenant_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_pages_id_idx" ON "_products_v_rels" USING btree ("pages_id");
  CREATE INDEX "_products_v_rels_posts_id_idx" ON "_products_v_rels" USING btree ("posts_id");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_rels_categories_id_idx" ON "_products_v_rels" USING btree ("categories_id");
  CREATE INDEX "orders_line_items_order_idx" ON "orders_line_items" USING btree ("_order");
  CREATE INDEX "orders_line_items_parent_id_idx" ON "orders_line_items" USING btree ("_parent_id");
  CREATE INDEX "orders_line_items_product_idx" ON "orders_line_items" USING btree ("product_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_tenant_idx" ON "orders" USING btree ("tenant_id");
  CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_archive_order_idx" ON "pages_blocks_archive" USING btree ("_order");
  CREATE INDEX "pages_blocks_archive_parent_id_idx" ON "pages_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_archive_path_idx" ON "pages_blocks_archive" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_form_idx" ON "pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_archive_order_idx" ON "_pages_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_archive_parent_id_idx" ON "_pages_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_archive_path_idx" ON "_pages_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_form_idx" ON "_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_products_id_idx" ON "_pages_v_rels" USING btree ("products_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
  CREATE INDEX "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_meta_meta_image_idx" ON "categories" USING btree ("meta_image_id");
  CREATE INDEX "categories_tenant_idx" ON "categories" USING btree ("tenant_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "organizations_members_order_idx" ON "organizations_members" USING btree ("_order");
  CREATE INDEX "organizations_members_parent_id_idx" ON "organizations_members" USING btree ("_parent_id");
  CREATE INDEX "organizations_members_user_idx" ON "organizations_members" USING btree ("user_id");
  CREATE INDEX "organizations_billing_settings_sharing_discounts_order_idx" ON "organizations_billing_settings_sharing_discounts" USING btree ("_order");
  CREATE INDEX "organizations_billing_settings_sharing_discounts_parent_id_idx" ON "organizations_billing_settings_sharing_discounts" USING btree ("_parent_id");
  CREATE INDEX "organizations_ops_settings_hours_schedule_order_idx" ON "organizations_ops_settings_hours_schedule" USING btree ("_order");
  CREATE INDEX "organizations_ops_settings_hours_schedule_parent_id_idx" ON "organizations_ops_settings_hours_schedule" USING btree ("_parent_id");
  CREATE INDEX "organizations_integration_websites_order_idx" ON "organizations_integration_websites" USING btree ("_order");
  CREATE INDEX "organizations_integration_websites_parent_id_idx" ON "organizations_integration_websites" USING btree ("_parent_id");
  CREATE INDEX "organizations_analytics_recipients_order_idx" ON "organizations_analytics_recipients" USING btree ("_order");
  CREATE INDEX "organizations_analytics_recipients_parent_id_idx" ON "organizations_analytics_recipients" USING btree ("_parent_id");
  CREATE INDEX "organizations_logo_idx" ON "organizations" USING btree ("logo_id");
  CREATE INDEX "organizations_updated_at_idx" ON "organizations" USING btree ("updated_at");
  CREATE INDEX "organizations_created_at_idx" ON "organizations" USING btree ("created_at");
  CREATE INDEX "venues_business_hours_schedule_order_idx" ON "venues_business_hours_schedule" USING btree ("_order");
  CREATE INDEX "venues_business_hours_schedule_parent_id_idx" ON "venues_business_hours_schedule" USING btree ("_parent_id");
  CREATE INDEX "venues_business_hours_special_hours_order_idx" ON "venues_business_hours_special_hours" USING btree ("_order");
  CREATE INDEX "venues_business_hours_special_hours_parent_id_idx" ON "venues_business_hours_special_hours" USING btree ("_parent_id");
  CREATE INDEX "venues_staff_specialties_order_idx" ON "venues_staff_specialties" USING btree ("_order");
  CREATE INDEX "venues_staff_specialties_parent_id_idx" ON "venues_staff_specialties" USING btree ("_parent_id");
  CREATE INDEX "venues_staff_schedule_availability_order_idx" ON "venues_staff_schedule_availability" USING btree ("_order");
  CREATE INDEX "venues_staff_schedule_availability_parent_id_idx" ON "venues_staff_schedule_availability" USING btree ("_parent_id");
  CREATE INDEX "venues_staff_order_idx" ON "venues_staff" USING btree ("_order");
  CREATE INDEX "venues_staff_parent_id_idx" ON "venues_staff" USING btree ("_parent_id");
  CREATE INDEX "venues_staff_user_idx" ON "venues_staff" USING btree ("user_id");
  CREATE INDEX "venues_services_order_idx" ON "venues_services" USING btree ("_order");
  CREATE INDEX "venues_services_parent_id_idx" ON "venues_services" USING btree ("_parent_id");
  CREATE INDEX "venues_bay_management_bays_order_idx" ON "venues_bay_management_bays" USING btree ("_order");
  CREATE INDEX "venues_bay_management_bays_parent_id_idx" ON "venues_bay_management_bays" USING btree ("_parent_id");
  CREATE INDEX "venues_integrations_payment_methods_order_idx" ON "venues_integrations_payment_methods" USING btree ("_order");
  CREATE INDEX "venues_integrations_payment_methods_parent_id_idx" ON "venues_integrations_payment_methods" USING btree ("_parent_id");
  CREATE INDEX "venues_guardian_angel_custom_services_order_idx" ON "venues_guardian_angel_custom_services" USING btree ("_order");
  CREATE INDEX "venues_guardian_angel_custom_services_parent_id_idx" ON "venues_guardian_angel_custom_services" USING btree ("_parent_id");
  CREATE INDEX "venues_organization_idx" ON "venues" USING btree ("organization_id");
  CREATE INDEX "venues_guardian_angel_guardian_angel_assigned_angel_idx" ON "venues" USING btree ("guardian_angel_assigned_angel_id");
  CREATE INDEX "venues_updated_at_idx" ON "venues" USING btree ("updated_at");
  CREATE INDEX "venues_created_at_idx" ON "venues" USING btree ("created_at");
  CREATE INDEX "business_agents_business_knowledge_services_order_idx" ON "business_agents_business_knowledge_services" USING btree ("_order");
  CREATE INDEX "business_agents_business_knowledge_services_parent_id_idx" ON "business_agents_business_knowledge_services" USING btree ("_parent_id");
  CREATE INDEX "business_agents_business_knowledge_customer_stories_order_idx" ON "business_agents_business_knowledge_customer_stories" USING btree ("_order");
  CREATE INDEX "business_agents_business_knowledge_customer_stories_parent_id_idx" ON "business_agents_business_knowledge_customer_stories" USING btree ("_parent_id");
  CREATE INDEX "business_agents_business_knowledge_frequent_questions_order_idx" ON "business_agents_business_knowledge_frequent_questions" USING btree ("_order");
  CREATE INDEX "business_agents_business_knowledge_frequent_questions_parent_id_idx" ON "business_agents_business_knowledge_frequent_questions" USING btree ("_parent_id");
  CREATE INDEX "business_agents_ops_hours_schedule_order_idx" ON "business_agents_ops_hours_schedule" USING btree ("_order");
  CREATE INDEX "business_agents_ops_hours_schedule_parent_id_idx" ON "business_agents_ops_hours_schedule" USING btree ("_parent_id");
  CREATE INDEX "business_agents_ops_handoff_triggers_order_idx" ON "business_agents_ops_handoff_triggers" USING btree ("_order");
  CREATE INDEX "business_agents_ops_handoff_triggers_parent_id_idx" ON "business_agents_ops_handoff_triggers" USING btree ("_parent_id");
  CREATE INDEX "business_agents_humanitarian_legal_databases_order_idx" ON "business_agents_humanitarian_legal_databases" USING btree ("order");
  CREATE INDEX "business_agents_humanitarian_legal_databases_parent_idx" ON "business_agents_humanitarian_legal_databases" USING btree ("parent_id");
  CREATE INDEX "business_agents_humanitarian_news_curation_content_filters_order_idx" ON "business_agents_humanitarian_news_curation_content_filters" USING btree ("order");
  CREATE INDEX "business_agents_humanitarian_news_curation_content_filters_parent_idx" ON "business_agents_humanitarian_news_curation_content_filters" USING btree ("parent_id");
  CREATE INDEX "business_agents_humanitarian_resources_vendors_order_idx" ON "business_agents_humanitarian_resources_vendors" USING btree ("_order");
  CREATE INDEX "business_agents_humanitarian_resources_vendors_parent_id_idx" ON "business_agents_humanitarian_resources_vendors" USING btree ("_parent_id");
  CREATE INDEX "business_agents_humanitarian_avatar_scope_order_idx" ON "business_agents_humanitarian_avatar_scope" USING btree ("order");
  CREATE INDEX "business_agents_humanitarian_avatar_scope_parent_idx" ON "business_agents_humanitarian_avatar_scope" USING btree ("parent_id");
  CREATE INDEX "business_agents_vapi_integration_allowed_actions_order_idx" ON "business_agents_vapi_integration_allowed_actions" USING btree ("order");
  CREATE INDEX "business_agents_vapi_integration_allowed_actions_parent_idx" ON "business_agents_vapi_integration_allowed_actions" USING btree ("parent_id");
  CREATE INDEX "business_agents_avatar_idx" ON "business_agents" USING btree ("avatar_id");
  CREATE INDEX "business_agents_tenant_idx" ON "business_agents" USING btree ("tenant_id");
  CREATE INDEX "business_agents_space_idx" ON "business_agents" USING btree ("space_id");
  CREATE INDEX "business_agents_human_partner_idx" ON "business_agents" USING btree ("human_partner_id");
  CREATE INDEX "business_agents_updated_at_idx" ON "business_agents" USING btree ("updated_at");
  CREATE INDEX "business_agents_created_at_idx" ON "business_agents" USING btree ("created_at");
  CREATE INDEX "humanitarian_agents_legal_advocacy_legal_databases_order_idx" ON "humanitarian_agents_legal_advocacy_legal_databases" USING btree ("order");
  CREATE INDEX "humanitarian_agents_legal_advocacy_legal_databases_parent_idx" ON "humanitarian_agents_legal_advocacy_legal_databases" USING btree ("parent_id");
  CREATE INDEX "humanitarian_agents_updated_at_idx" ON "humanitarian_agents" USING btree ("updated_at");
  CREATE INDEX "humanitarian_agents_created_at_idx" ON "humanitarian_agents" USING btree ("created_at");
  CREATE INDEX "ai_generation_queue_source_data_content_themes_order_idx" ON "ai_generation_queue_source_data_content_themes" USING btree ("_order");
  CREATE INDEX "ai_generation_queue_source_data_content_themes_parent_id_idx" ON "ai_generation_queue_source_data_content_themes" USING btree ("_parent_id");
  CREATE INDEX "ai_generation_queue_parameters_color_scheme_order_idx" ON "ai_generation_queue_parameters_color_scheme" USING btree ("_order");
  CREATE INDEX "ai_generation_queue_parameters_color_scheme_parent_id_idx" ON "ai_generation_queue_parameters_color_scheme" USING btree ("_parent_id");
  CREATE INDEX "ai_generation_queue_parameters_text_elements_order_idx" ON "ai_generation_queue_parameters_text_elements" USING btree ("_order");
  CREATE INDEX "ai_generation_queue_parameters_text_elements_parent_id_idx" ON "ai_generation_queue_parameters_text_elements" USING btree ("_parent_id");
  CREATE INDEX "ai_generation_queue_space_idx" ON "ai_generation_queue" USING btree ("space_id");
  CREATE INDEX "ai_generation_queue_tenant_idx" ON "ai_generation_queue" USING btree ("tenant_id");
  CREATE INDEX "ai_generation_queue_updated_at_idx" ON "ai_generation_queue" USING btree ("updated_at");
  CREATE INDEX "ai_generation_queue_created_at_idx" ON "ai_generation_queue" USING btree ("created_at");
  CREATE INDEX "ai_generation_queue_rels_order_idx" ON "ai_generation_queue_rels" USING btree ("order");
  CREATE INDEX "ai_generation_queue_rels_parent_idx" ON "ai_generation_queue_rels" USING btree ("parent_id");
  CREATE INDEX "ai_generation_queue_rels_path_idx" ON "ai_generation_queue_rels" USING btree ("path");
  CREATE INDEX "ai_generation_queue_rels_posts_id_idx" ON "ai_generation_queue_rels" USING btree ("posts_id");
  CREATE INDEX "ai_generation_queue_rels_pages_id_idx" ON "ai_generation_queue_rels" USING btree ("pages_id");
  CREATE INDEX "ai_generation_queue_rels_media_id_idx" ON "ai_generation_queue_rels" USING btree ("media_id");
  CREATE INDEX "job_queue_tenant_idx" ON "job_queue" USING btree ("tenant_id");
  CREATE INDEX "job_queue_updated_at_idx" ON "job_queue" USING btree ("updated_at");
  CREATE INDEX "job_queue_created_at_idx" ON "job_queue" USING btree ("created_at");
  CREATE INDEX "channels_feed_configuration_filters_file_types_order_idx" ON "channels_feed_configuration_filters_file_types" USING btree ("_order");
  CREATE INDEX "channels_feed_configuration_filters_file_types_parent_id_idx" ON "channels_feed_configuration_filters_file_types" USING btree ("_parent_id");
  CREATE INDEX "channels_feed_configuration_filters_keywords_order_idx" ON "channels_feed_configuration_filters_keywords" USING btree ("_order");
  CREATE INDEX "channels_feed_configuration_filters_keywords_parent_id_idx" ON "channels_feed_configuration_filters_keywords" USING btree ("_parent_id");
  CREATE INDEX "channels_economics_model_volume_discounts_order_idx" ON "channels_economics_model_volume_discounts" USING btree ("_order");
  CREATE INDEX "channels_economics_model_volume_discounts_parent_id_idx" ON "channels_economics_model_volume_discounts" USING btree ("_parent_id");
  CREATE INDEX "channels_processing_rules_custom_prompts_order_idx" ON "channels_processing_rules_custom_prompts" USING btree ("_order");
  CREATE INDEX "channels_processing_rules_custom_prompts_parent_id_idx" ON "channels_processing_rules_custom_prompts" USING btree ("_parent_id");
  CREATE INDEX "channels_tenant_id_idx" ON "channels" USING btree ("tenant_id");
  CREATE INDEX "channels_guardian_angel_id_idx" ON "channels" USING btree ("guardian_angel_id");
  CREATE INDEX "phyles_charter_specializations_order_idx" ON "phyles_charter_specializations" USING btree ("_order");
  CREATE INDEX "phyles_charter_specializations_parent_id_idx" ON "phyles_charter_specializations" USING btree ("_parent_id");
  CREATE INDEX "phyles_charter_core_values_order_idx" ON "phyles_charter_core_values" USING btree ("_order");
  CREATE INDEX "phyles_charter_core_values_parent_id_idx" ON "phyles_charter_core_values" USING btree ("_parent_id");
  CREATE INDEX "phyles_governance_leadership_structure_order_idx" ON "phyles_governance_leadership_structure" USING btree ("_order");
  CREATE INDEX "phyles_governance_leadership_structure_parent_id_idx" ON "phyles_governance_leadership_structure" USING btree ("_parent_id");
  CREATE INDEX "phyles_membership_criteria_admission_requirements_order_idx" ON "phyles_membership_criteria_admission_requirements" USING btree ("_order");
  CREATE INDEX "phyles_membership_criteria_admission_requirements_parent_id_idx" ON "phyles_membership_criteria_admission_requirements" USING btree ("_parent_id");
  CREATE INDEX "phyles_membership_criteria_skill_requirements_order_idx" ON "phyles_membership_criteria_skill_requirements" USING btree ("_order");
  CREATE INDEX "phyles_membership_criteria_skill_requirements_parent_id_idx" ON "phyles_membership_criteria_skill_requirements" USING btree ("_parent_id");
  CREATE INDEX "phyles_services_offered_services_order_idx" ON "phyles_services_offered_services" USING btree ("_order");
  CREATE INDEX "phyles_services_offered_services_parent_id_idx" ON "phyles_services_offered_services" USING btree ("_parent_id");
  CREATE INDEX "phyles_services_service_guarantees_order_idx" ON "phyles_services_service_guarantees" USING btree ("_order");
  CREATE INDEX "phyles_services_service_guarantees_parent_id_idx" ON "phyles_services_service_guarantees" USING btree ("_parent_id");
  CREATE INDEX "phyles_inter_phyle_relations_alliances_order_idx" ON "phyles_inter_phyle_relations_alliances" USING btree ("_order");
  CREATE INDEX "phyles_inter_phyle_relations_alliances_parent_id_idx" ON "phyles_inter_phyle_relations_alliances" USING btree ("_parent_id");
  CREATE INDEX "phyles_inter_phyle_relations_competitors_order_idx" ON "phyles_inter_phyle_relations_competitors" USING btree ("_order");
  CREATE INDEX "phyles_inter_phyle_relations_competitors_parent_id_idx" ON "phyles_inter_phyle_relations_competitors" USING btree ("_parent_id");
  CREATE INDEX "phyles_cultural_aspects_traditions_order_idx" ON "phyles_cultural_aspects_traditions" USING btree ("_order");
  CREATE INDEX "phyles_cultural_aspects_traditions_parent_id_idx" ON "phyles_cultural_aspects_traditions" USING btree ("_parent_id");
  CREATE INDEX "phyles_cultural_aspects_celebrations_order_idx" ON "phyles_cultural_aspects_celebrations" USING btree ("_order");
  CREATE INDEX "phyles_cultural_aspects_celebrations_parent_id_idx" ON "phyles_cultural_aspects_celebrations" USING btree ("_parent_id");
  CREATE INDEX "phyles_cultural_aspects_symbolism_colors_order_idx" ON "phyles_cultural_aspects_symbolism_colors" USING btree ("_order");
  CREATE INDEX "phyles_cultural_aspects_symbolism_colors_parent_id_idx" ON "phyles_cultural_aspects_symbolism_colors" USING btree ("_parent_id");
  CREATE INDEX "phyles_updated_at_idx" ON "phyles" USING btree ("updated_at");
  CREATE INDEX "phyles_created_at_idx" ON "phyles" USING btree ("created_at");
  CREATE INDEX "agent_reputation_reputation_history_order_idx" ON "agent_reputation_reputation_history" USING btree ("_order");
  CREATE INDEX "agent_reputation_reputation_history_parent_id_idx" ON "agent_reputation_reputation_history" USING btree ("_parent_id");
  CREATE INDEX "agent_reputation_achievements_order_idx" ON "agent_reputation_achievements" USING btree ("_order");
  CREATE INDEX "agent_reputation_achievements_parent_id_idx" ON "agent_reputation_achievements" USING btree ("_parent_id");
  CREATE INDEX "agent_reputation_specializations_order_idx" ON "agent_reputation_specializations" USING btree ("_order");
  CREATE INDEX "agent_reputation_specializations_parent_id_idx" ON "agent_reputation_specializations" USING btree ("_parent_id");
  CREATE INDEX "agent_reputation_social_network_mentor_of_order_idx" ON "agent_reputation_social_network_mentor_of" USING btree ("_order");
  CREATE INDEX "agent_reputation_social_network_mentor_of_parent_id_idx" ON "agent_reputation_social_network_mentor_of" USING btree ("_parent_id");
  CREATE INDEX "agent_reputation_social_network_mentored_by_order_idx" ON "agent_reputation_social_network_mentored_by" USING btree ("_order");
  CREATE INDEX "agent_reputation_social_network_mentored_by_parent_id_idx" ON "agent_reputation_social_network_mentored_by" USING btree ("_parent_id");
  CREATE INDEX "agent_reputation_social_network_collaborators_order_idx" ON "agent_reputation_social_network_collaborators" USING btree ("_order");
  CREATE INDEX "agent_reputation_social_network_collaborators_parent_id_idx" ON "agent_reputation_social_network_collaborators" USING btree ("_parent_id");
  CREATE INDEX "agent_reputation_social_network_endorsements_order_idx" ON "agent_reputation_social_network_endorsements" USING btree ("_order");
  CREATE INDEX "agent_reputation_social_network_endorsements_parent_id_idx" ON "agent_reputation_social_network_endorsements" USING btree ("_parent_id");
  CREATE INDEX "agent_reputation_agent_id_idx" ON "agent_reputation" USING btree ("agent_id");
  CREATE INDEX "agent_reputation_phyle_id_idx" ON "agent_reputation" USING btree ("phyle_id");
  CREATE INDEX "agent_reputation_updated_at_idx" ON "agent_reputation" USING btree ("updated_at");
  CREATE INDEX "agent_reputation_created_at_idx" ON "agent_reputation" USING btree ("created_at");
  CREATE UNIQUE INDEX "agentId_phyleId_idx" ON "agent_reputation" USING btree ("agent_id","phyle_id");
  CREATE INDEX "score_idx" ON "agent_reputation" USING btree ("score");
  CREATE INDEX "rank_idx" ON "agent_reputation" USING btree ("rank");
  CREATE INDEX "inventory_messages_photos_order_idx" ON "inventory_messages_photos" USING btree ("_order");
  CREATE INDEX "inventory_messages_photos_parent_id_idx" ON "inventory_messages_photos" USING btree ("_parent_id");
  CREATE INDEX "inventory_messages_tags_order_idx" ON "inventory_messages_tags" USING btree ("_order");
  CREATE INDEX "inventory_messages_tags_parent_id_idx" ON "inventory_messages_tags" USING btree ("_parent_id");
  CREATE INDEX "inventory_messages_tenant_id_idx" ON "inventory_messages" USING btree ("tenant_id");
  CREATE INDEX "inventory_messages_guardian_angel_id_idx" ON "inventory_messages" USING btree ("guardian_angel_id");
  CREATE INDEX "inventory_messages_user_id_idx" ON "inventory_messages" USING btree ("user_id");
  CREATE INDEX "inventory_messages_message_type_idx" ON "inventory_messages" USING btree ("message_type");
  CREATE INDEX "inventory_messages_category_idx" ON "inventory_messages" USING btree ("category");
  CREATE INDEX "inventory_messages_location_idx" ON "inventory_messages" USING btree ("location");
  CREATE INDEX "inventory_messages_created_at_idx" ON "inventory_messages" USING btree ("created_at");
  CREATE INDEX "inventory_messages_updated_at_idx" ON "inventory_messages" USING btree ("updated_at");
  CREATE INDEX "photo_analysis_updated_at_idx" ON "photo_analysis" USING btree ("updated_at");
  CREATE INDEX "mileage_logs_photos_order_idx" ON "mileage_logs_photos" USING btree ("_order");
  CREATE INDEX "mileage_logs_photos_parent_id_idx" ON "mileage_logs_photos" USING btree ("_parent_id");
  CREATE INDEX "mileage_logs_updated_at_idx" ON "mileage_logs" USING btree ("updated_at");
  CREATE INDEX "mileage_logs_created_at_idx" ON "mileage_logs" USING btree ("created_at");
  CREATE INDEX "quote_requests_updated_at_idx" ON "quote_requests" USING btree ("updated_at");
  CREATE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE INDEX "forms_blocks_number_order_idx" ON "forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "forms_blocks_number" USING btree ("_path");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE INDEX "forms_blocks_state_order_idx" ON "forms_blocks_state" USING btree ("_order");
  CREATE INDEX "forms_blocks_state_parent_id_idx" ON "forms_blocks_state" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_state_path_idx" ON "forms_blocks_state" USING btree ("_path");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
  CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_workflows_id_idx" ON "payload_locked_documents_rels" USING btree ("workflows_id");
  CREATE INDEX "payload_locked_documents_rels_tenant_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("tenant_memberships_id");
  CREATE INDEX "payload_locked_documents_rels_space_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("space_memberships_id");
  CREATE INDEX "payload_locked_documents_rels_appointments_id_idx" ON "payload_locked_documents_rels" USING btree ("appointments_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_locked_documents_rels_spaces_id_idx" ON "payload_locked_documents_rels" USING btree ("spaces_id");
  CREATE INDEX "payload_locked_documents_rels_web_chat_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("web_chat_sessions_id");
  CREATE INDEX "payload_locked_documents_rels_channel_management_id_idx" ON "payload_locked_documents_rels" USING btree ("channel_management_id");
  CREATE INDEX "payload_locked_documents_rels_social_media_bots_id_idx" ON "payload_locked_documents_rels" USING btree ("social_media_bots_id");
  CREATE INDEX "payload_locked_documents_rels_linked_accounts_id_idx" ON "payload_locked_documents_rels" USING btree ("linked_accounts_id");
  CREATE INDEX "payload_locked_documents_rels_invoices_id_idx" ON "payload_locked_documents_rels" USING btree ("invoices_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_donations_id_idx" ON "payload_locked_documents_rels" USING btree ("donations_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_organizations_id_idx" ON "payload_locked_documents_rels" USING btree ("organizations_id");
  CREATE INDEX "payload_locked_documents_rels_venues_id_idx" ON "payload_locked_documents_rels" USING btree ("venues_id");
  CREATE INDEX "payload_locked_documents_rels_business_agents_id_idx" ON "payload_locked_documents_rels" USING btree ("business_agents_id");
  CREATE INDEX "payload_locked_documents_rels_humanitarian_agents_id_idx" ON "payload_locked_documents_rels" USING btree ("humanitarian_agents_id");
  CREATE INDEX "payload_locked_documents_rels_ai_generation_queue_id_idx" ON "payload_locked_documents_rels" USING btree ("ai_generation_queue_id");
  CREATE INDEX "payload_locked_documents_rels_job_queue_id_idx" ON "payload_locked_documents_rels" USING btree ("job_queue_id");
  CREATE INDEX "payload_locked_documents_rels_channels_id_idx" ON "payload_locked_documents_rels" USING btree ("channels_id");
  CREATE INDEX "payload_locked_documents_rels_phyles_id_idx" ON "payload_locked_documents_rels" USING btree ("phyles_id");
  CREATE INDEX "payload_locked_documents_rels_agent_reputation_id_idx" ON "payload_locked_documents_rels" USING btree ("agent_reputation_id");
  CREATE INDEX "payload_locked_documents_rels_inventory_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("inventory_messages_id");
  CREATE INDEX "payload_locked_documents_rels_photo_analysis_id_idx" ON "payload_locked_documents_rels" USING btree ("photo_analysis_id");
  CREATE INDEX "payload_locked_documents_rels_mileage_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("mileage_logs_id");
  CREATE INDEX "payload_locked_documents_rels_quote_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("quote_requests_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_locked_documents_rels_payload_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_jobs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "header_rels_products_id_idx" ON "header_rels" USING btree ("products_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  CREATE INDEX "footer_rels_products_id_idx" ON "footer_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "tenants_revenue_sharing_volume_discounts" CASCADE;
  DROP TABLE "tenants" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_karma_contribution_types" CASCADE;
  DROP TABLE "users_karma_recognitions" CASCADE;
  DROP TABLE "users_tenant_memberships_permissions" CASCADE;
  DROP TABLE "users_tenant_memberships" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "workflows_steps" CASCADE;
  DROP TABLE "workflows_ethical_framework_bias_checkpoints" CASCADE;
  DROP TABLE "workflows_ethical_framework_value_alignment" CASCADE;
  DROP TABLE "workflows_change_log" CASCADE;
  DROP TABLE "workflows" CASCADE;
  DROP TABLE "workflows_rels" CASCADE;
  DROP TABLE "tenant_memberships_permissions" CASCADE;
  DROP TABLE "tenant_memberships" CASCADE;
  DROP TABLE "space_memberships_custom_permissions" CASCADE;
  DROP TABLE "space_memberships_crm_data_conversion_events" CASCADE;
  DROP TABLE "space_memberships" CASCADE;
  DROP TABLE "space_memberships_texts" CASCADE;
  DROP TABLE "appointments_reminders_sent" CASCADE;
  DROP TABLE "appointments" CASCADE;
  DROP TABLE "appointments_rels" CASCADE;
  DROP TABLE "contacts_addresses" CASCADE;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "contacts_texts" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "messages_rels" CASCADE;
  DROP TABLE "spaces_commerce_settings_payment_methods" CASCADE;
  DROP TABLE "spaces_commerce_settings_shipping_zones" CASCADE;
  DROP TABLE "sub_tiers" CASCADE;
  DROP TABLE "spaces_integrations_print_partners_product_catalog" CASCADE;
  DROP TABLE "spaces_integrations_print_partners" CASCADE;
  DROP TABLE "spaces_integrations_social_bots_platforms" CASCADE;
  DROP TABLE "spaces" CASCADE;
  DROP TABLE "spaces_texts" CASCADE;
  DROP TABLE "web_chat_sessions" CASCADE;
  DROP TABLE "web_chat_sessions_rels" CASCADE;
  DROP TABLE "channel_management" CASCADE;
  DROP TABLE "channel_management_rels" CASCADE;
  DROP TABLE "social_media_bots" CASCADE;
  DROP TABLE "linked_accounts" CASCADE;
  DROP TABLE "invoices_itemized_list" CASCADE;
  DROP TABLE "invoices_payment_methods" CASCADE;
  DROP TABLE "invoices" CASCADE;
  DROP TABLE "documents_signers" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "donations" CASCADE;
  DROP TABLE "products_hero_links" CASCADE;
  DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "products_blocks_cta_links" CASCADE;
  DROP TABLE "products_blocks_cta" CASCADE;
  DROP TABLE "products_blocks_content_columns" CASCADE;
  DROP TABLE "products_blocks_content" CASCADE;
  DROP TABLE "products_blocks_media_block" CASCADE;
  DROP TABLE "products_blocks_archive" CASCADE;
  DROP TABLE "products_blocks_form_block" CASCADE;
  DROP TABLE "products_digital_assets" CASCADE;
  DROP TABLE "products_tags" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_hero_links" CASCADE;
  DROP TABLE "_products_v_version_gallery" CASCADE;
  DROP TABLE "_products_v_blocks_cta_links" CASCADE;
  DROP TABLE "_products_v_blocks_cta" CASCADE;
  DROP TABLE "_products_v_blocks_content_columns" CASCADE;
  DROP TABLE "_products_v_blocks_content" CASCADE;
  DROP TABLE "_products_v_blocks_media_block" CASCADE;
  DROP TABLE "_products_v_blocks_archive" CASCADE;
  DROP TABLE "_products_v_blocks_form_block" CASCADE;
  DROP TABLE "_products_v_version_digital_assets" CASCADE;
  DROP TABLE "_products_v_version_tags" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "orders_line_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_archive" CASCADE;
  DROP TABLE "pages_blocks_form_block" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_archive" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts_populated_authors" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_populated_authors" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "organizations_members" CASCADE;
  DROP TABLE "organizations_billing_settings_sharing_discounts" CASCADE;
  DROP TABLE "organizations_ops_settings_hours_schedule" CASCADE;
  DROP TABLE "organizations_integration_websites" CASCADE;
  DROP TABLE "organizations_analytics_recipients" CASCADE;
  DROP TABLE "organizations" CASCADE;
  DROP TABLE "venues_business_hours_schedule" CASCADE;
  DROP TABLE "venues_business_hours_special_hours" CASCADE;
  DROP TABLE "venues_staff_specialties" CASCADE;
  DROP TABLE "venues_staff_schedule_availability" CASCADE;
  DROP TABLE "venues_staff" CASCADE;
  DROP TABLE "venues_services" CASCADE;
  DROP TABLE "venues_bay_management_bays" CASCADE;
  DROP TABLE "venues_integrations_payment_methods" CASCADE;
  DROP TABLE "venues_guardian_angel_custom_services" CASCADE;
  DROP TABLE "venues" CASCADE;
  DROP TABLE "business_agents_business_knowledge_services" CASCADE;
  DROP TABLE "business_agents_business_knowledge_customer_stories" CASCADE;
  DROP TABLE "business_agents_business_knowledge_frequent_questions" CASCADE;
  DROP TABLE "business_agents_ops_hours_schedule" CASCADE;
  DROP TABLE "business_agents_ops_handoff_triggers" CASCADE;
  DROP TABLE "business_agents_humanitarian_legal_databases" CASCADE;
  DROP TABLE "business_agents_humanitarian_news_curation_content_filters" CASCADE;
  DROP TABLE "business_agents_humanitarian_resources_vendors" CASCADE;
  DROP TABLE "business_agents_humanitarian_avatar_scope" CASCADE;
  DROP TABLE "business_agents_vapi_integration_allowed_actions" CASCADE;
  DROP TABLE "business_agents" CASCADE;
  DROP TABLE "humanitarian_agents_legal_advocacy_legal_databases" CASCADE;
  DROP TABLE "humanitarian_agents" CASCADE;
  DROP TABLE "ai_generation_queue_source_data_content_themes" CASCADE;
  DROP TABLE "ai_generation_queue_parameters_color_scheme" CASCADE;
  DROP TABLE "ai_generation_queue_parameters_text_elements" CASCADE;
  DROP TABLE "ai_generation_queue" CASCADE;
  DROP TABLE "ai_generation_queue_rels" CASCADE;
  DROP TABLE "job_queue" CASCADE;
  DROP TABLE "channels_feed_configuration_filters_file_types" CASCADE;
  DROP TABLE "channels_feed_configuration_filters_keywords" CASCADE;
  DROP TABLE "channels_economics_model_volume_discounts" CASCADE;
  DROP TABLE "channels_processing_rules_custom_prompts" CASCADE;
  DROP TABLE "channels" CASCADE;
  DROP TABLE "phyles_charter_specializations" CASCADE;
  DROP TABLE "phyles_charter_core_values" CASCADE;
  DROP TABLE "phyles_governance_leadership_structure" CASCADE;
  DROP TABLE "phyles_membership_criteria_admission_requirements" CASCADE;
  DROP TABLE "phyles_membership_criteria_skill_requirements" CASCADE;
  DROP TABLE "phyles_services_offered_services" CASCADE;
  DROP TABLE "phyles_services_service_guarantees" CASCADE;
  DROP TABLE "phyles_inter_phyle_relations_alliances" CASCADE;
  DROP TABLE "phyles_inter_phyle_relations_competitors" CASCADE;
  DROP TABLE "phyles_cultural_aspects_traditions" CASCADE;
  DROP TABLE "phyles_cultural_aspects_celebrations" CASCADE;
  DROP TABLE "phyles_cultural_aspects_symbolism_colors" CASCADE;
  DROP TABLE "phyles" CASCADE;
  DROP TABLE "agent_reputation_reputation_history" CASCADE;
  DROP TABLE "agent_reputation_achievements" CASCADE;
  DROP TABLE "agent_reputation_specializations" CASCADE;
  DROP TABLE "agent_reputation_social_network_mentor_of" CASCADE;
  DROP TABLE "agent_reputation_social_network_mentored_by" CASCADE;
  DROP TABLE "agent_reputation_social_network_collaborators" CASCADE;
  DROP TABLE "agent_reputation_social_network_endorsements" CASCADE;
  DROP TABLE "agent_reputation" CASCADE;
  DROP TABLE "inventory_messages_photos" CASCADE;
  DROP TABLE "inventory_messages_tags" CASCADE;
  DROP TABLE "inventory_messages" CASCADE;
  DROP TABLE "photo_analysis" CASCADE;
  DROP TABLE "mileage_logs_photos" CASCADE;
  DROP TABLE "mileage_logs" CASCADE;
  DROP TABLE "quote_requests" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_number" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_state" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "search_categories" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TYPE "public"."content_access";
  DROP TYPE "public"."ai_factors";
  DROP TYPE "public"."enum_tenants_business_type";
  DROP TYPE "public"."enum_tenants_revenue_sharing_partnership_tier";
  DROP TYPE "public"."enum_tenants_referral_program_referral_terms";
  DROP TYPE "public"."enum_tenants_referral_program_referral_status";
  DROP TYPE "public"."enum_tenants_status";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_karma_contribution_types";
  DROP TYPE "public"."enum_users_karma_recognitions_type";
  DROP TYPE "public"."enum_users_tenant_memberships_permissions";
  DROP TYPE "public"."enum_users_tenant_memberships_role";
  DROP TYPE "public"."enum_users_preferences_privacy_profile_visibility";
  DROP TYPE "public"."enum_workflows_steps_type";
  DROP TYPE "public"."enum_workflows_steps_target_collection";
  DROP TYPE "public"."enum_workflows_steps_automation";
  DROP TYPE "public"."enum_workflows_ethical_framework_value_alignment";
  DROP TYPE "public"."enum_workflows_status";
  DROP TYPE "public"."enum_workflows_trigger_collection";
  DROP TYPE "public"."enum_workflows_trigger_event";
  DROP TYPE "public"."enum_workflows_business_context_department";
  DROP TYPE "public"."enum_workflows_business_context_process";
  DROP TYPE "public"."enum_workflows_business_context_priority";
  DROP TYPE "public"."enum_workflows_scheduling_timezone";
  DROP TYPE "public"."enum_tenant_memberships_permissions";
  DROP TYPE "public"."enum_tenant_memberships_role";
  DROP TYPE "public"."enum_tenant_memberships_status";
  DROP TYPE "public"."enum_space_memberships_custom_permissions";
  DROP TYPE "public"."enum_space_memberships_role";
  DROP TYPE "public"."enum_space_memberships_status";
  DROP TYPE "public"."enum_space_memberships_crm_data_customer_tier";
  DROP TYPE "public"."enum_appointments_timezone";
  DROP TYPE "public"."enum_appointments_recurrence_type";
  DROP TYPE "public"."enum_appointments_meeting_type";
  DROP TYPE "public"."enum_appointments_appointment_type";
  DROP TYPE "public"."enum_appointments_status";
  DROP TYPE "public"."enum_appointments_revenue_tracking_source";
  DROP TYPE "public"."enum_appointments_payment_currency";
  DROP TYPE "public"."enum_appointments_payment_payment_status";
  DROP TYPE "public"."enum_contacts_addresses_type";
  DROP TYPE "public"."enum_contacts_addresses_country";
  DROP TYPE "public"."enum_contacts_type";
  DROP TYPE "public"."enum_contacts_preferences_preferred_contact_time";
  DROP TYPE "public"."enum_contacts_crm_status";
  DROP TYPE "public"."enum_contacts_crm_source";
  DROP TYPE "public"."enum_messages_message_type";
  DROP TYPE "public"."enum_messages_priority";
  DROP TYPE "public"."enum_spaces_commerce_settings_payment_methods";
  DROP TYPE "public"."enum_spaces_commerce_settings_shipping_zones";
  DROP TYPE "public"."enum_sub_tiers_currency";
  DROP TYPE "public"."enum_spaces_integrations_print_partners_product_catalog";
  DROP TYPE "public"."enum_spaces_integrations_social_bots_platforms";
  DROP TYPE "public"."enum_spaces_business_identity_type";
  DROP TYPE "public"."enum_spaces_business_identity_industry";
  DROP TYPE "public"."enum_spaces_business_identity_company_size";
  DROP TYPE "public"."enum_spaces_business_identity_target_market";
  DROP TYPE "public"."rev_type";
  DROP TYPE "public"."enum_spaces_integrations_scheduling_time_slots";
  DROP TYPE "public"."enum_spaces_visibility";
  DROP TYPE "public"."enum_spaces_member_approval";
  DROP TYPE "public"."enum_web_chat_sessions_status";
  DROP TYPE "public"."enum_channel_management_channel_type";
  DROP TYPE "public"."enum_channel_management_status";
  DROP TYPE "public"."enum_channel_management_category";
  DROP TYPE "public"."enum_channel_management_color";
  DROP TYPE "public"."enum_social_media_bots_status";
  DROP TYPE "public"."enum_linked_accounts_provider";
  DROP TYPE "public"."enum_linked_accounts_status";
  DROP TYPE "public"."enum_invoices_payment_methods";
  DROP TYPE "public"."enum_invoices_status";
  DROP TYPE "public"."enum_documents_signers_role";
  DROP TYPE "public"."enum_documents_signers_status";
  DROP TYPE "public"."enum_documents_signers_signature_type";
  DROP TYPE "public"."enum_documents_type";
  DROP TYPE "public"."enum_documents_status";
  DROP TYPE "public"."enum_donations_cause";
  DROP TYPE "public"."enum_donations_payment_method";
  DROP TYPE "public"."enum_donations_status";
  DROP TYPE "public"."enum_donations_recurring_frequency";
  DROP TYPE "public"."enum_products_hero_links_link_type";
  DROP TYPE "public"."enum_products_hero_links_link_appearance";
  DROP TYPE "public"."enum_products_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_products_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_products_blocks_content_columns_size";
  DROP TYPE "public"."enum_products_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_products_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_products_blocks_archive_populate_by";
  DROP TYPE "public"."enum_products_blocks_archive_relation_to";
  DROP TYPE "public"."enum_products_hero_type";
  DROP TYPE "public"."enum_products_product_type";
  DROP TYPE "public"."enum_products_pricing_currency";
  DROP TYPE "public"."enum_products_details_dimensions_unit";
  DROP TYPE "public"."enum_products_service_details_location";
  DROP TYPE "public"."enum_products_shipping_shipping_class";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__products_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__products_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__products_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__products_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__products_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__products_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__products_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__products_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__products_v_version_hero_type";
  DROP TYPE "public"."enum__products_v_version_product_type";
  DROP TYPE "public"."enum__products_v_version_pricing_currency";
  DROP TYPE "public"."enum__products_v_version_details_dimensions_unit";
  DROP TYPE "public"."enum__products_v_version_service_details_location";
  DROP TYPE "public"."enum__products_v_version_shipping_shipping_class";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_payment_details_payment_method";
  DROP TYPE "public"."enum_orders_fulfillment_method";
  DROP TYPE "public"."enum_orders_fulfillment_status";
  DROP TYPE "public"."enum_orders_fulfillment_carrier";
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_archive_populate_by";
  DROP TYPE "public"."enum_pages_blocks_archive_relation_to";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__pages_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_categories_business_type";
  DROP TYPE "public"."enum_categories_settings_default_sort";
  DROP TYPE "public"."enum_organizations_members_role";
  DROP TYPE "public"."enum_organizations_members_access_level";
  DROP TYPE "public"."enum_organizations_ops_settings_hours_schedule_day_of_week";
  DROP TYPE "public"."enum_organizations_integration_websites_purpose";
  DROP TYPE "public"."enum_organizations_organization_type";
  DROP TYPE "public"."enum_organizations_crm_integration_crm_type";
  DROP TYPE "public"."enum_organizations_crm_integration_sync_schedule";
  DROP TYPE "public"."enum_organizations_crm_integration_sync_status";
  DROP TYPE "public"."enum_organizations_analytics_frequency";
  DROP TYPE "public"."enum_organizations_status";
  DROP TYPE "public"."enum_venues_business_hours_schedule_day_of_week";
  DROP TYPE "public"."enum_venues_staff_schedule_availability_day_of_week";
  DROP TYPE "public"."enum_venues_staff_role";
  DROP TYPE "public"."enum_venues_services_service_type";
  DROP TYPE "public"."enum_venues_bay_management_bays_bay_type";
  DROP TYPE "public"."enum_venues_integrations_payment_methods_type";
  DROP TYPE "public"."enum_venues_venue_type";
  DROP TYPE "public"."enum_venues_integrations_booking_system_booking_system_type";
  DROP TYPE "public"."enum_venues_status";
  DROP TYPE "public"."enum_business_agents_ops_hours_schedule_day";
  DROP TYPE "public"."enum_business_agents_ops_handoff_triggers_trigger";
  DROP TYPE "public"."enum_business_agents_humanitarian_legal_databases";
  DROP TYPE "public"."enum_business_agents_humanitarian_news_curation_content_filters";
  DROP TYPE "public"."enum_business_agents_humanitarian_resources_vendors_type";
  DROP TYPE "public"."enum_business_agents_humanitarian_avatar_scope";
  DROP TYPE "public"."enum_business_agents_vapi_integration_allowed_actions";
  DROP TYPE "public"."enum_business_agents_spirit_type";
  DROP TYPE "public"."enum_business_agents_personality_communication_style";
  DROP TYPE "public"."enum_business_agents_ai_style_formality";
  DROP TYPE "public"."enum_business_agents_agent_type";
  DROP TYPE "public"."enum_business_agents_humanitarian_news_curation_positivity_bias";
  DROP TYPE "public"."enum_business_agents_vapi_integration_voice_id";
  DROP TYPE "public"."enum_business_agents_vapi_integration_status";
  DROP TYPE "public"."enum_humanitarian_agents_legal_advocacy_legal_databases";
  DROP TYPE "public"."enum_humanitarian_agents_spirit_type";
  DROP TYPE "public"."enum_humanitarian_agents_news_curation_hope_bias";
  DROP TYPE "public"."enum_ai_generation_queue_parameters_text_elements_emphasis";
  DROP TYPE "public"."enum_ai_generation_queue_generation_type";
  DROP TYPE "public"."enum_ai_generation_queue_parameters_product_type";
  DROP TYPE "public"."enum_ai_generation_queue_parameters_style_guide";
  DROP TYPE "public"."enum_ai_generation_queue_status";
  DROP TYPE "public"."enum_ai_generation_queue_approval_status";
  DROP TYPE "public"."enum_job_queue_status";
  DROP TYPE "public"."enum_channels_channel_type";
  DROP TYPE "public"."enum_channels_report_type";
  DROP TYPE "public"."enum_channels_feed_configuration_feed_source";
  DROP TYPE "public"."enum_channels_economics_phyle_affiliation";
  DROP TYPE "public"."enum_channels_economics_model_sharing";
  DROP TYPE "public"."enum_channels_processing_rules_output_format";
  DROP TYPE "public"."enum_channels_status";
  DROP TYPE "public"."enum_phyles_membership_criteria_skill_requirements_level";
  DROP TYPE "public"."enum_phyles_inter_phyle_relations_alliances_alliance_type";
  DROP TYPE "public"."enum_phyles_phyle_type";
  DROP TYPE "public"."enum_phyles_economic_structure_taxation_model";
  DROP TYPE "public"."enum_phyles_economic_structure_wealth_distribution";
  DROP TYPE "public"."enum_phyles_governance_governance_model";
  DROP TYPE "public"."enum_phyles_status";
  DROP TYPE "public"."enum_agent_reputation_reputation_history_event_type";
  DROP TYPE "public"."enum_agent_reputation_achievements_achievement";
  DROP TYPE "public"."enum_agent_reputation_specializations_proficiency_level";
  DROP TYPE "public"."enum_agent_reputation_rank";
  DROP TYPE "public"."enum_agent_reputation_status";
  DROP TYPE "public"."enum_inventory_messages_message_type";
  DROP TYPE "public"."enum_inventory_messages_status";
  DROP TYPE "public"."enum_inventory_messages_priority";
  DROP TYPE "public"."enum_photo_analysis_sequence_type";
  DROP TYPE "public"."enum_mileage_logs_type";
  DROP TYPE "public"."enum_quote_requests_service_type";
  DROP TYPE "public"."enum_quote_requests_status";
  DROP TYPE "public"."enum_quote_requests_priority";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_forms_confirmation_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";`)
}
