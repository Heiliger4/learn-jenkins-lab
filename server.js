const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let filePath;

  if (parsedUrl.pathname === "/") {
    filePath = path.join(__dirname, "index.html");
  } else {
    filePath = path.join(__dirname, parsedUrl.pathname);
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  const content = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, { "Content-Type": contentType });
  res.end(content);
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = Number(port) + 1;
      if (port === PORT) {
        console.warn(`Port ${port} is in use, trying ${nextPort} instead...`);
        startServer(nextPort);
      } else {
        console.error(`Unable to bind to any port: ${port} is also in use.`);
        process.exit(1);
      }
    } else {
      throw err;
    }
  });
}

startServer(PORT);

