'use client';
import { useState } from 'react';
import { 
  Calendar, Search, Filter, Clock, Video, MapPin, User, CheckCircle2, 
  XCircle, AlertCircle, RefreshCw, Trash2, Eye, Shield, DollarSign
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { updateAppointmentStatus, deleteAppointment } from '@/actions/admin.actions';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'];

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' },
  RESCHEDULED: { label: 'Rescheduled', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800' },
  NO_SHOW: { label: 'No Show', color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
};

export function AdminAppointmentsClient({ appointments: initialAppointments }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const filtered = appointments
    .filter(a => activeStatus === 'ALL' || a.status === activeStatus)
    .filter(a => typeFilter === 'ALL' || a.type === typeFilter)
    .filter(a => {
      const q = search.toLowerCase();
      const patientName = a.patient?.user?.name?.toLowerCase() || '';
      const doctorName = a.doctor?.user?.name?.toLowerCase() || '';
      const reason = a.reason?.toLowerCase() || '';
      return patientName.includes(q) || doctorName.includes(q) || reason.includes(q);
    });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
  };

  const handleStatusChange = async (id, newStatus) => {
    setLoadingId(id);
    const res = await updateAppointmentStatus(id, newStatus);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Appointment marked as ${newStatus}`);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
      }
    }
    setLoadingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    setLoadingId(id);
    const res = await deleteAppointment(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success('Appointment deleted successfully');
      setAppointments(prev => prev.filter(a => a.id !== id));
      if (selectedAppointment?.id === id) setSelectedAppointment(null);
    }
    setLoadingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Appointments Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor, update, and manage all patient-doctor bookings across the platform
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Confirmed</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{stats.confirmed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-sm">
          <p className="text-xs font-medium text-green-600 dark:text-green-400">Completed</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">Cancelled</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search doctor, patient, symptom..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Type:</span>
            {['ALL', 'in-person', 'video'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t === 'video' ? 'Video Consult' : 'In-Person'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 border-t border-gray-100 dark:border-gray-700/60 pt-3">
          {STATUSES.map(status => {
            const count = status === 'ALL' ? appointments.length : appointments.filter(a => a.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
                  activeStatus === status
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeStatus === status ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointments List / Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No Appointments Found</h3>
          <p className="text-sm text-gray-500 mt-1">Try tweaking your search filters or status criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Doctor & Specialty</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Type & Fee</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filtered.map(apt => {
                  const statusStyle = STATUS_CONFIG[apt.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={apt.patient?.user?.image} name={apt.patient?.user?.name || 'Patient'} size="sm" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{apt.patient?.user?.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-400">{apt.patient?.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={apt.doctor?.user?.image} name={apt.doctor?.user?.name || 'Doctor'} size="sm" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{apt.doctor?.user?.name || 'Dr. Assigned'}</p>
                            <p className="text-xs text-primary-600 dark:text-primary-400">{apt.doctor?.specialization}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-gray-900 dark:text-gray-200 flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(apt.date)}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {apt.startTime} - {apt.endTime}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            apt.type === 'video' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                          }`}>
                            {apt.type === 'video' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {apt.type === 'video' ? 'Video Call' : 'In-Person'}
                          </span>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            PKR {(apt.consultationFee || 0).toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={apt.status}
                          disabled={loadingId === apt.id}
                          onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:ring-2 focus:ring-primary-500 focus:outline-none ${statusStyle.color}`}
                        >
                          {STATUSES.filter(s => s !== 'ALL').map(s => (
                            <option key={s} value={s} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedAppointment(apt)}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(apt.id)}
                            disabled={loadingId === apt.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={Boolean(selectedAppointment)}
          onClose={() => setSelectedAppointment(null)}
          title="Appointment Details"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-500 font-medium">Patient</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedAppointment.patient?.user?.name || 'N/A'}</p>
                <p className="text-xs text-gray-400">{selectedAppointment.patient?.user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Doctor</p>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedAppointment.doctor?.user?.name || 'N/A'}</p>
                <p className="text-xs text-primary-600">{selectedAppointment.doctor?.specialization}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                  {formatDate(selectedAppointment.date)} ({selectedAppointment.startTime} - {selectedAppointment.endTime})
                </p>
              </div>
              <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">Fee & Type</p>
                <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                  PKR {(selectedAppointment.consultationFee || 0).toLocaleString()} • {selectedAppointment.type}
                </p>
              </div>
            </div>

            {selectedAppointment.reason && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reason for Visit</p>
                <p className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">{selectedAppointment.reason}</p>
              </div>
            )}

            {selectedAppointment.symptoms?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Symptoms Reported</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAppointment.symptoms.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedAppointment.notes && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Additional Notes</p>
                <p className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs">{selectedAppointment.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="flex-1 py-2 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
