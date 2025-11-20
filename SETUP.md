# Journo Journal - Development Setup

Complete guide to getting Journo Journal running on your local machine.

## Step 1: Prerequisites

Make sure you have:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **OpenAI API Key** (Get from [OpenAI Platform](https://platform.openai.com/))

## Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/journo-journal.git
cd journo-journal

# Install dependencies
npm install
```

## Step 3: Database Setup

### Create Database

```bash
# Create the database
createdb journo_journal

# Or using psql
psql
CREATE DATABASE journo_journal;
\q
```

### Run Schema

```bash
# Apply the database schema
psql journo_journal < src/lib/db/schema.sql
```

### Verify Setup

```bash
psql journo_journal
\dt  # List tables - you should see all tables
\q
```

## Step 4: Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://localhost:5432/journo_journal

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Environment
NODE_ENV=development
```

**Note:** Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Step 5: Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Step 6: Create Your First Account

1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Create your account
4. Start creating notes!

## Testing the AI Features

To test AI features, you need an OpenAI API key:

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and add billing
3. Generate an API key
4. Add it to your `.env.local` as `OPENAI_API_KEY`
5. Restart the dev server

AI features include:
- Auto-tagging notes
- Summarization
- Ask AI questions
- Related content discovery

## Installing the Browser Extension (Optional)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` directory from this project
5. The extension icon will appear in your toolbar

## Project Structure

```
journo-journal/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   └── page.tsx      # Landing page
│   ├── components/       # React components
│   │   ├── ui/           # Base UI components
│   │   ├── notes/        # Note-related components
│   │   ├── dashboard/    # Dashboard components
│   │   └── ai/           # AI components
│   └── lib/              # Utilities and helpers
│       ├── db/           # Database utilities
│       └── ai/           # AI/OpenAI integration
├── extension/            # Browser extension
├── public/               # Static assets
└── ...config files
```

## Common Issues

### Database Connection Error

**Problem:** Cannot connect to database

**Solutions:**
1. Make sure PostgreSQL is running: `pg_isready`
2. Check your `DATABASE_URL` in `.env.local`
3. Verify database exists: `psql -l`

### Port 3000 Already in Use

**Problem:** Port 3000 is already in use

**Solution:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### OpenAI API Errors

**Problem:** AI features not working

**Solutions:**
1. Verify your API key is correct
2. Check you have billing enabled on OpenAI
3. Check API usage limits
4. Review logs: look for "OpenAI" errors in terminal

### Missing Tables

**Problem:** Database tables don't exist

**Solution:**
```bash
# Re-run the schema
psql journo_journal < src/lib/db/schema.sql
```

## Development Tips

### Hot Reload

Next.js has hot module replacement enabled. Changes to files will automatically refresh the browser.

### Database Inspection

Use a GUI tool like:
- [Postico](https://eggerapps.at/postico/) (Mac)
- [pgAdmin](https://www.pgadmin.org/) (Cross-platform)
- [DBeaver](https://dbeaver.io/) (Cross-platform)

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostgreSQL

## Next Steps

1. **Read the docs**: Check out [README.md](README.md) for feature overview
2. **Deploy**: See [DEPLOYMENT.md](DEPLOYMENT.md) when ready to deploy
3. **Customize**: Modify colors, fonts, and branding in `tailwind.config.ts`
4. **Contribute**: See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines

## Getting Help

- **Documentation**: [docs.journojournal.com](https://docs.journojournal.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/journo-journal/issues)
- **Discord**: [Join our community](https://discord.gg/journojournal)

Happy coding! 📰✨
