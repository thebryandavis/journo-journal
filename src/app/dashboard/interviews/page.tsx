'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AudioUploadModal } from '@/components/transcribe/AudioUploadModal';
import { motion } from 'framer-motion';
import { Mic, Search, Clock, Users, Plus } from 'lucide-react';
import { Note } from '@/lib/types';
import Link from 'next/link';

export default function InterviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInterviews();
    }
  }, [status]);

  const fetchInterviews = async () => {
    try {
      const response = await fetch('/api/notes?type=interview');
      const data = await response.json();
      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribed = (note: Note) => {
    setNotes([note, ...notes]);
    router.push(`/dashboard/notes/${note.id}`);
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-highlight-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-ink/60 font-dm">Loading interviews...</p>
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-sm flex items-center justify-center">
              <Mic className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="font-crimson font-bold text-4xl text-ink">
                Interviews
              </h1>
              <p className="text-ink/60 font-dm">
                {notes.length} interview{notes.length !== 1 ? 's' : ''} transcribed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              <input
                type="text"
                placeholder="Search interviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-ink/10 rounded-sm font-dm text-sm focus:outline-none focus:border-highlight-amber transition-colors"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsUploadOpen(true)}
              className="bg-ink text-newsprint px-4 py-2 rounded-sm font-dm text-sm font-medium flex items-center gap-2"
            >
              <Mic className="w-4 h-4" /> Upload Interview
            </motion.button>
          </div>
        </div>

        {/* Interview List */}
        {filteredNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-ink mb-3">
              {searchQuery ? 'No interviews found' : 'Upload Your First Interview'}
            </h3>
            <p className="text-ink/60 font-dm mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Try a different search term.'
                : 'Upload an audio recording and get an AI-powered transcript with speaker detection.'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsUploadOpen(true)}
                className="bg-ink text-newsprint px-6 py-3 rounded-sm font-dm font-medium inline-flex items-center gap-2"
              >
                <Mic className="w-5 h-5" /> Upload Interview
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => {
              const attachment = note.attachments?.[0];
              const metadata = attachment?.metadata || {};

              return (
                <Link key={note.id} href={`/dashboard/notes/${note.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.005 }}
                    className="bg-white border border-ink/10 rounded-sm p-4 hover:border-ink/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-sm flex items-center justify-center flex-shrink-0">
                        <Mic className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-dm font-medium text-ink truncate">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-dm text-ink/50">
                            {formatDate(note.created_at)}
                          </span>
                          {metadata.duration && (
                            <span className="inline-flex items-center gap-1 text-xs font-dm text-ink/50">
                              <Clock className="w-3 h-3" />
                              {Math.floor(metadata.duration / 60)}m {Math.floor(metadata.duration % 60)}s
                            </span>
                          )}
                          {metadata.speakers && (
                            <span className="inline-flex items-center gap-1 text-xs font-dm text-ink/50">
                              <Users className="w-3 h-3" />
                              {metadata.speakers} speaker{metadata.speakers !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-dm text-ink/40 flex-shrink-0">
                        {note.word_count} words
                      </span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <AudioUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onTranscribed={handleTranscribed}
      />
    </DashboardLayout>
  );
}
