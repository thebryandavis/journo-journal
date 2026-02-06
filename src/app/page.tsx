'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import {
  BookOpen,
  Sparkles,
  Search,
  Users,
  Zap,
  Brain,
  FileText,
  Tag,
  Calendar,
  ChevronRight,
  Github,
  Star,
  GitFork,
  Package,
  Code2,
  Network,
  Layers,
  Database,
  Cloud,
  Server,
  Download,
  Shield,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-editorial-gradient">
      {/* Header */}
      <header className="border-b-2 border-ink/10 bg-newsprint/95 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-8 h-8 text-ink" strokeWidth={2.5} />
              <h1 className="font-newsreader font-extrabold text-2xl text-ink">
                Journo Journal
              </h1>
              <span className="ml-2 text-xs font-dm font-semibold bg-highlight-amber/30 text-ink px-2 py-1 rounded-full">
                OPEN SOURCE
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-6 font-dm text-sm">
              <Link href="/products" className="text-ink/70 hover:text-ink transition-colors">
                Products
              </Link>
              <Link href="/developers" className="text-ink/70 hover:text-ink transition-colors">
                Developers
              </Link>
              <Link href="/docs" className="text-ink/70 hover:text-ink transition-colors">
                Documentation
              </Link>
              <Link href="/community" className="text-ink/70 hover:text-ink transition-colors">
                Community
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <a
                href="https://github.com/yourusername/journo-journal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border border-ink/20 rounded-sm hover:bg-ink/5 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline font-dm text-sm">Star on GitHub</span>
              </a>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </motion.div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Open Source Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-4 mb-8"
            >
              <span className="bg-ink text-newsprint font-dm font-semibold px-4 py-2 rounded-sm text-sm flex items-center gap-2">
                <Github className="w-4 h-4" />
                Open Source Platform
              </span>
              <span className="flex items-center gap-2 text-ink/60 font-dm text-sm">
                <Star className="w-4 h-4 fill-highlight-amber text-highlight-amber" />
                2.4k stars
              </span>
              <span className="flex items-center gap-2 text-ink/60 font-dm text-sm">
                <GitFork className="w-4 h-4" />
                180 forks
              </span>
            </motion.div>

            <h1 className="font-crimson font-bold text-5xl md:text-6xl lg:text-7xl text-ink leading-tight mb-6">
              The Open Source
              <br />
              <span className="highlight-mark">Journalist Intelligence Platform</span>
            </h1>

            <p className="text-xl md:text-2xl text-ink-light font-source leading-relaxed mb-12 max-w-4xl mx-auto">
              Production-ready modules for note-taking, knowledge graphs, semantic search,
              and AI-powered research. Deploy anywhere—your infrastructure, your data, your control.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/products">
                <Button variant="primary" size="lg" icon={<Package className="w-5 h-5" />}>
                  Browse Products
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" size="lg" icon={<Code2 className="w-5 h-5" />}>
                  View Documentation
                </Button>
              </Link>
              <a href="https://github.com/yourusername/journo-journal" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="lg" icon={<Github className="w-5 h-5" />}>
                  GitHub
                </Button>
              </a>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-8 text-sm text-ink/60 font-dm"
            >
              <span>✓ Self-hosted or Cloud</span>
              <span>✓ MIT Licensed</span>
              <span>✓ Production Ready</span>
              <span>✓ Docker Support</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Product Modules Grid */}
      <section className="bg-newsprint py-20 border-y-2 border-ink/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-crimson font-bold text-4xl md:text-5xl text-ink mb-6">
              Off-the-Shelf Product Modules
            </h2>
            <p className="text-xl text-ink-light font-source max-w-3xl mx-auto">
              Each module works independently or together as a complete platform.
              Pick what you need, deploy in minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Knowledge Graph",
                desc: "Visualize connections between notes with semantic similarity powered by vector embeddings.",
                tech: "React Flow, PostgreSQL, OpenAI",
                status: "Stable",
                color: "amber",
                badge: "v1.2.0"
              },
              {
                icon: Sparkles,
                title: "AI Note-Taking",
                desc: "Auto-tagging, summarization, and smart organization using GPT-4 and embeddings.",
                tech: "OpenAI API, Tiptap Editor",
                status: "Stable",
                color: "amber",
                badge: "v1.1.0"
              },
              {
                icon: TrendingUp,
                title: "Spaced Repetition",
                desc: "SM-2 algorithm implementation for knowledge retention and review scheduling.",
                tech: "PostgreSQL Functions, SM-2",
                status: "Beta",
                color: "red",
                badge: "v0.8.0"
              },
              {
                icon: Search,
                title: "Semantic Search",
                desc: "Find content by meaning, not keywords. Powered by vector similarity search.",
                tech: "OpenAI Embeddings, JSONB",
                status: "Stable",
                color: "amber",
                badge: "v1.0.0"
              },
              {
                icon: Users,
                title: "Collaboration",
                desc: "Real-time sharing, permissions, and team workspaces with role-based access.",
                tech: "PostgreSQL, NextAuth",
                status: "Stable",
                color: "amber",
                badge: "v1.0.0"
              },
              {
                icon: Database,
                title: "Data Pipeline",
                desc: "Import from web, PDFs, YouTube transcripts. Export to Markdown, JSON, or CSV.",
                tech: "Puppeteer, PDF.js",
                status: "Alpha",
                color: "red",
                badge: "v0.3.0"
              },
            ].map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border-2 border-ink/10 rounded-sm p-6 hover:shadow-lg hover:border-highlight-amber/50 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-sm bg-highlight-${product.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <product.icon className={`w-6 h-6 text-highlight-${product.color === 'amber' ? 'amber' : 'red'}`} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-dm font-semibold px-2 py-1 rounded-full ${
                      product.status === 'Stable'
                        ? 'bg-editorial-green/20 text-editorial-green'
                        : product.status === 'Beta'
                        ? 'bg-highlight-amber/20 text-highlight-amber'
                        : 'bg-ink/10 text-ink/60'
                    }`}>
                      {product.status}
                    </span>
                    <span className="text-xs font-dm text-ink/40">
                      {product.badge}
                    </span>
                  </div>
                </div>

                <h3 className="font-crimson font-bold text-xl text-ink mb-3">
                  {product.title}
                </h3>
                <p className="text-ink/60 font-dm text-sm mb-4 leading-relaxed">
                  {product.desc}
                </p>

                <div className="pt-4 border-t border-ink/10">
                  <p className="text-xs text-ink/40 font-dm mb-2">Tech Stack:</p>
                  <p className="text-xs text-ink/60 font-dm">{product.tech}</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs">
                    View Docs
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Github className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/products">
              <Button variant="outline" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
                View All Products & Modules
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Deployment Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-crimson font-bold text-4xl md:text-5xl text-ink mb-6">
              Deploy Your Way
            </h2>
            <p className="text-xl text-ink-light font-source max-w-3xl mx-auto">
              Choose the deployment model that fits your needs. Same codebase, different approaches.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-newsprint border-2 border-ink/10 rounded-sm p-8 hover:border-highlight-amber/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-editorial-blue/20 rounded-sm flex items-center justify-center">
                  <Server className="w-6 h-6 text-editorial-blue" />
                </div>
                <div>
                  <h3 className="font-crimson font-bold text-2xl text-ink">Self-Hosted</h3>
                  <p className="text-sm text-ink/60 font-dm">Full control, your infrastructure</p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Complete data ownership",
                  "Deploy on any cloud or on-premise",
                  "Docker & Kubernetes ready",
                  "No usage limits or restrictions",
                  "Customize everything",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-ink/70 font-dm">
                    <Shield className="w-5 h-5 text-editorial-green flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full" icon={<Download className="w-4 h-4" />}>
                Get Started with Docker
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-ink text-newsprint border-2 border-ink rounded-sm p-8 hover:border-highlight-amber transition-all"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-highlight-amber/20 rounded-sm flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-highlight-amber" />
                </div>
                <div>
                  <h3 className="font-crimson font-bold text-2xl">Managed Cloud</h3>
                  <p className="text-sm text-newsprint/60 font-dm">Zero ops, instant setup</p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Deploy in 60 seconds",
                  "Auto-scaling & backups",
                  "99.9% uptime SLA",
                  "Built-in CDN & SSL",
                  "24/7 support included",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-newsprint/80 font-dm">
                    <Zap className="w-5 h-5 text-highlight-amber flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button variant="secondary" className="w-full" icon={<ChevronRight className="w-4 h-4" />}>
                Start Free Trial
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Open Source */}
      <section className="bg-ink text-newsprint py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-crimson font-bold text-4xl md:text-5xl mb-6">
              Why We're Open Source
            </h2>
            <p className="text-xl text-newsprint/80 font-source max-w-3xl mx-auto">
              We believe journalists deserve tools they can trust, inspect, and control.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Transparency",
                desc: "Every line of code is open. No black boxes, no hidden tracking, no vendor lock-in."
              },
              {
                icon: Users,
                title: "Community-Driven",
                desc: "Built by journalists, for journalists. Features driven by real newsroom needs."
              },
              {
                icon: Lightbulb,
                title: "Innovation",
                desc: "Extend, modify, and integrate freely. Build custom modules for your workflow."
              },
            ].map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-highlight-amber/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <reason.icon className="w-8 h-8 text-highlight-amber" />
                </div>
                <h3 className="font-crimson font-bold text-2xl mb-4">{reason.title}</h3>
                <p className="text-newsprint/70 font-source">{reason.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-20 bg-newsprint">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2.4k+", label: "GitHub Stars" },
              { value: "180+", label: "Contributors" },
              { value: "1.2k+", label: "Newsrooms" },
              { value: "50k+", label: "Weekly Downloads" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="font-crimson font-bold text-5xl text-ink mb-2">
                  {stat.value}
                </div>
                <div className="font-dm text-ink/60">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20 border-y-2 border-ink/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-crimson font-bold text-4xl md:text-5xl text-ink mb-6">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-ink-light font-source mb-8 max-w-2xl mx-auto">
              Choose self-hosted for complete control or managed cloud for zero-ops deployment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/signup">
                <Button variant="primary" size="lg" icon={<Cloud className="w-5 h-5" />}>
                  Try Managed Cloud Free
                </Button>
              </Link>
              <Link href="/docs/self-hosting">
                <Button variant="outline" size="lg" icon={<Server className="w-5 h-5" />}>
                  Self-Host with Docker
                </Button>
              </Link>
            </div>

            <p className="text-sm text-ink/60 font-dm">
              No credit card required for cloud trial • MIT License for self-hosting
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-newsprint py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-newsprint" />
                <span className="font-newsreader font-bold text-lg">Journo Journal</span>
              </div>
              <p className="text-newsprint/60 font-dm text-sm mb-4">
                Open source journalist intelligence platform. Built for newsrooms, by newsrooms.
              </p>
              <div className="flex gap-3">
                <a href="https://github.com" className="text-newsprint/60 hover:text-newsprint transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" className="text-newsprint/60 hover:text-newsprint transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-crimson font-bold mb-4">Products</h4>
              <ul className="space-y-2 font-dm text-sm text-newsprint/70">
                <li><Link href="/products/knowledge-graph" className="hover:text-newsprint">Knowledge Graph</Link></li>
                <li><Link href="/products/ai-notes" className="hover:text-newsprint">AI Note-Taking</Link></li>
                <li><Link href="/products/semantic-search" className="hover:text-newsprint">Semantic Search</Link></li>
                <li><Link href="/products/collaboration" className="hover:text-newsprint">Collaboration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-crimson font-bold mb-4">Developers</h4>
              <ul className="space-y-2 font-dm text-sm text-newsprint/70">
                <li><Link href="/docs" className="hover:text-newsprint">Documentation</Link></li>
                <li><Link href="/docs/api" className="hover:text-newsprint">API Reference</Link></li>
                <li><a href="https://github.com" className="hover:text-newsprint">GitHub</a></li>
                <li><Link href="/community" className="hover:text-newsprint">Community</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-crimson font-bold mb-4">Company</h4>
              <ul className="space-y-2 font-dm text-sm text-newsprint/70">
                <li><Link href="/about" className="hover:text-newsprint">About</Link></li>
                <li><Link href="/blog" className="hover:text-newsprint">Blog</Link></li>
                <li><Link href="/pricing" className="hover:text-newsprint">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-newsprint">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-newsprint/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-newsprint/60 font-dm text-sm">
              © 2024 Journo Journal. Open source under MIT License.
            </p>
            <div className="flex gap-6 text-newsprint/60 font-dm text-sm">
              <Link href="/privacy" className="hover:text-newsprint">Privacy</Link>
              <Link href="/terms" className="hover:text-newsprint">Terms</Link>
              <Link href="/security" className="hover:text-newsprint">Security</Link>
              <Link href="/license" className="hover:text-newsprint">License</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
