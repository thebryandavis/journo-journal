'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Project } from '@/lib/types';
import { Badge } from '@/components/ui';
import {
  FileText,
  Calendar,
  MoreVertical,
  Archive,
  ArchiveRestore,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onArchive: (projectId: string) => void;
  onUnarchive: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onArchive,
  onUnarchive,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    if (!confirm('Delete this project? Notes will not be deleted.')) return;
    onDelete(project.id);
    setShowMenu(false);
  };

  const handleArchiveToggle = () => {
    if (project.status === 'active') {
      onArchive(project.id);
    } else {
      onUnarchive(project.id);
    }
    setShowMenu(false);
  };

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="note-card p-6 h-full hover:shadow-lg transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-editorial-blue/20 rounded-sm flex items-center justify-center">
            <FileText className="w-6 h-6 text-editorial-blue" />
          </div>

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
                <button
                  onClick={handleArchiveToggle}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-ink/5 text-ink/70 hover:text-ink transition-colors font-dm text-sm"
                >
                  {project.status === 'active' ? (
                    <>
                      <Archive className="w-4 h-4" />
                      Archive
                    </>
                  ) : (
                    <>
                      <ArchiveRestore className="w-4 h-4" />
                      Unarchive
                    </>
                  )}
                </button>
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

        <h3 className="font-crimson font-bold text-xl text-ink mb-2 group-hover:text-editorial-blue transition-colors line-clamp-2">
          {project.name}
        </h3>

        {project.description && (
          <p className="text-ink/70 font-source text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-ink/50 font-dm pt-4 border-t border-ink/10">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(project.updated_at), 'MMM d')}
          </span>
          <Badge variant="blue" size="sm">
            {project.note_count || 0} {(project.note_count || 0) === 1 ? 'note' : 'notes'}
          </Badge>
        </div>
      </motion.div>
    </Link>
  );
};
