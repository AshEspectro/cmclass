const fs = require('fs');
const path = require('path');

const filePath = 'cmclass-main/admin/components/pages/Products.tsx';
let lines = fs.readFileSync(filePath, 'utf-8').split('\n');

console.log('File has', lines.length, 'lines');

// Find the exact lines with setNewColorImageUrl in both forms
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("setNewColorImageUrl('');") && lines[i].includes("setNewColorName")) {
    console.log('Line', i+1, ':', lines[i]);
  }
}

// Actually, the pattern is: we need to find setNewColorImageUrl after Ajouter button
// Find all occurrences of "setNewColorImageUrl('');"
const occurrences = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("setNewColorImageUrl('');") && lines[i-1].includes("setNewColorName")) {
    console.log('\nFound color reset block at line', i-1);
    console.log('Line', i, ':', lines[i-1]);
    console.log('Line', i+1, ':', lines[i]);
    console.log('Line', i+2, ':', lines[i+1]);
    occurrences.push(i);
  }
}

console.log('\nTotal occurrences found:', occurrences.length);

// If we have at least 2 occurrences, we need to add hex reset at each
if (occurrences.length >= 2) {
  // Work backwards so line numbers don't shift
  for (let idx = occurrences.length - 1; idx >= 0; idx--) {
    const lineNum = occurrences[idx];
    // Insert before setNewColorImageUrl
    lines.splice(lineNum, 0, '                            setNewColorHex(\'#000000\');');
    console.log('\n✅ Added hex reset before line', lineNum+1, '(in occurrence', idx+1, ')');
  }
  
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  console.log('\n✅ All fixes applied!');
} else {
  console.log('\n❌ Expected 2 occurrences but found:', occurrences.length);
}
