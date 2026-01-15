# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install all deps (including dev) in the builder so we can run the build (nest CLI)
# Fall back to a regular install if `npm ci` fails due to lockfile issues
RUN npm ci || npm install --legacy-peer-deps --no-audit --no-fund

COPY . .
# Ensure Prisma client is generated so TypeScript can find model types
RUN npx prisma generate || true
RUN npm run build

# Remove devDependencies before copying to the final image
RUN npm prune --production

FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy only necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production

EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
