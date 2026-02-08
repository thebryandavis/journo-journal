'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge } from '@/components/ui';
import { X, Search, Plus, Check } from 'lucide-react';
import { Note } from '@/lib/types';
import { format } from 'date-fns';

interface AddNotesToProjectModalProps {
  isOpen: boolean;
  projectId: string;
  existingNoteIds: string[];
  onClose: () => void;
  onNotesAdded: () => void;
}

export const AddNotesToProjectModal: React.FC<AddNotesToProjectModalProps> = ({
  isOpen,
  projectId,
  existingNoteIds,
  onClose,
  onNotesAdded,
}) => {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
      setSelectedIds(new Set());
      setSearchQuery('');
    }
  }, [isOpen]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      if (data.success) {
        setAllNotes(data.notes);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableNotes = useMemo(() => {
    const existingSet = new Set(existingNoteIds);
    let filtered = allNotes.filter((n) => !existingSet.has(n.id));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allNotes, existingNoteIds, searchQuery]);

  const toggleNote = (noteId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_ids: Array.from(selectedIds) }),
      });

      if (response.ok) {
        onNotesAdded();
        onClose();
      }
    } catch (error) {
      console.error('Failed to add notes:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'idea': return 'amber';
      case 'research': return 'blue';
      case 'interview': return 'green';
      default: return 'default';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white rounded-sm shadow-2xl border border-ink/10 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-ink/10 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-editorial-blue/20 rounded-sm flex items-center justify-center">
                      <Plus className="w-5 h-5 text-editorial-blue" />
                    </div>
                    <div>
                      <h2 className="font-crimson font-bold text-2xl text-ink">
                        Add Notes to Project
                      </h2>
                      <p className="text-sm text-ink/60 font-dm">
                        {selectedIds.size > 0
                          ? `${selectedIds.size} selected`
                          : 'Select notes to add'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-ink/5 rounded-sm transition-colors"
                  >
                    <X className="w-6 h-6 text-ink/60" />
                  </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-ink/10 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
                    <input
                      type="text"
                      placeholder="Search notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-ink/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-editorial-blue font-dm"
                    />
                  </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {loading ? (
                    <div className="text-center py-8 text-ink/60 font-dm">
                      Loading notes...
                    </div>
                  ) : availableNotes.length === 0 ? (
                    <div className="text-center py-8 text-ink/60 font-dm">
                      {searchQuery
                        ? 'No matching notes found'
                        : 'All notes are already in this project'}
                    </div>
                  ) : (
                    availableNotes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => toggleNote(note.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-sm border transition-colors text-left ${
                          selectedIds.has(note.id)
                            ? 'border-editorial-blue bg-editorial-blue/5'
                            : 'border-ink/10 hover:bg-ink/5'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedIds.has(note.id)
                              ? 'border-editorial-blue bg-editorial-blue text-white'
                              : 'border-ink/30'
                          }`}
                        >
                          {selectedIds.has(note.id) && (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-crimson font-bold text-ink truncate">
                            {note.title}
                          </p>
                          <p className="text-xs text-ink/50 font-dm">
                            {format(new Date(note.updated_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge
                          variant={getTypeColor(note.type) as any}
                          size="sm"
                        >
                          {note.type}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-ink/10 flex-shrink-0">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={selectedIds.size === 0 || submitting}
                  >
                    {submitting
                      ? 'Adding...'
                      : `Add ${selectedIds.size || ''} Note${selectedIds.size !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
