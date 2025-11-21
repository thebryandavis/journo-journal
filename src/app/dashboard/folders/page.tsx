'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui';
import { Folder, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FoldersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-editorial-green/20 rounded-sm flex items-center justify-center">
                <Folder className="w-6 h-6 text-editorial-green" />
              </div>
              <div>
                <h1 className="font-crimson font-bold text-4xl text-ink">
                  Folders
                </h1>
                <p className="text-ink/60 font-dm">
                  Organize your notes into folders
                </p>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-highlight-amber hover:bg-highlight-amber/90 text-ink font-dm font-medium rounded-sm transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Folder
          </button>
        </div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-editorial-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-editorial-green" />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-ink mb-2">
              Folder Management Coming Soon
            </h3>
            <p className="text-ink/60 font-dm max-w-md mx-auto">
              This page will let you create and manage folders to organize your notes.
              The folder structure is already in the database and ready to use.
            </p>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
