# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Ensure devDependencies are installed during build
ENV NPM_CONFIG_PRODUCTION=false
# Prefer clean install from lockfile; if lockfile validation fails, fall back to npm install
# This avoids CI failures when the lockfile and package.json become briefly out of sync.
RUN npm ci || npm install --legacy-peer-deps --no-audit --no-fund

COPY . .
RUN npm run build

# Remove devDependencies from node_modules before copying to final image
# keeps final image smaller and ensures only production deps are shipped
RUN if [ -f package-lock.json ]; then npm prune --production; else npm install --production --no-audit --no-fund; fi

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

# Copy necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
