#!/usr/bin/env node
/**
 * Simple seed runner that calls the Payload seed endpoint
 */

// Use built-in fetch in Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

async function runSeed() {
  console.log('🚀 Angel OS Seed Runner');
  console.log('🏭 Template Factory: Initializing Instance 0...');
  console.log('');

  try {
    // Call the seed endpoint
    const response = await fetch('http://localhost:3000/api/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          errorDetails += `\n📋 Server response: ${errorText}`;
        }
      } catch (e) {
        // Ignore error reading response
      }
      throw new Error(errorDetails);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Seeding completed successfully!');
    } else {
      throw new Error(result.error || 'Unknown seeding error');
    }

    console.log('');
    console.log('✅ Angel OS Instance 0 initialized successfully!');
    console.log('🎯 Kenneth Courtney is now the super admin');
    console.log('🏢 KenDev.Co tenant is provisioned and ready');
    console.log('🤖 LEO Site Angel is configured for conversational management');
    console.log('');
    console.log('🌟 You can now run: pnpm dev');
    console.log('🔗 Access dashboard at: http://localhost:3000/dashboard');
    console.log('🔑 Login: kenneth.courtney@gmail.com / K3nD3v!host');
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.log('');
    console.log('💡 Make sure the dev server is running (pnpm dev)');
    console.log('   Then try: node scripts/run-seed.js');
  }
}

runSeed();
