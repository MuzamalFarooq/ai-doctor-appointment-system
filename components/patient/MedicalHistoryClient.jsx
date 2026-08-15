'use client';
import { useState } from 'react';
import { Plus, FileText, Calendar, Pill, Edit2, Trash2, Activity } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { addMedicalHistory, deleteMedicalHistory } from '@/actions/patient.actions';

export function MedicalHistoryClient({ patient, history: initialHistory }) {
  const [history, setHistory] = useState(initialHistory || []);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ condition: '', diagnosedAt: '', treatment: '', notes: '' });

  const handleAdd = async () => {
    if (!form.condition.trim()) { toast.error('Condition is required'); return; }
    setLoading(true);
    try {
      const result = await addMedicalHistory(form);
      if (result?.error) { toast.error(result.error); return; }
      if (result?.history) { setHistory(prev => [result.history, ...prev]); }
      setShowModal(false);
      setForm({ condition: '', diagnosedAt: '', treatment: '', notes: '' });
      toast.success('Medical history added!');
    } catch { toast.error('Failed to add'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMedicalHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Medical History</h1>
          <p className="text-gray-500 text-sm mt-1">Your complete health records and medical history</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {/* Patient Info */}
      {patient && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[{ label: 'Blood Group', value: patient.bloodGroup || 'N/A', icon: '🩸' },
            { label: 'Allergies', value: patient.allergies?.join(', ') || 'None', icon: '⚠️' },
            { label: 'Chronic Diseases', value: patient.chronicDiseases?.join(', ') || 'None', icon: '🏥' },
            { label: 'Gender', value: patient.gender || 'N/A', icon: '👤' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
              <p className="text-lg mb-1">{icon}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* History Timeline */}
      {history.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">No medical history records</p>
          <button onClick={() => setShowModal(true)} className="text-xs bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700">Add First Record</button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary-300 via-primary-200 to-transparent" />
          <div className="space-y-4">
            {history.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white dark:border-gray-950">
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{item.condition}</p>
                      {item.diagnosedAt && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" /> Diagnosed: {new Date(item.diagnosedAt).toLocaleDateString()}</p>}
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.treatment && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex items-start gap-2"><Pill className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{item.treatment}</p>}
                  {item.notes && <p className="text-xs text-gray-400 mt-2 italic">{item.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Medical History">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Condition / Diagnosis <span className="text-red-500">*</span></label>
            <input type="text" value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} placeholder="e.g. Diabetes Type 2, Hypertension" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date Diagnosed</label>
            <input type="date" value={form.diagnosedAt} onChange={e => setForm(p => ({ ...p, diagnosedAt: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Treatment</label>
            <input type="text" value={form.treatment} onChange={e => setForm(p => ({ ...p, treatment: e.target.value }))} placeholder="e.g. Metformin 500mg twice daily" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm">Cancel</button>
            <button onClick={handleAdd} disabled={loading} className="flex-1 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 text-sm">
              {loading ? 'Saving...' : 'Add Record'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
