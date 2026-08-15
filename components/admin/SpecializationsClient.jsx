'use client';
import { useState } from 'react';
import { Plus, Trash2, Edit2, Stethoscope, Check, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { createSpecialization, deleteSpecialization } from '@/actions/admin.actions';
import toast from 'react-hot-toast';

const SPEC_ICONS = ['❤️','🧠','🦴','🩺','👶','🌸','👂','👁️','🧘','🩻','💊','🎗️','🦷','💉','🧬'];
const SPEC_COLORS = ['#ef4444','#3b82f6','#8b5cf6','#10b981','#f59e0b','#ec4899','#14b8a6','#6366f1','#84cc16','#f97316'];

export function SpecializationsClient({ specializations: initial }) {
  const [specializations, setSpecializations] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '❤️', color: '#ef4444' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setLoading(true);
    try {
      const result = await createSpecialization(form);
      if (result?.error) { toast.error(result.error); return; }
      if (result?.specialization) setSpecializations(prev => [...prev, result.specialization]);
      toast.success('Created!');
      setShowModal(false);
      setForm({ name: '', description: '', icon: '❤️', color: '#ef4444' });
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this specialization?')) return;
    const result = await deleteSpecialization(id);
    if (result?.error) toast.error(result.error);
    else { setSpecializations(prev => prev.filter(s => s.id !== id)); toast.success('Deleted'); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Specializations</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {specializations.map(spec => (
          <div key={spec.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: spec.color + '20' }}>
              {spec.icon || '🩺'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{spec.name}</p>
              {spec.description && <p className="text-xs text-gray-400 truncate">{spec.description}</p>}
            </div>
            <button onClick={() => handleDelete(spec.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {specializations.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <Stethoscope className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No specializations yet</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Specialization">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Cardiologist" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {SPEC_ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(p => ({ ...p, icon }))} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${ form.icon === icon ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700' }`}>{icon}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {SPEC_COLORS.map(color => (
                <button key={color} onClick={() => setForm(p => ({ ...p, color }))} style={{ backgroundColor: color }} className={`w-8 h-8 rounded-full transition-all ${ form.color === color ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : '' }`} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm">Cancel</button>
            <button onClick={handleCreate} disabled={loading} className="flex-1 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60 text-sm">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
