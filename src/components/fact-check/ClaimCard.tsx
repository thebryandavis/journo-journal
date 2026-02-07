'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { FactCheckClaim } from '@/lib/types';

interface ClaimCardProps {
  claim: FactCheckClaim;
}

const verdictConfig: Record<string, {
  icon: typeof CheckCircle;
  color: string;
  bgColor: string;
  label: string;
}> = {
  verified: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', label: 'Verified' },
  false: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', label: 'False' },
  mixed: { icon: AlertCircle, color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200', label: 'Mixed' },
  partially_verified: { icon: AlertCircle, color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200', label: 'Partial' },
  unverified: { icon: HelpCircle, color: 'text-ink/40', bgColor: 'bg-ink/[0.02] border-ink/10', label: 'Unverified' },
};

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim }) => {
  const [expanded, setExpanded] = useState(false);
  const config = verdictConfig[claim.verdict] || verdictConfig.unverified;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-sm border p-4 ${config.bgColor} transition-colors`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.color}`} />
          <div className="flex-1 min-w-0">
            <p className="font-dm text-sm text-ink leading-relaxed">
              {claim.claim_text}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-dm font-medium ${config.color}`}>
                {config.label}
              </span>
              <span className="text-xs font-dm text-ink/40">
                {Math.round(claim.confidence * 100)}% confidence
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-ink/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-ink/40" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-3 pt-3 border-t border-ink/10 space-y-3"
        >
          {claim.explanation && (
            <p className="text-sm font-dm text-ink/70 italic">
              {claim.explanation}
            </p>
          )}

          {claim.sources && claim.sources.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-dm font-medium text-ink/50 uppercase tracking-wide">
                Sources
              </p>
              {claim.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-white/60 rounded-sm hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-dm font-medium text-blue-600 group-hover:underline truncate">
                      {source.title}
                    </span>
                    <ExternalLink className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  </div>
                  {source.snippet && (
                    <p className="text-xs font-dm text-ink/50 line-clamp-2">
                      {source.snippet}
                    </p>
                  )}
                </a>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
