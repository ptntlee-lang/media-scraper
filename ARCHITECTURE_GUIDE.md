# Project Structure Documentation

## Backend Structure (NestJS)

```
backend/src/
├── core/                           # Core infrastructure modules
│   ├── config/
│   │   └── config.module.ts       # Global configuration
│   ├── database/
│   │   └── database.module.ts     # Database configuration
│   ├── queue/
│   │   └── queue.module.ts        # Queue/Redis configuration
│   └── index.ts
│
├── modules/                        # Feature modules
│   └── media/                      # Media scraping feature
│       ├── controllers/
│       │   ├── media.controller.ts # REST endpoints
│       │   └── index.ts
│       ├── services/
│       │   ├── media.service.ts    # Business logic
│       │   ├── scraper.service.ts  # Web scraping logic
│       │   └── index.ts
│       ├── processors/
│       │   ├── scraping.processor.ts # Queue worker
│       │   └── index.ts
│       ├── entities/
│       │   ├── media.entity.ts     # Database entity
│       │   └── index.ts
│       ├── dto/
│       │   ├── media.dto.ts        # Data transfer objects
│       │   └── index.ts
│       ├── media.module.ts         # Module definition
│       └── index.ts
│
├── shared/                         # Shared utilities
│   ├── constants/
│   │   ├── app.constants.ts        # App-wide constants
│   │   ├── queue.constants.ts      # Queue configuration
│   │   └── index.ts
│   ├── interfaces/
│   │   ├── pagination.interface.ts # Common interfaces
│   │   └── index.ts
│   └── index.ts
│
├── app.module.ts                   # Root module
└── main.ts                         # Application entry point
```

### Backend Module Organization

#### Core Modules
- **ConfigModule**: Global configuration management
- **DatabaseModule**: PostgreSQL/TypeORM setup
- **QueueModule**: BullMQ/Redis setup

