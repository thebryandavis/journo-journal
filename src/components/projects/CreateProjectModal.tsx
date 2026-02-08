'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Textarea } from '@/components/ui';
import { X, FolderPlus } from 'lucide-react';
import { Project } from '@/lib/types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a project name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      onProjectCreated(data.project);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white rounded-sm shadow-2xl border border-ink/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-ink/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-editorial-blue/20 rounded-sm flex items-center justify-center">
                      <FolderPlus className="w-5 h-5 text-editorial-blue" />
                    </div>
                    <div>
                      <h2 className="font-crimson font-bold text-2xl text-ink">
                        New Project
                      </h2>
                      <p className="text-sm text-ink/60 font-dm">
                        Organize notes around a story
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-ink/5 rounded-sm transition-colors"
                  >
                    <X className="w-6 h-6 text-ink/60" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {error && (
                    <div className="bg-highlight-red/10 border border-highlight-red/30 rounded-sm p-4 text-sm text-highlight-red font-dm">
                      {error}
                    </div>
                  )}

                  <Input
                    label="Project Name"
                    placeholder="e.g. Climate Policy Investigation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <Textarea
                    label="Description (optional)"
                    placeholder="Brief description of this story..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
