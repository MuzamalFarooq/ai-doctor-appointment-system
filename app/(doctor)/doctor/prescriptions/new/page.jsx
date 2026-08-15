'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, X, FileText, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPrescription } from '@/actions/prescription.actions';

function PrescriptionForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId');
  const patientName = searchParams.get('patientName') || 'Patient';

  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);

  const addMedicine = () => setMedicines(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const removeMedicine = (i) => setMedicines(prev => prev.filter((_, idx) => idx !== i));
  const updateMedicine = (i, field, value) => setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const handleSave = async () => {
    if (!appointmentId) { toast.error('No appointment selected'); return; }
    if (!diagnosis.trim()) { toast.error('Diagnosis is required'); return; }
    if (medicines.some(m => !m.name.trim())) { toast.error('All medicine names are required'); return; }
    setLoading(true);
    try {
      const result = await createPrescription({ appointmentId, medicines, diagnosis, instructions, followUpDate: followUpDate || null });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Prescription saved!');
      router.push('/doctor/appointments');
    } catch { toast.error('Failed to save prescription'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">New Prescription</h1>
          <p className="text-gray-500 text-sm mt-1">For: <strong>{patientName}</strong></p>
        </div>
        <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-60">
          <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save Prescription'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Diagnosis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Diagnosis</h2>
          <textarea rows={3} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Enter diagnosis..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
        </div>

        {/* Medicines */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Medicines</h2>
            <button onClick={addMedicine} className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
              <Plus className="w-4 h-4" /> Add Medicine
            </button>
          </div>
          <div className="space-y-4">
            {medicines.map((med, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl relative">
                {medicines.length > 1 && (
                  <button onClick={() => removeMedicine(i)} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Medicine Name *</label>
                    <input type="text" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} placeholder="e.g. Amoxicillin 500mg" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  {[{ key: 'dosage', label: 'Dosage', placeholder: 'e.g. 500mg' }, { key: 'frequency', label: 'Frequency', placeholder: 'e.g. Twice daily' }, { key: 'duration', label: 'Duration', placeholder: 'e.g. 7 days' }].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                      <input type="text" value={med[key]} onChange={e => updateMedicine(i, key, e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Special Instructions</label>
                    <input type="text" value={med.instructions} onChange={e => updateMedicine(i, 'instructions', e.target.value)} placeholder="e.g. Take after meals" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions & Follow-up */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Additional Instructions</h2>
          <div className="space-y-4">
            <textarea rows={3} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="General instructions for the patient..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Follow-up Date (optional)</label>
              <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewPrescriptionPage() {
  return <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}><PrescriptionForm /></Suspense>;
}
