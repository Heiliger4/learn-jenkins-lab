const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('integration: static assets exist and commits file parses', () => {
  const projectRoot = path.resolve(__dirname, '../../');
  assert.ok(fs.existsSync(path.join(projectRoot, 'index.html')), 'index.html must exist');
  assert.ok(fs.existsSync(path.join(projectRoot, 'server.js')), 'server.js must exist');
  assert.ok(fs.existsSync(path.join(projectRoot, 'data/commits.json')), 'data/commits.json must exist');

  const commits = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data/commits.json'), 'utf8'));
  assert.ok(Array.isArray(commits), 'commits.json should contain an array');
});
