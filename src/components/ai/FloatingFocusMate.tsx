import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bot,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lightbulb,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TypingDots } from '../motion/MotionPrimitives';
import { useApp } from '../../contexts/AppContext';
import { getSuggestedPrompts, PromptCategory } from '../../services/aiService';
import { FL_DURATION, FL_EASE_STANDARD } from '../../utils/motion';

type PromptFilter = 'all' | PromptCategory;
type PanelState = 'minimized' | 'expanded' | 'maximized';

export const FloatingFocusMate: React.FC = () => {
  const {
    activeSession,
    activeConversationId,
    chatMessages,
    aiTyping,
    sendAiMessage,
    retryAiMessage,
    setAiReturnPath,
    copy,
    language,
  } = useApp();
  const [panelState, setPanelState] = useState<PanelState>('minimized');
  const [input, setInput] = useState('');
  const [promptFilter, setPromptFilter] = useState<PromptFilter>('all');
  const [showPrompts, setShowPrompts] = useState(true);
  const [isMessagesScrolling, setIsMessagesScrolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  // Track message IDs already present when panel opens so history never re-animates
  const seenOnOpenIdsRef = useRef<Set<string>>(new Set(chatMessages.map((m) => m.id)));
  const location = useLocation();
  const navigate = useNavigate();

  const isOpen = panelState !== 'minimized';
  const isMaximized = panelState === 'maximized';
  const suggestedPrompts = getSuggestedPrompts(language, promptFilter);

  useEffect(() => {
    if (!isOpen) {
      seenOnOpenIdsRef.current = new Set(chatMessages.map((m) => m.id));
    }
  }, [isOpen, chatMessages, activeConversationId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length, aiTyping, isOpen, panelState]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanelState((prev) => (prev === 'maximized' ? 'expanded' : 'minimized'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Hidden during active focus session or when already viewing the full AI page
  if (activeSession !== null || location.pathname === '/ai') {
    return null;
  }

  const handleMessagesScroll = () => {
    setIsMessagesScrolling(true);
    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsMessagesScrolling(false);
    }, 700);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || aiTyping) return;
    const text = input;
    setInput('');
    await sendAiMessage(text);
  };

  const handlePromptClick = async (promptText: string) => {
    if (aiTyping) return;
    await sendAiMessage(promptText);
  };

  const filterLabels: { id: PromptFilter; label: string }[] =
    language === 'id'
      ? [
          { id: 'all', label: 'Semua' },
          { id: 'tips', label: 'Tips Belajar' },
          { id: 'motivation', label: 'Motivasi' },
          { id: 'focus', label: 'Strategi Fokus' },
        ]
      : [
          { id: 'all', label: 'All' },
          { id: 'tips', label: 'Study Tips' },
          { id: 'motivation', label: 'Motivation' },
          { id: 'focus', label: 'Focus' },
        ];

  const toggleMaximizeLabel = isMaximized
    ? language === 'id'
      ? 'Kembalikan ukuran panel'
      : 'Restore panel size'
    : language === 'id'
      ? 'Perbesar panel chatbot'
      : 'Maximize chatbot panel';

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            data-testid="focusmate-launcher-btn"
            initial={{ opacity: 0, scale: 0.94, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 6 }}
            transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
            onClick={() => setPanelState('expanded')}
            aria-label={copy.ai.title}
            className="fl-panel-solid fl-btn fl-type-btn fixed bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+6.75rem)] right-4 z-30 flex h-12 w-12 items-center justify-center gap-2 rounded-full text-[#102B7A] hover:bg-[var(--fl-soft-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2454FF] dark:text-[#8BA8FF] lg:bottom-6 lg:right-6 lg:h-11 lg:w-auto lg:border-white/25 lg:bg-gradient-to-br lg:from-[#2454FF] lg:via-[#1B42CC] lg:to-[#0F2557] lg:px-4.5 lg:text-white lg:shadow-[0_12px_28px_-6px_rgba(36,84,255,0.45)] lg:backdrop-blur-none lg:hover:brightness-110 lg:dark:border-white/20 lg:dark:from-[#8BA8FF] lg:dark:via-[#5D87FF] lg:dark:to-[#2954D6] lg:dark:text-[#0B1222] lg:dark:shadow-[0_12px_28px_-6px_rgba(93,135,255,0.36)]"
          >
            <span className="relative flex items-center justify-center">
              <Bot className="h-5 w-5 shrink-0 lg:h-4 lg:w-4" strokeWidth={1.65} aria-hidden="true" />
            </span>
            <span className="hidden whitespace-nowrap lg:inline">FocusMate AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => {
              if (e.target === e.currentTarget && isMaximized) {
                setPanelState('expanded');
              }
            }}
            className={`fixed inset-0 z-50 flex transition-colors duration-200 pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(0.5rem,env(safe-area-inset-right))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] sm:p-4 md:p-6 ${
              isMaximized
                ? 'pointer-events-auto items-center justify-center bg-black/40 backdrop-blur-[2px]'
                : 'pointer-events-none items-end justify-center sm:justify-end'
            }`}
          >
            <motion.aside
              data-testid="focusmate-panel"
              data-panel-state={panelState}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: FL_DURATION.panel, ease: FL_EASE_STANDARD }}
              role={isMaximized ? 'dialog' : 'complementary'}
              aria-modal={isMaximized ? true : undefined}
              aria-label={copy.ai.title}
              className={`fl-panel-solid pointer-events-auto flex max-h-full max-w-full flex-col overflow-hidden rounded-[24px] transition-[width,height,box-shadow] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isMaximized
                  ? 'h-full w-full md:h-[min(85dvh,760px)] md:w-[min(90vw,960px)]'
                  : 'h-[min(78dvh,580px)] w-full sm:w-[min(92vw,420px)]'
              }`}
            >
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--fl-border)] px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--fl-sage-soft)] text-[var(--fl-sage)]">
                    <Bot className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="fl-type-card truncate text-[var(--fl-text)]">
                      {copy.ai.title}
                    </h2>
                    <p className="fl-type-label truncate text-[var(--fl-muted)]">
                      {language === 'id'
                        ? 'Asisten Belajar · Kontekstual'
                        : 'Study Coach · Context-Aware'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    data-testid="floating-open-full-ai"
                    onClick={() => {
                      setAiReturnPath(location.pathname);
                      setPanelState('minimized');
                      navigate('/ai');
                    }}
                    aria-label={copy.ai.openFullPage}
                    title={copy.ai.openFullPage}
                    className="fl-btn fl-type-label inline-flex h-8 items-center gap-1 rounded-full px-2.5 font-semibold text-[var(--fl-primary)] hover:bg-[var(--fl-soft-blue)] whitespace-nowrap"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    <span className="hidden sm:inline">{copy.ai.openFullPage}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="focusmate-maximize-btn"
                    aria-pressed={isMaximized}
                    onClick={() =>
                      setPanelState((prev) => (prev === 'maximized' ? 'expanded' : 'maximized'))
                    }
                    aria-label={toggleMaximizeLabel}
                    title={toggleMaximizeLabel}
                    className="fl-btn flex h-8 w-8 items-center justify-center rounded-full text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)] hover:text-[var(--fl-primary)]"
                  >
                    {isMaximized ? (
                      <Minimize2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    data-testid="focusmate-close-btn"
                    onClick={() => setPanelState('minimized')}
                    aria-label={copy.common.close}
                    title={copy.common.close}
                    className="fl-btn flex h-8 w-8 items-center justify-center rounded-full text-[var(--fl-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div
                data-testid="focusmate-messages"
                data-lenis-prevent
                onScroll={handleMessagesScroll}
                className={`fl-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden p-4 ${
                  isMessagesScrolling ? 'is-scrolling' : ''
                }`}
              >
                {chatMessages.map((msg) => {
                  const isNew = !seenOnOpenIdsRef.current.has(msg.id);
                  const isError = msg.status === 'error';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={isNew ? { opacity: 0, y: 6 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`fl-type-support break-words rounded-2xl px-4 py-2.5 ${
                          isMaximized ? 'max-w-[88%] sm:max-w-[78%] md:max-w-[68%]' : 'max-w-[85%]'
                        } ${
                          msg.role === 'user'
                            ? 'bg-[#0F2557] text-white dark:bg-[#8BA8FF] dark:text-[#0D1424]'
                            : isError
                            ? 'border border-red-200 bg-red-50/80 text-red-900 dark:border-red-900/60 dark:bg-red-950/35 dark:text-red-200'
                            : 'bg-[var(--fl-surface-subtle)] text-[var(--fl-text)]'
                        }`}
                      >
                        {isError ? (
                          <div className="space-y-2">
                            <p className="flex items-start gap-1.5 text-xs font-semibold">
                              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                              <span>{copy.ai.unavailableTitle}</span>
                            </p>
                            <p className="text-xs opacity-90">{msg.content}</p>
                            {msg.retryPrompt && (
                              <button
                                type="button"
                                disabled={aiTyping}
                                onClick={() =>
                                  void retryAiMessage(
                                    activeConversationId,
                                    msg.id,
                                    msg.retryPrompt!
                                  )
                                }
                                className="fl-btn inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-[#0D1424] dark:text-red-300"
                              >
                                <RefreshCw className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                                <span>{copy.ai.retry}</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                {aiTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16, ease: FL_EASE_STANDARD }}
                    className="flex items-start"
                  >
                    <div className="fl-type-support rounded-2xl bg-[var(--fl-surface-subtle)] px-4 py-2 text-[var(--fl-muted)]">
                      <TypingDots
                        label={
                          language === 'id' ? 'FocusMate sedang mengetik' : 'FocusMate is typing'
                        }
                      />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts Tray */}
              <div className="shrink-0 border-t border-[var(--fl-border)] bg-[var(--fl-surface-subtle)]/75 px-3.5 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPrompts((v) => !v)}
                    aria-expanded={showPrompts}
                    className="fl-btn fl-type-label inline-flex shrink-0 items-center gap-1.5 font-semibold text-[var(--fl-primary)] hover:underline"
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-[var(--fl-sage)]" strokeWidth={1.6} aria-hidden="true" />
                    <span>
                      {language === 'id' ? 'Saran Pertanyaan' : 'Suggested Prompts'}
                    </span>
                    {showPrompts ? (
                      <ChevronDown className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <ChevronUp className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </button>

                  {showPrompts && (
                    <div className="flex min-w-0 flex-wrap items-center gap-1">
                      {filterLabels.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setPromptFilter(cat.id)}
                          className={`fl-btn fl-type-label rounded-full px-2.5 py-0.5 whitespace-nowrap ${
                            promptFilter === cat.id
                              ? 'bg-[#0F2557] text-white dark:bg-[#8BA8FF] dark:text-[#0D1424]'
                              : 'text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                          }`}
                        >
                          <span className="fl-lang">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {showPrompts && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.16, ease: FL_EASE_STANDARD }}
                      className={`fl-scrollbar mt-2 flex flex-wrap gap-1.5 overflow-y-auto overflow-x-hidden ${
                        isMaximized ? 'max-h-28' : 'max-h-24'
                      }`}
                      data-lenis-prevent
                    >
                      {suggestedPrompts.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          disabled={aiTyping}
                          onClick={() => handlePromptClick(item.prompt)}
                          title={item.prompt}
                          className="fl-btn fl-type-label rounded-full border border-[var(--fl-border)] bg-[var(--fl-surface)] px-3 py-1 text-left text-[var(--fl-text)] hover:border-[var(--fl-sage)] hover:bg-[var(--fl-sage-soft)] disabled:opacity-50"
                        >
                          <span className="fl-lang">{item.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form
                onSubmit={handleSubmit}
                data-testid="focusmate-composer"
                className="flex shrink-0 items-center gap-2 border-t border-[var(--fl-border)] p-3"
              >
                <label htmlFor="floating-ai-input" className="sr-only">
                  {copy.ai.chatPlaceholder}
                </label>
                <input
                  id="floating-ai-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={copy.ai.chatPlaceholder}
                  className="fl-input fl-type-support !min-h-[44px] min-w-0 flex-1 border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-2 text-[var(--fl-text)] placeholder:text-[var(--fl-muted)]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || aiTyping}
                  aria-label={copy.ai.send}
                  className="fl-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F2557] text-white hover:bg-[#1A377D] disabled:opacity-45 dark:bg-[#8BA8FF] dark:text-[#0D1424]"
                >
                  <Send className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </form>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
