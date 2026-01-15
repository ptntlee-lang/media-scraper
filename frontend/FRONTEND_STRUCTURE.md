# Frontend Structure Guide

## Overview

The frontend has been restructured to follow a **Simplified Modular Architecture** using Next.js 14 App Router with TanStack Query for state management.

## Directory Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx         # Root layout with QueryProvider
│   │   ├── page.tsx           # Home page
│   │   ├── media/             # Media gallery page
│   │   │   └── page.tsx
│   │   └── scraper/           # URL submission page
│   │       └── page.tsx
│   ├── components/            # ALL components organized by feature
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts
│   │   ├── media/             # Media-specific components
│   │   │   ├── MediaCard.tsx
│   │   │   ├── MediaGrid.tsx
│   │   │   ├── MediaFilters.tsx
│   │   │   ├── MediaStats.tsx
│   │   │   └── index.ts
│   │   └── scraper/           # Scraper-specific components
│   │       ├── UrlForm.tsx
│   │       └── index.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── useMedia.ts        # Media data fetching (TanStack Query)
│   │   ├── useMediaStats.ts   # Stats fetching (TanStack Query)
│   │   ├── useScraper.ts      # Scraper mutation (TanStack Query)
│   │   ├── usePagination.ts   # Pagination logic
│   │   ├── useDebounce.ts     # Debounce utility
│   │   └── index.ts
│   ├── lib/                   # Core utilities and configuration
│   │   ├── api.ts             # API client (Axios)
│   │   ├── constants.ts       # App constants
│   │   └── utils.ts           # Utility functions
│   ├── providers/             # React context providers
│   │   ├── QueryProvider.tsx  # TanStack Query provider
│   │   └── index.ts
│   ├── types/                 # TypeScript types
│   │   ├── media.ts           # Media-related types
│   │   ├── scraper.ts         # Scraper-related types
│   │   └── api.ts             # API response types
│   └── styles/                # CSS styles
│       └── globals.css
├── public/                    # Static assets
├── .eslintrc.json            # ESLint configuration
├── next.config.js
├── package.json
└── README.md
```

## Key Features

### 1. **TanStack Query State Management**

- ✅ Automatic caching and background refetching
- ✅ Optimistic updates and automatic invalidation
- ✅ Built-in loading and error states
- ✅ DevTools for debugging

### 2. **Component Organization**

- **UI Components**: Reusable, generic components (buttons, inputs, etc.)
- **Feature Components**: Domain-specific components (media, scraper)
- **Index Files**: Clean exports for easy imports

### 3. **Three-Page Architecture**

- **Home (`/`)**: Landing page with quick navigation
- **Scraper (`/scraper`)**: URL submission interface
- **Media Gallery (`/media`)**: Browse and search scraped media

### 4. **Type Safety**

- Organized TypeScript types by feature
- Proper type exports and re-exports
- No `any` types (except where necessary)

## Usage Examples

### Importing Components

```typescript
// From UI components
import { Button, Input, Pagination } from '@/components/ui';

// From media components
import { MediaGrid, MediaFilters } from '@/components/media';

// From scraper components
import { UrlForm } from '@/components/scraper';
```

### Using Hooks

```typescript
// Fetch media with filters and pagination
const { media, meta, loading, error } = useMedia(filters, page);

// Fetch stats
const { stats, refetch } = useMediaStats();

// Submit URLs for scraping
const { scrapeUrls, loading, isSuccess } = useScraper();
```

### Using Utilities

```typescript
import { isValidUrl, parseUrls, getHostname } from '@/lib/utils';
import { API_CONFIG, PAGINATION } from '@/constants';
import { api } from '@/api';
```

## Development

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Architecture Benefits

1. **Clear Separation of Concerns**: Each directory has a specific purpose
2. **Easy to Navigate**: Logical grouping makes finding code intuitive
3. **Scalable**: Easy to add new features without cluttering
4. **Type-Safe**: Strong TypeScript typing throughout
5. **Modern Stack**: Next.js 14 + TanStack Query + Tailwind CSS
6. **Performance**: Automatic code splitting and optimization

## Migration Notes

### Changes from Old Structure

1. **Removed**: `src/api/` → Moved to `src/api.ts`
2. **Removed**: `src/constants/` → Moved to `src/constants.ts`
3. **Reorganized**: Components split into `ui/`, `media/`, `scraper/`
4. **Renamed**: `useMediaScraper` → `useScraper`
5. **Added**: New utility hooks (`usePagination`, `useDebounce`)
6. **Added**: TanStack Query for state management
7. **Added**: Multiple pages with proper routing

### Import Path Changes

```typescript
// Old
import { mediaApi } from '@/api';
import { API_CONFIG } from '@/constants';
import MediaGallery from '@/components/MediaGallery';

// New
import { api } from '@/api';
import { API_CONFIG } from '@/constants';
import { MediaGrid } from '@/components/media';
```

## Best Practices

1. **Always use index files** for clean exports
2. **Keep components small** and focused on a single responsibility
3. **Use TanStack Query** for all server state
4. **Type everything** properly with TypeScript
5. **Follow the established folder structure** when adding new features
6. **Use provided UI components** before creating new ones

## Contributing

When adding new features:

1. Choose the appropriate directory based on the feature type
2. Create an index file if adding multiple related files
3. Update types in the `types/` directory
4. Follow existing naming conventions
5. Test build with `npm run build`
