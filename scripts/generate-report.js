const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../data/commits.json');
const commits = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Commit report');
console.log('==============');
console.log(`Total commits: ${commits.length}`);
console.log(`Latest commit: ${commits[commits.length - 1]?.message ?? 'none'}`);
process.exit(0);
