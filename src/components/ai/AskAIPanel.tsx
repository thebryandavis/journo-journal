'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { Brain, Send, Loader, Sparkles, X } from 'lucide-react';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AskAIPanelProps {
  noteId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AskAIPanel: React.FC<AskAIPanelProps> = ({
  noteId,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          note_id: noteId,
          use_all_notes: !noteId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'Summarize the key points',
    'What are the main insights?',
    'Suggest related story angles',
    'What questions should I ask?',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-ink/10 z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-ink/10 bg-gradient-to-r from-highlight-amber/10 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-highlight-amber/20 rounded-sm flex items-center justify-center">
                  <Brain className="w-5 h-5 text-highlight-amber" />
                </div>
                <div>
                  <h2 className="font-crimson font-bold text-xl text-ink">
                    Ask AI
                  </h2>
                  <p className="text-xs text-ink/60 font-dm">
                    Your research assistant
                  </p>
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-highlight-amber mx-auto mb-4" />
                <h3 className="font-crimson font-bold text-lg text-ink mb-2">
                  How can I help?
                </h3>
                <p className="text-sm text-ink/60 font-dm mb-6">
                  Ask me anything about {noteId ? 'this note' : 'your notes'}
                </p>

                <div className="space-y-2">
                  <p className="text-xs text-ink/50 font-dm mb-3">
                    Try asking:
                  </p>
                  {suggestedQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(question)}
                      className="w-full text-left px-4 py-2 bg-newsprint hover:bg-newsprint-dark rounded-sm text-sm font-dm text-ink/70 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-highlight-amber/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-highlight-amber" />
                      </div>
                    )}

                    <div
                      className={clsx(
                        'max-w-[80%] rounded-sm p-4 font-source text-sm',
                        message.role === 'user'
                          ? 'bg-ink text-newsprint'
                          : 'bg-newsprint text-ink'
                      )}
                    >
                      {message.content}
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center text-newsprint font-bold text-sm flex-shrink-0">
                        You
                      </div>
                    )}
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 bg-highlight-amber/20 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-highlight-amber" />
                    </div>
                    <div className="bg-newsprint rounded-sm p-4">
                      <Loader className="w-5 h-5 text-ink/40 animate-spin" />
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-ink/10 bg-newsprint/50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-3 border border-ink/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-highlight-amber font-dm text-sm"
                disabled={loading}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!input.trim() || loading}
                className="flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
