# Simplified Project Structure

## 📁 Backend Structure

```
backend/src/
├── modules/
│   ├── config.module.ts           # Configuration module
│   ├── database.module.ts         # PostgreSQL/TypeORM setup
│   ├── queue.module.ts            # BullMQ/Redis setup
│   └── media/
│       ├── media.module.ts        # Media feature module
│       ├── media.controller.ts    # REST endpoints
│       ├── media.service.ts       # Business logic
│       ├── media.entity.ts        # Database model
│       ├── media.dto.ts           # Validation objects
│       ├── media-scraper.service.ts    # Web scraping
│       └── media-scraping.processor.ts # Queue worker
│
├── constants/
│   ├── index.ts
│   ├── app.constants.ts           # App settings
│   └── queue.constants.ts         # Queue configuration
│
├── interfaces/
│   ├── index.ts
│   └── pagination.interface.ts    # Common interfaces
│
├── app.module.ts                  # Root module
└── main.ts                        # Entry point
```

## 🎨 Frontend Structure

```
frontend/src/
├── api/
│   ├── index.ts
│   └── media.api.ts              # API client
│
├── constants/
│   ├── index.ts
│   └── app.constants.ts          # Configuration
│
├── types/
│   ├── index.ts
│   └── media.types.ts            # TypeScript types
│
├── hooks/
│   ├── index.ts
│   ├── useMedia.ts               # Media data fetching
│   ├── useMediaStats.ts          # Stats fetching
│   └── useMediaScraper.ts        # Scraping action
│
├── components/
│   ├── MediaGallery.tsx          # Gallery display
│   ├── Filters.tsx               # Search/filter UI
│   ├── Stats.tsx                 # Statistics
│   ├── UrlForm.tsx               # URL input
│   ├── LoadingSpinner.tsx        # Loading state
│   ├── Pagination.tsx            # Page controls
│   └── EmptyState.tsx            # Empty UI
│
└── app/
    ├── page.tsx                  # Main page
    ├── layout.tsx                # Root layout
    └── globals.css               # Global styles
```

## 📝 Import Examples

### Backend

```typescript
// Modules
import { ConfigModule } from './modules/config.module';
import { DatabaseModule } from './modules/database.module';
import { QueueModule } from './modules/queue.module';
import { MediaModule } from './modules/media/media.module';

// From media module
import { MediaController } from './modules/media/media.controller';
import { MediaService } from './modules/media/media.service';
import { Media } from './modules/media/media.entity';

// Constants & Interfaces
import { QUEUE_NAMES, PAGINATION } from './constants';
import { PaginatedResponse } from './interfaces';
```

### Frontend

```typescript
// API
import { mediaApi } from '@/api';

// Types
import { Media, MediaFilters } from '@/types';

// Constants
import { API_CONFIG, PAGINATION } from '@/constants';

// Hooks
import { useMedia, useMediaStats, useMediaScraper } from '@/hooks';

// Components
import MediaGallery from '@/components/MediaGallery';
import Filters from '@/components/Filters';
```

## 🎯 Key Benefits

1. **Flat Structure**: No deep nesting, easy to navigate
2. **Clear Separation**: modules/, constants/, interfaces/
3. **Simple Imports**: Straightforward paths
4. **Easy to Find**: Predictable file locations
5. **Less Boilerplate**: Fewer index files

## 🚀 Adding New Features

### Backend: Add New Module

```bash
# Create new module
touch src/modules/new-feature.module.ts

# Or create feature folder
mkdir src/modules/new-feature
touch src/modules/new-feature/new-feature.module.ts
touch src/modules/new-feature/new-feature.controller.ts
touch src/modules/new-feature/new-feature.service.ts
```

### Frontend: Add New Component

```bash
# Add component
touch src/components/NewComponent.tsx

# Add hook
touch src/hooks/useNewFeature.ts

# Add types
touch src/types/new-feature.types.ts
```

## 📊 Comparison

### Before (Complex)
```
backend/src/
├── core/
│   ├── config/config.module.ts
│   ├── database/database.module.ts
│   └── queue/queue.module.ts
├── modules/
│   └── media/
│       ├── controllers/media.controller.ts
│       ├── services/media.service.ts
│       └── ...
└── shared/
    ├── constants/...
    └── interfaces/...
```

### After (Simple)
```
backend/src/
├── modules/
│   ├── config.module.ts
│   ├── database.module.ts
│   ├── queue.module.ts
│   └── media/
│       ├── media.controller.ts
│       ├── media.service.ts
│       └── ...
├── constants/...
└── interfaces/...
```

## ✅ What Changed

1. **Backend**:
   - Moved `core/` modules to `modules/` root
   - Flattened media module (no subdirectories)
   - Moved `shared/` to root level (`constants/`, `interfaces/`)
   - Removed unnecessary index.ts files

2. **Frontend**:
   - Moved `core/` folders to root (`api/`, `constants/`, `types/`)
   - Flattened `modules/media/` structure
   - Moved `shared/components/` to `components/`
   - Extracted hooks to dedicated `hooks/` folder

---

**Simple, flat, and easy to understand!** 🎉
