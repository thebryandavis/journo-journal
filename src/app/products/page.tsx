'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import {
  BookOpen,
  Brain,
  Sparkles,
  TrendingUp,
  Search,
  Users,
  Database,
  Calendar,
  Tag,
  FileText,
  Github,
  ChevronRight,
  Package,
  Download,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

const products = [
  {
    id: 'knowledge-graph',
    icon: Brain,
    title: 'Knowledge Graph',
    tagline: 'Visualize connections in your research',
    description: 'Automatically discover relationships between your notes using semantic similarity powered by vector embeddings. See how your stories connect in a dynamic, interactive graph.',
    status: 'Stable',
    version: 'v1.2.0',
    color: 'amber',
    features: [
      'React Flow powered graph visualization',
      'Semantic similarity using OpenAI embeddings',
      'Auto-generated relationships',
      'Interactive graph navigation',
      'Export to JSON or image',
      'Relationship strength scoring',
    ],
    techStack: ['React Flow', 'PostgreSQL', 'OpenAI API', 'D3.js'],
    codeExample: `// Generate knowledge graph
const graph = await buildKnowledgeGraph(userId, {
  limit: 100,
  minStrength: 0.5
});`,
  },
  {
    id: 'ai-notes',
    icon: Sparkles,
    title: 'AI Note-Taking',
    tagline: 'Smart organization, zero effort',
    description: 'Capture notes and let AI handle the organization. Auto-tagging, summarization, and intelligent categorization powered by GPT-4.',
    status: 'Stable',
    version: 'v1.1.0',
    color: 'amber',
    features: [
      'Auto-tagging with GPT-4',
      'Smart summarization',
      'Content extraction from URLs',
      'Rich text editor (Tiptap)',
      'Markdown support',
      'Real-time collaboration',
    ],
    techStack: ['OpenAI GPT-4', 'Tiptap Editor', 'Next.js API Routes'],
    codeExample: `// Create AI-powered note
const note = await createNote({
  title, content,
  autoTag: true,
  summarize: true
});`,
  },
  {
    id: 'spaced-repetition',
    icon: TrendingUp,
    title: 'Spaced Repetition',
    tagline: 'Remember what matters',
    description: 'SM-2 algorithm implementation for knowledge retention. Schedule reviews, track progress, and never forget important information.',
    status: 'Beta',
    version: 'v0.8.0',
    color: 'red',
    features: [
      'SM-2 spaced repetition algorithm',
      'Review scheduling system',
      'Learning progress tracking',
      'Difficulty-based intervals',
      'Performance analytics',
      'Custom review decks',
    ],
    techStack: ['PostgreSQL Functions', 'SM-2 Algorithm', 'React Hooks'],
    codeExample: `// Schedule next review
const next = await calculateNextReview({
  quality: 4,
  currentInterval: 7
});`,
  },
  {
    id: 'semantic-search',
    icon: Search,
    title: 'Semantic Search',
    tagline: 'Find by meaning, not keywords',
    description: 'Search your notes by meaning, not just keywords. Vector similarity search understands context and finds relevant content even with different phrasing.',
    status: 'Stable',
    version: 'v1.0.0',
    color: 'amber',
    features: [
      'Vector similarity search',
      'OpenAI embeddings (1536 dimensions)',
      'Context-aware results',
      'Fuzzy matching',
      'Instant search results',
      'Filter by tags, dates, type',
    ],
    techStack: ['OpenAI Embeddings', 'PostgreSQL JSONB', 'Cosine Similarity'],
    codeExample: `// Semantic search
const results = await searchNotes(
  "climate change interviews",
  { limit: 10 }
);`,
  },
  {
    id: 'collaboration',
    icon: Users,
    title: 'Collaboration',
    tagline: 'Work together seamlessly',
    description: 'Share notes with your team, manage permissions, and collaborate in real-time. Role-based access control keeps sensitive information secure.',
    status: 'Stable',
    version: 'v1.0.0',
    color: 'amber',
    features: [
      'Real-time note sharing',
      'Role-based permissions',
      'Team workspaces',
      'Activity feed',
      'Comment threads',
      'Version history',
    ],
    techStack: ['PostgreSQL', 'NextAuth.js', 'WebSockets'],
    codeExample: `// Share note with team
await shareNote(noteId, {
  userId: "user-123",
  permission: "edit"
});`,
  },
  {
    id: 'data-pipeline',
    icon: Database,
    title: 'Data Pipeline',
    tagline: 'Import anything, export everything',
    description: 'Import content from web pages, PDFs, YouTube transcripts, and more. Export to Markdown, JSON, or CSV for maximum flexibility.',
    status: 'Alpha',
    version: 'v0.3.0',
    color: 'red',
    features: [
      'Web content extraction',
      'PDF text extraction',
      'YouTube transcript import',
      'Markdown export',
      'JSON/CSV export',
      'Batch processing',
    ],
    techStack: ['Puppeteer', 'PDF.js', 'YouTube API'],
    codeExample: `// Import from URL
const note = await importFromURL(
  "https://example.com/article"
);`,
  },
  {
    id: 'task-management',
    icon: Calendar,
    title: 'Task Management',
    tagline: 'Never miss a deadline',
    description: 'Track story deadlines, manage follow-ups, and prioritize your work. Integrated task management keeps you organized and on schedule.',
    status: 'Stable',
    version: 'v1.0.0',
    color: 'amber',
    features: [
      'Deadline tracking',
      'Priority levels',
      'Task dependencies',
      'Calendar integration',
      'Email reminders',
      'Progress tracking',
    ],
    techStack: ['PostgreSQL', 'Node-cron', 'iCal'],
    codeExample: `// Create task
const task = await createTask({
  title: "Interview mayor",
  deadline: "2024-02-15"
});`,
  },
  {
    id: 'smart-tagging',
    icon: Tag,
    title: 'Smart Tagging',
    tagline: 'Organize automatically',
    description: 'AI-powered tagging system that understands your content and suggests relevant tags. Build a consistent taxonomy without manual work.',
    status: 'Stable',
    version: 'v1.0.0',
    color: 'amber',
    features: [
      'AI-generated tags',
      'Tag suggestions',
      'Tag hierarchies',
      'Auto-categorization',
      'Tag analytics',
      'Custom tag rules',
    ],
    techStack: ['OpenAI API', 'PostgreSQL', 'Tag2Vec'],
    codeExample: `// Generate tags
const tags = await generateTags(
  title, content,
  { maxTags: 5 }
);`,
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-editorial-gradient">
      {/* Header */}
      <header className="border-b-2 border-ink/10 bg-newsprint/95 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-ink" strokeWidth={2.5} />
              <h1 className="font-newsreader font-extrabold text-2xl text-ink">
                Journo Journal
              </h1>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/docs">
                <Button variant="ghost" size="sm">Documentation</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="primary" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 bg-highlight-amber/30 text-ink font-dm font-semibold px-4 py-2 rounded-sm text-sm mb-6">
              <Package className="w-4 h-4" />
              Product Modules
            </span>

            <h1 className="font-crimson font-bold text-5xl md:text-6xl text-ink leading-tight mb-6">
              Off-the-Shelf
              <br />
              <span className="highlight-mark">Intelligence Modules</span>
            </h1>

            <p className="text-xl text-ink-light font-source leading-relaxed mb-8">
              Production-ready components you can deploy independently or combine into
              a complete platform. Each module is battle-tested and fully documented.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="lg" icon={<Github className="w-5 h-5" />}>
                View on GitHub
              </Button>
              <Button variant="ghost" size="lg" icon={<Download className="w-5 h-5" />}>
                Download All
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Product Grid */}
        <div className="space-y-16">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-2 border-ink/10 rounded-sm overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="grid md:grid-cols-5 gap-8 p-8">
                {/* Left Column - Info */}
                <div className="md:col-span-2">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-sm bg-highlight-${product.color}/20 flex items-center justify-center flex-shrink-0`}>
                      <product.icon className={`w-7 h-7 text-highlight-${product.color === 'amber' ? 'amber' : 'red'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-crimson font-bold text-2xl text-ink">
                          {product.title}
                        </h3>
                        <span className={`text-xs font-dm font-semibold px-2 py-1 rounded-full ${
                          product.status === 'Stable'
                            ? 'bg-editorial-green/20 text-editorial-green'
                            : product.status === 'Beta'
                            ? 'bg-highlight-amber/20 text-highlight-amber'
                            : 'bg-ink/10 text-ink/60'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                      <p className="text-sm text-ink/60 font-dm mb-4">
                        {product.tagline}
                      </p>
                      <p className="text-xs text-ink/40 font-dm">
                        {product.version}
                      </p>
                    </div>
                  </div>

                  <p className="text-ink/70 font-source mb-6 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="font-dm font-semibold text-ink text-sm mb-3">
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs bg-ink/5 text-ink/60 px-3 py-1 rounded-full font-dm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="primary" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
                        View Details
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" icon={<Code2 className="w-4 h-4" />}>
                      Docs
                    </Button>
                  </div>
                </div>

                {/* Right Column - Features & Code */}
                <div className="md:col-span-3 space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-dm font-semibold text-ink text-sm mb-4">
                      Features
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {product.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-editorial-green flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-ink/70 font-dm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code Example */}
                  <div>
                    <h4 className="font-dm font-semibold text-ink text-sm mb-3">
                      Quick Example
                    </h4>
                    <div className="bg-ink rounded-sm p-4 overflow-x-auto">
                      <pre className="text-sm text-newsprint font-mono">
                        {product.codeExample}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-newsprint py-20 mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-crimson font-bold text-4xl md:text-5xl mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-newsprint/80 font-source mb-8 max-w-2xl mx-auto">
              Deploy individual modules or the complete platform. Self-hosted or managed cloud.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button variant="secondary" size="lg">
                  Try Managed Cloud
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" size="lg" className="text-newsprint border-newsprint/30 hover:bg-newsprint/10">
                  Read Documentation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-newsprint border-t-2 border-ink/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-ink/60 font-dm text-sm">
            © 2024 Journo Journal. Open source under MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
