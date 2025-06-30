# System Patterns - Frontend

## Architecture
```
Next.js 14 (App Router)
├── app/
│   ├── layout.tsx (global shell)
│   └── page.tsx   (single page UI)
├── components/
│   ├── JobForm.tsx
│   └── ResultsViewer.tsx
└── lib/api.ts (fetch wrappers → backend)
```

## Key Decisions
- Use fetch wrappers for clarity & testability.
- TailwindCSS for styling; config in `tailwind.config.ts`.
- Environment var `NEXT_PUBLIC_API_BASE` overrides backend URL in prod. 