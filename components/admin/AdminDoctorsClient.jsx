'use client';
import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Search, User, Star, MapPin, Stethoscope, Shield, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { approveDoctor, rejectDoctor, suspendDoctor } from '@/actions/doctor.actions';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

export function AdminDoctorsClient({ doctors: initialDoctors }) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(null);

  const filtered = doctors
    .filter(d => activeTab === 'ALL' || d.status === activeTab)
    .filter(d => {
      const q = search.toLowerCase();
      return d.user?.name?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q) || d.city?.toLowerCase().includes(q);
    });

  const handleApprove = async (id) => {
    setLoading(id + 'approve');
    const result = await approveDoctor(id);
    if (result?.error) toast.error(result.error);
    else { toast.success('Doctor approved!'); setDoctors(prev => prev.map(d => d.id === id ? { ...d, status: 'APPROVED', isVerified: true } : d)); }
    setLoading(null);
  };

  const handleReject = async (id) => {
    setLoading(id + 'reject');
    const result = await rejectDoctor(id);
    if (result?.error) toast.error(result.error);
    else { toast.success('Doctor rejected.'); setDoctors(prev => prev.map(d => d.id === id ? { ...d, status: 'REJECTED' } : d)); }
    setLoading(null);
  };

  const handleSuspend = async (id) => {
    setLoading(id + 'suspend');
    const result = await suspendDoctor(id);
    if (result?.error) toast.error(result.error);
    else { toast.success('Doctor suspended.'); setDoctors(prev => prev.map(d => d.id === id ? { ...d, status: 'SUSPENDED' } : d)); }
    setLoading(null);
  };

  const STATUS_STYLE = {
    PENDING: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300',
    APPROVED: 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
    REJECTED: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
    SUSPENDED: 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300',
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Manage Doctors</h1>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..." className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}>
            {tab} <span className="ml-1 text-xs">({tab === 'ALL' ? doctors.length : doctors.filter(d => d.status === tab).length})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Stethoscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No doctors found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(doctor => (
            <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start gap-4 mb-4">
                <Avatar src={doctor.user?.image} name={doctor.user?.name} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 dark:text-white">{doctor.user?.name}</p>
                    {doctor.isVerified && <Shield className="w-4 h-4 text-blue-500" />}
                  </div>
                  <p className="text-sm text-primary-600 dark:text-primary-400">{doctor.specialization}</p>
                  <p className="text-xs text-gray-400">{doctor.user?.email}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLE[doctor.status] || ''}`}>{doctor.status}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doctor.city}</div>
                <div className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{(doctor.rating || 0).toFixed(1)}</div>
                <div>PKR {(doctor.consultationFee || 0).toLocaleString()}</div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                {doctor.status !== 'APPROVED' && (
                  <button onClick={() => handleApprove(doctor.id)} disabled={loading === doctor.id + 'approve'}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {doctor.status === 'PENDING' && (
                  <button onClick={() => handleReject(doctor.id)} disabled={loading === doctor.id + 'reject'}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                {doctor.status === 'APPROVED' && (
                  <button onClick={() => handleSuspend(doctor.id)} disabled={loading === doctor.id + 'suspend'}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border-2 border-amber-500 text-amber-600 text-xs font-semibold rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors disabled:opacity-60">
                    <AlertTriangle className="w-3.5 h-3.5" /> Suspend
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
