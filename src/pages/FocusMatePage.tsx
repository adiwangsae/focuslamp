import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  History,
  Lightbulb,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TypingDots } from '../components/motion/MotionPrimitives';
import { useApp } from '../contexts/AppContext';
import { SCIENCE_FACTS } from '../data/scienceFacts';
import { getSuggestedPrompts, PromptCategory } from '../services/aiService';
import { ChatConversation } from '../types';
import {
  generateDeterministicInsights,
  MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT,
} from '../utils/analytics';
import { FL_DURATION, FL_EASE_STANDARD, tabContentVariants } from '../utils/motion';

type WorkspaceMode = 'chat' | 'insights';
type AiTab = 'insights' | 'tips' | 'motivation' | 'facts';
type PromptFilter = 'all' | PromptCategory;

function formatShortTime(iso: string, lang: 'en' | 'id'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export const FocusMatePage: React.FC = () => {
  const {
    copy,
    language,
    sessions,
    streakInfo,
    levelInfo,
    totalXp,
    conversations,
    activeConversationId,
    chatMessages,
    aiTyping,
    selectConversation,
    createNewConversation,
    sendAiMessage,
    retryAiMessage,
    aiReturnPath,
    factsExploredIds,
    markFactExplored,
  } = useApp();

  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('chat');
  const [activeTab, setActiveTab] = useState<AiTab>('insights');
  const [input, setInput] = useState('');
  const [promptFilter, setPromptFilter] = useState<PromptFilter>('all');
  const [showPrompts, setShowPrompts] = useState<boolean>(() => chatMessages.length <= 2);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMessagesScrolling, setIsMessagesScrolling] = useState(false);
  const [isHistoryScrolling, setIsHistoryScrolling] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const msgScrollTimerRef = useRef<number | null>(null);
  const histScrollTimerRef = useRef<number | null>(null);
  const isNearBottomRef = useRef(true);
  const justSentRef = useRef(false);

  // Track seen message IDs per active conversation so history switches never re-animate bubbles
  const seenMsgIdsRef = useRef<Set<string>>(new Set(chatMessages.map((m) => m.id)));
  const lastConvIdRef = useRef<string>(activeConversationId);

  if (lastConvIdRef.current !== activeConversationId) {
    lastConvIdRef.current = activeConversationId;
    seenMsgIdsRef.current = new Set(chatMessages.map((m) => m.id));
  }

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? conversations[0],
    [conversations, activeConversationId]
  );

  const insights = useMemo(() => generateDeterministicInsights(sessions), [sessions]);
  const suggestedPrompts = useMemo(
    () => getSuggestedPrompts(language, promptFilter),
    [language, promptFilter]
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    isNearBottomRef.current = true;
    setShowJumpToLatest(false);
    const id = window.requestAnimationFrame(() => {
      scrollToBottom('auto');
    });
    return () => window.cancelAnimationFrame(id);
  }, [activeConversationId, scrollToBottom]);

  useEffect(() => {
    if (isNearBottomRef.current || justSentRef.current) {
      justSentRef.current = false;
      const id = window.requestAnimationFrame(() => {
        scrollToBottom(prefersReduced ? 'auto' : 'smooth');
      });
      return () => window.cancelAnimationFrame(id);
    }
    return undefined;
  }, [chatMessages.length, aiTyping, prefersReduced, scrollToBottom]);

  useEffect(() => {
    if (!isHistoryOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHistoryOpen]);

  useEffect(() => {
    return () => {
      if (msgScrollTimerRef.current !== null) window.clearTimeout(msgScrollTimerRef.current);
      if (histScrollTimerRef.current !== null) window.clearTimeout(histScrollTimerRef.current);
    };
  }, []);

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (el) {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distanceFromBottom < 72;
      isNearBottomRef.current = atBottom;
      setShowJumpToLatest(!atBottom);
    }

    setIsMessagesScrolling(true);
    if (msgScrollTimerRef.current !== null) window.clearTimeout(msgScrollTimerRef.current);
    msgScrollTimerRef.current = window.setTimeout(() => {
      setIsMessagesScrolling(false);
    }, 700);
  };

  const handleHistoryScroll = () => {
    setIsHistoryScrolling(true);
    if (histScrollTimerRef.current !== null) window.clearTimeout(histScrollTimerRef.current);
    histScrollTimerRef.current = window.setTimeout(() => {
      setIsHistoryScrolling(false);
    }, 700);
  };

  const resizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  };

  const submitMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || aiTyping) return;
    justSentRef.current = true;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendAiMessage(trimmed);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMessage(input);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submitMessage(input);
    }
  };

  const handleSelectConversation = (conv: ChatConversation) => {
    selectConversation(conv.id);
    setWorkspaceMode('chat');
    setIsHistoryOpen(false);
  };

  const handleNewConversation = () => {
    createNewConversation();
    setWorkspaceMode('chat');
    setShowPrompts(true);
    setIsHistoryOpen(false);
    textareaRef.current?.focus();
  };

  const handleBack = () => {
    const target = aiReturnPath && aiReturnPath !== '/ai' ? aiReturnPath : '/home';
    navigate(target);
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

  const studyTips =
    language === 'id'
      ? [
          {
            title: 'Atur Blok Sesuai Kompleksitas Materi',
            body: 'Gunakan blok 25 menit untuk membaca atau mencatat, dan blok 45 menit saat mengerjakan pemrograman atau latihan soal mendalam.',
          },
          {
            title: 'Jeda Visual 5 Menit Antar Blok',
            body: 'Setelah lampu selesai satu blok, angkat pandangan dari layar dan berjalan singkat sebelum memulai sesi berikutnya.',
          },
          {
            title: 'Catat Refleksi Singkat 1 Kalimat',
            body: 'Menuliskan apa yang selesai di akhir sesi membantu memulai blok berikutnya lebih cepat tanpa bingung.',
          },
        ]
      : [
          {
            title: 'Match Block Length to Task Complexity',
            body: 'Use 25-minute blocks for reading or lecture review, and 45-minute blocks for coding, writing, or multi-step problem sets.',
          },
          {
            title: 'Take a 5-Minute Screen-Free Reset',
            body: 'After completing a session, leave your desk briefly before docking your phone for the next block.',
          },
          {
            title: 'Write a One-Sentence Session Note',
            body: 'Recording where you stopped reduces restart friction the next time you sit down at FocusLamp.',
          },
        ];

  const renderSidebarBody = () => (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--fl-border)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="fl-type-overline text-[var(--fl-muted)]">
            {copy.ai.historyTitle}
          </span>
          <span className="fl-type-label rounded-full bg-[var(--fl-surface-subtle)] px-2 py-0.5 text-[var(--fl-muted)] tabular-nums">
            {conversations.length}
          </span>
        </div>
        <button
          type="button"
          data-testid="full-ai-new-chat-btn"
          onClick={handleNewConversation}
          className="fl-btn fl-type-label inline-flex min-h-[32px] items-center gap-1 rounded-full border border-[var(--fl-border)] bg-[var(--fl-surface)] px-3 py-1 font-semibold text-[var(--fl-primary)] hover:bg-[var(--fl-soft-blue)]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          <span>{copy.ai.newChat}</span>
        </button>
      </div>

      <div
        onScroll={handleHistoryScroll}
        data-testid="full-ai-history-list"
        data-lenis-prevent
        className={`fl-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden p-2.5 ${
          isHistoryScrolling ? 'is-scrolling' : ''
        }`}
      >
        {conversations.map((conv) => {
          const isActive = conv.id === activeConversation?.id;
          const lastMsg = conv.messages[conv.messages.length - 1];
          const previewText = lastMsg ? lastMsg.content : '';
          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => handleSelectConversation(conv)}
              aria-current={isActive ? 'true' : undefined}
              className={`fl-btn group relative flex w-full flex-col rounded-2xl px-3.5 py-2.5 text-left ${
                isActive
                  ? 'bg-[var(--fl-soft-blue)] text-[var(--fl-primary)] ring-1 ring-[var(--fl-primary)]/12'
                  : 'bg-transparent text-[var(--fl-text)] hover:bg-[var(--fl-surface)]'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="fl-type-btn truncate font-semibold">{conv.title}</span>
                <span className="fl-type-label shrink-0 text-[var(--fl-muted)] tabular-nums">
                  {formatShortTime(conv.updatedAtIso, language)}
                </span>
              </div>
              <p className="fl-type-support mt-0.5 line-clamp-1 text-[var(--fl-muted)]">
                {previewText}
              </p>
              <div className="fl-type-label mt-1 flex items-center gap-1.5 text-[var(--fl-muted)] tabular-nums">
                <MessageSquare className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>
                  {conv.messages.length} {copy.ai.messagesCount}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Compact Study Context */}
      <div className="shrink-0 border-t border-[var(--fl-border)] bg-[var(--fl-surface-subtle)]/75 p-3.5">
        <div className="fl-type-label flex items-center justify-between font-medium text-[var(--fl-muted)] tabular-nums">
          <span className="fl-lang">
            {copy.common.level} {levelInfo.level} · {totalXp} XP
          </span>
          <span className="fl-lang">
            {streakInfo.currentStreak}
            {language === 'id' ? 'h beruntun' : 'd streak'}
          </span>
        </div>
        <p className="fl-type-label mt-1.5 text-[var(--fl-muted)] tabular-nums">
          {sessions.length === 0
            ? language === 'id'
              ? 'Belum ada sesi tercatat pada akun Anda.'
              : 'No focus sessions logged on your account yet.'
            : `${sessions.length} ${language === 'id' ? 'sesi tercatat' : 'logged sessions'}`}
        </p>
      </div>
    </div>
  );

  return (
    <div
      data-testid="focusmate-full-page"
      className="fl-panel flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {/* Unified Stationary Workspace Header */}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--fl-border)] px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            data-testid="full-ai-back-btn"
            onClick={handleBack}
            aria-label={copy.ai.back}
            title={copy.ai.back}
            className="fl-btn fl-type-btn inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-2.5 text-[var(--fl-text)] hover:bg-[var(--fl-soft-blue)] hover:text-[var(--fl-primary)] sm:px-3"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="hidden sm:inline">{copy.ai.back}</span>
          </button>

          {workspaceMode === 'chat' && (
            <button
              type="button"
              data-testid="full-ai-history-toggle"
              onClick={() => setIsHistoryOpen((v) => !v)}
              aria-expanded={isHistoryOpen}
              aria-label={copy.ai.historyTitle}
              title={copy.ai.historyTitle}
              className="fl-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--fl-border)] bg-[var(--fl-bg)] text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)] hover:text-[var(--fl-primary)] lg:hidden"
            >
              <History className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          )}

          <div className="flex min-w-0 items-center gap-2.5">
            <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--fl-sage-border)] bg-[var(--fl-sage-soft)] text-[var(--fl-sage)] sm:flex">
              <Bot className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="fl-type-card truncate text-[var(--fl-text)]">
                  {copy.ai.title}
                </h1>
                <span className="fl-type-label hidden items-center rounded-full border border-[var(--fl-sage-border)] bg-[var(--fl-sage-soft)] px-2.5 py-0.5 font-semibold text-[var(--fl-sage)] sm:inline-flex">
                  <span>{copy.ai.statusLabel}</span>
                </span>
              </div>
              {workspaceMode === 'chat' && activeConversation && (
                <p className="fl-type-label hidden truncate text-[var(--fl-muted)] md:block">
                  {activeConversation.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Mode Switcher (Chat | Insights & Science) */}
        <div className="flex shrink-0 items-center gap-2">
          <div
            role="tablist"
            aria-label={language === 'id' ? 'Mode ruang kerja FocusMate' : 'FocusMate workspace view'}
            className="inline-flex rounded-full bg-[var(--fl-surface-subtle)] p-1"
          >
            {(
              [
                {
                  id: 'chat',
                  label: copy.ai.modeChat,
                  mobileLabel: copy.ai.modeChat,
                },
                {
                  id: 'insights',
                  label: copy.ai.modeInsights,
                  mobileLabel: language === 'id' ? 'Wawasan' : 'Insights',
                },
              ] as { id: WorkspaceMode; label: string; mobileLabel: string }[]
            ).map((mode) => {
              const active = workspaceMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setWorkspaceMode(mode.id)}
                  className={`fl-btn fl-type-label relative z-10 min-h-[32px] rounded-full px-3 py-1 font-semibold whitespace-nowrap sm:px-3.5 ${
                    active
                      ? 'text-white dark:text-[#0D1424]'
                      : 'text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="fl-ai-workspace-mode"
                      transition={{ duration: 0.2, ease: FL_EASE_STANDARD }}
                      className="absolute inset-0 -z-10 rounded-full bg-[#0F2557] dark:bg-[#8BA8FF]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="sm:hidden">{mode.mobileLabel}</span>
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <AnimatePresence mode="wait" initial={false}>
        {workspaceMode === 'chat' ? (
          <motion.div
            key="workspace-chat"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
            className="relative flex min-h-0 flex-1 overflow-hidden"
          >
            {/* Desktop Sidebar (30–35% width, independent vertical scrolling) */}
            <aside
              data-testid="full-ai-desktop-sidebar"
              aria-label={copy.ai.historyTitle}
              className="hidden shrink-0 flex-col border-r border-[var(--fl-border)] bg-[var(--fl-surface-subtle)]/50 lg:flex lg:w-[32%] lg:min-w-[270px] lg:max-w-[360px]"
            >
              {renderSidebarBody()}
            </aside>

            {/* Tablet & Mobile Collapsible History Drawer */}
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setIsHistoryOpen(false);
                  }}
                  className="fixed inset-0 z-40 flex bg-black/30 backdrop-blur-[1px] lg:hidden"
                >
                  <motion.aside
                    data-testid="full-ai-drawer-sidebar"
                    aria-label={copy.ai.historyTitle}
                    initial={prefersReduced ? false : { x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={prefersReduced ? undefined : { x: '-100%' }}
                    transition={{ duration: FL_DURATION.panel, ease: FL_EASE_STANDARD }}
                    className="flex h-full w-[min(86vw,320px)] flex-col border-r border-[var(--fl-border)] bg-[var(--fl-surface)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-xl"
                  >
                    <div className="flex shrink-0 items-center justify-between border-b border-[var(--fl-border)] px-4 py-3">
                      <span className="fl-type-card text-[var(--fl-text)]">
                        {copy.ai.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsHistoryOpen(false)}
                        aria-label={copy.common.close}
                        className="fl-btn flex h-8 w-8 items-center justify-center rounded-full text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)]"
                      >
                        <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    </div>
                    {renderSidebarBody()}
                  </motion.aside>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Conversation Area (~65–70% on desktop, full width on tablet/mobile) */}
            <section
              data-testid="full-ai-chat-pane"
              aria-label={copy.ai.chatTitle}
              className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--fl-surface)]"
            >
              {/* Compact Tablet/Mobile Sub-bar for Quick New Chat */}
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--fl-border)]/70 px-3 py-2 lg:hidden">
                <span className="fl-type-support truncate font-medium text-[var(--fl-muted)]">
                  {activeConversation?.title}
                </span>
                <button
                  type="button"
                  onClick={handleNewConversation}
                  className="fl-btn fl-type-label inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--fl-border)] px-2.5 py-1 font-semibold text-[var(--fl-primary)] hover:bg-[var(--fl-soft-blue)]"
                >
                  <Plus className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                  <span>{copy.ai.newChat}</span>
                </button>
              </div>

              {/* Independent Vertical Scroll Area */}
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                data-testid="full-ai-messages"
                data-lenis-prevent
                className={`fl-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 sm:px-6 ${
                  isMessagesScrolling ? 'is-scrolling' : ''
                }`}
              >
                <motion.div
                  key={activeConversationId}
                  initial={prefersReduced ? false : { opacity: 0.72 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.16, ease: FL_EASE_STANDARD }}
                  className="mx-auto flex w-full max-w-[740px] flex-col gap-3.5"
                >
                  {chatMessages.map((msg) => {
                    const isNew = !seenMsgIdsRef.current.has(msg.id);
                    const isError = msg.status === 'error';
                    return (
                      <motion.div
                        key={msg.id}
                        initial={isNew && !prefersReduced ? { opacity: 0, y: 6 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
                        className={`flex flex-col ${
                          msg.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`fl-type-body break-words rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'max-w-[88%] bg-[#0F2557] text-white sm:max-w-[76%] dark:bg-[#8BA8FF] dark:text-[#0D1424]'
                              : isError
                              ? 'max-w-[94%] border border-red-200 bg-red-50/80 text-red-900 sm:max-w-[84%] dark:border-red-900/60 dark:bg-red-950/35 dark:text-red-200'
                              : 'max-w-[94%] border border-[var(--fl-border)]/65 bg-[var(--fl-surface-subtle)] text-[var(--fl-text)] sm:max-w-[84%]'
                          }`}
                        >
                          {isError ? (
                            <div className="space-y-2">
                              <p className="flex items-start gap-2 text-sm font-semibold">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
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
                                  className="fl-btn inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-[#0D1424] dark:text-red-300"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                                  <span>{copy.ai.retry}</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                        <span className="fl-lang fl-type-label mt-1 px-1 text-[var(--fl-muted)] tabular-nums">
                          {msg.role === 'assistant' ? `${copy.ai.statusLabel} · ` : ''}
                          {formatShortTime(msg.timestampIso, language)}
                        </span>
                      </motion.div>
                    );
                  })}

                  {aiTyping && (
                    <motion.div
                      initial={prefersReduced ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16, ease: FL_EASE_STANDARD }}
                      className="flex items-start"
                    >
                      <div className="fl-type-support rounded-2xl bg-[var(--fl-surface-subtle)] px-4 py-2.5 text-[var(--fl-muted)]">
                        <TypingDots
                          label={
                            language === 'id'
                              ? 'FocusMate sedang mengetik'
                              : 'FocusMate is typing'
                          }
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Non-intrusive Jump to Latest pill */}
              <AnimatePresence>
                {showJumpToLatest && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.16, ease: FL_EASE_STANDARD }}
                    className="pointer-events-none absolute inset-x-0 bottom-[132px] z-10 flex justify-center sm:bottom-[142px]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        isNearBottomRef.current = true;
                        setShowJumpToLatest(false);
                        scrollToBottom('smooth');
                      }}
                      className="fl-btn fl-type-label pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--fl-border)] bg-[var(--fl-surface)] px-3.5 py-1.5 font-semibold text-[var(--fl-primary)] shadow-[var(--fl-shadow-md)] hover:bg-[var(--fl-soft-blue)]"
                    >
                      <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      <span>{copy.ai.jumpToLatest}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Anchored Bottom Prompt Strip & Auto-Expanding Composer */}
              <div className="shrink-0 border-t border-[var(--fl-border)] bg-[var(--fl-surface-subtle)]/70 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-3">
                <div className="mx-auto w-full max-w-[740px]">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPrompts((v) => !v)}
                      aria-expanded={showPrompts}
                      className="fl-btn fl-type-label inline-flex shrink-0 items-center gap-1.5 font-semibold text-[var(--fl-primary)] hover:underline"
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-[#D99B38] dark:text-[#F5C26B]" strokeWidth={1.5} aria-hidden="true" />
                      <span>
                        {language === 'id' ? 'Saran Pertanyaan' : 'Suggested Prompts'}
                      </span>
                      {showPrompts ? (
                        <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      )}
                    </button>

                    {showPrompts && (
                      <div className="fl-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto">
                        {filterLabels.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setPromptFilter(cat.id)}
                            className={`fl-btn rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap sm:px-2.5 sm:text-[12px] ${
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
                        initial={prefersReduced ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReduced ? undefined : { opacity: 0, y: 4 }}
                        transition={{ duration: 0.16, ease: FL_EASE_STANDARD }}
                        className="fl-scrollbar mb-2.5 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:max-h-20 sm:flex-wrap sm:overflow-y-auto sm:overflow-x-hidden sm:pb-0"
                      >
                        {suggestedPrompts.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            disabled={aiTyping}
                            onClick={() => void submitMessage(item.prompt)}
                            title={item.prompt}
                            className="fl-btn fl-type-label shrink-0 rounded-full border border-[var(--fl-border)] bg-[var(--fl-surface)] px-3 py-1 text-left text-[var(--fl-text)] whitespace-nowrap hover:border-[var(--fl-sage)] hover:bg-[var(--fl-sage-soft)] disabled:opacity-50"
                          >
                            <span className="fl-lang">{item.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form
                    onSubmit={handleChatSubmit}
                    data-testid="full-ai-composer"
                    className="flex items-end gap-2"
                  >
                    <label htmlFor="full-ai-input" className="sr-only">
                      {copy.ai.chatPlaceholder}
                    </label>
                    <textarea
                      ref={textareaRef}
                      id="full-ai-input"
                      rows={1}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        resizeTextarea(e.target);
                      }}
                      onKeyDown={handleTextareaKeyDown}
                      placeholder={copy.ai.chatPlaceholder}
                      className="fl-input fl-scrollbar fl-type-body max-h-[132px] !min-h-[44px] min-w-0 flex-1 resize-none overflow-y-auto border border-[var(--fl-border)] bg-[var(--fl-surface)] px-3.5 py-2.5 text-[var(--fl-text)] placeholder:truncate placeholder:text-[var(--fl-muted)]"
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
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="workspace-insights"
            data-lenis-prevent
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
            className="fl-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
          >
            <div className="mx-auto w-full max-w-[920px] space-y-5">
              <div className="flex justify-center lg:justify-start">
                <div className="fl-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-[var(--fl-surface-subtle)] p-1">
                  {(
                    [
                      { id: 'insights', label: copy.ai.tabInsights },
                      { id: 'tips', label: copy.ai.tabTips },
                      { id: 'motivation', label: copy.ai.tabMotivation },
                      { id: 'facts', label: copy.ai.tabFacts },
                    ] as { id: AiTab; label: string }[]
                  ).map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`fl-btn fl-type-label relative z-10 min-h-[36px] rounded-full px-3.5 py-1.5 font-semibold whitespace-nowrap shrink-0 ${
                          active
                            ? 'text-white dark:text-[#0D1424]'
                            : 'text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="fl-ai-tab-pill"
                            transition={{ duration: 0.2, ease: FL_EASE_STANDARD }}
                            className="absolute inset-0 -z-10 rounded-full bg-[#0F2557] dark:bg-[#8BA8FF]"
                            aria-hidden="true"
                          />
                        )}
                        <span className="fl-lang">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {activeTab === 'insights' && (
                  <motion.div
                    key="insights"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    {insights.length === 0 ? (
                      <div className="fl-card p-6 text-center lg:text-left">
                        <h2 className="fl-type-card">{copy.ai.insufficientTitle}</h2>
                        <p className="fl-type-body mt-2 text-[var(--fl-muted)]">
                          {copy.ai.insufficientBody}
                        </p>
                        <p className="fl-type-label mt-3 font-semibold text-[var(--fl-primary)] tabular-nums">
                          {language === 'id'
                            ? `Jumlah sampel saat ini: ${sessions.length} / ${MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT} sesi diperlukan`
                            : `Current sample size: ${sessions.length} / ${MIN_SESSIONS_FOR_PERSONALIZED_INSIGHT} sessions required`}
                        </p>
                      </div>
                    ) : (
                      insights.map((ins) => (
                        <article key={ins.id} className="fl-card p-5">
                          <div className="fl-type-label flex items-center justify-between gap-2 text-[var(--fl-muted)]">
                            <span>{language === 'id' ? ins.periodId : ins.periodEn}</span>
                            <span className="font-semibold tabular-nums">
                              n = {ins.sampleSize} {language === 'id' ? 'sesi' : 'sessions'}
                            </span>
                          </div>
                          <h2 className="fl-type-card mt-2">
                            {language === 'id' ? ins.titleId : ins.titleEn}
                          </h2>
                          <dl className="fl-type-body mt-3 space-y-2.5">
                            <div>
                              <dt className="fl-type-label text-[var(--fl-muted)]">
                                {language === 'id' ? 'Data Teramati' : 'Observed Data'}
                              </dt>
                              <dd className="mt-0.5">
                                {language === 'id' ? ins.observedDataId : ins.observedDataEn}
                              </dd>
                            </div>
                            <div>
                              <dt className="fl-type-label text-[var(--fl-muted)]">
                                {language === 'id' ? 'Interpretasi' : 'Interpretation'}
                              </dt>
                              <dd className="mt-0.5 text-[var(--fl-muted)]">
                                {language === 'id' ? ins.interpretationId : ins.interpretationEn}
                              </dd>
                            </div>
                            <div className="fl-card-sage p-3.5">
                              <dt className="fl-type-label font-semibold text-[var(--fl-sage)]">
                                {language === 'id' ? 'Saran Aksi' : 'Suggested Action'}
                              </dt>
                              <dd className="fl-type-support mt-0.5 font-medium text-[var(--fl-text)]">
                                {language === 'id' ? ins.suggestedActionId : ins.suggestedActionEn}
                              </dd>
                            </div>
                          </dl>
                        </article>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === 'tips' && (
                  <motion.div
                    key="tips"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-3"
                  >
                    {studyTips.map((tip) => (
                      <div key={tip.title} className="fl-card p-5">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-[#D99B38] dark:text-[#F5C26B]" strokeWidth={1.5} aria-hidden="true" />
                          <h2 className="fl-type-card">{tip.title}</h2>
                        </div>
                        <p className="fl-type-support mt-2 text-[var(--fl-muted)]">
                          {tip.body}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'motivation' && (
                  <motion.div
                    key="motivation"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="fl-card space-y-4 p-6"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-[#D99B38] dark:text-[#F5C26B]" strokeWidth={1.5} aria-hidden="true" />
                      <h2 className="fl-type-card">
                        {language === 'id' ? 'Ringkasan Momentum Anda' : 'Your Study Momentum'}
                      </h2>
                    </div>
                    <p className="fl-type-body text-[var(--fl-muted)]">
                      {language === 'id'
                        ? `Anda berada di Level ${levelInfo.level} (${totalXp} XP) dengan streak ${streakInfo.currentStreak} hari. Konsistensi kecil minimal 5 menit fokus per hari menjaga kebiasaan belajar tetap hidup bahkan di pekan ujian yang padat.`
                        : `You are currently at Level ${levelInfo.level} (${totalXp} XP) with a ${streakInfo.currentStreak}-day streak. Even a focused 5-minute block on busy days keeps your study rhythm intact.`}
                    </p>
                    <p className="fl-type-support rounded-xl bg-[var(--fl-surface-subtle)] p-4 text-[var(--fl-muted)] tabular-nums">
                      {language === 'id'
                        ? `Hari ini: ${streakInfo.todayFocusMinutes} menit fokus tercatat · Pemulihan tersisa bulan ini: ${streakInfo.recoveriesRemaining}/3`
                        : `Today: ${streakInfo.todayFocusMinutes} focus minutes logged · Monthly recoveries left: ${streakInfo.recoveriesRemaining}/3`}
                    </p>
                  </motion.div>
                )}

                {activeTab === 'facts' && (
                  <motion.div
                    key="facts"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    {SCIENCE_FACTS.map((fact) => {
                      const explored = factsExploredIds.includes(fact.id);
                      return (
                        <article key={fact.id} className="fl-card p-5">
                          <div className="fl-type-label flex items-center justify-between gap-2 text-[var(--fl-muted)]">
                            <span className="font-semibold text-[var(--fl-primary)]">
                              {fact.category} · {fact.year}
                            </span>
                            {explored && (
                              <span className="fl-lang rounded-full bg-[var(--fl-sage-soft)] px-2.5 py-0.5 font-semibold text-[var(--fl-sage)]">
                                {language === 'id' ? 'Dibaca' : 'Explored'}
                              </span>
                            )}
                          </div>
                          <h2 className="fl-type-card mt-1.5">
                            {language === 'id' ? fact.titleId : fact.titleEn}
                          </h2>
                          <p className="fl-type-body mt-2 text-[var(--fl-muted)]">
                            {language === 'id' ? fact.summaryId : fact.summaryEn}
                          </p>
                          <div className="fl-type-support mt-3 border-t border-[var(--fl-border)]/70 pt-3">
                            <p className="font-semibold text-[var(--fl-text)]">
                              {fact.sourceTitle}
                            </p>
                            <p className="mt-0.5 text-[var(--fl-muted)]">
                              {fact.authorOrInstitution} ({fact.year})
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-3">
                              <a
                                href={fact.verifiedUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => markFactExplored(fact.id)}
                                className="fl-btn inline-flex items-center gap-1 font-semibold text-[var(--fl-primary)] hover:underline"
                              >
                                <span>{language === 'id' ? 'Sumber DOI' : 'Verified Reference'}</span>
                                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                              </a>
                              {!explored && (
                                <button
                                  type="button"
                                  onClick={() => markFactExplored(fact.id)}
                                  className="fl-btn inline-flex items-center gap-1 font-medium text-[var(--fl-muted)] hover:text-[var(--fl-text)]"
                                >
                                  <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                                  <span>{language === 'id' ? 'Tandai dibaca' : 'Mark as read'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
