'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Note } from '@/lib/types';
import { Badge } from '@/components/ui';
import {
  FileText,
  Calendar,
  MoreVertical,
  Star,
  Trash2,
  Edit,
  Share2,
  Tag as TagIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import clsx from 'clsx';

interface NoteCardProps {
  note: Note;
  viewMode: 'grid' | 'list';
  onDeleted: (noteId: string) => void;
  onUpdated: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  viewMode,
  onDeleted,
  onUpdated,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isFavorite, setIsFavorite] = useState(note.is_favorite);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDeleted(note.id);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch(`/api/notes/${note.id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !isFavorite }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        onUpdated();
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'idea':
        return 'amber';
      case 'research':
        return 'blue';
      case 'interview':
        return 'green';
      default:
        return 'default';
    }
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  if (viewMode === 'list') {
    return (
      <div className="note-card p-6 flex items-start gap-4 hover:shadow-lg transition-all cursor-pointer group">
        <div className="flex-shrink-0 w-12 h-12 bg-highlight-amber/20 rounded-sm flex items-center justify-center">
          <FileText className="w-6 h-6 text-highlight-amber" />
        </div>

        <div className="flex-1 min-w-0">
          <Link href={`/dashboard/notes/${note.id}`}>
            <h3 className="font-crimson font-bold text-xl text-ink mb-2 group-hover:text-highlight-amber transition-colors">
              {note.title}
            </h3>
          </Link>

          {note.content && (
            <p className="text-ink/70 font-source text-sm mb-3 line-clamp-2">
              {truncateContent(note.content, 150)}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-ink/50 font-dm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(note.updated_at), 'MMM d, yyyy')}
            </span>
            {note.word_count > 0 && (
              <span>{note.word_count} words</span>
            )}
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {note.tags.slice(0, 5).map((tag) => (
                <Badge key={tag.id} variant="amber" size="sm">
                  {tag.tag_name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getTypeColor(note.type)} size="sm">
            {note.type}
          </Badge>

          <button
            onClick={handleToggleFavorite}
            className={clsx(
              'p-2 rounded-sm transition-colors',
              isFavorite ? 'text-highlight-amber' : 'text-ink/30 hover:text-ink/60'
            )}
          >
            <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-ink/5 rounded-sm transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-ink/60" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-xl border border-ink/10 py-2 z-10">
                <Link
                  href={`/dashboard/notes/${note.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-ink/5 text-ink/70 hover:text-ink transition-colors font-dm text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-highlight-red/5 text-highlight-red transition-colors font-dm text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/dashboard/notes/${note.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="note-card p-6 h-full hover:shadow-lg transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-highlight-amber/20 rounded-sm flex items-center justify-center">
            <FileText className="w-6 h-6 text-highlight-amber" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleToggleFavorite();
              }}
              className={clsx(
                'p-2 rounded-sm transition-colors',
                isFavorite ? 'text-highlight-amber' : 'text-ink/30 hover:text-ink/60'
              )}
            >
              <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu(!showMenu);
                }}
                className="p-2 hover:bg-ink/5 rounded-sm transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-ink/60" />
              </button>

              {showMenu && (
                <div
                  onClick={(e) => e.preventDefault()}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-xl border border-ink/10 py-2 z-10"
                >
                  <Link
                    href={`/dashboard/notes/${note.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-ink/5 text-ink/70 hover:text-ink transition-colors font-dm text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-highlight-red/5 text-highlight-red transition-colors font-dm text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <h3 className="font-crimson font-bold text-xl text-ink mb-3 group-hover:text-highlight-amber transition-colors line-clamp-2">
          {note.title}
        </h3>

        {note.content && (
          <p className="text-ink/70 font-source text-sm mb-4 line-clamp-3">
            {truncateContent(note.content, 120)}
          </p>
        )}

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="amber" size="sm">
                {tag.tag_name}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="default" size="sm">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-ink/50 font-dm pt-4 border-t border-ink/10">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(note.updated_at), 'MMM d')}
          </span>
          <Badge variant={getTypeColor(note.type)} size="sm">
            {note.type}
          </Badge>
        </div>
      </motion.div>
    </Link>
  );
};
