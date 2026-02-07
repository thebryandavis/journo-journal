'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { NoteCard } from '@/components/notes/NoteCard';
import { CreateNoteModal } from '@/components/notes/CreateNoteModal';
import { AddNotesToProjectModal } from '@/components/projects/AddNotesToProjectModal';
import { Button, Badge } from '@/components/ui';
import {
  Plus,
  ArrowLeft,
  Archive,
  ArchiveRestore,
  FileText,
  MoreVertical,
  Trash2,
  LinkIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Note, Project } from '@/lib/types';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [isAddNotesOpen, setIsAddNotesOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && projectId) {
      fetchProject();
    }
  }, [status, projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setProject(data.project);
        setNotes(data.project.notes || []);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleNoteCreated = (note: Note) => {
    setNotes([note, ...notes]);
    setProject((prev) =>
      prev ? { ...prev, note_count: (prev.note_count || 0) + 1 } : prev
    );
    setIsCreateNoteOpen(false);
  };

  const handleNotesAdded = () => {
    fetchProject();
    setIsAddNotesOpen(false);
  };

  const handleNoteDeleted = (noteId: string) => {
    setNotes(notes.filter((n) => n.id !== noteId));
    setProject((prev) =>
      prev ? { ...prev, note_count: Math.max(0, (prev.note_count || 0) - 1) } : prev
    );
  };

  const handleRemoveFromProject = async (noteId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/notes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_ids: [noteId] }),
      });
      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== noteId));
        setProject((prev) =>
          prev ? { ...prev, note_count: Math.max(0, (prev.note_count || 0) - 1) } : prev
        );
      }
    } catch (error) {
      console.error('Failed to remove note from project:', error);
    }
  };

  const handleArchiveToggle = async () => {
    if (!project) return;
    const newStatus = project.status === 'active' ? 'archived' : 'active';
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setProject({ ...project, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project? Notes will not be deleted.')) return;
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-highlight-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-ink/60 font-dm">Loading project...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Link + Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-ink font-dm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Newsroom
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-crimson font-bold text-4xl text-ink">
                  {project.name}
                </h1>
                <Badge
                  variant={project.status === 'active' ? 'green' : 'default'}
                  size="sm"
                >
                  {project.status}
                </Badge>
              </div>
              {project.description && (
                <p className="text-ink/60 font-dm mb-2">{project.description}</p>
              )}
              <p className="text-ink/40 font-dm text-sm">
                {project.note_count || 0}{' '}
                {(project.note_count || 0) === 1 ? 'note' : 'notes'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                icon={<LinkIcon className="w-5 h-5" />}
                onClick={() => setIsAddNotesOpen(true)}
              >
                Add Existing Notes
              </Button>
              <Button
                variant="primary"
                icon={<Plus className="w-5 h-5" />}
                onClick={() => setIsCreateNoteOpen(true)}
              >
                New Note
              </Button>

              {/* More Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-3 hover:bg-ink/5 rounded-sm transition-colors border border-ink/20"
                >
                  <MoreVertical className="w-5 h-5 text-ink/60" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-xl border border-ink/10 py-2 z-10">
                    <button
                      onClick={handleArchiveToggle}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-ink/5 text-ink/70 hover:text-ink transition-colors font-dm text-sm"
                    >
                      {project.status === 'active' ? (
                        <>
                          <Archive className="w-4 h-4" />
                          Archive Project
                        </>
                      ) : (
                        <>
                          <ArchiveRestore className="w-4 h-4" />
                          Unarchive Project
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-highlight-red/5 text-highlight-red transition-colors font-dm text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-highlight-amber/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-highlight-amber" />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-ink mb-3">
              No Notes Yet
            </h3>
            <p className="text-ink/60 font-dm mb-6 max-w-md mx-auto">
              Start adding notes, research, and interviews to this project.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                icon={<LinkIcon className="w-5 h-5" />}
                onClick={() => setIsAddNotesOpen(true)}
              >
                Add Existing Notes
              </Button>
              <Button
                variant="primary"
                icon={<Plus className="w-5 h-5" />}
                onClick={() => setIsCreateNoteOpen(true)}
              >
                Create Note
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="relative group/remove"
              >
                <NoteCard
                  note={note}
                  viewMode="grid"
                  onDeleted={handleNoteDeleted}
                  onUpdated={fetchProject}
                />
                <button
                  onClick={() => handleRemoveFromProject(note.id)}
                  className="absolute top-2 left-2 opacity-0 group-hover/remove:opacity-100 transition-opacity bg-white/90 border border-ink/10 text-ink/60 hover:text-highlight-red hover:border-highlight-red/30 rounded-sm px-2 py-1 text-xs font-dm z-10"
                >
                  Remove from project
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateNoteModal
        isOpen={isCreateNoteOpen}
        onClose={() => setIsCreateNoteOpen(false)}
        onNoteCreated={handleNoteCreated}
        projectId={projectId}
        projectName={project.name}
      />

      <AddNotesToProjectModal
        isOpen={isAddNotesOpen}
        projectId={projectId}
        existingNoteIds={notes.map((n) => n.id)}
        onClose={() => setIsAddNotesOpen(false)}
        onNotesAdded={handleNotesAdded}
      />
    </DashboardLayout>
  );
}
