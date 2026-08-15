'use client';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Save, Camera, Stethoscope, MapPin, DollarSign, Globe, Award } from 'lucide-react';
import { updateDoctorProfile } from '@/actions/doctor.actions';
import toast from 'react-hot-toast';

const LANGUAGES = ['English', 'Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi'];
const SPECIALIZATIONS = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Gynecologist', 'ENT Specialist', 'Ophthalmologist', 'Psychiatrist', 'General Physician', 'Urologist', 'Oncologist'];

export function DoctorProfileClient({ doctor }) {
  const [form, setForm] = useState({
    name: doctor?.user?.name || '',
    specialization: doctor?.specialization || '',
    experience: doctor?.experience || '',
    consultationFee: doctor?.consultationFee || '',
    city: doctor?.city || '',
    biography: doctor?.biography || '',
    languages: doctor?.languages || [],
    degree: doctor?.degree || [],
    licenseNumber: doctor?.licenseNumber || '',
    gender: doctor?.gender || '',
    location: doctor?.location || '',
  });
  const [loading, setLoading] = useState(false);
  const [newDegree, setNewDegree] = useState('');

  const toggleLanguage = (lang) => setForm(p => ({
    ...p,
    languages: p.languages.includes(lang) ? p.languages.filter(l => l !== lang) : [...p.languages, lang]
  }));

  const addDegree = () => {
    if (newDegree.trim() && !form.degree.includes(newDegree.trim())) {
      setForm(p => ({ ...p, degree: [...p.degree, newDegree.trim()] }));
      setNewDegree('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateDoctorProfile(doctor?.id, form);
      if (result?.error) toast.error(result.error);
      else toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <Avatar src={doctor?.user?.image} name={doctor?.user?.name} size="2xl" className="ring-4 ring-white/30" />
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-primary-600" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-black font-heading">{doctor?.user?.name}</h1>
            <p className="text-white/80 text-sm">{doctor?.specialization}</p>
            <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              doctor?.status === 'APPROVED' ? 'bg-green-400/30 text-green-100' :
              doctor?.status === 'PENDING' ? 'bg-amber-400/30 text-amber-100' : 'bg-red-400/30 text-red-100'
            }`}>{doctor?.status}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Stethoscope className="w-4 h-4 text-primary-500" /> Professional Info</h2>
          <div className="grid grid-cols-2 gap-4">
            {[{ key: 'name', label: 'Full Name', type: 'text', span: 2 },
              { key: 'licenseNumber', label: 'License Number', type: 'text' },
              { key: 'experience', label: 'Experience (years)', type: 'number' },
              { key: 'consultationFee', label: 'Consultation Fee (PKR)', type: 'number' },
              { key: 'city', label: 'City', type: 'text' },
              { key: 'location', label: 'Clinic/Hospital Address', type: 'text', span: 2 },
            ].map(({ key, label, type, span }) => (
              <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Specialization */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Specialization</h2>
          <div className="grid grid-cols-3 gap-2">
            {SPECIALIZATIONS.map(spec => (
              <button key={spec} type="button" onClick={() => setForm(p => ({ ...p, specialization: spec }))}
                className={`py-2 text-xs font-medium rounded-xl border-2 transition-all ${
                  form.specialization === spec ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                }`}>{spec}</button>
            ))}
          </div>
        </div>

        {/* Biography */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Biography</h2>
          <textarea rows={4} value={form.biography} onChange={e => setForm(p => ({ ...p, biography: e.target.value }))} placeholder="Write a professional bio..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {/* Languages */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Languages Spoken</h2>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all ${
                  form.languages.includes(lang) ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                }`}>{lang}</button>
            ))}
          </div>
        </div>

        {/* Degrees */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Degrees & Qualifications</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.degree.map(deg => (
              <span key={deg} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                {deg}
                <button onClick={() => setForm(p => ({ ...p, degree: p.degree.filter(d => d !== deg) }))} className="hover:text-red-500 transition-colors">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newDegree} onChange={e => setNewDegree(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDegree()} placeholder="e.g. MBBS, FCPS" className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <button onClick={addDegree} className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">Add</button>
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
          <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
