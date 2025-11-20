'use client';

import { motion } from 'framer-motion';
import { Note } from '@/lib/types';
import { NoteCard } from './NoteCard';
import { useMemo } from 'react';

interface NotesListProps {
  notes: Note[];
  searchQuery: string;
  viewMode: 'grid' | 'list';
  onNoteDeleted: (noteId: string) => void;
  onNoteUpdated: () => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  searchQuery,
  viewMode,
  onNoteDeleted,
  onNoteUpdated,
}) => {
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;

    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content?.toLowerCase().includes(query) ||
        note.tags?.some((tag) => tag.tag_name.toLowerCase().includes(query))
    );
  }, [notes, searchQuery]);

  if (filteredNotes.length === 0 && searchQuery) {
    return (
      <div className="text-center py-20">
        <p className="text-ink/60 font-dm text-lg mb-2">No notes found</p>
        <p className="text-ink/40 font-dm text-sm">
          Try adjusting your search terms
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }
    >
      {filteredNotes.map((note, index) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <NoteCard
            note={note}
            viewMode={viewMode}
            onDeleted={onNoteDeleted}
            onUpdated={onNoteUpdated}
          />
        </motion.div>
      ))}
    </div>
  );
};