#### Feature Modules
Each feature module follows this structure:
- **controllers/**: HTTP endpoints
- **services/**: Business logic
- **processors/**: Background job processing
- **entities/**: Database models
- **dto/**: Request/response validation

#### Shared
- **constants/**: Application-wide constants
- **interfaces/**: Shared TypeScript interfaces
- **utils/**: Helper functions (future)

### Import Patterns (Backend)

```typescript
// Core modules
import { DatabaseModule } from './core/database/database.module';
import { QUEUE_NAMES } from './shared/constants';

// Feature modules
import { MediaModule } from './modules/media';
import { MediaService } from './modules/media/services';
import { Media } from './modules/media/entities';
```

---

## Frontend Structure (Next.js)

```
frontend/src/
├── core/                           # Core infrastructure
│   ├── api/
│   │   ├── media.api.ts           # API client
│   │   └── index.ts
│   ├── constants/
│   │   ├── app.constants.ts       # App-wide constants
│   │   └── index.ts
│   ├── types/
│   │   ├── media.types.ts         # TypeScript types
│   │   └── index.ts
│   └── index.ts
│
├── modules/                        # Feature modules
│   └── media/                      # Media feature
│       ├── components/
│       │   ├── MediaGallery.tsx   # Gallery display
│       │   ├── Filters.tsx        # Search/filter UI
│       │   ├── Stats.tsx          # Statistics display
│       │   ├── UrlForm.tsx        # URL submission
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useMedia.ts        # Media fetching hook
│       │   ├── useMediaStats.ts   # Stats fetching hook
│       │   ├── useMediaScraper.ts # Scraping hook
│       │   └── index.ts
│       └── index.ts
│
├── shared/                         # Shared UI components
│   ├── components/
│   │   ├── LoadingSpinner.tsx     # Loading state
│   │   ├── Pagination.tsx         # Pagination controls
│   │   ├── EmptyState.tsx         # Empty state UI
│   │   └── index.ts
│   └── index.ts
│
└── app/                            # Next.js App Router
    ├── layout.tsx                  # Root layout
    ├── page.tsx                    # Home page
    └── globals.css                 # Global styles
```

### Frontend Module Organization

#### Core
- **api/**: API client and HTTP communication
- **constants/**: Configuration and constants
- **types/**: TypeScript types and interfaces

#### Feature Modules
Each feature module contains:
- **components/**: Feature-specific UI components
- **hooks/**: Custom React hooks for data fetching
- **types/**: Feature-specific types (optional)

#### Shared
- **components/**: Reusable UI components
- **hooks/**: Reusable custom hooks (future)
- **utils/**: Helper functions (future)

### Import Patterns (Frontend)

```typescript
// Core imports
import { mediaApi } from '@/core/api';
import { Media, MediaFilters } from '@/core/types';
import { API_CONFIG, PAGINATION } from '@/core/constants';

// Feature module imports
import { MediaGallery, Filters, useMedia, useMediaStats } from '@/modules/media';

// Shared imports
import { LoadingSpinner, Pagination } from '@/shared';
```

### Path Aliases

Configure in `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/core/*": ["./src/core/*"],
    "@/modules/*": ["./src/modules/*"],
    "@/shared/*": ["./src/shared/*"]
  }
}
```

---

## Benefits of This Structure

### 1. **Separation of Concerns**
- Core infrastructure separate from business logic
- Feature modules are self-contained
- Shared utilities centralized

### 2. **Scalability**
- Easy to add new features as modules
- Clear boundaries between features
- Independent development and testing

### 3. **Maintainability**
- Predictable file locations
- Clear import paths
- Easy to navigate codebase

### 4. **Reusability**
- Shared components and utilities
- Feature modules can be reused
- Constants defined once, used everywhere

### 5. **Testability**
- Isolated modules easy to test
- Mock dependencies clearly defined
- Feature-specific tests co-located

---

## Adding New Features

### Backend: Add New Feature Module

1. Create module structure:
```bash
mkdir -p src/modules/new-feature/{controllers,services,entities,dto}
```

2. Create files following media module pattern:
- `new-feature.module.ts`
- `controllers/new-feature.controller.ts`
- `services/new-feature.service.ts`
- `entities/new-feature.entity.ts`
- `dto/new-feature.dto.ts`

3. Register in `app.module.ts`:
```typescript
import { NewFeatureModule } from './modules/new-feature';

@Module({
  imports: [
    // ... existing modules
    NewFeatureModule,
  ],
})
```

### Frontend: Add New Feature Module

1. Create module structure:
```bash
mkdir -p src/modules/new-feature/{components,hooks,types}
```

2. Create components and hooks:
- `components/NewFeature.tsx`
- `hooks/useNewFeature.ts`
- `index.ts` for exports

3. Use in pages:
```typescript
import { NewFeature, useNewFeature } from '@/modules/new-feature';
```

---

## Best Practices

### Backend
1. **One responsibility per service**
2. **Use DTOs for validation**
3. **Export from index.ts for clean imports**
4. **Keep constants in shared/constants**
5. **Use dependency injection**

### Frontend
1. **Co-locate related files**
2. **Use custom hooks for data fetching**
3. **Keep components pure and focused**
4. **Export types from @/core/types**
5. **Use shared components for consistency**

### Both
1. **Follow consistent naming conventions**
2. **Document complex logic**
3. **Keep files small and focused**
4. **Use barrel exports (index.ts)**
5. **Maintain clear boundaries**

---

## Migration Guide

If you have existing code:

### Backend
1. Move feature code to `src/modules/[feature]/`
2. Move config to `src/core/`
3. Move shared utilities to `src/shared/`
4. Update imports
5. Test thoroughly

### Frontend
1. Move feature components to `src/modules/[feature]/components/`
2. Extract data fetching to hooks in `src/modules/[feature]/hooks/`
3. Move API clients to `src/core/api/`
4. Move types to `src/core/types/`
5. Update imports
6. Test thoroughly

---

## Folder Naming Conventions

- **lowercase-with-dashes**: Folder names
- **PascalCase**: Component/Class files
- **camelCase**: Service/utility files
- **kebab-case.type.ts**: Specific file types (constants, types, etc.)

---

This structure provides a solid foundation for building scalable, maintainable applications!
