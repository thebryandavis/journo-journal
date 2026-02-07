'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Mic, FileAudio, CheckCircle, Users, Clock } from 'lucide-react';
import { Note } from '@/lib/types';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscribed: (note: Note) => void;
}

export const AudioUploadModal: React.FC<AudioUploadModalProps> = ({
  isOpen,
  onClose,
  onTranscribed,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<{
    note: Note;
    duration: number;
    speakers: number;
    confidence: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop an audio file (mp3, wav, m4a, webm, ogg, flac)');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', file);
      if (title.trim()) {
        formData.append('title', title.trim());
      }

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transcribe audio');
      }

      setResult({
        note: data.note,
        duration: data.transcription.duration,
        speakers: data.transcription.speakers,
        confidence: data.transcription.confidence,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTranscript = () => {
    if (result) {
      onTranscribed(result.note);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setError('');
    setResult(null);
    setLoading(false);
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
                    <div className="w-10 h-10 bg-green-100 rounded-sm flex items-center justify-center">
                      <Mic className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="font-crimson font-bold text-2xl text-ink">
                        Upload Interview
                      </h2>
                      <p className="text-sm text-ink/60 font-dm">
                        Transcribe audio with speaker detection
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

                <div className="p-6 space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-sm text-red-600 font-dm">
                      {error}
                    </div>
                  )}

                  {result ? (
                    /* Success state */
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="font-crimson font-bold text-xl text-ink mb-4">
                        Transcription Complete
                      </h3>
                      <div className="flex justify-center gap-6 mb-6">
                        <div className="text-center">
                          <Clock className="w-4 h-4 text-ink/40 mx-auto mb-1" />
                          <p className="text-sm font-dm font-medium text-ink">
                            {formatDuration(result.duration)}
                          </p>
                          <p className="text-xs text-ink/40 font-dm">Duration</p>
                        </div>
                        <div className="text-center">
                          <Users className="w-4 h-4 text-ink/40 mx-auto mb-1" />
                          <p className="text-sm font-dm font-medium text-ink">
                            {result.speakers}
                          </p>
                          <p className="text-xs text-ink/40 font-dm">Speakers</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleViewTranscript}
                        className="bg-ink text-newsprint px-6 py-3 rounded-sm font-dm font-medium"
                      >
                        View Transcript
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      {/* Title input */}
                      <div>
                        <label className="block text-sm font-dm font-medium text-ink mb-1">
                          Title (optional)
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Interview with..."
                          className="w-full px-4 py-3 border border-ink/10 rounded-sm font-dm text-sm focus:outline-none focus:border-highlight-amber transition-colors"
                          disabled={loading}
                        />
                      </div>

                      {/* Drop zone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
                          dragOver
                            ? 'border-highlight-amber bg-highlight-amber/5'
                            : file
                            ? 'border-green-300 bg-green-50'
                            : 'border-ink/20 hover:border-ink/40'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        {file ? (
                          <div>
                            <FileAudio className="w-10 h-10 text-green-500 mx-auto mb-2" />
                            <p className="font-dm text-sm font-medium text-ink">{file.name}</p>
                            <p className="text-xs text-ink/40 font-dm mt-1">
                              {formatFileSize(file.size)} &middot; Click to change
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-10 h-10 text-ink/30 mx-auto mb-2" />
                            <p className="font-dm text-sm text-ink/60">
                              Drag and drop an audio file, or click to browse
                            </p>
                            <p className="text-xs text-ink/40 font-dm mt-1">
                              MP3, WAV, M4A, WebM, OGG, FLAC &middot; Max 100MB
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={handleClose}
                          className="px-4 py-2 border border-ink/10 rounded-sm font-dm text-sm text-ink/70 hover:bg-ink/5 transition-colors"
                        >
                          Cancel
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmit}
                          disabled={!file || loading}
                          className="bg-ink text-newsprint px-6 py-2 rounded-sm font-dm text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-newsprint/40 border-t-transparent rounded-full animate-spin"></div>
                              Transcribing...
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4" /> Upload & Transcribe
                            </>
                          )}
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
