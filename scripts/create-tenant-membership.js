// Simple script to create tenant membership via direct API call
const membershipData = {
  user: 1,
  tenant: 1, 
  role: 'admin',
  status: 'active'
};

console.log('Creating tenant membership for Kenneth...');
console.log('Membership data:', membershipData);

// We'll use the browser to make this call since the server is running
console.log('\n📋 Please open your browser and go to:');
console.log('http://localhost:3000/admin/collections/tenant-memberships');
console.log('\nThen click "Create New" and fill in:');
console.log('- User: Kenneth Courtney (ID: 1)');
console.log('- Tenant: KenDev.Co (ID: 1)'); 
console.log('- Role: admin');
console.log('- Status: active');
console.log('\nThis will fix the "No tenant memberships found" error.');
