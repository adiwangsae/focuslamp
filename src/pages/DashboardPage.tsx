import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Brain, Download, Info, Play, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AnimatedNumber,
  StaggerGrid,
  StaggerItem,
} from '../components/motion/MotionPrimitives';
import { EmptyState, StatusBadge } from '../components/common/StatePrimitives';
import { useApp } from '../contexts/AppContext';
import { mlService } from '../services/mlService';
import { FocusSession, SessionStatus } from '../types';
import {
  buildCompletionDistribution,
  buildDailyChartData,
  buildMonthlyProgressData,
  buildSessionFrequencyData,
  buildWeeklyComparisonData,
  deriveDashboardMetrics,
  exportSessionsToCsv,
} from '../utils/analytics';
import { modalBackdropVariants, modalPanelVariants } from '../utils/motion';

const LIGHT_STATUS_COLORS: Record<SessionStatus, string> = {
  Completed: '#4B735C',
  'Manually Ended': '#0F2557',
  Interrupted: '#D99B38',
  Abandoned: '#DC2626',
};

const DARK_STATUS_COLORS: Record<SessionStatus, string> = {
  Completed: '#7FB395',
  'Manually Ended': '#8BA8FF',
  Interrupted: '#F5C26B',
  Abandoned: '#F87171',
};

