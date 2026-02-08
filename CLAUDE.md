# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Journo Journal is an AI-powered note-taking and idea management SaaS for journalists. Built with Next.js 14 (App Router), TypeScript, PostgreSQL, and OpenAI. Features include rich text editing (Tiptap), knowledge graph visualization (ReactFlow/D3), AI-powered tagging/summarization, and spaced repetition for active recall.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
npx tsx scripts/seed.ts  # Seed database with test data
```

No test framework is configured. There are no test commands.

## Local Development Setup

PostgreSQL 15 is installed via Homebrew. Binary is at `/opt/homebrew/opt/postgresql@15/bin/psql`.

```bash
brew services start postgresql@15   # Start PostgreSQL
brew services stop postgresql@15    # Stop PostgreSQL
```

Database setup (one-time):
```bash
/opt/homebrew/opt/postgresql@15/bin/createdb journo_journal
/opt/homebrew/opt/postgresql@15/bin/psql journo_journal < src/lib/db/schema.sql
/opt/homebrew/opt/postgresql@15/bin/psql journo_journal < src/lib/db/migrations/001_knowledge_graph.sql
/opt/homebrew/opt/postgresql@15/bin/psql journo_journal < src/lib/db/migrations/002_spaced_repetition.sql
npx tsx scripts/seed.ts
```

Seed login: `journalist@demo.com` / `password123` (user: Alex Rivera)

Requires `.env.local` with: `DATABASE_URL` (postgresql://localhost:5432/journo_journal), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (http://localhost:3000), `OPENAI_API_KEY` (can be placeholder for non-AI testing). See `.env.example`.

## Architecture

### Data Access

No ORM — raw SQL with parameterized queries via `pg` connection pool. All database access goes through `src/lib/db/index.ts` which exports `query(text, params)` and `transaction(callback)`. Always use parameterized queries (`$1`, `$2`, etc.) to prevent SQL injection.

### Authentication

**Critical**: Auth config lives in `src/lib/auth.ts` (shared `authOptions` object). The NextAuth route handler at `src/app/api/auth/[...nextauth]/route.ts` imports from there. All API routes **must** call `getServerSession(authOptions)` — calling `getServerSession()` without `authOptions` will return a session missing the custom `id` and `workspaceId` fields, causing all user-scoped queries to return empty results.

NextAuth.js with Credentials provider (email/password) and JWT session strategy. The JWT token carries `id` and `workspaceId`; session callbacks enrich the session object with these fields (accessed via `(session.user as any).id`).

Registration (`/api/auth/signup`) creates user + workspace + default folder in a single transaction.

### API Routes

All in `src/app/api/`. Pattern: import `authOptions` from `@/lib/auth`, check `getServerSession(authOptions)`, validate input, run parameterized SQL, return JSON. Error shape: `{ error: string }`. Success shape varies but typically `{ success: true, data: T }` or `{ notes: T[] }`.

Key route groups:
- `notes/` — CRUD, favorites toggle, export
- `ai/` — tags, summarize, ask, insights, related (calls OpenAI service)
- `graph/` — knowledge graph relationships and embeddings
- `search/` — full-text PostgreSQL search
- `sources/`, `folders/`, `tasks/`, `shares/` — entity CRUD

### AI Integration

`src/lib/ai/openai.ts` — singleton `AIService` class wrapping OpenAI. Uses `gpt-4o-mini` for chat completions and `text-embedding-3-small` (1536 dimensions) for embeddings. Methods: `generateTags`, `summarize`, `askQuestion`, `extractInsights`, `suggestRelatedTopics`.

`src/lib/ai/knowledge-graph.ts` — builds note relationships using cosine similarity on stored embeddings. Manages `note_relationships` and `note_embeddings` tables. Embeddings stored as JSONB (not pgvector), so cosine similarity runs in JS — fine for small datasets but won't scale to thousands of notes.

### Frontend

- **Path alias**: `@/*` maps to `./src/*`
- **UI primitives**: `src/components/ui/` (Button, Card, Badge, Input, Textarea) — exported from `index.ts`
- **Dashboard layout**: `src/components/dashboard/DashboardLayout.tsx` — collapsible sidebar wrapping all `/dashboard/*` pages
- **Rich text**: Tiptap editor in `src/components/notes/RichTextEditor.tsx`
- **Knowledge graph**: ReactFlow-based visualization in `src/components/graph/KnowledgeGraphView.tsx`
- **Providers**: `src/app/providers.tsx` wraps SessionProvider and QueryClientProvider (1-min staleTime, no refetch on focus)
- **Data fetching**: Dashboard uses `fetch()` + `useState`/`useEffect` on mount (not React Query). Other pages are mostly stub "Coming Soon" shells.

### Design System

Custom Tailwind theme in `tailwind.config.ts` with editorial newspaper aesthetic:
- Colors: `ink` (dark neutrals), `newsprint` (cream/off-white), `highlight` (amber/red), `editorial` (green/blue/purple)
- Fonts: Newsreader, Crimson Pro, Source Serif Pro, DM Sans (loaded via `next/font/google` in `layout.tsx`, applied as CSS variables)
- Animations: fade-in, slide-up, slide-in, typewriter

### Database Schema

16 tables across schema.sql + 2 migrations. Core: `users`, `workspaces`, `notes`, `folders`, `tags`, `sources`, `note_sources`, `attachments`, `tasks`, `shares`. Knowledge graph (migration 001): `note_relationships`, `note_embeddings`, `graph_metadata`. Spaced repetition (migration 002): `review_items`, `review_sessions`, `learning_stats`.

Notes have `type` (note/idea/research/interview) and `status` (draft/in-progress/published). All entities are scoped by `user_id` and `workspace_id`. Full-text search uses a GIN index on notes title + content.

The old `embeddings` table was removed from schema.sql (it required pgvector). Migration 001 provides the correct `note_embeddings` table using JSONB.

### Browser Extension

Separate Chrome extension in `/extension/` (not part of the Next.js build). Captures web content and sends to the main app's API. Shortcut: Ctrl/Cmd+Shift+J.

## Key Type Definitions

All core interfaces are in `src/lib/types.ts`: `User`, `Workspace`, `Note`, `Folder`, `Tag`, `Source`, `Task`, `Share`, `Attachment`, `ApiResponse<T>`.

## Current Status

- **Working pages**: Landing, Login, Signup, Dashboard (note cards grid), Sources, Calendar, Knowledge Graph, Settings
- **Stub pages**: All Notes, Favorites, Folders, Tags (render "Coming Soon" but have navigation)
- **Spaced repetition**: DB schema complete, no API routes or UI yet
- **Multi-format content** (YouTube, PDF): Not started
- **Knowledge Cards UI**: Not started
- **Augmented browsing**: Not started
- **No test suite** — no Jest, Vitest, Playwright, or Cypress configured

## Git

- `main` branch: initial commit baseline
- `claude/journalist-idea-collection-saas-012xhiiVSE7xfXFmWVguAcsZ`: active development branch (merged to main via PR #1)
- Remote: `origin` at `https://github.com/thebryandavis/journo-journal`
