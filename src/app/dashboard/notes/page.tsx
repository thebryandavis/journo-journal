'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui';
import { FileText, Search, Filter, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AllNotesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-editorial-blue/20 rounded-sm flex items-center justify-center">
                <FileText className="w-6 h-6 text-editorial-blue" />
              </div>
              <div>
                <h1 className="font-crimson font-bold text-4xl text-ink">
                  All Notes
                </h1>
                <p className="text-ink/60 font-dm">
                  View and manage all your notes
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-ink/5 rounded-sm transition-colors">
              <Grid className="w-5 h-5 text-ink/60" />
            </button>
            <button className="p-2 hover:bg-ink/5 rounded-sm transition-colors">
              <List className="w-5 h-5 text-ink/60" />
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-3 border border-ink/10 rounded-sm font-dm focus:outline-none focus:border-highlight-amber transition-colors"
            />
          </div>
          <button className="px-4 py-3 border border-ink/10 rounded-sm font-dm hover:bg-ink/5 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-highlight-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-highlight-amber" />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-ink mb-2">
              Notes List View Coming Soon
            </h3>
            <p className="text-ink/60 font-dm max-w-md mx-auto">
              This page will display all your notes in a filterable, searchable list.
              For now, you can access notes from the main Dashboard.
            </p>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
