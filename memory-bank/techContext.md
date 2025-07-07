# Tech Context - Frontend

_Last updated: 2025-04-07_

## Frameworks & Libraries
- **Next.js 14.2** (App Router) - React framework with server-side rendering
- **React 18** - Component library with hooks and modern patterns
- **TailwindCSS 3** - Utility-first CSS framework for responsive design
- **TypeScript** - Full type safety throughout the application

## Dual-Backend Racing Architecture

### Backend Configuration
The frontend implements a **racing system** that submits jobs to multiple backends simultaneously:

```typescript
// lib/api.ts
export const BACKENDS = {
  railway: "https://yt-lyrics-backend-production.up.railway.app",
  flyio: "https://yt-lyrics-backend.fly.dev"
} as const;
```

### Racing System Implementation
- **Simultaneous Submission**: Jobs submitted to both backends at once
- **Real-Time Monitoring**: Status polling every 2 seconds for both backends
- **Winner Detection**: First backend to complete gets highlighted with trophy emoji
- **Failover Logic**: Continues operation if one backend fails

## API Integration Layer

### Core Functions
```typescript
// Dual backend job management
createDualJobs(youtubeUrl: string): Promise<DualJobResponse>
getDualJobStatus(railwayJobId: string, flyioJobId: string): Promise<DualJobStatus>
getJobResults(jobId: string, backend: BackendType): Promise<TranscriptionResults>
```

### Request/Response Types
```typescript
interface DualJobResponse {
  railway: { jobId: string; status: string } | { error: string };
  flyio: { jobId: string; status: string } | { error: string };
}

interface DualJobStatus {
  railway: JobStatus | null;
  flyio: JobStatus | null;
  winner: 'railway' | 'flyio' | null;
}

interface JobStatus {
  status: 'queued' | 'processing' | 'done' | 'error';
  pct: number;
  statusMessage: string;
  resultUrl?: string;
}
```

## Component Architecture

### App Structure
```
Next.js 14 (App Router)
├── app/
│   ├── layout.tsx     # Global shell with metadata
│   ├── page.tsx       # Main racing interface
│   └── globals.css    # Tailwind CSS imports
├── components/
│   ├── JobForm.tsx    # Dual-backend racing UI
│   └── ResultsViewer.tsx # Multi-format results display
└── lib/
    └── api.ts         # Backend integration and racing logic
```

### JobForm Component Features
- **Racing Interface**: Visual comparison between Railway (purple) and Fly.io (blue)
- **Progress Tracking**: Real-time progress bars with stage indicators
- **Winner Detection**: Trophy emoji and highlighting for fastest backend
- **Error Handling**: Graceful degradation when backends fail

### ResultsViewer Component Features
- **Multi-Format Display**: SRT subtitles, plain text, and word-by-word views
- **Download Options**: Direct download of SRT and TXT files
- **Metadata Display**: Video title, duration, word count, processing timestamp
- **Backend Attribution**: Shows which backend provided the results

## Styling & Design System

### TailwindCSS Configuration
```javascript
// tailwind.config.ts
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        railway: '#8B5CF6',  // Purple for Railway backend
        flyio: '#3B82F6',    // Blue for Fly.io backend
      }
    }
  }
}
```

### Design Patterns
- **Racing Theme**: Color-coded backends with racing metaphors
- **Progress Visualization**: Gradient progress bars with smooth animations
- **Stage Indicators**: Emoji-based pipeline visualization (📥→🎵→🎤→⏱️→💾)
- **Responsive Design**: Mobile-first approach with grid layouts

## Development Tooling

### Scripts
```json
{
  "dev": "next dev",           // Development server on :3000
  "build": "next build",       // Production build
  "start": "next start",       // Production server
  "lint": "next lint"          // ESLint checking
}
```

### Configuration Files
- **PostCSS**: `postcss.config.js` - Autoprefixer and TailwindCSS processing
- **TypeScript**: `tsconfig.json` - Strict type checking enabled
- **Next.js**: `next.config.js` - Framework configuration

## Environment Configuration

### Environment Variables
```bash
# Development (defaults)
NEXT_PUBLIC_RAILWAY_API_BASE=http://localhost:4000
NEXT_PUBLIC_FLYIO_API_BASE=http://localhost:4001

# Production (Vercel deployment)
NEXT_PUBLIC_RAILWAY_API_BASE=https://yt-lyrics-backend-production.up.railway.app
NEXT_PUBLIC_FLYIO_API_BASE=https://yt-lyrics-backend.fly.dev
```

### Deployment Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

## Performance Optimizations

### Racing System Benefits
- **Speed**: Users get results from fastest backend (typically 50-100 seconds)
- **Reliability**: Redundancy ensures high availability
- **Load Distribution**: Traffic spread across multiple platforms
- **Real-Time Feedback**: Live progress updates every 2 seconds

### Frontend Optimizations
- **Efficient Polling**: Smart polling that stops when jobs complete
- **Error Recovery**: `Promise.allSettled()` prevents single backend failures
- **State Management**: Minimal re-renders with proper React state handling
- **Responsive Design**: Optimized for all screen sizes

## Build & Deployment

### Build Process
```bash
# Local development
pnpm dev                    # Start development server

# Production build
pnpm build                  # Create optimized production build
pnpm start                  # Serve production build locally
```

### Deployment Pipeline
- **Platform**: Vercel (automatic deployment on git push)
- **Build**: Next.js static optimization with SSR where needed
- **Environment**: Production environment variables configured
- **Domain**: Custom domain with HTTPS enabled

## Testing Strategy

### Manual Testing
- **Cross-Browser**: Verified on Chrome, Firefox, Safari, Edge
- **Mobile Testing**: Responsive design tested on various screen sizes
- **Racing System**: Comprehensive testing with real YouTube URLs
- **Error Scenarios**: Backend failure and recovery testing

### Quality Assurance
- **TypeScript**: Compile-time type checking prevents runtime errors
- **ESLint**: Code quality and consistency enforcement
- **Responsive Design**: Mobile-first approach ensures compatibility
- **Performance**: Lighthouse audits for optimization validation

## Security Considerations

### Client-Side Security
- **Input Validation**: YouTube URL format validation before submission
- **HTTPS**: All API calls use secure HTTPS connections
- **Environment Variables**: Sensitive config properly managed
- **CORS**: Backend CORS configuration allows frontend domain

### Data Handling
- **No Sensitive Data**: No user authentication or personal data storage
- **Temporary Processing**: All data processed temporarily on backend
- **Public URLs**: Only public YouTube URLs accepted
- **Error Handling**: No sensitive information exposed in error messages

## Future Enhancements

### Planned Features
1. **Performance Analytics**: Historical racing data and trends
2. **Smart Routing**: Intelligent backend selection based on performance
3. **Batch Processing**: Multiple URL racing support
4. **Customization**: User preferences for display modes

### Technical Improvements
1. **Caching**: Client-side caching for repeated URLs
2. **Offline Support**: Service worker for offline functionality
3. **Progressive Web App**: PWA features for mobile experience
4. **Advanced Analytics**: Detailed performance metrics and insights