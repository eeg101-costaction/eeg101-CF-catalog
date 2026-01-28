#!/usr/bin/env node

/**
 * Test Zotero Polling Locally
 * 
 * Simulates what the cron job does by calling the polling endpoint
 * Usage: npm run test:polling
 */

async function testPolling() {
  console.log('\n🧪 Testing Zotero polling...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/cron/poll-zotero', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📨 Response status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response body:\n');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Polling test successful!\n');
      console.log(`Checked ${data.checked} collections, ${data.changed} changed\n`);
      
      if (data.collections && data.collections.length > 0) {
        console.log('Changed collections:');
        data.collections.forEach(col => {
          console.log(`  • ${col.name} (${col.key})`);
          console.log(`    Version: ${col.lastVersion} → ${col.currentVersion}`);
        });
        console.log();
      }
    } else {
      console.log('\n⚠️  Polling returned non-200 status\n');
    }

  } catch (error) {
    console.error('\n❌ Error testing polling:', error.message);
    console.log('\n💡 Make sure the dev server is running: npm run dev\n');
    process.exit(1);
  }
}

testPolling();
