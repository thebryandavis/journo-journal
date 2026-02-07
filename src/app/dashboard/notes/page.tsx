'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { NotesList } from '@/components/notes/NotesList';
import { Button } from '@/components/ui';
import { FileText, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Note } from '@/lib/types';
import clsx from 'clsx';

export default function AllNotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'unassigned' ? 'unassigned' : 'all';

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'unassigned'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotes();
    }
  }, [status, tab]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const url = tab === 'unassigned' ? '/api/notes?unassigned=true' : '/api/notes';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteDeleted = (noteId: string) => {
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-highlight-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-ink/60 font-dm">Loading notes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-editorial-blue/20 rounded-sm flex items-center justify-center">
              <FileText className="w-6 h-6 text-editorial-blue" />
            </div>
            <div>
              <h1 className="font-crimson font-bold text-4xl text-ink">
                All Notes
              </h1>
              <p className="text-ink/60 font-dm">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex border border-ink/20 rounded-sm p-1">
            <button
              onClick={() => setTab('all')}
              className={clsx(
                'px-4 py-2 rounded-sm font-dm text-sm transition-colors',
                tab === 'all'
                  ? 'bg-ink text-newsprint font-semibold'
                  : 'text-ink/60 hover:bg-ink/5'
              )}
            >
              All Notes
            </button>
            <button
              onClick={() => setTab('unassigned')}
              className={clsx(
                'px-4 py-2 rounded-sm font-dm text-sm transition-colors',
                tab === 'unassigned'
                  ? 'bg-ink text-newsprint font-semibold'
                  : 'text-ink/60 hover:bg-ink/5'
              )}
            >
              Unassigned
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-ink/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-highlight-amber font-dm"
            />
          </div>
        </div>

        {/* Notes */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-highlight-amber border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-highlight-amber/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-highlight-amber" />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-ink mb-3">
              {tab === 'unassigned' ? 'No Unassigned Notes' : 'No Notes Yet'}
            </h3>
            <p className="text-ink/60 font-dm max-w-md mx-auto">
              {tab === 'unassigned'
                ? 'All your notes are assigned to projects.'
                : 'Create your first note to get started.'}
            </p>
          </motion.div>
        ) : (
          <NotesList
            notes={notes}
            searchQuery={searchQuery}
            viewMode="grid"
            onNoteDeleted={handleNoteDeleted}
            onNoteUpdated={fetchNotes}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
