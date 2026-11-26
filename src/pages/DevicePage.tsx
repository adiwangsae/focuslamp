import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bluetooth,
  BluetoothOff,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  LampDesk,
  RefreshCw,
  Smartphone,
  Sun,
  UserCheck,
  Wifi,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AnimatedCollapse,
  AnimatedSwitch,
  StaggerGrid,
  StaggerItem,
} from '../components/motion/MotionPrimitives';
import { ErrorState, StatusBadge } from '../components/common/StatePrimitives';
import { DEMO_MODE_ENABLED, isDemoAccount } from '../config/demoConfig';
import { useApp } from '../contexts/AppContext';
import { DeviceConnectionStatus } from '../types';
import { FL_EASE_STANDARD } from '../utils/motion';

const CONNECTION_STATES: DeviceConnectionStatus[] = [
  'Connected',
  'Connecting',
  'Reconnecting',
  'Disconnected',
  'Connection Failed',
];

export const DevicePage: React.FC = () => {
  const {
    currentUser,
    copy,
    language,
    device,
    setDeviceConnected,
    setDeviceConnectionStatus,
    setPhoneDocked,
    setUserPresent,
    setAmbientLightLux,
    setLampOn,
    setLampBrightness,
    setLampColorTemp,
    syncDeviceNow,
  } = useApp();

  const [techExpanded, setTechExpanded] = useState(false);
  const [hardwareProbeChecked, setHardwareProbeChecked] = useState(false);

  const isDemo = DEMO_MODE_ENABLED && isDemoAccount(currentUser);

  const connectionLabelMap: Record<DeviceConnectionStatus, string> = {
    Connected: copy.common.connected,
    Disconnected: copy.common.disconnected,
    Connecting: copy.common.connecting,
    Reconnecting: copy.common.reconnecting,
    'Connection Failed': copy.common.connectionFailed,
  };

  // Registered user view when no real FocusLamp companion hardware is paired
  if (!isDemo && !device.connected) {
    return (
      <StaggerGrid className="space-y-8">
        <StaggerItem className="flex flex-col items-center justify-between gap-3 text-center lg:flex-row lg:items-end lg:text-left">
          <div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              <h1 className="fl-type-page">{copy.device.title}</h1>
              <StatusBadge tone="neutral">
                {language === 'id' ? 'Tidak Terhubung' : 'Not Connected'}
              </StatusBadge>
            </div>
            <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Pasangkan dan kelola perangkat keras FocusLamp FL-01 Anda.'
                : 'Pair and manage your physical FocusLamp FL-01 companion hardware.'}
            </p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <section
            data-testid="registered-no-device-panel"
            className="fl-panel p-6 sm:p-10"
          >
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--fl-surface-subtle)] text-[var(--fl-muted)]">
                <BluetoothOff className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h2 className="fl-type-section mt-4 text-[var(--fl-text)]">
                {language === 'id'
                  ? 'Belum Ada Perangkat Terhubung'
                  : 'No Device Connected'}
              </h2>
              <p className="fl-type-body mt-2 text-[var(--fl-muted)]">
                {language === 'id'
                  ? 'Belum ada lampu fisik FocusLamp FL-01 atau jembatan Bluetooth pendamping yang terpasang di akun ini. Data sensor langsung, lux cahaya sekitar, dan status dock tidak tersedia sebelum perangkat asli terhubung.'
                  : 'No physical FocusLamp FL-01 lamp or companion Bluetooth bridge is paired to your account yet. Live sensor readings, ambient light levels, and dock telemetry are unavailable until real hardware is connected.'}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setHardwareProbeChecked(true)}
                  className="fl-btn-primary"
                >
                  <Bluetooth className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  <span>
                    {language === 'id'
                      ? 'Periksa Koneksi Perangkat'
                      : 'Check Hardware Connection'}
                  </span>
                </button>
                <Link to="/focus" className="fl-btn-secondary">
                  <span>
                    {language === 'id'
                      ? 'Mulai Fokus (Mode Timer)'
                      : 'Start Focus (Timer Mode)'}
                  </span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </div>

              {hardwareProbeChecked && (
                <div
                  role="status"
                  data-testid="hardware-probe-result"
                  className="fl-card-soft fl-type-support mt-6 p-4 text-left text-[var(--fl-muted)]"
                >
                  <p className="font-semibold text-[var(--fl-text)]">
                    {language === 'id'
                      ? 'Tidak ada perangkat FocusLamp FL-01 yang terdeteksi'
                      : 'No paired FocusLamp FL-01 hardware detected'}
                  </p>
                  <p className="mt-1">
                    {language === 'id'
                      ? 'Pastikan unit FocusLamp FL-01 dinyalakan dan aplikasi pendamping aktif. Sementara itu, semua sesi fokus dan analitik tetap berjalan penuh melalui mode Timer Perangkat Lunak di halaman Fokus.'
                      : 'Ensure your FocusLamp FL-01 unit is powered on with a compatible companion bridge. In the meantime, all focus sessions and study analytics remain fully available in Software Timer mode from the Focus tab.'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </StaggerItem>

        <StaggerItem>
          <section className="fl-card rounded-2xl p-6 text-center lg:text-left">
            <div className="flex items-center justify-center gap-2 lg:justify-start">
              <Cpu className="h-4 w-4 text-[var(--fl-primary)]" strokeWidth={1.5} aria-hidden="true" />
              <h2 className="fl-type-card">
                {language === 'id' ? 'Status Telemetri Perangkat' : 'Hardware Telemetry Availability'}
              </h2>
            </div>
            <dl className="fl-type-body mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-[var(--fl-border)]/65 bg-[var(--fl-surface-subtle)] p-4">
                <dt className="fl-type-label text-[var(--fl-muted)]">
                  {copy.device.connectionLabel}
                </dt>
                <dd className="fl-type-section mt-1.5 text-[var(--fl-muted)]">
                  {copy.common.disconnected}
                </dd>
              </div>
              <div className="rounded-xl border border-[var(--fl-border)]/65 bg-[var(--fl-surface-subtle)] p-4">
                <dt className="fl-type-label text-[var(--fl-muted)]">
                  {copy.device.dockLabel}
                </dt>
                <dd className="fl-type-section mt-1.5 text-[var(--fl-muted)]">
                  {language === 'id' ? 'Tidak tersedia' : 'Unavailable'}
                </dd>
              </div>
              <div className="rounded-xl border border-[var(--fl-border)]/65 bg-[var(--fl-surface-subtle)] p-4">
                <dt className="fl-type-label text-[var(--fl-muted)]">
                  {copy.device.ambientLabel}
                </dt>
                <dd className="fl-type-section mt-1.5 text-[var(--fl-muted)]">
                  {language === 'id' ? 'Tidak tersedia' : 'Unavailable'}
                </dd>
              </div>
            </dl>
          </section>
        </StaggerItem>
      </StaggerGrid>
    );
  }

  const connectionTone =
    device.connectionStatus === 'Connected'
      ? 'sage'
      : device.connectionStatus === 'Connecting' || device.connectionStatus === 'Reconnecting'
      ? 'primary'
      : 'danger';

  const needsTroubleshooting =
    device.connectionStatus === 'Disconnected' ||
    device.connectionStatus === 'Connection Failed';

  return (
    <StaggerGrid className="space-y-8">
      <StaggerItem className="flex flex-col items-center justify-between gap-4 text-center lg:flex-row lg:items-end lg:text-left">
        <div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            <h1 className="fl-type-page">{copy.device.title}</h1>
            <StatusBadge tone={connectionTone}>
              {connectionLabelMap[device.connectionStatus]}
            </StatusBadge>
          </div>
          <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
            {copy.device.subtitle}
          </p>
        </div>
        {isDemo && (
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => syncDeviceNow(true)}
              className="fl-btn fl-type-label min-h-[40px] rounded-full border border-amber-300 bg-amber-50/75 px-4 py-2 font-semibold text-amber-900 hover:bg-amber-100 whitespace-nowrap dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300"
            >
              <span className="fl-lang">
                {language === 'id' ? 'Simulasikan Gagal Sinkron' : 'Simulate Sync Failure'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => syncDeviceNow(false)}
              className="fl-btn-secondary !min-h-[40px]"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              <span>{language === 'id' ? 'Sinkronkan Simulasi' : 'Sync Telemetry'}</span>
            </button>
          </div>
        )}
      </StaggerItem>

      {/* Clear Simulated Prototype Notice (Demo only) */}
      {isDemo && (
        <StaggerItem>
          <div className="fl-card-soft fl-type-support flex flex-col items-center gap-2.5 border border-[var(--fl-primary)]/12 p-4 text-center text-[var(--fl-primary)] lg:flex-row lg:items-start lg:gap-3 lg:text-left">
            <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="fl-lang">{copy.device.simBanner}</span>
          </div>
        </StaggerItem>
      )}

      {/* Simulated Sync Failure or Connection Troubleshooting Alert (Demo only) */}
      {isDemo && (
        <AnimatePresence>
          {device.syncFailed && (
            <motion.div
              key="sync-failed-alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
            >
              <ErrorState
                title={
                  language === 'id'
                    ? 'Sinkronisasi telemetri gagal (simulasi)'
                    : 'Simulated telemetry sync failed'
                }
                message={
                  language === 'id'
                    ? 'Lampu FocusLamp FL-01 tidak merespons sinkronisasi Wi-Fi dalam batas waktu simulasi. Coba sinkronkan ulang.'
                    : 'FocusLamp FL-01 did not acknowledge Wi-Fi telemetry within the simulated timeout window.'
                }
                retryLabel={language === 'id' ? 'Coba Sinkron Lagi' : 'Retry Sync'}
                onRetry={() => syncDeviceNow(false)}
              />
            </motion.div>
          )}

          {needsTroubleshooting && (
            <motion.div
              key="ble-troubleshoot"
              role="status"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: FL_EASE_STANDARD }}
              className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <p className="font-semibold">
                      {language === 'id'
                        ? 'Panduan Pemulihan Koneksi FocusLamp'
                        : 'FocusLamp Connection Troubleshooting'}
                    </p>
                    <p className="mt-0.5 text-xs opacity-90">
                      {language === 'id'
                        ? 'Pastikan daya lampu menyala, jarak ponsel berada di dekat meja belajar, dan aktifkan kembali koneksi BLE simulasi.'
                        : 'Ensure the desk lamp is powered on, your phone is near the study desk, and re-initiate simulated BLE pairing.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => syncDeviceNow(false)}
                  className="fl-btn rounded-full border border-amber-400 bg-white px-3.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:bg-[#161F33] dark:text-amber-200"
                >
                  <span className="fl-lang">
                    {language === 'id' ? 'Hubungkan Ulang' : 'Reconnect Device'}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Status Grid with Varied Visual Weight */}
      <StaggerItem>
        <div className="grid grid-cols-1 gap-5 text-center lg:grid-cols-3 lg:text-left">
          <div className="fl-card-elevated p-5">
            <div className="fl-type-label flex items-center justify-center gap-2 text-[var(--fl-muted)] lg:justify-between">
              <span>{copy.device.connectionLabel}</span>
              {device.connected ? (
                <Bluetooth className="h-4 w-4 text-[var(--fl-sage)]" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <BluetoothOff className="h-4 w-4 text-red-600 dark:text-red-400" strokeWidth={1.5} aria-hidden="true" />
              )}
            </div>
            <p className="fl-type-section mt-2">{connectionLabelMap[device.connectionStatus]}</p>
            <p className="fl-type-support mt-1 text-[var(--fl-muted)] tabular-nums">
              {device.connectionType} · {device.signalStrengthDbm} dBm
            </p>
          </div>

          <div className="fl-card-elevated p-5">
            <div className="fl-type-label flex items-center justify-center gap-2 text-[var(--fl-muted)] lg:justify-between">
              <span>{copy.device.dockLabel}</span>
              <Smartphone
                className={`h-4 w-4 ${device.phoneDocked ? 'text-[var(--fl-sage)]' : 'text-[#D99B38]'}`}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <p className="fl-type-section mt-2">
              {device.phoneDocked ? copy.common.docked : copy.common.notDocked}
            </p>
            <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Sensor induktif / Hall dock (Simulasi)'
                : 'Hall / inductive presence pad (Simulated)'}
            </p>
          </div>

          <div
            className={`fl-card-elevated relative overflow-hidden p-5 ${
              device.lampOn ? 'ring-1 ring-[#E5A94C]/50' : ''
            }`}
          >
            <div className="fl-type-label flex items-center justify-center gap-2 text-[var(--fl-muted)] lg:justify-between">
              <span>{copy.device.lampLabel}</span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  device.lampOn
                    ? 'bg-[#FFE8B8]/75 text-[#8F590A] dark:bg-[#F5C26B]/20 dark:text-[#F5C26B]'
                    : 'bg-[var(--fl-surface-subtle)] text-[var(--fl-muted)]'
                }`}
              >
                <LampDesk className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </span>
            </div>
            <p className="fl-type-section mt-2 tabular-nums">
              {device.lampOn
                ? `${copy.common.on} · ${device.lampBrightness}%`
                : copy.common.off}
            </p>
            <p className="fl-type-support mt-1 text-[var(--fl-muted)] tabular-nums">
              {device.lampColorTempK}K {language === 'id' ? 'Suhu Warna' : 'Color Temperature'}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--fl-surface-subtle)]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  device.lampOn ? 'bg-[#E5A94C] dark:bg-[#F5C26B]' : 'bg-[var(--fl-border)]'
                }`}
                style={{ width: device.lampOn ? `${device.lampBrightness}%` : '0%' }}
              />
            </div>
          </div>

          <div className="fl-card p-5">
            <div className="fl-type-label flex items-center justify-center gap-2 text-[var(--fl-muted)] lg:justify-between">
              <span>{copy.device.presenceLabel}</span>
              <UserCheck
                className={`h-4 w-4 ${device.userPresent ? 'text-[var(--fl-sage)]' : 'text-[#D99B38]'}`}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <p className="fl-type-section mt-2">
              {device.userPresent ? copy.common.present : copy.common.away}
            </p>
            <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
              {language === 'id'
                ? 'Sensor jarak meja mmWave / IR (Simulasi)'
                : 'mmWave / IR desk proximity (Simulated)'}
            </p>
          </div>

          <div className="fl-card p-5">
            <div className="fl-type-label flex items-center justify-center gap-2 text-[var(--fl-muted)] lg:justify-between">
              <span>{copy.device.ambientLabel}</span>
              <Sun className="h-4 w-4 text-[#D99B38] dark:text-[#F5C26B]" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="fl-type-section mt-2 tabular-nums">{device.ambientLightLux} lux</p>
            <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
              {device.ambientLightLux < 200
                ? language === 'id'
                  ? 'Cahaya ruangan rendah'
                  : 'Low ambient room light'
                : device.ambientLightLux < 450
                ? language === 'id'
                  ? 'Pencahayaan belajar seimbang'
                  : 'Balanced study illumination'
                : language === 'id'
                ? 'Lingkungan terang'
                : 'Bright daylight environment'}
            </p>
          </div>

          <div className="fl-card p-5">
            <div className="fl-type-label flex items-center justify-center gap-2 text-[var(--fl-muted)] lg:justify-between">
              <span>{copy.device.networkLabel}</span>
              <Wifi
                className={`h-4 w-4 ${
                  device.syncFailed
                    ? 'text-red-600 dark:text-red-400'
                    : device.wifiConnected
                    ? 'text-[var(--fl-sage)]'
                    : 'text-[var(--fl-muted)]'
                }`}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
            <p className="fl-type-section mt-2">
              {device.syncFailed
                ? language === 'id'
                  ? 'Sinkronisasi Gagal'
                  : 'Sync Failed'
                : device.wifiConnected
                ? language === 'id'
                  ? 'Tersinkron (Simulasi)'
                  : 'Synced (Simulated)'
                : 'Offline'}
            </p>
            <p className="fl-type-support mt-1 text-[var(--fl-muted)] tabular-nums">
              ID: {device.deviceId} · {device.firmwareVersion}
            </p>
          </div>
        </div>
      </StaggerItem>

      {/* Simulation Controls (Demo accounts only) */}
      {isDemo && (
        <StaggerItem>
          <section className="fl-card p-6">
            <div className="text-center lg:text-left">
              <h2 className="fl-type-card">{copy.device.simControlsTitle}</h2>
              <p className="fl-type-support mt-1 text-[var(--fl-muted)]">
                {language === 'id'
                  ? 'Sesuaikan status perangkat keras dan sensor simulasi untuk melihat respons FocusLamp di seluruh halaman.'
                  : 'Adjust simulated hardware states and sensors to inspect how FocusLamp responds across pages.'}
              </p>
            </div>

            {/* BLE 5-State Simulator */}
            <div className="mt-4 rounded-2xl bg-[var(--fl-surface-subtle)] p-4 text-center lg:text-left">
              <p className="fl-type-label mb-2.5 text-[var(--fl-muted)]">
                {language === 'id' ? 'Simulasi Status Koneksi BLE' : 'BLE Connection State Simulator'}
              </p>
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                {CONNECTION_STATES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDeviceConnectionStatus(st)}
                    className={`fl-btn fl-type-label rounded-full px-3.5 py-1.5 font-medium ${
                      device.connectionStatus === st
                        ? 'bg-[#0F2557] text-white dark:bg-[#8BA8FF] dark:text-[#0D1424]'
                        : 'border border-[var(--fl-border)] bg-[var(--fl-surface)] text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                    }`}
                  >
                    <span className="fl-lang">{connectionLabelMap[st]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--fl-surface-subtle)] p-3.5">
                  <span className="fl-lang fl-type-support font-semibold">
                    {language === 'id'
                      ? 'Koneksi Bluetooth (Simulasi)'
                      : 'Bluetooth Connection (Simulated)'}
                  </span>
                  <AnimatedSwitch
                    checked={device.connected}
                    onChange={setDeviceConnected}
                    ariaLabel={
                      language === 'id'
                        ? 'Koneksi Bluetooth (Simulasi)'
                        : 'Bluetooth Connection (Simulated)'
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--fl-surface-subtle)] p-3.5">
                  <span className="fl-lang fl-type-support font-semibold">
                    {language === 'id' ? 'Ponsel di Dock' : 'Phone Placed on Dock'}
                  </span>
                  <AnimatedSwitch
                    checked={device.phoneDocked}
                    onChange={setPhoneDocked}
                    ariaLabel={language === 'id' ? 'Ponsel di Dock' : 'Phone Placed on Dock'}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--fl-surface-subtle)] p-3.5">
                  <span className="fl-lang fl-type-support font-semibold">
                    {language === 'id' ? 'Kehadiran Pengguna di Meja' : 'User Presence at Desk'}
                  </span>
                  <AnimatedSwitch
                    checked={device.userPresent}
                    onChange={setUserPresent}
                    ariaLabel={
                      language === 'id' ? 'Kehadiran Pengguna di Meja' : 'User Presence at Desk'
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-[var(--fl-surface-subtle)] p-3.5">
                  <div className="fl-type-support flex items-center justify-between">
                    <label htmlFor="ambient-slider" className="font-semibold">
                      {language === 'id' ? 'Cahaya Sekitar (Simulasi)' : 'Simulated Ambient Light'}
                    </label>
                    <span className="fl-type-label font-semibold tabular-nums">
                      {device.ambientLightLux} lux
                    </span>
                  </div>
                  <input
                    id="ambient-slider"
                    type="range"
                    min={40}
                    max={800}
                    step={10}
                    value={device.ambientLightLux}
                    onChange={(e) => setAmbientLightLux(Number(e.target.value))}
                    className="mt-2.5 w-full accent-[#0F2557] dark:accent-[#8BA8FF]"
                  />
                </div>

                <div className="rounded-xl bg-[var(--fl-surface-subtle)] p-3.5">
                  <div className="fl-type-support flex items-center justify-between">
                    <span className="font-semibold">
                      {language === 'id' ? 'Daya & Kecerahan Lampu' : 'Lamp Power & Brightness'}
                    </span>
                    <AnimatedSwitch
                      checked={device.lampOn}
                      onChange={setLampOn}
                      ariaLabel={
                        language === 'id' ? 'Daya Lampu FocusLamp' : 'FocusLamp Power'
                      }
                    />
                  </div>
                  <input
                    aria-label={language === 'id' ? 'Kecerahan lampu' : 'Lamp brightness'}
                    type="range"
                    min={10}
                    max={100}
                    value={device.lampBrightness}
                    onChange={(e) => setLampBrightness(Number(e.target.value))}
                    className="mt-2.5 w-full accent-[#0F2557] dark:accent-[#8BA8FF]"
                  />
                  <div className="fl-type-support mt-2.5 flex items-center justify-between text-[var(--fl-muted)]">
                    <span className="tabular-nums">
                      {language === 'id' ? 'Suhu Warna' : 'Color Temp'}: {device.lampColorTempK}K
                    </span>
                    <div className="flex gap-1.5">
                      {[3000, 4200, 5600].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setLampColorTemp(k)}
                          className={`fl-btn fl-type-label rounded-full px-2.5 py-0.5 tabular-nums ${
                            device.lampColorTempK === k
                              ? 'bg-[#0F2557] text-white dark:bg-[#8BA8FF] dark:text-[#0D1424]'
                              : 'border border-[var(--fl-border)] bg-[var(--fl-surface)] text-[var(--fl-muted)] hover:text-[var(--fl-text)]'
                          }`}
                        >
                          {k}K
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </StaggerItem>
      )}

      {/* Expandable Technical Details */}
      <StaggerItem>
        <section className="fl-card overflow-hidden">
          <button
            type="button"
            aria-expanded={techExpanded}
            onClick={() => setTechExpanded((v) => !v)}
            className="fl-btn fl-type-card flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <span>{copy.device.techDetailsTitle}</span>
            {techExpanded ? (
              <ChevronUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>

          <AnimatedCollapse open={techExpanded}>
            <div className="fl-type-support border-t border-[var(--fl-border)] px-6 py-4 text-center text-[var(--fl-muted)] lg:text-left">
              <dl className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <dt className="font-semibold text-[var(--fl-text)]">
                    {language === 'id' ? 'Model Perangkat (Prototipe)' : 'Hardware Model (Prototype)'}
                  </dt>
                  <dd>
                    {language === 'id'
                      ? 'FocusLamp FL-01 · Unit telemetri BLE 5.3 & Wi-Fi berbasis mikrokontroler (simulasi)'
                      : 'FocusLamp FL-01 · BLE 5.3 & Wi-Fi telemetry unit (simulated)'}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--fl-text)]">
                    {language === 'id' ? 'Batas Timer Firmware' : 'Firmware Timer Bounds'}
                  </dt>
                  <dd>
                    {language === 'id'
                      ? 'Jendela hitung mundur prototipe 1–60 menit; pelacakan lokal tetap berjalan saat BLE terputus'
                      : '1–60 minute prototype countdown window; local state resilience on BLE drop'}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--fl-text)]">
                    {language === 'id' ? 'Sensor Kehadiran & Dock' : 'Presence & Dock Sensors'}
                  </dt>
                  <dd>
                    {language === 'id'
                      ? 'Sakelar bantalan dock + sensor kehadiran jarak meja. Hanya mencatat posisi fisik—tidak pernah membaca perhatian kognitif.'
                      : 'Dock pad switch + desk proximity presence sensor. Measures physical presence and dock state only—never cognitive attention.'}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--fl-text)]">
                    {language === 'id' ? 'Cakupan Android DND' : 'Android DND Scope'}
                  </dt>
                  <dd>
                    {language === 'id'
                      ? 'Hanya disimulasikan pada prototipe web; kontrol DND sistem OS memerlukan aplikasi pendamping seluler di masa depan.'
                      : 'Simulated only in web prototype; OS-level DND control cannot run inside standard browsers without a native companion bridge.'}
                  </dd>
                </div>
              </dl>
            </div>
          </AnimatedCollapse>
        </section>
      </StaggerItem>
    </StaggerGrid>
  );
};
