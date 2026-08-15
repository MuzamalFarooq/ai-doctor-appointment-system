'use client';
import { useState } from 'react';
import { Calendar, Clock, Video, MapPin, CheckCircle, XCircle, FileText, User, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { getStatusColor, formatDate } from '@/lib/utils';
import { updateAppointmentStatus } from '@/actions/appointment.actions';
import toast from 'react-hot-toast';
import Link from 'next/link';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming', statuses: ['PENDING', 'CONFIRMED'] },
  { key: 'completed', label: 'Completed', statuses: ['COMPLETED'] },
];

export function DoctorAppointmentsClient({ appointments }) {
  const [activeTab, setActiveTab] = useState('all');
  const [updating, setUpdating] = useState(null);

  const today = new Date();
  const isToday = (d) => new Date(d).toDateString() === today.toDateString();

  const filtered = activeTab === 'all' ? appointments
    : activeTab === 'today' ? appointments.filter(a => isToday(a.date))
    : appointments.filter(a => TABS.find(t => t.key === activeTab)?.statuses?.includes(a.status));

  const handleStatus = async (appointmentId, status) => {
    setUpdating(appointmentId + status);
    try {
      const result = await updateAppointmentStatus(appointmentId, status);
      if (result?.error) toast.error(result.error);
      else toast.success(`Appointment ${status.toLowerCase()}`);
    } catch { toast.error('Failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-6">Appointments</h1>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(apt => (
            <div key={apt.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar src={apt.patient?.user?.image} name={apt.patient?.user?.name} size="lg" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{apt.patient?.user?.name}</p>
                    <p className="text-xs text-gray-400">{apt.reason || 'General consultation'}</p>
                    {apt.symptoms?.length > 0 && <p className="text-xs text-primary-500 mt-0.5">Symptoms: {apt.symptoms.slice(0, 3).join(', ')}</p>}
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary-400" />{formatDate(apt.date, 'MMM d, yyyy')}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary-400" />{apt.startTime}</div>
                <div className="flex items-center gap-1.5">{apt.type === 'video' ? <Video className="w-3.5 h-3.5 text-primary-400" /> : <MapPin className="w-3.5 h-3.5 text-primary-400" />}{apt.type === 'video' ? 'Video Call' : 'In-Person'}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                {apt.status === 'PENDING' && (
                  <button onClick={() => handleStatus(apt.id, 'CONFIRMED')} disabled={!!updating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
                    <CheckCircle className="w-3 h-3" /> Confirm
                  </button>
                )}
                {apt.status === 'CONFIRMED' && (
                  <>
                    {apt.type === 'video' && apt.videoRoomUrl && (
                      <a href={apt.videoRoomUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700">
                        <Video className="w-3 h-3" /> Join Video
                      </a>
                    )}
                    <button onClick={() => handleStatus(apt.id, 'COMPLETED')} disabled={!!updating}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                      <CheckCircle className="w-3 h-3" /> Mark Complete
                    </button>
                  </>
                )}
                {!apt.prescription && apt.status === 'COMPLETED' && (
                  <Link href={`/doctor/prescriptions/new?appointmentId=${apt.id}&patientName=${apt.patient?.user?.name}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700">
                    <FileText className="w-3 h-3" /> Add Prescription
                  </Link>
                )}
                {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                  <button onClick={() => handleStatus(apt.id, 'CANCELLED')} disabled={!!updating}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-red-600 text-xs font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
                    <XCircle className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
