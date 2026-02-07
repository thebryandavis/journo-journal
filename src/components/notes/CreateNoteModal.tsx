'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { RichTextEditor } from './RichTextEditor';
import { X, Sparkles } from 'lucide-react';
import { Note, NoteType } from '@/lib/types';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated: (note: Note) => void;
  projectId?: string;
  projectName?: string;
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  onNoteCreated,
  projectId,
  projectName,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('note');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content,
          type,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          ...(projectId && { project_id: projectId }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create note');
      }

      onNoteCreated(data.note);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('note');
    setTags('');
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="w-full max-w-4xl bg-white rounded-sm shadow-2xl border border-ink/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-ink/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-highlight-amber/20 rounded-sm flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-highlight-amber" />
                    </div>
                    <div>
                      <h2 className="font-crimson font-bold text-2xl text-ink">
                        Create New Note
                      </h2>
                      <p className="text-sm text-ink/60 font-dm">
                        {projectName
                          ? `Adding to: ${projectName}`
                          : 'Capture your story idea'}
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

                  {/* Title */}
                  <Input
                    label="Title"
                    placeholder="What's this story about?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  {/* Type Selector */}
                  <div>
                    <label className="label">Type</label>
                    <div className="flex gap-2">
                      {(['note', 'idea', 'research', 'interview'] as NoteType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`px-4 py-2 rounded-sm font-dm capitalize transition-all ${
                            type === t
                              ? 'bg-highlight-amber text-ink font-semibold'
                              : 'bg-newsprint text-ink/70 hover:bg-newsprint-dark'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Editor */}
                  <div>
                    <label className="label">Content</label>
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Start writing your story..."
                    />
                  </div>

                  {/* Tags */}
                  <Input
                    label="Tags (comma-separated)"
                    placeholder="politics, climate, investigation"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-ink/10">
                    <p className="text-sm text-ink/60 font-dm">
                      AI will auto-tag and organize your note
                    </p>
                    <div className="flex gap-3">
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
                        {loading ? 'Creating...' : 'Create Note'}
                      </Button>
                    </div>
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
