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
- October 6, 2025: Implemented week navigation with swipe gestures and interactive indicators
  - Added swipe left/right gestures to navigate between weeks 1-8
  - Implemented week indicator dots showing current progress and viewed week
  - Added visual distinction between current week (gradient) and viewed week (elongated bar)
  - Created "Return to Current Week" button when browsing other weeks
  - Dashboard content dynamically updates to show selected week's session, practice, hack, and journaling
  - Touch gesture support with 50px minimum swipe distance for smooth navigation
  - All navigation features verified through end-to-end testing
- October 2, 2025: Redesigned dashboard with NYT-style vibrant colorful layout
  - Implemented full-screen colorful card-based design inspired by NYT quizzing app
  - Created session title and picture card with yellow/orange gradient (full width)
  - Added daily practice card with large play button and green/teal gradient (full width)
  - Implemented half-screen cards: handy hack (pink gradient) and journal (purple gradient) side by side
  - Moved progress bar to fixed bottom position with gradient fill
  - Created dedicated session page (/session/:id) for audio playback
  - Fixed React hooks error in AudioPlayer component (removed conditional hook calls)
  - Added proper routing for session playback page
  - Screen now filled with vibrant colors creating an engaging, modern UI experience
- September 28, 2025: Implemented course format preference system
  - Added courseFormat field to user database schema with default "8-week" value
  - Created comprehensive settings panel with course format and session pace options
  - Implemented session availability logic with "effective pace" calculation for 4-week condensed courses
  - Enhanced progress indicators to display course format alongside session pace
  - Added API endpoint (PUT /api/users/:userId/course-format) for updating course format preferences
  - Fixed session ordering in database queries to ensure deterministic session availability
  - All functionality verified through end-to-end testing with successful persistence and UI updates
- July 7, 2025: Implemented comprehensive audio session tracking and progression system
  - Enhanced database schema with detailed session analytics tracking (play count, pause count, skip count, completion percentage)
  - Added sessionAnalytics table for granular tracking of user behavior (start/end times, pause durations, seek events, device type)
  - Created advanced storage methods for comprehensive progress analysis including weekly progress, practice patterns, and most played sessions
  - Built ProgressDashboard component with interactive charts showing practice statistics, time patterns, and detailed session analytics
  - Enhanced SimpleAudioPlayer with real-time event tracking (play, pause, seek events) and automatic analytics logging
  - Added new API routes for session analytics and advanced progress data
  - Integrated analytics dashboard into Profile page with tabs for comprehensive progress visualization
  - System now tracks: total listen time, session completion rates, practice streaks, weekly progress, daily practice patterns, pause/skip behavior
- July 4, 2025: Configured iOS App Store deployment with Capacitor
  - Added Capacitor configuration for native iOS app conversion
  - Installed native plugins for notifications, splash screen, device access, and file system
  - Created comprehensive deployment guide and build scripts
  - Set up app identity: "Coming to Our Senses" (com.ctos.mindfulness)
  - Ready for Mac-based Xcode development and App Store submission
- July 4, 2025: Enhanced sessions page with expandable cards and integrated images
  - Created concertina-style expandable cards with smooth Framer Motion animations
  - Integrated session images directly into collapsed card headers while preserving gradient colors
  - Updated "What You Really Want" session with new custom illustration showing two figures in contemplation
  - Updated "Finding Your Flow" session with new custom illustration showing journaling for flow with flowing creative energy
  - Updated "Falling Awake" session with new custom illustration showing a figure sharing before a supportive group
  - Improved text readability by breaking course descriptions into digestible paragraphs
  - Removed duplicate elements (play buttons, duration from headers) for cleaner design
  - Each card now shows week badge, session image, title, and expand arrow in perfect visual hierarchy
- July 4, 2025: Completely redesigned journal system with structured morning and evening routines
  - Created comprehensive daily journal with tabbed interface for morning/evening sections
  - Implemented morning routine with 3 gratitude fields, 3 high value priorities, 3 high flow priorities
  - Added voice recording functionality for "Script the Day" morning routine and evening reflection
  - Enhanced database schema with detailed journaling fields and completion tracking
  - Built progress indicators and completion badges for morning/evening routines
  - Added API endpoints for creating and updating journal entries
- July 4, 2025: Updated header logo to use authentic CTOS emblem
  - Replaced blue circle placeholder with official CTOS emblem (16x16 pixels)
  - Integrated authentic course branding throughout the app
- July 4, 2025: Integrated authentic meditation audio files
  - Replaced placeholder SoundCloud URLs with real MP3 meditation recordings
  - Updated seven sessions with authentic content:
    - "Dropping the Balloon" (10 min)
    - "Seven Stations of the Spine" (20 min) 
    - "The Sense of Being Alive" (20 min)
    - "Mind in Body, Body in Movement, Movement in Mind" (10 min)
    - "What if All There is Is This?" (10 min)
    - "Turning Towards Discomfort" (15 min)
    - "The Four Pillars of Wellbeing" (22 min)
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