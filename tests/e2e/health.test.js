const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('child_process');
const path = require('path');

test('e2e: health check script returns success', async () => {
  const projectRoot = path.resolve(__dirname, '../../');
  const script = spawn('node', [path.join(projectRoot, 'scripts/health-check.js')], { cwd: projectRoot });
  let output = '';

  for await (const chunk of script.stdout) {
    output += chunk.toString();
  }
  for await (const chunk of script.stderr) {
    output += chunk.toString();
  }

  const code = await new Promise(resolve => script.on('close', resolve));
  assert.equal(code, 0, `health-check script should exit successfully, got ${code}: ${output}`);
});
