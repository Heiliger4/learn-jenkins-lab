const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

function waitForServer(url, timeout = 5000) {
  const deadline = Date.now() + timeout;
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.request(url, { method: 'HEAD', timeout: 1000 }, res => {
        res.resume();
        resolve();
      });

      req.on('error', () => {
        if (Date.now() > deadline) {
          reject(new Error(`Server did not start before timeout: ${url}`));
        } else {
          setTimeout(check, 200);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`Server did not start before timeout: ${url}`));
        } else {
          setTimeout(check, 200);
        }
      });

      req.end();
    };

    check();
  });
}

test('e2e: health check script returns success', async () => {
  const projectRoot = path.resolve(__dirname, '../../');
  const server = spawn('node', [path.join(projectRoot, 'server.js')], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', () => {});
  server.stderr.on('data', () => {});

  try {
    await waitForServer('http://127.0.0.1:8000/');

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
  } finally {
    server.kill();
  }
});
