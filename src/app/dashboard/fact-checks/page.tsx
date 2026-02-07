'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { Shield, Search, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

interface FactCheckEntry {
  id: string;
  note_id: string;
  note_title: string;
  status: string;
  summary: string;
  total_claims: number;
  verified_count: number;
  false_count: number;
  mixed_count: number;
  unverified_count: number;
  created_at: string;
  completed_at: string;
}

export default function FactChecksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [factChecks, setFactChecks] = useState<FactCheckEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFactChecks();
    }
  }, [status]);

  const fetchFactChecks = async () => {
    try {
      const response = await fetch('/api/fact-check');
      const data = await response.json();
      if (data.success) {
        setFactChecks(data.factChecks || []);
      }
    } catch (error) {
      console.error('Failed to fetch fact-checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChecks = factChecks.filter((fc) =>
    (fc.note_title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-highlight-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-ink/60 font-dm">Loading fact checks...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="font-crimson font-bold text-4xl text-ink">
                Fact Checks
              </h1>
              <p className="text-ink/60 font-dm">
                {factChecks.length} fact check{factChecks.length !== 1 ? 's' : ''} completed
              </p>
            </div>
          </div>

          {factChecks.length > 0 && (
            <div className="relative md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              <input
                type="text"
                placeholder="Search by note title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-ink/10 rounded-sm font-dm text-sm focus:outline-none focus:border-highlight-amber transition-colors"
              />
            </div>
          )}
        </div>

        {/* Fact Check List */}
        {filteredChecks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-ink mb-3">
              {searchQuery ? 'No fact checks found' : 'No Fact Checks Yet'}
            </h3>
            <p className="text-ink/60 font-dm mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Try a different search term.'
                : 'Open any note and click the Fact Check button to verify claims against live sources.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredChecks.map((fc) => (
              <Link key={fc.id} href={`/dashboard/notes/${fc.note_id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.005 }}
                  className="bg-white border border-ink/10 rounded-sm p-4 hover:border-ink/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-dm font-medium text-ink truncate">
                        {fc.note_title || 'Untitled Note'}
                      </h3>
                      {fc.summary && (
                        <p className="text-sm font-dm text-ink/60 mt-1 line-clamp-2">
                          {fc.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-dm text-ink/50">
                          <Clock className="w-3 h-3" />
                          {formatDate(fc.completed_at || fc.created_at)}
                        </span>
                        {fc.verified_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-dm font-medium text-green-600">
                            <CheckCircle className="w-3 h-3" /> {fc.verified_count} verified
                          </span>
                        )}
                        {fc.false_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-dm font-medium text-red-600">
                            <XCircle className="w-3 h-3" /> {fc.false_count} false
                          </span>
                        )}
                        {fc.mixed_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-dm font-medium text-amber-600">
                            <AlertTriangle className="w-3 h-3" /> {fc.mixed_count} mixed
                          </span>
                        )}
                        {fc.unverified_count > 0 && (
                          <span className="text-xs font-dm text-ink/40">
                            {fc.unverified_count} unverified
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-dm text-ink/40 flex-shrink-0">
                      {fc.total_claims} claim{fc.total_claims !== 1 ? 's' : ''}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
