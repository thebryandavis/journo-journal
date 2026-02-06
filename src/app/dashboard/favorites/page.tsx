'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FavoritesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-highlight-amber/20 rounded-sm flex items-center justify-center">
                <Star className="w-6 h-6 text-highlight-amber" />
              </div>
              <div>
                <h1 className="font-crimson font-bold text-4xl text-ink">
                  Favorites
                </h1>
                <p className="text-ink/60 font-dm">
                  Quick access to your starred notes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-highlight-amber/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-highlight-amber" />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-ink mb-2">
              Favorites View Coming Soon
            </h3>
            <p className="text-ink/60 font-dm max-w-md mx-auto">
              This page will display all your favorite notes.
              You can mark notes as favorites from the main Dashboard.
            </p>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
