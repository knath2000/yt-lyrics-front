# YouTube Lyrics Frontend

A modern Next.js 14 application for submitting YouTube videos for lyrics extraction and viewing the results.

## Features

- 🎵 Submit YouTube URLs for lyrics extraction
- ⏱️ Real-time job status tracking
- 📝 View synchronized lyrics with timestamps
- 🎨 Modern, responsive UI with TailwindCSS
- ⚡ Built with Next.js 14 App Router

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **API Communication**: Fetch API with polling
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update the API base URL in `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE=http://localhost:4000
   ```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
youtube-lyrics-frontend/
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── JobForm.tsx        # URL submission form
│   └── ResultsViewer.tsx  # Lyrics display component
├── lib/                   # Utilities
│   └── api.ts            # API client functions
└── memory-bank/          # Project documentation
```

## API Integration

The frontend communicates with the backend through a RESTful API:

- **POST** `/api/jobs` - Submit YouTube URL for processing
- **GET** `/api/jobs/:id` - Get job status
- **GET** `/api/jobs/:id/result` - Get processing results

## Environment Variables

- `NEXT_PUBLIC_API_BASE` - Backend API base URL

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_BASE` - Your backend URL
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
pnpm build
# Deploy the .next folder to your hosting provider
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License