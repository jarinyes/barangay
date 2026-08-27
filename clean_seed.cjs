const fs = require('fs');

let content = fs.readFileSync('src/data/seedData.ts', 'utf8');

// The keys to remove
const keysToRemove = [
  'photos', 
  'attachments', 
  'referrals', 
  'dilgRecommendations', 
  'isPending', 
  'daysPending', 
  'lastActionTaken', 
  'requiredNextAction', 
  'pendingReason', 
  'pendingExplanation'
];

for (const key of keysToRemove) {
  const regex = new RegExp(`^\\s*${key}\\s*:.*\\n?`, 'gm');
  content = content.replace(regex, '');
}

// Remove empty lines for clean up
content = content.replace(/^\s*[\r\n]/gm, '\n');

// Also need to fix status mapping
content = content.replace(/status: '.*?'/g, (match) => {
  if (match.includes('Resolved') || match.includes('Closed')) {
    return `status: 'Resolved'`;
  }
  return `status: 'Unresolved'`;
});

fs.writeFileSync('src/data/seedData.ts', content);
