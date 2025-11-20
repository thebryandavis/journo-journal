'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button, Input, Card, Badge } from '@/components/ui';
import { Users, Plus, Mail, Phone, Building2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      if (data.success) {
        setSources(data.sources);
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-crimson font-bold text-4xl text-ink mb-2">
              Sources & Contacts
            </h1>
            <p className="text-ink/60 font-dm">
              {sources.length} {sources.length === 1 ? 'source' : 'sources'} in your network
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
              <input
                type="text"
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-ink/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-highlight-amber font-dm"
              />
            </div>
            <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
              Add Source
            </Button>
          </div>
        </div>

        {/* Sources Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-highlight-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-ink/60 font-dm">Loading sources...</p>
          </div>
        ) : filteredSources.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-highlight-amber/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-highlight-amber" />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-ink mb-3">
              {searchQuery ? 'No sources found' : 'Start Building Your Network'}
            </h3>
            <p className="text-ink/60 font-dm mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Add sources, contacts, and experts to keep track of your journalism network'}
            </p>
            {!searchQuery && (
              <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
                Add Your First Source
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSources.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-highlight-amber/20 rounded-full flex items-center justify-center text-ink font-bold text-lg flex-shrink-0">
                      {source.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <h3 className="font-crimson font-bold text-xl text-ink mb-1">
                    {source.name}
                  </h3>

                  {source.title && (
                    <p className="text-sm text-ink/70 font-dm mb-1">
                      {source.title}
                    </p>
                  )}

                  {source.organization && (
                    <div className="flex items-center gap-2 text-sm text-ink/60 font-dm mb-4">
                      <Building2 className="w-4 h-4" />
                      {source.organization}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {source.email && (
                      <div className="flex items-center gap-2 text-sm text-ink/70 font-dm">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${source.email}`} className="hover:text-highlight-amber">
                          {source.email}
                        </a>
                      </div>
                    )}

                    {source.phone && (
                      <div className="flex items-center gap-2 text-sm text-ink/70 font-dm">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${source.phone}`} className="hover:text-highlight-amber">
                          {source.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {source.notes && (
                    <p className="text-sm text-ink/60 font-source line-clamp-2 mb-4">
                      {source.notes}
                    </p>
                  )}

                  {source.last_contacted && (
                    <div className="text-xs text-ink/50 font-dm pt-4 border-t border-ink/10">
                      Last contacted:{' '}
                      {new Date(source.last_contacted).toLocaleDateString()}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
