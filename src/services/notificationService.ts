import { NotificationCategory, NotificationItem, NotificationRetention } from '../types';
import {
  appendUniqueNotification,
  groupNotifications,
  pruneNotificationsByRetention,
} from '../utils/notifications';

export const notificationService = {
  appendUnique(list: NotificationItem[], item: NotificationItem): NotificationItem[] {
    return appendUniqueNotification(list, item);
  },

  prune(list: NotificationItem[], retention: NotificationRetention): NotificationItem[] {
    return pruneNotificationsByRetention(list, retention);
  },

  group(list: NotificationItem[], category?: NotificationCategory | 'All') {
    const filtered =
      !category || category === 'All'
        ? list
        : list.filter((item) => item.category === category);
    return groupNotifications(filtered);
  },
};
