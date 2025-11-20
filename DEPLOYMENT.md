# Journo Journal - Deployment Guide

This guide will help you deploy Journo Journal to production.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ database
- OpenAI API key
- Vercel account (recommended) or any Node.js hosting

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/journo_journal

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Environment
NODE_ENV=production
```

## Database Setup

1. Create a PostgreSQL database:

```bash
createdb journo_journal
```

2. Run the schema:

```bash
psql journo_journal < src/lib/db/schema.sql
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all environment variables from `.env`

4. Deploy to production:
```bash
vercel --prod
```

### Option 2: Docker

1. Build the Docker image:
```bash
docker build -t journo-journal .
```

2. Run the container:
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e OPENAI_API_KEY="your-api-key" \
  journo-journal
```

### Option 3: Traditional VPS (DigitalOcean, AWS, etc.)

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

4. Use PM2 for process management:
```bash
npm i -g pm2
pm2 start npm --name "journo-journal" -- start
pm2 save
pm2 startup
```

## Post-Deployment Checklist

- [ ] Database is accessible and schema is applied
- [ ] All environment variables are set
- [ ] SSL certificate is configured (use Let's Encrypt)
- [ ] Domain is pointed to your server
- [ ] Email notifications are working (if configured)
- [ ] OpenAI API is responding
- [ ] Browser extension URLs are updated to production

## Monitoring

Set up monitoring with:

- **Vercel Analytics**: Built-in if using Vercel
- **Sentry**: For error tracking
- **Uptime Robot**: For uptime monitoring
- **PostgreSQL monitoring**: pg_stat_statements

## Backup Strategy

1. **Database backups**:
```bash
# Daily backup script
pg_dump journo_journal > backup_$(date +%Y%m%d).sql
```

2. **Automated backups**:
   - Use your hosting provider's backup solution
   - Or set up automated backups to S3/Cloud Storage

## Scaling

As your user base grows:

1. **Database**: Use connection pooling (pgBouncer)
2. **Caching**: Add Redis for session storage
3. **CDN**: Use Vercel's built-in CDN or Cloudflare
4. **File storage**: Move attachments to S3/Cloud Storage

## Security Checklist

- [ ] HTTPS is enforced
- [ ] Environment variables are secure
- [ ] Database has strong password
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-org/journo-journal
- Email: support@journojournal.com
