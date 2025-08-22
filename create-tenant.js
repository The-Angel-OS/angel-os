const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';
const adminEmail = 'kenneth.courtney@gmail.com';
const adminPassword = 'K3nD3v!host';

async function createKenDevTenant() {
  console.log('🚀 Creating KenDev.Co tenant...');

  try {
    // Step 1: Login
    console.log('📝 Step 1: Authenticating...');
    const loginResponse = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText} - ${errorText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Authentication successful');

    // Step 2: Create tenant
    console.log('🏢 Step 2: Creating KenDev.Co tenant...');
    const tenantData = {
      name: 'KenDev.Co',
      slug: 'kendev-co',
      domain: 'kendev.co',
      subdomain: 'kendev',
      businessType: 'service',
      status: 'active',
      configuration: {
        primaryColor: '#2563eb',
        contactEmail: 'kenneth.courtney@gmail.com',
        contactPhone: '+1-555-0123',
        address: {
          street: '123 Developer Lane',
          city: 'Tech City',
          state: 'CA',
          zipCode: '90210',
          country: 'US',
        },
      },
      features: {
        ecommerce: true,
        spaces: true,
        crm: true,
        vapi: true,
        n8n: true,
        memberPortal: true,
      },
      limits: {
        maxUsers: 50,
        maxProducts: 1000,
        maxStorage: 5000,
      },
    };

    const tenantResponse = await fetch(`${baseUrl}/api/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(tenantData),
    });

    if (!tenantResponse.ok) {
      const errorText = await tenantResponse.text();
      throw new Error(`Tenant creation failed: ${tenantResponse.status} ${tenantResponse.statusText} - ${errorText}`);
    }

    const tenantResult = await tenantResponse.json();
    console.log('🎉 KenDev.Co tenant created successfully!');
    console.log(`📊 Tenant ID: ${tenantResult.doc.id}`);
    console.log(`🏷️  Tenant Name: ${tenantResult.doc.name}`);
    console.log(`🔗 Tenant Slug: ${tenantResult.doc.slug}`);
    console.log(`⚙️  Admin URL: ${baseUrl}/admin/collections/tenants/${tenantResult.doc.id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createKenDevTenant();
