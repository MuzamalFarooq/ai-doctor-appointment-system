'use client';
import { useState } from 'react';
import { Bell, Calendar, FileText, CreditCard, Star, CheckCircle, CheckCheck } from 'lucide-react';
import { markAllNotificationsRead, markNotificationRead } from '@/actions/patient.actions';
import toast from 'react-hot-toast';

const ICONS = {
  APPOINTMENT_BOOKED: { icon: Calendar, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
  APPOINTMENT_CANCELLED: { icon: Calendar, color: 'text-red-500 bg-red-50 dark:bg-red-950' },
  APPOINTMENT_REMINDER: { icon: Bell, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950' },
  APPOINTMENT_COMPLETED: { icon: CheckCircle, color: 'text-green-500 bg-green-50 dark:bg-green-950' },
  PRESCRIPTION_ADDED: { icon: FileText, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950' },
  PAYMENT_RECEIVED: { icon: CreditCard, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950' },
  REVIEW_RECEIVED: { icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950' },
  SYSTEM: { icon: Bell, color: 'text-gray-500 bg-gray-50 dark:bg-gray-700' },
};

export function NotificationsClient({ notifications: initial }) {
  const [notifications, setNotifications] = useState(initial || []);
  const unread = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500 mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll} className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const config = ICONS[n.type] || ICONS.SYSTEM;
            const Icon = config.icon;
            return (
              <div key={n.id} onClick={() => !n.isRead && handleMarkRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.isRead ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700' : 'bg-primary-50 dark:bg-primary-950/30 border-primary-100 dark:border-primary-900'
                }`}>
                <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
