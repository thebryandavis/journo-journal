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
```

No test framework is configured. There are no test commands.

## Environment Setup

Requires `.env` with: `DATABASE_URL` (PostgreSQL 14+), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OPENAI_API_KEY`. See `.env.example`.

Database schema must be applied manually: run `src/lib/db/schema.sql` first, then migrations in `src/lib/db/migrations/` in order (001, 002).

## Architecture

### Data Access

No ORM — raw SQL with parameterized queries via `pg` connection pool. All database access goes through `src/lib/db/index.ts` which exports `query(text, params)` and `transaction(callback)`. Always use parameterized queries (`$1`, `$2`, etc.) to prevent SQL injection.

### Authentication

NextAuth.js with Credentials provider (email/password) and JWT session strategy. Auth config is in `src/app/api/auth/[...nextauth]/route.ts`. Protected API routes check `getServerSession()`. The JWT token carries `id` and `workspaceId`; session callbacks in the NextAuth config enrich the session object with these fields (accessed via `(session.user as any).id`).

Registration (`/api/auth/signup`) creates user + workspace + default folder in a single transaction.

### API Routes

All in `src/app/api/`. Pattern: check session, validate input, run parameterized SQL, return JSON. Error shape: `{ error: string }`. Success shape varies but typically `{ success: true, data: T }` or `{ notes: T[] }`.

Key route groups:
- `notes/` — CRUD, favorites toggle
- `ai/` — tags, summarize, ask, insights, related (calls OpenAI service)
- `graph/` — knowledge graph relationships and embeddings
- `search/` — full-text PostgreSQL search
- `sources/`, `folders/`, `tasks/`, `shares/` — entity CRUD

### AI Integration

`src/lib/ai/openai.ts` — singleton `AIService` class wrapping OpenAI. Uses `gpt-4o-mini` for chat completions and `text-embedding-3-small` (1536 dimensions) for embeddings. Methods: `generateTags`, `summarize`, `askQuestion`, `extractInsights`, `suggestRelatedTopics`.

`src/lib/ai/knowledge-graph.ts` — builds note relationships using cosine similarity on stored embeddings. Manages `note_relationships` and `note_embeddings` tables.

### Frontend

- **Path alias**: `@/*` maps to `./src/*`
- **UI primitives**: `src/components/ui/` (Button, Card, Badge, Input, Textarea) — exported from `index.ts`
- **Dashboard layout**: `src/components/dashboard/DashboardLayout.tsx` — collapsible sidebar wrapping all `/dashboard/*` pages
- **Rich text**: Tiptap editor in `src/components/notes/RichTextEditor.tsx`
- **Knowledge graph**: ReactFlow-based visualization in `src/components/graph/KnowledgeGraphView.tsx`
- **Providers**: `src/app/providers.tsx` wraps SessionProvider and QueryClientProvider

### Design System

Custom Tailwind theme in `tailwind.config.ts` with editorial newspaper aesthetic:
- Colors: `ink` (dark neutrals), `newsprint` (cream/off-white), `highlight` (amber/red), `editorial` (green/blue/purple)
- Fonts: Newsreader, Crimson Pro, Source Serif Pro, DM Sans (via CSS variables)
- Animations: fade-in, slide-up, slide-in, typewriter

### Database Schema

Core tables: `users`, `workspaces`, `notes`, `folders`, `tags`, `sources`, `attachments`, `tasks`, `shares`. Knowledge graph adds: `note_relationships`, `note_embeddings`, `graph_metadata`. Spaced repetition adds: `review_items`, `review_sessions`, `learning_stats`.

Notes have `type` (note/idea/research/interview) and `status` (draft/in-progress/published). All entities are scoped by `user_id` and `workspace_id`. Full-text search uses a GIN index on notes title + content.

### Browser Extension

Separate Chrome extension in `/extension/` (not part of the Next.js build). Captures web content and sends to the main app's API. Shortcut: Ctrl/Cmd+Shift+J.

## Key Type Definitions

All core interfaces are in `src/lib/types.ts`: `User`, `Workspace`, `Note`, `Folder`, `Tag`, `Source`, `Task`, `Share`, `Attachment`, `ApiResponse<T>`.
