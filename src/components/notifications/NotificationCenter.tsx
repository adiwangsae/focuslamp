import React, { useMemo, useState } from 'react';
import { Bell, CheckCheck, ChevronDown, ChevronUp, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AnimatedCollapse } from '../motion/MotionPrimitives';
import { useApp } from '../../contexts/AppContext';
import { Language, NotificationCategory, NotificationItem } from '../../types';
import { FL_EASE_STANDARD } from '../../utils/motion';
import { groupNotifications } from '../../utils/notifications';

const CATEGORIES: ('All' | NotificationCategory)[] = [
  'All',
  'Device',
  'Focus Session',
  'Achievement',
  'AI Insight',
  'System',
  'Reminder',
  'Fun Facts',
];

function getCategoryLabel(cat: 'All' | NotificationCategory, lang: Language): string {
  if (lang === 'en') return cat;
  switch (cat) {
    case 'All':
      return 'Semua';
    case 'Device':
      return 'Perangkat';
    case 'Focus Session':
      return 'Sesi Fokus';
    case 'Achievement':
      return 'Pencapaian';
    case 'AI Insight':
      return 'Wawasan AI';
    case 'System':
      return 'Sistem';
    case 'Reminder':
      return 'Pengingat';
    case 'Fun Facts':
      return 'Fakta Menarik';
  }
}

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    activeSession,
    queuedCountDuringFocus,
    language,
    copy,
    currentUser,
  } = useApp();

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | NotificationCategory>('All');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<NotificationItem | null>(null);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return notifications;
    return notifications.filter((n) => n.category === selectedCategory);
  }, [notifications, selectedCategory]);

  const groups = useMemo(() => groupNotifications(filtered), [filtered]);

  const closePanel = () => {
    setOpen(false);
    setDetailItem(null);
  };

  const formatTimestamp = (iso: string) => {
    const dt = new Date(iso);
    return dt.toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (open ? closePanel() : setOpen(true))}
        aria-label={copy.nav.notifications}
        aria-expanded={open}
        className="fl-btn relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--fl-border)] bg-[var(--fl-surface)] text-[var(--fl-text)] hover:bg-[var(--fl-soft-blue)] focus-visible:outline-2 focus-visible:outline-[var(--fl-primary)]"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            data-lang-exempt="true"
            className="fl-type-label absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0F2557] px-1 text-[10px] font-semibold text-white tabular-nums dark:bg-[#8BA8FF] dark:text-[#0D1424]"
          >
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="fixed inset-0 z-40 bg-black/20 md:bg-transparent"
              onClick={closePanel}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.985 }}
              transition={{ duration: 0.2, ease: FL_EASE_STANDARD }}
              role="dialog"
              aria-label={copy.nav.notifications}
              data-lenis-prevent
              className="fl-panel fixed inset-x-3 top-16 z-50 max-h-[80vh] overflow-hidden md:absolute md:inset-x-auto md:right-0 md:top-12 md:w-[400px]"
            >
              <div className="flex items-center justify-between border-b border-[var(--fl-border)] px-5 py-3.5">
                <div>
                  <h2 className="fl-type-card text-[var(--fl-text)]">
                    {copy.nav.notifications}
                  </h2>
                  <p className="fl-type-label mt-0.5 text-[var(--fl-muted)]">
                    {language === 'id' ? 'Retensi' : 'Retention'}:{' '}
                    {currentUser?.preferences.notificationRetention ?? '1m'}
                    {activeSession
                      ? ` · ${
                          language === 'id'
                            ? `Mode Fokus aktif (${queuedCountDuringFocus} antre)`
                            : `Focus muted (${queuedCountDuringFocus} queued)`
                        }`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--fl-primary)] hover:bg-[var(--fl-soft-blue)] whitespace-nowrap"
                    >
                      <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      <span>{copy.common.markAllRead}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closePanel}
                    aria-label={copy.common.close}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)] hover:text-[var(--fl-text)]"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="fl-scrollbar flex gap-1.5 overflow-x-auto border-b border-[var(--fl-border)] px-4 py-2.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setDetailItem(null);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#0F2557] text-white dark:bg-[#8BA8FF] dark:text-[#0D1424]'
                        : 'text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)] hover:text-[var(--fl-text)]'
                    }`}
                  >
                    <span className="fl-lang">{getCategoryLabel(cat, language)}</span>
                  </button>
                ))}
              </div>

              <div className="fl-scrollbar max-h-[420px] overflow-y-auto overflow-x-hidden divide-y divide-[var(--fl-border)]/70">
                {detailItem ? (
                  <div className="p-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => setDetailItem(null)}
                      className="text-xs font-semibold text-[var(--fl-primary)] hover:underline"
                    >
                      <span className="fl-lang">
                        ← {language === 'id' ? 'Kembali ke daftar' : 'Back to list'}
                      </span>
                    </button>
                    <div className="text-xs text-[var(--fl-muted)]">
                      <span className="fl-lang">
                        {getCategoryLabel(detailItem.category, language)} ·{' '}
                        {formatTimestamp(detailItem.timestampIso)}
                      </span>
                    </div>
                    <h3 className="fl-type-card text-[var(--fl-text)]">
                      {language === 'id' ? detailItem.titleId : detailItem.titleEn}
                    </h3>
                    <p className="fl-type-support text-[var(--fl-muted)]">
                      {language === 'id' ? detailItem.messageId : detailItem.messageEn}
                    </p>
                  </div>
                ) : groups.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-[var(--fl-muted)]">
                    <span className="fl-lang">{copy.common.noNotifications}</span>
                  </div>
                ) : (
                  groups.map((grp) => {
                    const latest = grp.latest;
                    const isExpanded = expandedGroup === grp.groupKey;
                    const hasMultiple = grp.items.length > 1;
                    return (
                      <div
                        key={grp.groupKey}
                        className={`px-5 py-3.5 transition-colors ${
                          grp.unreadCount > 0 ? 'bg-[var(--fl-soft-blue)]/45' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              grp.items.forEach((it) => markNotificationRead(it.id));
                              setDetailItem(latest);
                            }}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-2 text-xs text-[var(--fl-muted)]">
                              <span className="font-semibold text-[var(--fl-primary)]">
                                {getCategoryLabel(grp.category, language)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">
                                {formatTimestamp(latest.timestampIso)}
                              </span>
                              {grp.unreadCount > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--fl-sage)]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--fl-sage)]" aria-hidden="true" />
                                    {language === 'id' ? 'Baru' : 'Unread'}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-semibold text-[var(--fl-text)]">
                              {language === 'id' ? latest.titleId : latest.titleEn}
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--fl-muted)] line-clamp-2">
                              {language === 'id' ? latest.messageId : latest.messageEn}
                            </p>
                          </button>

                          {hasMultiple && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedGroup(isExpanded ? null : grp.groupKey)
                              }
                              aria-label={
                                isExpanded
                                  ? 'Collapse grouped events'
                                  : `Show ${grp.items.length} grouped events`
                              }
                              className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)] tabular-nums"
                            >
                              <span>{grp.items.length}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                              )}
                            </button>
                          )}
                        </div>

                        <AnimatedCollapse open={hasMultiple && isExpanded}>
                          <div className="mt-2.5 space-y-1.5 border-t border-[var(--fl-border)]/70 pt-2.5">
                            {grp.items.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  markNotificationRead(item.id);
                                  setDetailItem(item);
                                }}
                                className="flex w-full items-center justify-between text-left text-xs text-[var(--fl-muted)] hover:text-[var(--fl-text)]"
                              >
                                <span className="truncate pr-2">
                                  {language === 'id' ? item.titleId : item.titleEn}
                                </span>
                                <span className="shrink-0 tabular-nums">
                                  {formatTimestamp(item.timestampIso)}
                                </span>
                              </button>
                            ))}
                          </div>
                        </AnimatedCollapse>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
