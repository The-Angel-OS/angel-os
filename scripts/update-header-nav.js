#!/usr/bin/env node
/**
 * Update header navigation to include Spaces and Docs links
 */

// Use built-in fetch in Node.js 18+
const fetch = globalThis.fetch;

async function updateHeaderNav() {
  console.log('🔧 Updating header navigation...');
  
  try {
    // First, get current header global
    const response = await fetch('http://localhost:3000/api/globals/header', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch header: ${response.status}`);
    }

    const headerData = await response.json();
    console.log('📄 Current header nav items:', headerData.navItems?.length || 0);

    // Update with Spaces and Docs links
    const updatedNavItems = [
      {
        link: {
          type: 'custom',
          label: 'Spaces',
          url: '/spaces',
        },
      },
      {
        link: {
          type: 'custom',
          label: 'Docs',
          url: '/docs',
        },
      },
      // Keep existing nav items
      ...(headerData.navItems || [])
    ];

    // Update header global
    const updateResponse = await fetch('http://localhost:3000/api/globals/header', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        navItems: updatedNavItems
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update header: ${updateResponse.status} - ${errorText}`);
    }

    const result = await updateResponse.json();
    console.log('✅ Header navigation updated successfully!');
    console.log('📝 New nav items count:', result.navItems?.length || 0);
    console.log('🔗 Navigation order: Spaces, Docs, then existing items');

  } catch (error) {
    console.error('❌ Failed to update header navigation:', error.message);
    console.log('💡 Make sure the dev server is running (pnpm dev)');
    console.log('   Then try: node scripts/update-header-nav.js');
  }
}

updateHeaderNav();
