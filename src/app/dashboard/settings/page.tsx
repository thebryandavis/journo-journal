'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui';
import { Settings, User, Bell, Lock, Palette, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-ink/10 rounded-sm flex items-center justify-center">
                <Settings className="w-6 h-6 text-ink" />
              </div>
              <div>
                <h1 className="font-crimson font-bold text-4xl text-ink">
                  Settings
                </h1>
                <p className="text-ink/60 font-dm">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-editorial-blue/20 rounded-sm flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-editorial-blue" />
                </div>
                <div>
                  <h3 className="font-dm font-semibold text-ink mb-1">
                    Profile Settings
                  </h3>
                  <p className="text-sm text-ink/60 font-dm">
                    Update your name, email, and profile photo
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
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-highlight-amber/20 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-highlight-amber" />
                </div>
                <div>
                  <h3 className="font-dm font-semibold text-ink mb-1">
                    Notifications
                  </h3>
                  <p className="text-sm text-ink/60 font-dm">
                    Configure email and push notifications
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
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-highlight-red/20 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-highlight-red" />
                </div>
                <div>
                  <h3 className="font-dm font-semibold text-ink mb-1">
                    Security & Privacy
                  </h3>
                  <p className="text-sm text-ink/60 font-dm">
                    Manage password, 2FA, and privacy settings
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-editorial-green/20 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Palette className="w-5 h-5 text-editorial-green" />
                </div>
                <div>
                  <h3 className="font-dm font-semibold text-ink mb-1">
                    Appearance
                  </h3>
                  <p className="text-sm text-ink/60 font-dm">
                    Customize theme, fonts, and layout
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-ink/10 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h3 className="font-dm font-semibold text-ink mb-1">
                    Data & Storage
                  </h3>
                  <p className="text-sm text-ink/60 font-dm">
                    Export data, manage backups, and storage
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Coming Soon Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-newsprint border-l-4 border-highlight-amber">
            <p className="text-ink/70 font-dm text-sm">
              <strong className="text-ink">Settings panels coming soon.</strong> These
              settings are currently placeholders. Full configuration options will be
              available in the next update.
            </p>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
