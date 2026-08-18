'use client';
import { useState } from 'react';
import { Search, Users, Calendar, Mail, UserX, UserCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { toggleUserActive } from '@/actions/admin.actions';
import toast from 'react-hot-toast';

export function AdminPatientsClient({ patients: initialPatients }) {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState('');

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return p.user?.name?.toLowerCase().includes(q) || p.user?.email?.toLowerCase().includes(q);
  });

  const handleToggleActive = async (userId, currentStatus) => {
    const result = await toggleUserActive(userId);
    if (result?.error) toast.error(result.error);
    else {
      setPatients(prev => prev.map(p => p.user?.id === userId ? { ...p, user: { ...p.user, isActive: !currentStatus } } : p));
      toast.success(currentStatus ? 'User deactivated' : 'User activated');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Manage Patients</h1>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..." className="pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {['Patient', 'Email', 'Appointments', 'Joined', 'Status', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(patient => (
              <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={patient.user?.image} name={patient.user?.name} size="sm" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{patient.user?.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{patient.user?.email}</td>
                <td className="px-4 py-3 text-sm text-center">{patient._count?.appointments || 0}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{patient.user?.createdAt ? new Date(patient.user.createdAt).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                    patient.user?.isActive ? 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' : 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                  }`}>{patient.user?.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleActive(patient.user?.id, patient.user?.isActive)}
                    className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors ${
                      patient.user?.isActive ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}>
                    {patient.user?.isActive ? <><UserX className="w-3 h-3" /> Deactivate</> : <><UserCheck className="w-3 h-3" /> Activate</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No patients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
