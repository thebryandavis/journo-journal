'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { KnowledgeGraphView } from '@/components/graph/KnowledgeGraphView';
import { Button, Card } from '@/components/ui';
import { Network, Info, Lightbulb, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KnowledgeGraphPage() {
  const router = useRouter();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleNodeClick = (noteId: string) => {
    setSelectedNoteId(noteId);
    // Optionally navigate to the note
    // router.push(`/dashboard/notes/${noteId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-highlight-amber/20 rounded-sm flex items-center justify-center">
                <Network className="w-6 h-6 text-highlight-amber" />
              </div>
              <div>
                <h1 className="font-crimson font-bold text-4xl text-ink">
                  Knowledge Graph
                </h1>
                <p className="text-ink/60 font-dm">
                  Visualize connections between your stories
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-highlight-amber/10 to-transparent border-l-4 border-highlight-amber">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-highlight-amber flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-dm font-semibold text-ink mb-1">
                    Auto-Connected
                  </h3>
                  <p className="text-sm text-ink/70 font-dm">
                    AI automatically links related stories based on content similarity
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-editorial-blue/10 to-transparent border-l-4 border-editorial-blue">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-editorial-blue flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-dm font-semibold text-ink mb-1">
                    Discover Insights
                  </h3>
                  <p className="text-sm text-ink/70 font-dm">
                    Find unexpected connections and new story angles
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-editorial-green/10 to-transparent border-l-4 border-editorial-green">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-editorial-green flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-dm font-semibold text-ink mb-1">
                    Track Themes
                  </h3>
                  <p className="text-sm text-ink/70 font-dm">
                    See recurring themes and build on your reporting
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Knowledge Graph */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <KnowledgeGraphView onNodeClick={handleNodeClick} />
        </motion.div>

        {/* Tips Section */}
        <Card className="bg-newsprint">
          <h3 className="font-crimson font-bold text-xl text-ink mb-4">
            How to Use the Knowledge Graph
          </h3>
          <div className="space-y-3 font-dm text-ink/70">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-highlight-amber text-ink rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <p>
                <strong className="text-ink">Click nodes</strong> to view note details
                and navigate to full content
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-highlight-amber text-ink rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <p>
                <strong className="text-ink">Drag nodes</strong> to reorganize the graph
                and find better layouts
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-highlight-amber text-ink rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <p>
                <strong className="text-ink">Hover over connections</strong> to see
                similarity strength between notes
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-highlight-amber text-ink rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              <p>
                <strong className="text-ink">Use minimap</strong> to navigate large
                graphs with many notes
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