export const DashboardPage: React.FC = () => {
  const { sessions, streakInfo, copy, language, theme, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SessionStatus>('All');
  const [selectedSession, setSelectedSession] = useState<FocusSession | null>(null);

  const metrics = useMemo(() => deriveDashboardMetrics(sessions), [sessions]);
  const dailyData = useMemo(() => buildDailyChartData(sessions, 7), [sessions]);
  const weeklyData = useMemo(
    () => buildWeeklyComparisonData(sessions, undefined, language),
    [sessions, language]
  );
  const monthlyData = useMemo(
    () => buildMonthlyProgressData(sessions, undefined, language),
    [sessions, language]
  );
  const statusDist = useMemo(() => buildCompletionDistribution(sessions), [sessions]);
  const frequencyData = useMemo(() => buildSessionFrequencyData(sessions), [sessions]);
  const mlSummary = useMemo(() => mlService.getMlStatus(sessions), [sessions]);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions.filter((s) => {
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (s.subjectTag ?? '').toLowerCase().includes(q) ||
        s.date.toLowerCase().includes(q) ||
        (s.reflection ?? '').toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
      );
    });
  }, [sessions, searchQuery, statusFilter]);

  const handleExportCsv = () => {
    if (filteredSessions.length === 0) {
      showToast(
        'info',
        language === 'id'
          ? 'Belum ada sesi untuk diekspor ke CSV.'
          : 'No matching sessions available to export.'
      );
      return;
    }
    const csv = exportSessionsToCsv(filteredSessions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `focuslamp-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const axisColor = theme === 'dark' ? '#9BA7C2' : '#54627D';
  const gridColor = theme === 'dark' ? '#25334E' : '#DCE3EE';
  const primaryBar = theme === 'dark' ? '#8BA8FF' : '#0F2557';
  const sageBar = theme === 'dark' ? '#7FB395' : '#4B735C';
  const oliveAccent = theme === 'dark' ? '#A4B57E' : '#687849';
  const statusColors = theme === 'dark' ? DARK_STATUS_COLORS : LIGHT_STATUS_COLORS;
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#151F34' : '#FFFFFF',
    borderColor: theme === 'dark' ? '#25334E' : '#DCE3EE',
    borderRadius: '12px',
    color: theme === 'dark' ? '#F3F5FA' : '#162038',
    fontSize: '12px',
  };
  const statusLabels: Record<SessionStatus, string> =
    language === 'id'
      ? {
          Completed: 'Selesai',
          'Manually Ended': 'Diakhiri Manual',
          Interrupted: 'Terputus',
          Abandoned: 'Ditinggalkan',
        }
      : {
          Completed: 'Completed',
          'Manually Ended': 'Manually Ended',
          Interrupted: 'Interrupted',
          Abandoned: 'Abandoned',
        };

  const localizedStatusDist = useMemo(
    () =>
      statusDist.map((entry) => ({
        ...entry,
        label: statusLabels[entry.status],
      })),
    [statusDist, statusLabels]
  );

  const showSensorSummary =
    metrics.totalAwayEvents > 0 ||
    metrics.totalPhoneLiftEvents > 0 ||
    metrics.totalDisconnectEvents > 0;

  if (sessions.length === 0) {
    return (
      <StaggerGrid className="space-y-6">
        <StaggerItem className="flex flex-col items-center justify-between gap-3 text-center lg:flex-row lg:items-end lg:text-left">
          <div>
            <h1 className="fl-type-page">{copy.dashboard.title}</h1>
            <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
              {copy.dashboard.subtitle}
            </p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <section
            data-testid="dashboard-empty-state"
            className="fl-panel flex flex-col items-center justify-center px-6 py-14 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--fl-sage-soft)] text-[var(--fl-sage)]">
              <BarChart3 className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
            </div>
            <h2 className="fl-type-section mt-4 text-[var(--fl-text)]">
              {language === 'id'
                ? 'Analitik akan muncul setelah sesi fokus pertama Anda'
                : 'Analytics will appear after your first focus session'}
            </h2>
            <p className="fl-type-body mt-2 max-w-md text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Belum ada sesi fokus tercatat pada akun Anda. Mulai blok belajar pertama untuk melihat durasi harian, tingkat selesai, dan riwayat sesi.'
                : 'No focus sessions have been recorded on your account yet. Complete your first study block to unlock daily charts, completion metrics, and session logs.'}
            </p>
            <Link to="/focus" className="fl-btn-primary mt-6">
              <Play className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              <span>{copy.home.startSession}</span>
            </Link>
          </section>
        </StaggerItem>
      </StaggerGrid>
    );
  }

  return (
    <StaggerGrid className="space-y-8">
      {/* Header */}
      <StaggerItem className="flex flex-col items-center justify-between gap-4 text-center lg:flex-row lg:items-end lg:text-left">
        <div>
          <h1 className="fl-type-page">{copy.dashboard.title}</h1>
          <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
            {copy.dashboard.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="fl-btn-primary shrink-0"
        >
          <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>{copy.dashboard.exportCsv}</span>
        </button>
      </StaggerItem>

      {/* Overview KPI Strip — Sage Highlight First Metric */}
      <StaggerItem>
        <div className="grid grid-cols-2 gap-4 text-center lg:grid-cols-5 lg:text-left">
          <div className="fl-card-sage p-4">
            <p className="fl-type-label text-[var(--fl-sage)]">
              {language === 'id' ? 'Total Fokus' : 'Total Focus'}
            </p>
            <p className="fl-type-stat mt-1 text-[var(--fl-sage)]">
              <AnimatedNumber value={metrics.totalFocusMinutes} suffix="m" />
            </p>
          </div>
          <div className="fl-card p-4">
            <p className="fl-type-label text-[var(--fl-muted)]">
              {language === 'id' ? 'Sesi Selesai' : 'Completed'}
            </p>
            <p className="fl-type-stat mt-1">
              <AnimatedNumber value={metrics.completedSessions} />
            </p>
          </div>
          <div className="fl-card p-4">
            <p className="fl-type-label text-[var(--fl-muted)]">
              {language === 'id' ? 'Tingkat Selesai' : 'Completion Rate'}
            </p>
            <p className="fl-type-stat mt-1">
              <AnimatedNumber value={metrics.completionRate} suffix="%" />
            </p>
          </div>
          <div className="fl-card p-4">
            <p className="fl-type-label text-[var(--fl-muted)]">
              {language === 'id' ? 'Rata-rata Sesi' : 'Avg Duration'}
            </p>
            <p className="fl-type-stat mt-1">
              <AnimatedNumber value={metrics.averageSessionMinutes} suffix="m" />
            </p>
          </div>
          <div className="fl-card col-span-2 p-5 lg:col-span-1">
            <p className="fl-type-label text-[var(--fl-muted)]">
              {language === 'id' ? 'Streak Saat Ini' : 'Current Streak'}
            </p>
            <p className="fl-type-stat mt-1">
              <AnimatedNumber
                value={streakInfo.currentStreak}
                suffix={language === 'id' ? 'h' : 'd'}
              />
            </p>
          </div>
        </div>
      </StaggerItem>

      {/* 4 Analytics Charts */}
      <StaggerItem>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 1. Daily Focus Duration */}
          <section className="fl-card-elevated p-6">
            <h2 className="fl-type-card text-center lg:text-left">
              {language === 'id' ? 'Durasi Fokus Harian (7 Hari)' : 'Daily Focus Duration (7 Days)'}
            </h2>
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
                  <YAxis stroke={axisColor} fontSize={12} unit="m" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="focusMinutes"
                    name={language === 'id' ? 'Fokus (menit)' : 'Focus (min)'}
                    fill={primaryBar}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 2. Weekly Comparison */}
          <section className="fl-card p-5">
            <h2 className="fl-type-card text-center lg:text-left">
              {language === 'id' ? 'Perbandingan Mingguan' : 'Weekly Comparison'}
            </h2>
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="week" stroke={axisColor} fontSize={12} />
                  <YAxis stroke={axisColor} fontSize={12} unit="m" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="thisWeekMinutes"
                    name={language === 'id' ? 'Minggu Ini' : 'This Week'}
                    stroke={sageBar}
                    strokeWidth={2.25}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lastWeekMinutes"
                    name={language === 'id' ? 'Minggu Lalu' : 'Last Week'}
                    stroke={axisColor}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 3. Completion Distribution */}
          <section className="fl-card p-5">
            <h2 className="fl-type-card text-center lg:text-left">
              {language === 'id' ? 'Distribusi Status Sesi' : 'Completion Distribution'}
            </h2>
            <div className="mt-4 h-60 w-full">
              {localizedStatusDist.length === 0 ? (
                <p className="fl-type-body flex h-full items-center justify-center text-[var(--fl-muted)]">
                  {copy.dashboard.noSessionsFound}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={localizedStatusDist}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                      isAnimationActive={false}
                    >
                      {localizedStatusDist.map((entry) => (
                        <Cell key={entry.status} fill={statusColors[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* 4. Session Frequency */}
          <section className="fl-card p-5">
            <h2 className="fl-type-card text-center lg:text-left">
              {language === 'id' ? 'Frekuensi Durasi Sesi' : 'Session Frequency by Duration'}
            </h2>
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyData} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="range" stroke={axisColor} fontSize={12} />
                  <YAxis stroke={axisColor} fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="count"
                    name={language === 'id' ? 'Sesi' : 'Sessions'}
                    fill={oliveAccent}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </StaggerItem>

      {/* Monthly Progress & Honest ML Status Card */}
      <StaggerItem>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Monthly Progress (Rolling 4 Weeks) */}
          <section className="fl-card p-6 lg:col-span-7">
            <div className="flex flex-col items-center justify-between gap-2 text-center lg:flex-row lg:items-start lg:text-left">
              <div>
                <h2 className="fl-type-card">{copy.dashboard.monthlyProgressTitle}</h2>
                <p className="fl-type-support mt-0.5 text-[var(--fl-muted)]">
                  {copy.dashboard.monthlyProgressSubtitle}
                </p>
              </div>
              <BarChart3
                className="h-4 w-4 shrink-0 text-[var(--fl-sage)]"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </div>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="weekLabel" stroke={axisColor} fontSize={12} />
                  <YAxis stroke={axisColor} fontSize={12} unit="m" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="focusMinutes"
                    name={language === 'id' ? 'Fokus (menit)' : 'Focus (min)'}
                    fill={sageBar}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Honest ML Availability Notice */}
          <section
            data-testid="dashboard-ml-status-card"
            className="fl-card-elevated flex flex-col justify-between p-5 text-center lg:col-span-5 lg:text-left"
          >
            <div>
              <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <Brain
                    className="h-4 w-4 text-[var(--fl-primary)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <h2 className="fl-type-card">{copy.dashboard.mlSectionTitle}</h2>
                </div>
                <StatusBadge tone="neutral">
                  {language === 'id' ? 'Belum Tersedia' : 'Unavailable'}
                </StatusBadge>
              </div>

              <div className="fl-card-soft mt-4 p-4">
                <p className="fl-type-support text-[var(--fl-text)]">
                  {language === 'id' ? mlSummary.reasonId : mlSummary.reasonEn}
                </p>
              </div>

              <div className="mt-3.5 space-y-1.5">
                <p className="fl-type-label text-[var(--fl-muted)]">
                  {language === 'id' ? 'Data Sesi Tercatat' : 'Recorded Session Inputs'}
                </p>
                <ul className="fl-type-support mx-auto inline-block space-y-1 text-left text-[var(--fl-text)] lg:mx-0 lg:block">
                  {(language === 'id'
                    ? mlSummary.relevantInputsId
                    : mlSummary.relevantInputsEn
                  ).map((item) => (
                    <li key={item}>
                      <span className="fl-lang">· {item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </StaggerItem>

      {/* Behavioral Analytics */}
      {showSensorSummary && (
        <StaggerItem>
          <section className="fl-card p-6 text-center lg:text-left">
            <h2 className="fl-type-card">{copy.dashboard.behaviorTitle}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl bg-[var(--fl-surface-subtle)] p-4">
                <p className="fl-type-label text-[var(--fl-muted)]">
                  {language === 'id' ? 'Kejadian Meninggalkan Meja' : 'Away-from-Desk Events'}
                </p>
                <p className="fl-type-stat mt-1">
                  <AnimatedNumber value={metrics.totalAwayEvents} />
                </p>
              </div>
              <div className="rounded-xl bg-[var(--fl-surface-subtle)] p-4">
                <p className="fl-type-label text-[var(--fl-muted)]">
                  {language === 'id' ? 'Kejadian Ponsel Diangkat' : 'Phone Dock Lift Events'}
                </p>
                <p className="fl-type-stat mt-1">
                  <AnimatedNumber value={metrics.totalPhoneLiftEvents} />
                </p>
              </div>
              <div className="rounded-xl bg-[var(--fl-surface-subtle)] p-4">
                <p className="fl-type-label text-[var(--fl-muted)]">
                  {language === 'id' ? 'Pemulihan Sinyal BLE' : 'BLE Reconnect Events'}
                </p>
                <p className="fl-type-stat mt-1">
                  <AnimatedNumber value={metrics.totalDisconnectEvents} />
                </p>
              </div>
            </div>

            <div className="fl-type-support mt-4 flex flex-col items-center gap-2 text-center text-[var(--fl-muted)] lg:flex-row lg:items-start lg:text-left">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fl-primary)]" strokeWidth={1.5} aria-hidden="true" />
              <span>{copy.dashboard.sensorDisclaimer}</span>
            </div>
          </section>
        </StaggerItem>
      )}

      {/* Session History Table */}
      <StaggerItem>
        <section className="fl-card p-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center lg:flex-row lg:text-left">
            <h2 className="fl-type-card">{copy.dashboard.historyTitle}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-end">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-[var(--fl-muted)]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  aria-label={copy.dashboard.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={copy.dashboard.searchPlaceholder}
                  className="fl-input fl-type-support !min-h-[44px] w-56 border border-[var(--fl-border)] bg-[var(--fl-bg)] py-2 pr-3 pl-9 text-[var(--fl-text)]"
                />
              </div>

              <select
                aria-label={language === 'id' ? 'Filter berdasarkan status' : 'Filter by status'}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'All' | SessionStatus)}
                className="fl-input fl-type-support !min-h-[44px] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3 py-2 text-[var(--fl-text)]"
              >
                <option value="All">{copy.dashboard.allStatuses}</option>
                <option value="Completed">{statusLabels.Completed}</option>
                <option value="Manually Ended">{statusLabels['Manually Ended']}</option>
                <option value="Interrupted">{statusLabels.Interrupted}</option>
                <option value="Abandoned">{statusLabels.Abandoned}</option>
              </select>
            </div>
          </div>

          <div className="fl-scrollbar mt-4 overflow-x-auto">
            {filteredSessions.length === 0 ? (
              <EmptyState
                title={copy.dashboard.noSessionsFound}
                description={
                  language === 'id'
                    ? 'Mulai sesi fokus dari menu Fokus atau ubah filter pencarian Anda.'
                    : 'Start a focus session from the Focus tab or clear your active search filters.'
                }
              />
            ) : (
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="fl-type-label border-b border-[var(--fl-border)] text-[var(--fl-muted)]">
                    <th className="py-3 pr-4 font-semibold">
                      {language === 'id' ? 'Tanggal' : 'Date'}
                    </th>
                    <th className="py-3 pr-4 font-semibold">
                      {language === 'id' ? 'Mulai' : 'Start'}
                    </th>
                    <th className="py-3 pr-4 font-semibold">
                      {language === 'id' ? 'Topik' : 'Topic'}
                    </th>
                    <th className="py-3 pr-4 font-semibold text-right">
                      {language === 'id' ? 'Rencana' : 'Planned'}
                    </th>
                    <th className="py-3 pr-4 font-semibold text-right">
                      {language === 'id' ? 'Aktual' : 'Actual'}
                    </th>
                    <th className="py-3 pr-4 font-semibold">Status</th>
                    <th className="py-3 font-semibold text-right">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--fl-border)]/65">
                  {filteredSessions.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSession(s)}
                      className="cursor-pointer transition-colors duration-150 hover:bg-[var(--fl-soft-blue)]/45"
                    >
                      <td className="fl-type-support py-3.5 pr-4 tabular-nums">{s.date}</td>
                      <td className="fl-type-support py-3.5 pr-4 tabular-nums">{s.startTime}</td>
                      <td className="fl-type-body py-3.5 pr-4 font-semibold">
                        {s.subjectTag || (language === 'id' ? 'Belajar Umum' : 'General Study')}
                      </td>
                      <td className="fl-type-support py-3.5 pr-4 text-right tabular-nums">
                        {s.plannedMinutes}m
                      </td>
                      <td className="fl-type-support py-3.5 pr-4 text-right tabular-nums">
                        {Math.floor(s.actualFocusSeconds / 60)}m
                      </td>
                      <td className="fl-type-label py-3.5 pr-4">{statusLabels[s.status]}</td>
                      <td className="fl-type-label py-3.5 text-right font-semibold text-[var(--fl-primary)] tabular-nums">
                        +{s.xpEarned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </StaggerItem>

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={language === 'id' ? 'Detail sesi' : 'Session details'}
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedSession(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          >
            <motion.div
              variants={modalPanelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fl-panel w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="fl-type-card">
                  {selectedSession.subjectTag || (language === 'id' ? 'Sesi Belajar' : 'Study Session')}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  aria-label={copy.common.close}
                  className="fl-btn flex h-8 w-8 items-center justify-center rounded-full text-[var(--fl-muted)] hover:bg-[var(--fl-soft-blue)]"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>

              <dl className="fl-type-support mt-4 space-y-2.5">
                <div className="flex justify-between">
                  <dt className="text-[var(--fl-muted)]">
                    {language === 'id' ? 'Tanggal & Mulai' : 'Date & Start'}
                  </dt>
                  <dd className="tabular-nums">
                    {selectedSession.date} · {selectedSession.startTime}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--fl-muted)]">
                    {language === 'id' ? 'Rencana / Aktual' : 'Planned / Actual'}
                  </dt>
                  <dd className="tabular-nums">
                    {selectedSession.plannedMinutes}m /{' '}
                    {Math.floor(selectedSession.actualFocusSeconds / 60)}m
                  </dd>
                </div>
                {(selectedSession.awayEvents > 0 || selectedSession.phoneLiftEvents > 0) && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-[var(--fl-muted)]">
                        {language === 'id' ? 'Kejadian Pergi / Waktu' : 'Away Events / Time'}
                      </dt>
                      <dd className="tabular-nums">
                        {selectedSession.awayEvents} ({Math.floor(selectedSession.awaySeconds / 60)}m)
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[var(--fl-muted)]">
                        {language === 'id' ? 'Kejadian Ponsel Diangkat' : 'Phone Lift Events'}
                      </dt>
                      <dd className="tabular-nums">{selectedSession.phoneLiftEvents}</dd>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <dt className="text-[var(--fl-muted)]">Status & XP</dt>
                  <dd className="font-semibold">
                    {statusLabels[selectedSession.status]} (+{selectedSession.xpEarned} XP)
                  </dd>
                </div>
              </dl>

              {selectedSession.reflection && (
                <div className="fl-card-soft fl-type-support mt-4 p-3.5">
                  <p className="font-semibold text-[var(--fl-text)]">
                    {language === 'id' ? 'Catatan Refleksi' : 'Reflection Note'}
                  </p>
                  <p className="mt-1 text-[var(--fl-muted)]">
                    {selectedSession.reflection}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </StaggerGrid>
  );
};
