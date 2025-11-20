'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { NotesList } from '@/components/notes/NotesList';
import { CreateNoteModal } from '@/components/notes/CreateNoteModal';
import { Button } from '@/components/ui';
import { Plus, Search, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { Note } from '@/lib/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotes();
    }
  }, [status]);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
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

  const handleNoteCreated = (newNote: Note) => {
    setNotes([newNote, ...notes]);
    setIsCreateModalOpen(false);
  };

  const handleNoteDeleted = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-highlight-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-ink/60 font-dm">Loading your newsroom...</p>
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
          <div>
            <h1 className="font-crimson font-bold text-4xl text-ink mb-2">
              Your Stories
            </h1>
            <p className="text-ink/60 font-dm">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} in your workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-ink/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-highlight-amber font-dm"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border border-ink/20 rounded-sm p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-sm transition-colors ${
                  viewMode === 'grid' ? 'bg-ink text-newsprint' : 'text-ink/60 hover:bg-ink/5'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-sm transition-colors ${
                  viewMode === 'list' ? 'bg-ink text-newsprint' : 'text-ink/60 hover:bg-ink/5'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Create Note Button */}
            <Button
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-highlight-amber/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-highlight-amber" />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-ink mb-3">
              Start Your First Story
            </h3>
            <p className="text-ink/60 font-dm mb-6 max-w-md mx-auto">
              Capture ideas, research, interviews, and more. Your AI-powered newsroom awaits.
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Your First Note
            </Button>
          </motion.div>
        ) : (
          <NotesList
            notes={notes}
            searchQuery={searchQuery}
            viewMode={viewMode}
            onNoteDeleted={handleNoteDeleted}
            onNoteUpdated={fetchNotes}
          />
        )}
      </div>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onNoteCreated={handleNoteCreated}
      />
    </DashboardLayout>
  );
}
