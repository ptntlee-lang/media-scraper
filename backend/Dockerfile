# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install all deps (including dev) in the builder so we can run the build (nest CLI)
# Fall back to a regular install if `npm ci` fails due to lockfile issues
RUN npm ci || npm install --legacy-peer-deps --no-audit --no-fund

COPY . .
# Ensure Prisma client is generated so TypeScript can find model types
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy build output and package metadata
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies in the final image to avoid
# running `npm prune` (which may trigger peer-dependency resolution errors
# inside the builder). Using `npm ci --omit=dev` ensures a clean production
# install based on the lockfile.
RUN npm ci --omit=dev --legacy-peer-deps --no-audit --no-fund || npm install --production --legacy-peer-deps --no-audit --no-fund

# Install prisma CLI locally for migrations (not global to avoid module resolution issues)
RUN npm install --no-save prisma@7.2.0

# Copy the generated Prisma client from the builder stage into the final
# image. The Prisma client is generated during the build step and is not
# available after a production-only `npm ci` (since `prisma` is often a
# devDependency), so copy the generated artifacts from the builder.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma schema files for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

ENV NODE_ENV=development

EXPOSE 3001

# Create a startup script that runs migrations before starting the app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Running Prisma database sync..."' >> /app/start.sh && \
    echo 'cd /app' >> /app/start.sh && \
    echo 'if [ -n "$DATABASE_URL" ]; then' >> /app/start.sh && \
    echo '  npx prisma db push --accept-data-loss 2>&1 || echo "DB sync failed, continuing..."' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "WARNING: DATABASE_URL not set, skipping DB sync"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'exec node dist/src/main' >> /app/start.sh && \
    chmod +x /app/start.sh

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]
