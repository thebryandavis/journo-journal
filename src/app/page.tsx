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
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-editorial-gradient">
      {/* Hero Section */}
      <header className="border-b-2 border-ink/10 bg-newsprint/95 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-8 h-8 text-ink" strokeWidth={2.5} />
            <h1 className="font-newsreader font-extrabold text-2xl text-ink">
              Journo Journal
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </motion.div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="bg-highlight-amber/30 text-ink font-dm font-medium px-4 py-2 rounded-full text-sm">
                ✨ Your AI-Powered Newsroom Assistant
              </span>
            </motion.div>

            <h1 className="font-crimson font-bold text-5xl md:text-6xl lg:text-7xl text-ink leading-tight mb-6">
              From Chaos to
              <span className="highlight-mark ml-3">Compelling Stories</span>
            </h1>

            <p className="text-xl text-ink-light font-source leading-relaxed mb-8">
              Stop drowning in browser tabs and scattered notes. Journo Journal helps journalists capture ideas,
              organize research, and develop stories—all with AI-powered intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button variant="primary" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </Link>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-ink/60 font-dm mt-6"
            >
              No credit card required • Free 14-day trial
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="bg-white rounded-sm shadow-2xl border border-ink/10 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-highlight-amber via-highlight-red to-highlight-amber"></div>

              <div className="space-y-4">
                {[
                  { title: "Interview: Mayor's Response to Housing Crisis", tags: ["Politics", "Housing"], time: "2m ago" },
                  { title: "Research Notes: Climate Change Data 2024", tags: ["Environment", "Data"], time: "1h ago" },
                  { title: "Story Idea: Local Business Boom Post-Pandemic", tags: ["Business", "Community"], time: "3h ago" },
                ].map((note, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="note-card p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <h4 className="font-crimson font-semibold text-ink mb-2">{note.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {note.tags.map((tag, j) => (
                          <span key={j} className="text-xs bg-highlight-amber/20 text-ink px-2 py-1 rounded-full font-dm">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-ink/50 font-dm">{note.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="bg-ink text-newsprint py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-crimson font-bold text-4xl md:text-5xl mb-6">
              The Great Journalist Brain of Chaos
            </h2>
            <p className="text-xl text-newsprint/80 font-source max-w-3xl mx-auto">
              We know the struggle: 147 browser tabs, random voice notes, lost quotes,
              and that Google Doc graveyard of "final_FINAL_actualFINAL_v7"
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "Scattered Information", desc: "Notes across Slack, emails, docs, and notebooks" },
              { icon: Search, title: "Can't Find Anything", desc: "That perfect quote exists... somewhere, maybe?" },
              { icon: Zap, title: "Missing Deadlines", desc: "Lost focus, missed follow-ups, and overlooked insights" },
            ].map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-newsprint/5 border border-newsprint/10 rounded-sm p-8 hover:bg-newsprint/10 transition-all"
              >
                <problem.icon className="w-12 h-12 text-highlight-amber mb-4" />
                <h3 className="font-crimson font-bold text-2xl mb-3">{problem.title}</h3>
                <p className="text-newsprint/70 font-source">{problem.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-newsprint">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-crimson font-bold text-4xl md:text-5xl text-ink mb-6">
              Your AI-Powered Newsroom
            </h2>
            <p className="text-xl text-ink-light font-source max-w-3xl mx-auto">
              Journo Journal transforms how journalists work—capturing ideas in seconds,
              organizing with AI, and surfacing insights when you need them most.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                icon: Sparkles,
                title: "Instant Capture",
                desc: "Browser extension lets you clip articles, quotes, and research without breaking your flow. One click, perfectly organized.",
                color: "amber"
              },
              {
                icon: Brain,
                title: "AI Auto-Tagging",
                desc: "AI reads your content and automatically tags everything. No more manual organization—it just works.",
                color: "red"
              },
              {
                icon: Search,
                title: "Semantic Search",
                desc: "Find anything by meaning, not just keywords. Ask 'climate change interviews' and get exactly what you need.",
                color: "amber"
              },
              {
                icon: Users,
                title: "Team Collaboration",
                desc: "Share notes with your newsroom. AI highlights key points so teammates get context instantly.",
                color: "red"
              },
              {
                icon: Tag,
                title: "Smart Suggestions",
                desc: "See related notes and research as you write. Discover connections you didn't know existed.",
                color: "amber"
              },
              {
                icon: Calendar,
                title: "Editorial Calendar",
                desc: "Track deadlines, manage follow-ups, and prioritize stories—all in one beautiful interface.",
                color: "red"
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6"
              >
                <div className={`flex-shrink-0 w-16 h-16 rounded-sm bg-highlight-${feature.color}/20 flex items-center justify-center`}>
                  <feature.icon className={`w-8 h-8 text-highlight-${feature.color === 'amber' ? 'amber' : 'red'}`} />
                </div>
                <div>
                  <h3 className="font-crimson font-bold text-2xl text-ink mb-3">{feature.title}</h3>
                  <p className="text-ink-light font-source text-lg">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ink text-newsprint py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-crimson font-bold text-4xl md:text-5xl mb-6">
              Let Your Chaos Create Magic
            </h2>
            <p className="text-xl text-newsprint/80 font-source mb-8 max-w-2xl mx-auto">
              Stop trying to force your creative brain into a filing cabinet.
              Let Journo Journal handle the organizing—you focus on the stories that matter.
            </p>
            <Link href="/signup">
              <Button variant="secondary" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
                Start Your Free Trial
              </Button>
            </Link>
            <p className="text-sm text-newsprint/60 font-dm mt-6">
              Join hundreds of journalists who've transformed their workflow
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-newsprint border-t-2 border-ink/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-ink" />
                <span className="font-newsreader font-bold text-lg text-ink">Journo Journal</span>
              </div>
              <p className="text-ink/60 font-dm text-sm">
                Organize your stories, amplify your impact.
              </p>
            </div>
            <div>
              <h4 className="font-crimson font-bold text-ink mb-4">Product</h4>
              <ul className="space-y-2 font-dm text-sm text-ink/70">
                <li><a href="#" className="hover:text-ink">Features</a></li>
                <li><a href="#" className="hover:text-ink">Pricing</a></li>
                <li><a href="#" className="hover:text-ink">Browser Extension</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-crimson font-bold text-ink mb-4">Company</h4>
              <ul className="space-y-2 font-dm text-sm text-ink/70">
                <li><a href="#" className="hover:text-ink">About</a></li>
                <li><a href="#" className="hover:text-ink">Blog</a></li>
                <li><a href="#" className="hover:text-ink">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-crimson font-bold text-ink mb-4">Legal</h4>
              <ul className="space-y-2 font-dm text-sm text-ink/70">
                <li><a href="#" className="hover:text-ink">Privacy</a></li>
                <li><a href="#" className="hover:text-ink">Terms</a></li>
                <li><a href="#" className="hover:text-ink">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-ink/10 pt-8 text-center">
            <p className="text-ink/60 font-dm text-sm">
              © 2024 Journo Journal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
