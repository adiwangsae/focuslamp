import { NotificationItem, NotificationRetention } from '../types';

const RETENTION_MS: Record<NotificationRetention, number> = {
  '3d': 3 * 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1m': 30 * 24 * 60 * 60 * 1000,
};

/**
 * Removes expired notifications without touching session history or analytics.
 */
export function pruneNotificationsByRetention(
  notifications: NotificationItem[],
  retention: NotificationRetention,
  nowMs: number = Date.now()
): NotificationItem[] {
  const cutoff = nowMs - RETENTION_MS[retention];
  return notifications.filter((n) => new Date(n.timestampIso).getTime() >= cutoff);
}

/**
 * Appends a notification only if its unique eventId is not already present.
 */
export function appendUniqueNotification(
  existing: NotificationItem[],
  incoming: NotificationItem
): NotificationItem[] {
  if (existing.some((n) => n.eventId === incoming.eventId)) {
    return existing;
  }
  return [incoming, ...existing];
}

export interface NotificationGroup {
  groupKey: string;
  category: NotificationItem['category'];
  latest: NotificationItem;
  items: NotificationItem[];
  unreadCount: number;
}

/**
 * Groups similar events by groupKey (or unique id) while preserving every individual timestamp.
 */
export function groupNotifications(notifications: NotificationItem[]): NotificationGroup[] {
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime()
  );
  const map = new Map<string, NotificationGroup>();

  for (const item of sorted) {
    const key = item.groupKey ? `${item.category}::${item.groupKey}` : item.id;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        groupKey: key,
        category: item.category,
        latest: item,
        items: [item],
        unreadCount: item.read ? 0 : 1,
      });
    } else {
      existing.items.push(item);
      if (!item.read) existing.unreadCount += 1;
    }
  }

  return Array.from(map.values());
}
