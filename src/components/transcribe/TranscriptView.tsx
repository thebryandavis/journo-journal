'use client';

import { Mic, Clock, Users, BarChart3 } from 'lucide-react';
import { Attachment } from '@/lib/types';

interface TranscriptViewProps {
  attachment?: Attachment;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const TranscriptView: React.FC<TranscriptViewProps> = ({ attachment }) => {
  if (!attachment) return null;

  const metadata = attachment.metadata || {};
  const duration = metadata.duration;
  const speakers = metadata.speakers;
  const confidence = metadata.confidence;

  return (
    <div className="space-y-3 mb-4">
      {/* Audio Player */}
      {attachment.file_url && (
        <div className="bg-ink/[0.02] rounded-sm border border-ink/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-sm flex items-center justify-center">
              <Mic className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-dm font-medium text-ink truncate">
                {attachment.file_name}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                {duration && (
                  <span className="inline-flex items-center gap-1 text-xs font-dm text-ink/50">
                    <Clock className="w-3 h-3" /> {formatDuration(duration)}
                  </span>
                )}
                {speakers && (
                  <span className="inline-flex items-center gap-1 text-xs font-dm text-ink/50">
                    <Users className="w-3 h-3" /> {speakers} speaker{speakers !== 1 ? 's' : ''}
                  </span>
                )}
                {confidence && (
                  <span className="inline-flex items-center gap-1 text-xs font-dm text-ink/50">
                    <BarChart3 className="w-3 h-3" /> {Math.round(confidence * 100)}% accuracy
                  </span>
                )}
              </div>
            </div>
          </div>
          <audio
            controls
            className="w-full h-10"
            src={attachment.file_url}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};
