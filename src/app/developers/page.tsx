'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import {
  BookOpen,
  Terminal,
  Package,
  Rocket,
  Code2,
  Database,
  Cloud,
  Github,
  BookMarked,
  Wrench,
  Zap,
  Shield,
  Copy,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DevelopersPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const quickStartSteps = [
    {
      title: 'Clone the Repository',
      code: 'git clone https://github.com/yourusername/journo-journal.git\ncd journo-journal',
      icon: Github,
    },
    {
      title: 'Install Dependencies',
      code: 'npm install',
      icon: Package,
    },
    {
      title: 'Configure Environment',
      code: `# Copy environment template
cp .env.example .env.local

# Add your credentials
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
NEXTAUTH_SECRET="..."`,
      icon: Wrench,
    },
    {
      title: 'Run Database Migrations',
      code: 'npm run db:migrate',
      icon: Database,
    },
    {
      title: 'Start Development Server',
      code: 'npm run dev',
      icon: Rocket,
    },
  ];

  const dockerSteps = [
    {
      title: 'Docker Compose (Recommended)',
      code: `# Clone and start with one command
git clone https://github.com/yourusername/journo-journal.git
cd journo-journal
docker-compose up -d

# Visit http://localhost:3000`,
      description: 'Includes PostgreSQL, Redis, and the app',
    },
    {
      title: 'Docker Build',
      code: `# Build the image
docker build -t journo-journal .

# Run the container
docker run -p 3000:3000 \\
  -e DATABASE_URL="..." \\
  -e OPENAI_API_KEY="..." \\
  journo-journal`,
      description: 'Custom configuration for production',
    },
  ];

  const apiExamples = [
    {
      title: 'Create a Note',
      language: 'typescript',
      code: `// POST /api/notes
const response = await fetch('/api/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Breaking News',
    content: 'Story content here...',
    type: 'article',
    autoTag: true
  })
});

const note = await response.json();`,
    },
    {
      title: 'Search Notes',
      language: 'typescript',
      code: `// GET /api/search
const results = await fetch(
  '/api/search?q=climate+change&limit=10'
);

const { notes } = await results.json();`,
    },
    {
      title: 'Build Knowledge Graph',
      language: 'typescript',
      code: `// POST /api/graph
const graph = await fetch('/api/graph', {
  method: 'POST'
});

const { nodes, edges } = await graph.json();`,
    },
  ];

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

            <div className="hidden md:flex items-center gap-6 font-dm text-sm">
              <Link href="/products" className="text-ink/70 hover:text-ink">
                Products
              </Link>
              <Link href="/developers" className="text-ink font-semibold">
                Developers
              </Link>
              <Link href="/docs" className="text-ink/70 hover:text-ink">
                Documentation
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" icon={<Github className="w-4 h-4" />}>
                  GitHub
                </Button>
              </a>
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
            <span className="inline-flex items-center gap-2 bg-ink text-newsprint font-dm font-semibold px-4 py-2 rounded-sm text-sm mb-6">
              <Code2 className="w-4 h-4" />
              Developer Documentation
            </span>

            <h1 className="font-crimson font-bold text-5xl md:text-6xl text-ink leading-tight mb-6">
              Build with
              <br />
              <span className="highlight-mark">Journo Journal</span>
            </h1>

            <p className="text-xl text-ink-light font-source leading-relaxed mb-8">
              Open source, production-ready, and fully documented. Get started
              in minutes with our comprehensive guides and APIs.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" icon={<Rocket className="w-5 h-5" />}>
                Quick Start
              </Button>
              <Button variant="outline" size="lg" icon={<BookMarked className="w-5 h-5" />}>
                API Reference
              </Button>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="lg" icon={<Github className="w-5 h-5" />}>
                  View on GitHub
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="bg-white py-20 border-y-2 border-ink/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-crimson font-bold text-4xl text-ink mb-4 text-center">
              Quick Start
            </h2>
            <p className="text-center text-ink/60 font-source mb-12">
              Get Journo Journal running locally in 5 minutes
            </p>

            <div className="space-y-8">
              {quickStartSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border-2 border-ink/10 rounded-sm overflow-hidden"
                >
                  <div className="bg-newsprint p-4 flex items-center gap-3 border-b-2 border-ink/10">
                    <div className="w-8 h-8 bg-highlight-amber rounded-full flex items-center justify-center font-dm font-bold text-ink">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <step.icon className="w-5 h-5 text-ink/60" />
                      <h3 className="font-dm font-semibold text-ink">
                        {step.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(step.code, `step-${index}`)}
                      className="p-2 hover:bg-ink/5 rounded-sm transition-colors"
                    >
                      {copied === `step-${index}` ? (
                        <CheckCircle className="w-4 h-4 text-editorial-green" />
                      ) : (
                        <Copy className="w-4 h-4 text-ink/40" />
                      )}
                    </button>
                  </div>
                  <div className="bg-ink p-4">
                    <pre className="text-sm text-newsprint font-mono overflow-x-auto">
                      {step.code}
                    </pre>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Docker Deployment */}
      <section className="py-20 bg-newsprint">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-crimson font-bold text-4xl text-ink mb-4 text-center">
              Docker Deployment
            </h2>
            <p className="text-center text-ink/60 font-source mb-12">
              Production-ready containerized deployment
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {dockerSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border-2 border-ink/10 rounded-sm overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="font-dm font-semibold text-ink mb-2 flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-editorial-blue" />
                      {step.title}
                    </h3>
                    <p className="text-sm text-ink/60 font-dm mb-4">
                      {step.description}
                    </p>
                    <div className="relative">
                      <div className="bg-ink rounded-sm p-4 overflow-x-auto">
                        <pre className="text-xs text-newsprint font-mono">
                          {step.code}
                        </pre>
                      </div>
                      <button
                        onClick={() => copyToClipboard(step.code, `docker-${index}`)}
                        className="absolute top-2 right-2 p-2 bg-newsprint/10 hover:bg-newsprint/20 rounded-sm transition-colors"
                      >
                        {copied === `docker-${index}` ? (
                          <CheckCircle className="w-4 h-4 text-editorial-green" />
                        ) : (
                          <Copy className="w-4 h-4 text-newsprint/60" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* API Examples */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-crimson font-bold text-4xl text-ink mb-4 text-center">
              API Examples
            </h2>
            <p className="text-center text-ink/60 font-source mb-12">
              RESTful API with full TypeScript support
            </p>

            <div className="space-y-6">
              {apiExamples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border-2 border-ink/10 rounded-sm overflow-hidden"
                >
                  <div className="bg-newsprint p-4 flex items-center justify-between border-b-2 border-ink/10">
                    <h3 className="font-dm font-semibold text-ink">
                      {example.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink/40 font-mono">
                        {example.language}
                      </span>
                      <button
                        onClick={() => copyToClipboard(example.code, `api-${index}`)}
                        className="p-2 hover:bg-ink/5 rounded-sm transition-colors"
                      >
                        {copied === `api-${index}` ? (
                          <CheckCircle className="w-4 h-4 text-editorial-green" />
                        ) : (
                          <Copy className="w-4 h-4 text-ink/40" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="bg-ink p-4">
                    <pre className="text-sm text-newsprint font-mono overflow-x-auto">
                      {example.code}
                    </pre>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/docs/api">
                <Button variant="outline" size="lg">
                  View Full API Reference
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 bg-ink text-newsprint">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-crimson font-bold text-4xl mb-12 text-center">
            Developer Resources
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookMarked,
                title: 'Documentation',
                desc: 'Comprehensive guides, API references, and tutorials',
                link: '/docs',
              },
              {
                icon: Github,
                title: 'GitHub Repository',
                desc: 'Source code, issues, and community contributions',
                link: 'https://github.com',
              },
              {
                icon: Terminal,
                title: 'CLI Tools',
                desc: 'Command-line interface for advanced workflows',
                link: '/docs/cli',
              },
              {
                icon: Shield,
                title: 'Security',
                desc: 'Best practices and security guidelines',
                link: '/docs/security',
              },
              {
                icon: Zap,
                title: 'Performance',
                desc: 'Optimization guides and benchmarks',
                link: '/docs/performance',
              },
              {
                icon: Package,
                title: 'Modules',
                desc: 'Browse all available product modules',
                link: '/products',
              },
            ].map((resource, index) => (
              <motion.a
                key={index}
                href={resource.link}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-newsprint/5 border border-newsprint/10 rounded-sm p-6 hover:bg-newsprint/10 transition-all group"
              >
                <resource.icon className="w-8 h-8 text-highlight-amber mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-dm font-semibold text-lg mb-2">
                  {resource.title}
                </h3>
                <p className="text-newsprint/70 text-sm font-dm">
                  {resource.desc}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-newsprint">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-crimson font-bold text-4xl md:text-5xl text-ink mb-6">
              Need Help Getting Started?
            </h2>
            <p className="text-xl text-ink-light font-source mb-8">
              Join our community on GitHub or try the managed cloud version
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://github.com/discussions" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" icon={<Github className="w-5 h-5" />}>
                  GitHub Discussions
                </Button>
              </a>
              <Link href="/signup">
                <Button variant="primary" size="lg">
                  Try Managed Cloud
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-newsprint py-8 border-t-2 border-newsprint/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-newsprint/60 font-dm text-sm">
            © 2024 Journo Journal. Open source under MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
