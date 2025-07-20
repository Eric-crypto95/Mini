# Mini AI Assistant

## Overview

This is a full-stack TypeScript application featuring an AI assistant called "Mini" with a React frontend and Express.js backend. The application provides weather information, timer functionality, translation services, and conversational chat capabilities through an animated avatar interface with customizable themes and personalization features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with React plugin and runtime error overlay

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Storage**: In-memory storage with PostgreSQL session store support
- **API Integration**: OpenAI API for chat functionality

### Key Components

#### Core Features
1. **Chat Interface**: Conversational AI powered by OpenAI with message history
2. **Weather Service**: Real-time weather data via OpenWeatherMap API
3. **Timer System**: Multiple timer types (pomodoro, focus, break, countdown) with persistence
4. **Translation Service**: Multi-language translation with text-to-speech capabilities
5. **Avatar Customization**: Animated Mini character with accessories and expressions
6. **Dynamic Theming**: Time-based themes (morning, afternoon, evening, night) with seasonal variations

#### UI Components
- **MiniAvatar**: Animated character with customizable accessories and expressions
- **ChatInterface**: Real-time messaging with typing indicators and response handling
- **WeatherCard**: Weather display with animated backgrounds based on conditions
- **TimerInterface**: Multi-timer management with visual progress indicators
- **TranslationPanel**: Multi-language translation with pronunciation guides
- **ThemeSelector**: Manual theme override system

## Data Flow

### Database Schema
- **Users**: Basic user authentication and identification
- **User Preferences**: Personalization settings including Mini customization, themes, and conversation memory
- **Chat Messages**: Message history with metadata for different interaction types
- **Active Timers**: Real-time timer state with type classification and duration tracking

### API Endpoints
- `GET /api/weather/:location` - Weather data retrieval
- `POST /api/chat` - AI conversation handling
- `GET /api/timers` - Timer state management
- `POST /api/translate` - Translation services
- `GET/PUT /api/preferences` - User preference management

### State Management
- **Server State**: TanStack Query for API data caching and synchronization
- **Local State**: React useState for UI interactions and temporary data
- **Form State**: React Hook Form with Zod validation
- **Theme State**: Custom hooks for time-based theme management

## External Dependencies

### APIs and Services
- **OpenAI API**: Chat completion and conversation handling
- **OpenWeatherMap API**: Real-time weather data
- **Neon Database**: PostgreSQL hosting and connection management

### Key Libraries
- **UI**: Radix UI primitives, shadcn/ui components, Tailwind CSS
- **Database**: Drizzle ORM, Drizzle Kit for migrations
- **HTTP Client**: Native fetch API with custom wrapper
- **Validation**: Zod for schema validation and type safety
- **Animation**: CSS animations and transitions via Tailwind

### Development Tools
- **Build**: Vite for frontend, esbuild for backend
- **TypeScript**: Strict type checking across frontend and backend
- **Path Aliases**: Configured for clean imports (@/, @shared/)

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle Kit handles schema migrations via `db:push`

### Environment Configuration
- **Development**: `NODE_ENV=development` with tsx for hot reloading
- **Production**: `NODE_ENV=production` with compiled JavaScript
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **APIs**: Environment variables for OpenAI and OpenWeatherMap keys

### Runtime Requirements
- Node.js with ES module support
- PostgreSQL database (Neon recommended)
- Valid API keys for external services
- File system access for static asset serving

The application is designed as a monorepo with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clear separation between client and server concerns.