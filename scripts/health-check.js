const http = require('http');
const url = process.env.HEALTH_URL || `http://127.0.0.1:3000/`;

const req = http.get(url, res => {
  const status = res.statusCode;
  if (status === 200) {
    console.log(`Health check passed: ${url} returned ${status}`);
    process.exit(0);
  }

  console.error(`Health check failed: ${url} returned ${status}`);
  process.exit(1);
});

req.on('error', err => {
  console.error(`Health check failed: ${err.message}`);
  process.exit(1);
});

