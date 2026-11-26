import { DeviceConnectionStatus, DeviceState } from '../types';

export const deviceService = {
  setConnectionStatus(
    device: DeviceState,
    status: DeviceConnectionStatus
  ): DeviceState {
    const connected = status === 'Connected';
    return {
      ...device,
      connected,
      connectionStatus: status,
      connectionType: connected ? 'Hardware Companion' : 'Offline',
      signalStrengthDbm: connected ? -56 : 0,
      syncFailed: status === 'Connection Failed' ? true : device.syncFailed,
      lastSyncAt: new Date().toISOString(),
    };
  },

  applyPatch(
    device: DeviceState,
    patch: Partial<DeviceState>
  ): DeviceState {
    const nextStatus: DeviceConnectionStatus =
      patch.connectionStatus ??
      (patch.connected === true
        ? 'Connected'
        : patch.connected === false
        ? 'Disconnected'
        : device.connectionStatus);

    return {
      ...device,
      ...patch,
      connected: nextStatus === 'Connected',
      connectionStatus: nextStatus,
      connectionType: nextStatus === 'Connected' ? 'Hardware Companion' : 'Offline',
      lastSyncAt: new Date().toISOString(),
    };
  },
};

