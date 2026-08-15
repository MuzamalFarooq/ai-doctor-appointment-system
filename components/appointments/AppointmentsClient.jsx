'use client';
import { useState } from 'react';
import { Calendar, Clock, MapPin, Video, FileText, XCircle, RefreshCw, ChevronDown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cancelAppointment } from '@/actions/appointment.actions';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming', statuses: ['PENDING', 'CONFIRMED'] },
  { key: 'completed', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['CANCELLED', 'NO_SHOW'] },
];

export function AppointmentsClient({ appointments }) {
  const [activeTab, setActiveTab] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);
  const [loading, setLoading] = useState(false);

  const filtered = activeTab === 'all'
    ? appointments
    : appointments.filter(a => TABS.find(t => t.key === activeTab)?.statuses?.includes(a.status));

  const handleCancel = async (appointmentId) => {
    setLoading(true);
    try {
      const result = await cancelAppointment(appointmentId);
      if (result?.error) { toast.error(result.error); }
      else { toast.success('Appointment cancelled.'); setCancelModal(null); }
    } catch { toast.error('Failed to cancel.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">My Appointments</h1>
        <Link href="/doctors" className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
          + Book New
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            {tab.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {tab.key === 'all' ? appointments.length : appointments.filter(a => TABS.find(t => t.key === tab.key)?.statuses?.includes(a.status)).length}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No appointments found</p>
          <Link href="/doctors" className="mt-3 inline-block text-xs bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700">Book Appointment</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(apt => (
            <div key={apt.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl">
                    {apt.type === 'video' ? '📹' : '🏥'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{apt.doctor?.user?.name}</p>
                    <p className="text-primary-600 dark:text-primary-400 text-xs">{apt.doctor?.specialization}</p>
                    <p className="text-gray-400 text-xs">{apt.doctor?.hospital?.name || 'Private Clinic'}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary-400" />{formatDate(apt.date, 'MMM d, yyyy')}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary-400" />{apt.startTime}</div>
                <div className="flex items-center gap-1.5">{apt.type === 'video' ? <Video className="w-3.5 h-3.5 text-primary-400" /> : <MapPin className="w-3.5 h-3.5 text-primary-400" />}{apt.type === 'video' ? 'Video Call' : 'In-Person'}</div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                {apt.status === 'CONFIRMED' && apt.type === 'video' && apt.videoRoomUrl && (
                  <a href={apt.videoRoomUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors">
                    <Video className="w-3 h-3" /> Join Video
                  </a>
                )}
                {apt.prescription && (
                  <Link href={`/dashboard/prescriptions`} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-xl border border-blue-200 dark:border-blue-800">
                    <FileText className="w-3 h-3" /> Prescription
                  </Link>
                )}
                {apt.status === 'COMPLETED' && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-xl border border-amber-200 dark:border-amber-800">
                    <Star className="w-3 h-3" /> Write Review
                  </button>
                )}
                {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                  <button onClick={() => setCancelModal(apt.id)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <XCircle className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Appointment" size="sm">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setCancelModal(null)} className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 text-sm">Keep Appointment</button>
          <button onClick={() => handleCancel(cancelModal)} disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 text-sm">
            {loading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
