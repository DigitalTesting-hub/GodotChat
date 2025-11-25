# Godot Game Chat Backend

## Overview

A real-time chat API backend designed for Godot games (Desktop Windows/Linux and Android) with Discord integration. The system provides a simple RESTful API for sending and receiving chat messages, with bidirectional synchronization to Discord channels. Built with Express.js backend and React frontend for web-based chat interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript (ESM modules)
- **Framework:** Express.js for REST API
- **Discord Integration:** Discord.js v14 with Gateway intents for message content
- **Build System:** Vite (frontend), esbuild (backend production builds)

**Server Structure:**
- **Development Server (`server/index-dev.ts`):** Vite middleware integration with HMR support
- **Production Server (`server/index-prod.ts`):** Serves pre-built static assets from dist/public
- **Core Application (`server/app.ts`):** Express app configuration with JSON body parsing and request logging
- **Routing (`server/routes.ts`):** API endpoint definitions with Zod schema validation

**API Endpoints:**
- `GET /health` - Health check with Discord connection status and uptime
- `GET /api/status` - Quick online/Discord status check
- `POST /api/send_message` - Send chat message (validated: playerName, message 1-500 chars)
- `POST /api/get_messages` - Retrieve all stored messages

**Message Flow:**
1. Client sends message via REST API
2. Message validated with Zod schemas
3. Stored in-memory via MemStorage
4. Asynchronously forwarded to Discord (non-blocking)
5. Discord bot listens for messages and syncs back to memory storage

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) v5 for server state
- **UI Components:** Radix UI primitives with shadcn/ui patterns
- **Styling:** Tailwind CSS with custom design system (New York style)

**Component Structure:**
- Single-page application with chat interface (`client/src/pages/chat.tsx`)
- Gaming-focused UI with collapsible chat widget
- Mobile-responsive design (full-screen on mobile, overlay on desktop)
- Auto-scrolling message list with 3-second polling interval

**Design System:**
- **Typography:** Inter/Roboto fonts via Google Fonts CDN
- **Color Scheme:** Light/dark mode support with CSS custom properties
- **Layout:** Fixed positioning for chat (bottom-right desktop, full-screen mobile)
- **Message Alignment:** User's own messages align LEFT, others align RIGHT (intentional design choice)

### Data Storage

**In-Memory Storage (`server/storage.ts`):**
- **Interface:** `IStorage` with add/get/clear message operations
- **Implementation:** `MemStorage` class with array-based message storage
- **Schema:** ChatMessage type with id (UUID), playerName, message, timestamp, optional isOwn flag
- **Limitation:** Messages lost on server restart (no persistence layer)
- **Future-Ready:** Interface allows easy swap to database implementation

**Note on Database Configuration:**
- Drizzle ORM configured in `drizzle.config.ts` for PostgreSQL (Neon)
- Schema definition exists in `shared/schema.ts` but currently unused
- Database infrastructure prepared but not actively utilized (application runs without DB)

### Discord Integration

**Connection Method:**
- Uses Replit Connectors API for Discord OAuth credentials
- Requires `REPLIT_CONNECTORS_HOSTNAME` and Replit identity tokens
- Environment variable `DISCORD_CHANNEL_ID` specifies target channel

**Bot Capabilities:**
- **Intents:** Guilds, GuildMessages, MessageContent
- **Bidirectional Sync:** Receives Discord messages and sends game messages to Discord
- **Message Backfill:** Automatically fetches last 50 Discord messages on startup to sync recent history
- **Error Handling:** Non-blocking Discord sends (failures logged but don't block API responses)
- **Graceful Degradation:** Chat API works fully even if Discord integration is unavailable

**State Management:**
- `isReady` flag tracks Discord bot connection status
- Exposed via `isDiscordReady()` function for health checks
- `sendToDiscord()` function for outbound message delivery

## External Dependencies

### Third-Party Services

**Discord API:**
- **Purpose:** Real-time message synchronization and community integration
- **Authentication:** OAuth2 via Replit Connectors
- **Required Environment Variables:** 
  - `DISCORD_CHANNEL_ID` - Target channel for message sync
  - `REPLIT_CONNECTORS_HOSTNAME` - Replit connector service endpoint
  - `REPL_IDENTITY` or `WEB_REPL_RENEWAL` - Replit authentication tokens

**Replit Infrastructure:**
- **Connectors API:** OAuth credential management for Discord
- **Environment:** Requires Replit deployment environment for Discord integration
- **Dev Tools:** Vite plugins for runtime error overlay, cartographer, and dev banner

### Database (Configured but Inactive)

**Neon PostgreSQL:**
- **ORM:** Drizzle Kit with schema migrations support
- **Configuration:** `DATABASE_URL` environment variable expected
- **Status:** Infrastructure ready but not currently utilized
- **Migration Path:** `npm run db:push` for schema deployment when activated

### UI Component Libraries

**Radix UI:**
- Comprehensive primitive component set (accordion, dialog, dropdown, popover, etc.)
- Accessibility-first design with ARIA support
- Unstyled base components customized with Tailwind

**Additional UI Dependencies:**
- `class-variance-authority` - Component variant management
- `cmdk` - Command menu interface
- `date-fns` - Date formatting utilities
- `lucide-react` - Icon library
- `react-day-picker` - Calendar component
- `vaul` - Drawer component (mobile)
- `embla-carousel-react` - Carousel functionality

### Build and Development Tools

**Core Build Tools:**
- **Vite:** Frontend development server and build tool
- **esbuild:** Backend production bundling
- **TypeScript:** Type checking (noEmit mode)
- **PostCSS:** CSS processing with Tailwind and Autoprefixer

**Code Quality:**
- Path aliases configured (`@/`, `@shared/`, `@assets/`)
- Strict TypeScript configuration
- ESNext module resolution with bundler mode