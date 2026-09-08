import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-500" /> Notifications & Operational Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">System updates, stockout alerts, PO status changes, and delay warnings</p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-brand-500" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No Notifications" description="You have no unread system notifications." />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              className={`p-4 flex items-start gap-4 transition-colors cursor-pointer ${
                notif.read ? 'bg-white dark:bg-slate-900' : 'bg-brand-500/5 dark:bg-brand-950/20'
              }`}
            >
              <div className="pt-1">
                {notif.read ? (
                  <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                ) : (
                  <span className="w-3 h-3 rounded-full bg-brand-500 block"></span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400">{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
