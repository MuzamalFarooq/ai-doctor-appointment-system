'use client';
import { useState } from 'react';
import { 
  Bell, Send, Users, Shield, Stethoscope, AlertTriangle, 
  CheckCircle2, Trash2, Clock, Filter, MessageSquare
} from 'lucide-react';
import { sendBroadcastNotification, deleteNotification } from '@/actions/admin.actions';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const NOTIFICATION_TYPES = [
  'SYSTEM', 'APPOINTMENT_REMINDER', 'APPOINTMENT_BOOKED', 'PAYMENT_RECEIVED', 'REVIEW_RECEIVED'
];

export function AdminNotificationsClient({ notifications: initialNotifications }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  // Broadcast Form
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    targetRole: 'ALL', // 'ALL' | 'PATIENT' | 'DOCTOR'
    type: 'SYSTEM',
    link: '',
  });

  const filtered = notifications.filter(n => filterType === 'ALL' || n.type === filterType);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.title || !broadcastData.message) {
      toast.error('Please enter title and message.');
      return;
    }

    setLoading(true);
    const res = await sendBroadcastNotification(broadcastData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Broadcast sent successfully to ${res.count} users!`);
      setBroadcastData({
        title: '',
        message: '',
        targetRole: 'ALL',
        type: 'SYSTEM',
        link: '',
      });
      // Refresh notifications list locally if needed
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const res = await deleteNotification(id);
    if (res?.error) toast.error(res.error);
    else {
      toast.success('Notification removed');
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
          Notifications & Broadcast Center
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Send platform-wide announcements, system alerts, and manage notification logs
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Broadcast Composer */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Send Broadcast</h2>
              <p className="text-xs text-gray-500">Deliver in-app notifications</p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Audience *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ALL', label: 'All Users', icon: Users },
                  { id: 'PATIENT', label: 'Patients', icon: Users },
                  { id: 'DOCTOR', label: 'Doctors', icon: Stethoscope },
                ].map(target => {
                  const Icon = target.icon;
                  const isSelected = broadcastData.targetRole === target.id;
                  return (
                    <button
                      type="button"
                      key={target.id}
                      onClick={() => setBroadcastData({ ...broadcastData, targetRole: target.id })}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-950/40 dark:border-primary-600 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      {target.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notification Type</label>
              <select
                value={broadcastData.type}
                onChange={e => setBroadcastData({ ...broadcastData, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                {NOTIFICATION_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={broadcastData.title}
                onChange={e => setBroadcastData({ ...broadcastData, title: e.target.value })}
                placeholder="e.g. System Maintenance Notice"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Message Content *</label>
              <textarea
                rows={4}
                required
                value={broadcastData.message}
                onChange={e => setBroadcastData({ ...broadcastData, message: e.target.value })}
                placeholder="Write your broadcast announcement details..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Action Link (Optional)</label>
              <input
                type="text"
                value={broadcastData.link}
                onChange={e => setBroadcastData({ ...broadcastData, link: e.target.value })}
                placeholder="e.g. /doctors or /appointments"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending Broadcast...' : 'Send Broadcast Now'}
            </button>
          </form>
        </div>

        {/* Right Column: Notification Logs */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent System Notifications</h2>
                <p className="text-xs text-gray-500">Audit of sent alerts and triggers</p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['ALL', 'SYSTEM', 'APPOINTMENT_REMINDER'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                      filterType === type
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {type === 'ALL' ? 'All' : type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications found in log</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {filtered.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/40 flex items-start justify-between gap-3 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{item.message}</p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleString()}
                          </span>
                          {item.user && (
                            <span>Recipient: <strong className="text-gray-700 dark:text-gray-300">{item.user.name}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
