# Journo Journal 📰

A beautiful, AI-powered SaaS platform for journalists to capture, organize, and develop story ideas.

![Journo Journal](https://via.placeholder.com/1200x600/F5F1E8/1A1A1A?text=Journo+Journal)

## 🎯 Overview

**Journo Journal** transforms how journalists work—capturing ideas in seconds, organizing with AI, and surfacing insights when you need them most. No more scattered notes, lost quotes, or 147 browser tabs. Just a clean, beautiful workspace designed for the modern newsroom.

### The Problem

Journalists struggle with:
- 📚 Information scattered across Slack, emails, docs, and notebooks
- 🔍 Can't find that perfect quote when writing
- ⏰ Missing deadlines due to disorganization
- 🧠 Lost insights that could make stories shine

### The Solution

Journo Journal provides:
- ⚡ **Instant Capture**: Browser extension saves content in one click
- 🤖 **AI Auto-Tagging**: Smart organization without manual work
- 🔎 **Semantic Search**: Find by meaning, not just keywords
- 👥 **Team Collaboration**: Share notes with your newsroom
- 💡 **AI Insights**: Summaries, suggestions, and research assistance
- 📅 **Editorial Calendar**: Track deadlines and plan stories

## ✨ Features

### Core Features
- **Rich Text Editor**: Professional writing experience with formatting tools
- **Note Organization**: Folders, tags, and smart categorization
- **Quick Search**: Full-text search across all your content
- **Favorites**: Star important notes for quick access
- **Multiple Note Types**: Ideas, Research, Interviews, Notes

### AI-Powered Features
- **Auto-Tagging**: AI analyzes content and suggests relevant tags
- **Summarization**: Get instant summaries of long articles
- **Ask AI**: Chat with AI about your notes and research
- **Related Content**: Discover connections between your notes
- **Key Insights**: Extract important points automatically

### Collaboration
- **Share Notes**: Collaborate with team members
- **Permissions**: Control view/edit access
- **Sources Management**: Track contacts and experts
- **Task Management**: Set deadlines and reminders

### Browser Extension
- **One-Click Capture**: Save web content instantly
- **Keyboard Shortcut**: `Cmd/Ctrl + Shift + J` to capture
- **Context Menu**: Right-click to save selections
- **Smart Pre-fill**: Automatically captures title and selected text

## 🎨 Design Philosophy

**"Digital Newsroom" Aesthetic**

Journo Journal breaks away from generic SaaS design with a distinctive visual identity inspired by classic editorial design:

- **Typography**: Newsreader, Crimson Pro, Source Serif Pro (no generic Inter/Roboto!)
- **Colors**: Deep ink blacks, newsprint creams, highlighter amber (not purple gradients!)
- **Layout**: Newspaper-inspired grid systems and column layouts
- **Animations**: Purposeful, editorial-style transitions

We designed Journo Journal to feel like a premium tool built specifically for journalists—not another cookie-cutter productivity app.

## 🚀 Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (custom design system)
- Framer Motion (animations)
- Tiptap (rich text editing)

**Backend**
- Node.js
- PostgreSQL (with full-text search)
- NextAuth.js (authentication)

**AI**
- OpenAI GPT-4 (auto-tagging, summarization, chat)
- Text embeddings (semantic search)

**Deployment**
- Vercel (recommended)
- Docker support included

## 📋 Getting Started

### Quick Start

1. **Clone and install:**
```bash
git clone https://github.com/thebryandavis/journo-journal.git
cd journo-journal
npm install
```

2. **Set up database:**
```bash
createdb journo_journal
psql journo_journal < src/lib/db/schema.sql
```

3. **Configure environment:**
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. **Start development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

### Full Setup Guide

For detailed setup instructions, see [SETUP.md](SETUP.md)

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

## 📖 Documentation

- **Setup Guide**: [SETUP.md](SETUP.md) - Complete development environment setup
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment instructions
- **Browser Extension**: [extension/README.md](extension/README.md) - Extension installation and usage

## 🎯 Use Cases

### Individual Journalists
- Capture story ideas on the go
- Organize research and interviews
- Track sources and contacts
- Manage deadlines

### Newsrooms
- Share research across teams
- Collaborate on investigations
- Build institutional knowledge
- Onboard new reporters faster

### Freelancers
- Manage multiple stories
- Track pitches and assignments
- Export notes for publication
- Build a personal archive

## 🔒 Security & Privacy

- **Encrypted connections**: All data transmitted over HTTPS
- **Secure authentication**: Password hashing with bcrypt
- **Database security**: Parameterized queries prevent SQL injection
- **API keys**: Safely stored in environment variables
- **Privacy first**: Your notes are yours—we never train AI on your content

## 🗺️ Roadmap

**Current Version: 1.0**
- ✅ Core note-taking and organization
- ✅ AI auto-tagging and summarization
- ✅ Browser extension
- ✅ Team collaboration
- ✅ Editorial calendar

**Coming Soon**
- 🔄 Mobile apps (iOS and Android)
- 🔄 Advanced AI: Fact-checking integration
- 🔄 Audio transcription for interviews
- 🔄 Multi-modal notes (images, videos)
- 🔄 Publishing workflow integration
- 🔄 Analytics dashboard

## 🤝 Contributing

We welcome contributions! Areas we'd love help with:
- UI/UX improvements
- New AI features
- Mobile app development
- Documentation
- Bug fixes

## 📄 License

Proprietary - All rights reserved

## 💬 Support

- **GitHub Issues**: [Report a bug](https://github.com/thebryandavis/journo-journal/issues)

## 🙏 Acknowledgments

Built with love for journalists everywhere. Special thanks to:
- The newsrooms who inspired this project
- Open source community for amazing tools
- Early beta testers for invaluable feedback

---

**Made with ❤️ for journalists who change the world, one story at a time.**
