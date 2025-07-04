# Coming to Our Senses - Mindfulness App

## Overview

This is a mobile-first mindfulness application built as a progressive web app (PWA) that provides an 8-week "Coming to Our Senses" course. The app combines guided meditation sessions, journaling features, and daily mindfulness practices to help users develop awareness and transform their relationship with technology.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and bundling
- **Mobile Design**: Responsive design optimized for mobile devices (max-width: 384px)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Style**: RESTful API endpoints

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Type-safe database schema with Zod validation
- **Tables**: Users, sessions, user progress, journal entries, handy hacks, notifications

## Key Components

### Core Features
1. **8-Week Course Structure**: Progressive mindfulness sessions with audio content
2. **Audio Player**: Custom audio player with progress tracking and SoundCloud integration
3. **Journal System**: Daily reflection entries with gratitude and feeling tracking
4. **Handy Hacks**: Quick mindfulness tips and practices
5. **Progress Tracking**: User progress across sessions and overall course completion
6. **Notifications**: Practice reminders and mindfulness notifications

### UI Components
- **Mobile-First Design**: Optimized for smartphone usage
- **Bottom Navigation**: Tab-based navigation (Home, Sessions, Journal, Profile)
- **Status Bar**: Custom mobile status bar simulation
- **Session Cards**: Visual session representations with progress indicators
- **Audio Player**: Integrated audio playback with progress tracking

### Authentication & User Management
- **Demo Mode**: Currently uses a demo user (ID: 1) for development
- **User Profiles**: Basic user management with progress tracking
- **Session Management**: No authentication system implemented yet

## Data Flow

### Session Management Flow
1. User selects a session from the home screen or sessions page
2. Audio player opens with session content
3. Progress is tracked and saved to database every 10 seconds
4. Session marked complete when 90% finished
5. User progress updates unlock new sessions

### Journal Flow
1. User navigates to journal section
2. Creates entries with feeling, gratitude, and reflection fields
3. Entries saved to database with timestamps
4. Historical entries displayed in chronological order

### Progress Tracking Flow
1. User actions trigger progress updates (session completion, hack completion)
2. Progress data stored in user_progress and user_hack_completions tables
3. Dashboard displays overall progress and statistics
4. Course progression unlocks new content based on current week

## External Dependencies

### Database & Backend
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Schema validation integration
- **connect-pg-simple**: PostgreSQL session store

### Frontend Libraries
- **@radix-ui/***: Accessible UI primitives for components
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **class-variance-authority**: Component variant styling
- **date-fns**: Date manipulation utilities

### Audio Integration
- **SoundCloud Integration**: Planned integration for audio content streaming
- **Custom Audio Player**: Built-in audio controls with progress tracking

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing

## Deployment Strategy

### Platform Configuration
- **Hosting**: Replit deployment with autoscale target
- **Build Process**: Vite build for frontend, esbuild for backend
- **Port Configuration**: Internal port 5000, external port 80
- **Environment**: Node.js 20, PostgreSQL 16

### Build & Runtime
- **Development**: `npm run dev` - runs both frontend and backend in development mode
- **Production Build**: `npm run build` - builds both client and server
- **Production Start**: `npm run start` - runs production server
- **Database**: `npm run db:push` - pushes schema changes to database

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)

## Recent Changes
- July 4, 2025: Integrated authentic meditation audio files
  - Replaced placeholder SoundCloud URLs with real MP3 meditation recordings
  - Updated six sessions with authentic content:
    - "Dropping the Balloon" (10 min)
    - "Seven Stations of the Spine" (20 min) 
    - "The Sense of Being Alive" (20 min)
    - "Mind in Body, Body in Movement, Movement in Mind" (10 min)
    - "What if All There is Is This?" (10 min)
    - "Turning Towards Discomfort" (15 min)
  - Implemented HTML5 audio player with real-time progress tracking
  - Audio player now supports actual meditation content with proper duration and timeline
- July 4, 2025: Complete UI redesign inspired by NYT Games aesthetic
  - Implemented vibrant color palette with bright, modern colors (yellow, blue, purple, red, green, orange, mint)
  - Updated session cards with colorful backgrounds and duotone image filters
  - Applied bold, modern typography with improved readability
  - Redesigned header with "Coming to Our Senses" title and clean layout
  - Enhanced progress indicator and bottom navigation styling
  - Added CSS duotone filters for session images that match week colors
- June 16, 2025: Updated color palette and typography to match course guide aesthetic
- Implemented course emblem integration with sophisticated cream and black design
- Enhanced "Remember to..." notification system with 8-week course concepts
- Applied elegant typography with proper font weights and letter spacing
- Updated session cards with refined styling and improved visual hierarchy

## Changelog
- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
Design aesthetic: Course guide inspired - cream background, black typography, sophisticated and elegant presentation.