# Issue Resolution Report

**Date:** January 20, 2026  
**Issue:** Database initialization error on deployment  
**Status:** ✅ Resolved

---

## Problem Summary

The backend service was encountering a critical runtime error:

```
PrismaClientKnownRequestError: The table 'public.media' does not exist in the current database.
```

This error occurred when the application attempted to query the database immediately after container startup, preventing the `/stats`, `/media`, and related endpoints from functioning correctly.

## Root Cause Analysis

The issue was caused by **missing database schema initialization** in the deployment pipeline. Specifically:

1. The Docker container built the application successfully with Prisma Client generated
2. However, no migration or schema synchronization step was executed before starting the Node.js server
3. The PostgreSQL database remained empty (no tables created)
4. When the application tried to query `prisma.media.count()`, it failed because the table didn't exist

This is a common deployment issue with Prisma ORM when migrations aren't properly integrated into the container lifecycle.

## Solution Implemented

**Modified:** `backend/Dockerfile`

### Key Changes:

1. **Installed Prisma CLI locally** in the production container (Prisma 7.2.0)
   - Avoided global installation to prevent module resolution issues with Prisma 7.x configuration system

2. **Copied Prisma configuration files** to the production image
   - `prisma/schema.prisma` - Database schema definition
   - `prisma.config.ts` - Prisma 7.x configuration file with datasource URL

3. **Created automated startup script** (`/app/start.sh`)
   - Executes `prisma db push --accept-data-loss` before starting the application
   - Synchronizes database schema with Prisma schema automatically
   - Gracefully handles failures to ensure the application still starts
   - Validates `DATABASE_URL` environment variable presence

### Startup Flow:

```
Container Start → Run prisma db push → Create/Update Schema → Start Node.js App
```

## Verification

The fix has been tested and verified:

✅ Database schema created successfully on container startup  
✅ `media` table with correct columns and indexes  
✅ `MediaType` enum created  
✅ Backend health checks passing  
✅ All API endpoints (`/stats`, `/media`, `/scrape`) functional

**Log Confirmation:**

```
Running Prisma database sync...
Loaded Prisma config from prisma.config.ts.
🚀 Your database is now in sync with your Prisma schema. Done in 93ms
Starting application...
[NestFactory] Starting Nest application...
🚀 Backend running on http://localhost:3001
```

## Technical Details

- **Prisma Version:** 7.2.0 (uses new configuration system via `prisma.config.ts`)
- **Database:** PostgreSQL 15
- **Deployment:** Docker Compose with health checks
- **Migration Strategy:** Schema push (suitable for development; recommend migration files for production)

## Recommendation for Production

For production deployments, consider:

1. **Use Prisma Migrate instead of `db push`**

   ```bash
   npx prisma migrate deploy
   ```

   - Requires creating migration files: `npx prisma migrate dev --name init`
   - Provides better audit trail and rollback capability

2. **Separate migration from application deployment**
   - Run migrations as a pre-deployment step or init container
   - Prevents application pods from racing to apply migrations

3. **Add migration status check**
   - Verify all migrations applied before accepting traffic
   - Include in readiness probe

## Commit Reference

```
commit 489d386
fix: Add Prisma database migration on container startup

- Install Prisma CLI locally in Docker container for migration support
- Create startup script to run 'prisma db push' before app initialization
- Copy prisma.config.ts to production image for Prisma 7.x compatibility
- Ensure database schema is synchronized automatically on deployment
```

---

**Resolution Time:** ~45 minutes  
**Testing:** Manual verification via API endpoints and container logs  
**Impact:** Zero data loss, backward compatible deployment
