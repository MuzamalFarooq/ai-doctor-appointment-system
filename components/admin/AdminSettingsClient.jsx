'use client';
import { useState } from 'react';
import { 
  Settings, Shield, Database, Cpu, BellRing, Phone, 
  Save, AlertTriangle, CheckCircle, RefreshCw, Key, Globe, Lock
} from 'lucide-react';
import { saveSystemSettings } from '@/actions/admin.actions';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function AdminSettingsClient({ auditLogs: initialLogs }) {
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    platformCommission: '10', // 10%
    emergencyHotline: '1122',
    supportEmail: 'support@mediconnect.ai',
    bookingCancellationWindowHours: '4',
    autoApproveDoctors: false,
    maintenanceMode: false,
    emailNotifications: true,
    smsReminders: true,
    aiGroqEnabled: true,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveSystemSettings(settings);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success('System settings saved successfully!');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
          Platform Settings & System Config
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage commission rates, service policies, automated AI workflows, and system audit logs
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial & Fee Rules */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" /> Platform Financial Rules
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Platform Commission Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={settings.platformCommission}
                      onChange={e => setSettings({ ...settings, platformCommission: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">%</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Fee retained per paid doctor consultation</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Free Cancellation Window (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={settings.bookingCancellationWindowHours}
                    onChange={e => setSettings({ ...settings, bookingCancellationWindowHours: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Minimum hours before appointment for refund</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Emergency Hotline Number
                  </label>
                  <input
                    type="text"
                    value={settings.emergencyHotline}
                    onChange={e => setSettings({ ...settings, emergencyHotline: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Automation & AI Toggles */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-500" /> AI & Automation Engine
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Groq AI Symptom Diagnosis Engine</p>
                    <p className="text-xs text-gray-500">Enable ultra-fast AI symptom assessment powered by LLaMA 3 on Groq</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.aiGroqEnabled}
                    onChange={e => setSettings({ ...settings, aiGroqEnabled: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Auto-Approve Doctor Registrations</p>
                    <p className="text-xs text-gray-500">Bypass manual verification requirement (Not recommended for production)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoApproveDoctors}
                    onChange={e => setSettings({ ...settings, autoApproveDoctors: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Email Booking Confirmations</p>
                    <p className="text-xs text-gray-500">Send transactional receipts and QR codes via Nodemailer</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={e => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Emergency Maintenance Mode</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Temporarily disable new booking requests during platform updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving Settings...' : 'Save All Settings'}
              </button>
            </div>
          </div>

          {/* Right Column: System Status & Audit Log */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" /> System Health
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">Database</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> MongoDB Connected
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">AI Provider</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    Groq / LLaMA 3.3 70B
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">Timezone</span>
                  <span className="text-gray-900 dark:text-white font-medium">Asia/Karachi (PKT)</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-500">Environment</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Development / Active</span>
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Recent Audit Trail
              </h2>

              {initialLogs.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No audit logs recorded yet</p>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {initialLogs.map(log => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary-600 dark:text-primary-400">{log.action}</span>
                        <span className="text-[10px] text-gray-400">{formatDate(log.createdAt)}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                        By: <strong className="text-gray-800 dark:text-gray-200">{log.user?.name || 'System Admin'}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
