# Quick Reference - Modular Structure

## 📁 Directory Structure

### Backend
```
src/
├── core/          # Infrastructure (config, database, queue)
├── modules/       # Features (media, ...)
├── shared/        # Utilities (constants, interfaces)
├── app.module.ts
└── main.ts
```

### Frontend
```
src/
├── core/          # Infrastructure (api, types, constants)
├── modules/       # Features (media, ...)
├── shared/        # UI components (reusable)
└── app/           # Pages
```

---

## 🎯 Import Patterns

### Backend
```typescript
// Core
import { DatabaseModule } from './core/database/database.module';
import { QUEUE_NAMES } from './shared/constants';

// Features
import { MediaModule } from './modules/media';
import { MediaService } from './modules/media/services';
```

### Frontend
```typescript
// Core
import { mediaApi } from '@/core/api';
import { Media, MediaFilters } from '@/core/types';
import { API_CONFIG } from '@/core/constants';

// Features
import { MediaGallery, useMedia } from '@/modules/media';

// Shared
import { LoadingSpinner, Pagination } from '@/shared';
```

---

## 🔧 Adding New Features

### Backend
```bash
# 1. Create structure
mkdir -p src/modules/new-feature/{controllers,services,entities,dto}

# 2. Create module
touch src/modules/new-feature/new-feature.module.ts

# 3. Register in app.module.ts
```

### Frontend
```bash
# 1. Create structure
mkdir -p src/modules/new-feature/{components,hooks}

# 2. Create files
touch src/modules/new-feature/components/NewFeature.tsx
touch src/modules/new-feature/hooks/useNewFeature.ts

# 3. Export from index.ts
```

---

## 📦 Key Files

### Backend
| File | Purpose |
|------|---------|
| `core/database/database.module.ts` | PostgreSQL config |
| `core/queue/queue.module.ts` | Redis/BullMQ config |
| `shared/constants/queue.constants.ts` | Queue names |
| `shared/constants/app.constants.ts` | App settings |
| `modules/media/media.module.ts` | Media feature |

### Frontend
| File | Purpose |
|------|---------|
| `core/api/media.api.ts` | API client |
| `core/types/media.types.ts` | TypeScript types |
| `core/constants/app.constants.ts` | Configuration |
| `modules/media/hooks/useMedia.ts` | Data fetching |
| `shared/components/LoadingSpinner.tsx` | Loading UI |

---

## 🎨 Component Patterns

### Smart Component (Container)
```typescript
// Uses hooks, manages state
export default function MediaPage() {
  const { media, loading } = useMedia(filters, page);
  return <MediaGallery media={media} />;
}
```

### Dumb Component (Presentation)
```typescript
// Receives props, displays UI
interface Props { media: Media[] }
export default function MediaGallery({ media }: Props) {
  return <div>{/* Display media */}</div>;
}
```

---

## 🪝 Custom Hooks Pattern

```typescript
// src/modules/feature/hooks/useFeature.ts
export const useFeature = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Fetch logic
  }, []);
  
  return { data, loading };
};
```

---

## 🔄 Module Template

### Backend Module
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity]),
    BullModule.registerQueue({ name: 'queue-name' }),
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
```

### Frontend Module
```typescript
// index.ts
export * from './components';
export * from './hooks';
```

---

## 📝 Constants Pattern

```typescript
// Backend: src/shared/constants/feature.constants.ts
export const FEATURE_CONFIG = {
  SETTING_A: 'value',
  SETTING_B: 10,
} as const;

// Frontend: src/core/constants/feature.constants.ts
export const FEATURE_CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
} as const;
```

---

## 🎯 Type Definitions

### Backend
```typescript
// src/shared/interfaces/feature.interface.ts
export interface FeatureData {
  id: number;
  name: string;
}
```

### Frontend
```typescript
// src/core/types/feature.types.ts
export interface Feature {
  id: number;
  name: string;
}
```

---

## 🧪 Testing Structure

### Backend
```
src/modules/media/
├── controllers/
│   ├── media.controller.ts
│   └── media.controller.spec.ts
├── services/
│   ├── media.service.ts
│   └── media.service.spec.ts
```

### Frontend
```
src/modules/media/
├── components/
│   ├── MediaGallery.tsx
│   └── MediaGallery.test.tsx
├── hooks/
│   ├── useMedia.ts
│   └── useMedia.test.ts
```

---

## 🚀 Quick Commands

```bash
# Backend
cd backend
npm run build       # Build
npm run start:dev   # Dev mode

# Frontend
cd frontend
npm run build       # Build
npm run dev         # Dev mode

# Full App
./start.sh          # Start all services
./stop.sh           # Stop all services
```

---

## 📚 Documentation

- [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md) - Full guide
- [RESTRUCTURING_SUMMARY.md](RESTRUCTURING_SUMMARY.md) - Changes
- [BEFORE_AFTER.md](BEFORE_AFTER.md) - Comparison

---

## 🎓 Best Practices

1. ✅ One module per feature
2. ✅ Keep components small
3. ✅ Use custom hooks for logic
4. ✅ Export from index.ts
5. ✅ Centralize constants
6. ✅ Define types once
7. ✅ Co-locate related files
8. ✅ Follow naming conventions

---

**Keep this handy for quick reference!** 📌
