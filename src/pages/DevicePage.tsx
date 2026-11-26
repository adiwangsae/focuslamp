import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bluetooth,
  BluetoothOff,
  ChevronDown,
  ChevronUp,
  Cpu,
  LampDesk,
  Smartphone,
  Sun,
  UserCheck,
  Wifi,
} from 'lucide-react';
import {
  AnimatedCollapse,
  StaggerGrid,
  StaggerItem,
} from '../components/motion/MotionPrimitives';
import { StatusBadge } from '../components/common/StatePrimitives';
import { useApp } from '../contexts/AppContext';
import { DeviceConnectionStatus } from '../types';

export const DevicePage: React.FC = () => {
  const {
    copy,
    language,
    device,
  } = useApp();

  const [techExpanded, setTechExpanded] = useState(false);
  const [hardwareProbeChecked, setHardwareProbeChecked] = useState(false);

  const connectionLabelMap: Record<DeviceConnectionStatus, string> = {
    Connected: copy.common.connected,
    Disconnected: copy.common.disconnected,
    Connecting: copy.common.connecting,
    Reconnecting: copy.common.reconnecting,
    'Connection Failed': copy.common.connectionFailed,
  };

  // Disconnected view when no real FocusLamp companion hardware is paired
  if (!device.connected) {
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
      </StaggerItem>

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
                ? 'Sensor induktif / Hall dock'
                : 'Hall / inductive presence pad'}
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
                ? 'Sensor jarak meja mmWave / IR'
                : 'mmWave / IR desk proximity'}
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
                  ? 'Tersinkron'
                  : 'Synced'
                : 'Offline'}
            </p>
            <p className="fl-type-support mt-1 text-[var(--fl-muted)] tabular-nums">
              ID: {device.deviceId} · {device.firmwareVersion}
            </p>
          </div>
        </div>
      </StaggerItem>

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
                    {language === 'id' ? 'Model Perangkat Keras' : 'Hardware Model'}
                  </dt>
                  <dd>
                    {language === 'id'
                      ? 'FocusLamp FL-01 · Unit telemetri BLE 5.3 & Wi-Fi berbasis mikrokontroler'
                      : 'FocusLamp FL-01 · BLE 5.3 & Wi-Fi microcontroller telemetry unit'}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--fl-text)]">
                    {language === 'id' ? 'Batas Timer Blok' : 'Block Timer Bounds'}
                  </dt>
                  <dd>
                    {language === 'id'
                      ? 'Jendela hitung mundur 1–60 menit; pelacakan lokal tetap berjalan saat BLE terputus'
                      : '1–60 minute countdown window; local state resilience on BLE drop'}
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
                      ? 'Kontrol DND tingkat sistem OS memerlukan aplikasi pendamping seluler asli.'
                      : 'OS-level DND control requires a native mobile companion bridge.'}
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
