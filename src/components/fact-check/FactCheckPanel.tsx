'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Loader, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ClaimCard } from './ClaimCard';
import { FactCheck } from '@/lib/types';

interface FactCheckPanelProps {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FactCheckPanel: React.FC<FactCheckPanelProps> = ({
  noteId,
  isOpen,
  onClose,
}) => {
  const [factCheck, setFactCheck] = useState<FactCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchExisting();
    }
  }, [isOpen, noteId]);

  const fetchExisting = async () => {
    setFetching(true);
    try {
      const response = await fetch(`/api/fact-check?noteId=${noteId}`);
      const data = await response.json();
      if (data.success && data.factCheck) {
        setFactCheck(data.factCheck);
      }
    } catch (error) {
      console.error('Failed to fetch fact-check:', error);
    } finally {
      setFetching(false);
    }
  };

  const runFactCheck = async () => {
    setLoading(true);
    setLoadingStep('Extracting claims...');
    setFactCheck(null);

    try {
      // Simulate step progression for UX
      const stepTimer1 = setTimeout(() => setLoadingStep('Searching sources...'), 5000);
      const stepTimer2 = setTimeout(() => setLoadingStep('Verifying claims...'), 15000);

      const response = await fetch('/api/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await response.json();

      if (data.success) {
        setFactCheck(data.factCheck);
      }
    } catch (error) {
      console.error('Failed to run fact-check:', error);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl border-l border-ink/10 z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-ink/10 bg-gradient-to-r from-blue-50 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-crimson font-bold text-xl text-ink">Fact Check</h2>
                  <p className="text-xs text-ink/60 font-dm">Verify claims against live sources</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-ink/5 rounded-sm transition-colors"
              >
                <X className="w-5 h-5 text-ink/60" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {fetching ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 text-ink/40 animate-spin" />
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="font-crimson font-bold text-lg text-ink mb-2">Analyzing...</h3>
                <p className="text-sm text-ink/60 font-dm">{loadingStep}</p>
                <p className="text-xs text-ink/40 font-dm mt-2">This may take up to a minute</p>
              </div>
            ) : factCheck && factCheck.status === 'completed' ? (
              <>
                {/* Summary */}
                <div className="bg-ink/[0.02] rounded-sm p-4 border border-ink/10">
                  <p className="text-sm font-dm text-ink/70 mb-3">{factCheck.summary}</p>
                  <div className="flex gap-3 flex-wrap">
                    {factCheck.verified_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-dm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-sm">
                        <CheckCircle className="w-3 h-3" /> {factCheck.verified_count} verified
                      </span>
                    )}
                    {factCheck.false_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-dm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-sm">
                        <XCircle className="w-3 h-3" /> {factCheck.false_count} false
                      </span>
                    )}
                    {factCheck.mixed_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-dm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-sm">
                        <AlertTriangle className="w-3 h-3" /> {factCheck.mixed_count} mixed
                      </span>
                    )}
                    {factCheck.unverified_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-dm font-medium text-ink/50 bg-ink/5 px-2 py-1 rounded-sm">
                        {factCheck.unverified_count} unverified
                      </span>
                    )}
                  </div>
                </div>

                {/* Claims */}
                {factCheck.claims && factCheck.claims.length > 0 && (
                  <div className="space-y-3">
                    {factCheck.claims.map((claim, idx) => (
                      <ClaimCard key={claim.id || idx} claim={claim} />
                    ))}
                  </div>
                )}
              </>
            ) : factCheck && factCheck.status === 'failed' ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="font-crimson font-bold text-lg text-ink mb-2">Fact Check Failed</h3>
                <p className="text-sm text-ink/60 font-dm">{factCheck.error_message || 'An unexpected error occurred'}</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <h3 className="font-crimson font-bold text-lg text-ink mb-2">Ready to Fact Check</h3>
                <p className="text-sm text-ink/60 font-dm mb-6 max-w-xs mx-auto">
                  Extract factual claims from this note and verify them against live web sources.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={runFactCheck}
                  className="bg-ink text-newsprint px-6 py-3 rounded-sm font-dm font-medium inline-flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" /> Run Fact Check
                </motion.button>
              </div>
            )}
          </div>

          {/* Footer */}
          {factCheck && factCheck.status === 'completed' && (
            <div className="p-4 border-t border-ink/10 bg-newsprint/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runFactCheck}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-ink/5 hover:bg-ink/10 rounded-sm font-dm text-sm text-ink transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" /> Re-run Fact Check
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
