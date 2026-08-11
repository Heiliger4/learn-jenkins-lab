# --- base image ---
FROM node:18-alpine

# git is required because updater.js shells out to `git add/commit/push`
RUN apk add --no-cache git

WORKDIR /app

# Copy manifest first so Docker can cache npm install between builds
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Run the test suite at build time — if tests fail, the image fails to build.
# This is what gives Jenkins a "docker build" stage real signal.
RUN npm test

EXPOSE 8001

# Default: serve the static site.
# Override at `docker run` time with `node updater.js` if you want the
# committer process instead (it will need git credentials mounted in).
CMD ["node", "server.js"]
