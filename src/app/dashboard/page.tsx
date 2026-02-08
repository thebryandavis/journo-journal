'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { NoteCard } from '@/components/notes/NoteCard';
import { CreateNoteModal } from '@/components/notes/CreateNoteModal';
import { AudioUploadModal } from '@/components/transcribe/AudioUploadModal';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { Button } from '@/components/ui';
import { Plus, Mic, FolderPlus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Note, Project } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [unassignedNotes, setUnassignedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [projectsRes, notesRes] = await Promise.all([
        fetch('/api/projects?status=active'),
        fetch('/api/notes?unassigned=true'),
      ]);
      const [projectsData, notesData] = await Promise.all([
        projectsRes.json(),
        notesRes.json(),
      ]);
      if (projectsData.success) setProjects(projectsData.projects);
      if (notesData.success) setUnassignedNotes(notesData.notes);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (project: Project) => {
    setProjects([project, ...projects]);
    setIsCreateProjectOpen(false);
  };

  const handleNoteCreated = (note: Note) => {
    setUnassignedNotes([note, ...unassignedNotes]);
    setIsCreateNoteOpen(false);
  };

  const handleTranscribed = (note: Note) => {
    setUnassignedNotes([note, ...unassignedNotes]);
    setIsUploadModalOpen(false);
  };

  const handleNoteDeleted = (noteId: string) => {
    setUnassignedNotes(unassignedNotes.filter((n) => n.id !== noteId));
  };

  const handleProjectAction = async (
    projectId: string,
    action: 'archive' | 'unarchive' | 'delete'
  ) => {
    try {
      if (action === 'delete') {
        await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: action === 'archive' ? 'archived' : 'active',
          }),
        });
      }
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error(`Failed to ${action} project:`, error);
    }
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

  const hasContent = projects.length > 0 || unassignedNotes.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-crimson font-bold text-4xl text-ink mb-2">
              Your Newsroom
            </h1>
            <p className="text-ink/60 font-dm">
              {projects.length} active {projects.length === 1 ? 'project' : 'projects'}
              {unassignedNotes.length > 0 &&
                ` · ${unassignedNotes.length} unassigned ${unassignedNotes.length === 1 ? 'note' : 'notes'}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={<Mic className="w-5 h-5" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Interview
            </Button>
            <Button
              variant="outline"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => setIsCreateNoteOpen(true)}
            >
              New Note
            </Button>
            <Button
              variant="primary"
              icon={<FolderPlus className="w-5 h-5" />}
              onClick={() => setIsCreateProjectOpen(true)}
            >
              New Project
            </Button>
          </div>
        </div>

        {!hasContent ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-editorial-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderPlus className="w-12 h-12 text-editorial-blue" />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-ink mb-3">
              Create Your First Project
            </h3>
            <p className="text-ink/60 font-dm mb-6 max-w-md mx-auto">
              Projects group your notes, research, and interviews around a single story. Start by creating a project for your current article.
            </p>
            <Button
              variant="primary"
              icon={<FolderPlus className="w-5 h-5" />}
              onClick={() => setIsCreateProjectOpen(true)}
            >
              Create Project
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Active Projects */}
            {projects.length > 0 && (
              <section>
                <h2 className="font-crimson font-bold text-2xl text-ink mb-4">
                  Active Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <ProjectCard
                        project={project}
                        onArchive={(id) => handleProjectAction(id, 'archive')}
                        onUnarchive={(id) => handleProjectAction(id, 'unarchive')}
                        onDelete={(id) => handleProjectAction(id, 'delete')}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Unassigned Notes */}
            {unassignedNotes.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-crimson font-bold text-2xl text-ink">
                    Unassigned Notes
                  </h2>
                  <Link
                    href="/dashboard/notes?tab=unassigned"
                    className="flex items-center gap-1 text-sm text-editorial-blue hover:underline font-dm"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unassignedNotes.slice(0, 6).map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <NoteCard
                        note={note}
                        viewMode="grid"
                        onDeleted={handleNoteDeleted}
                        onUpdated={fetchData}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <CreateNoteModal
        isOpen={isCreateNoteOpen}
        onClose={() => setIsCreateNoteOpen(false)}
        onNoteCreated={handleNoteCreated}
      />

      <AudioUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onTranscribed={handleTranscribed}
      />
    </DashboardLayout>
  );
}
