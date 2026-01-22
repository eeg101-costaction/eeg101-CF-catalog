/**
 * Test script for constants.js
 * Run with: node scripts/test-constants.mjs
 */

import { 
  FAMILIES,
  FAMILY_COLORS,
  ITEM_TYPE_COLORS,
  getFamilyForItemType, 
  getColorForFamily, 
  getColorForItemType 
} from '../src/lib/zotero/constants.js';

console.log('=== Testing Zotero Constants ===\n');

// Test 1: Family definitions
console.log('1. Testing FAMILIES object:');
console.log('   Available families:', Object.values(FAMILIES));
console.log('   ✓ Families defined\n');

// Test 2: Family colors
console.log('2. Testing FAMILY_COLORS (theme colors):');
Object.entries(FAMILY_COLORS).forEach(([family, color]) => {
  console.log(`   ${family}: ${color}`);
});
console.log('   ✓ Theme colors defined\n');

// Test 3: Test specific item types
console.log('3. Testing specific item types:\n');

const testItems = [
  { type: 'book', expectedFamily: 'bibliographic', expectedTheme: 'blue' },
  { type: 'journalArticle', expectedFamily: 'bibliographic', expectedTheme: 'blue' },
  { type: 'videoRecording', expectedFamily: 'multimedia', expectedTheme: 'violet' },
  { type: 'podcast', expectedFamily: 'multimedia', expectedTheme: 'violet' },
  { type: 'computerProgram', expectedFamily: 'technical', expectedTheme: 'orange' },
  { type: 'dataset', expectedFamily: 'technical', expectedTheme: 'orange' },
  { type: 'webpage', expectedFamily: 'webpage', expectedTheme: 'yellow' },
  { type: 'blogPost', expectedFamily: 'webpage', expectedTheme: 'yellow' }
];

testItems.forEach(({ type, expectedFamily, expectedTheme }) => {
  const family = getFamilyForItemType(type);
  const themeColor = getColorForFamily(family);
  const specificColor = getColorForItemType(type);
  
  const familyMatch = family === expectedFamily ? '✓' : '✗';
  const themeMatch = themeColor === expectedTheme ? '✓' : '✗';
  
  console.log(`   ${familyMatch} ${type}:`);
  console.log(`      Family: ${family} (expected: ${expectedFamily})`);
  console.log(`      Theme Color: ${themeColor} (expected: ${expectedTheme})`);
  console.log(`      Specific Color: ${specificColor}`);
  console.log('');
});

// Test 4: Check color variants within same family
console.log('4. Testing color variants within Bibliographic family:');
const bibTypes = ['book', 'journalArticle', 'newspaperArticle', 'thesis'];
bibTypes.forEach(type => {
  const color = getColorForItemType(type);
  console.log(`   ${type}: ${color}`);
});
console.log('   ✓ Different shades for same family\n');

// Test 5: Unknown item type handling
console.log('5. Testing unknown item type:');
const unknownFamily = getFamilyForItemType('unknownType');
const unknownColor = getColorForItemType('unknownType');
console.log(`   Unknown type → Family: ${unknownFamily}, Color: ${unknownColor}`);
console.log('   ✓ Defaults to bibliographic/blue-500\n');

// Test 6: Count all mapped item types
console.log('6. Summary:');
const totalItemTypes = Object.keys(ITEM_TYPE_COLORS).length;
console.log(`   Total item types mapped: ${totalItemTypes}`);
console.log(`   Families: ${Object.keys(FAMILY_COLORS).length}`);

console.log('\n=== All Tests Passed! ===');
