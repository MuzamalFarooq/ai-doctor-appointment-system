'use client';
import { useState } from 'react';
import { User, Phone, MapPin, Droplets, AlertTriangle, Shield, Camera, Save } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import toast from 'react-hot-toast';
import { updatePatientProfile, updatePassword } from '@/actions/patient.actions';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMMON_ALLERGIES = ['Penicillin', 'Aspirin', 'Ibuprofen', 'Sulfa drugs', 'Latex', 'Peanuts', 'Shellfish', 'Pollen'];
const COMMON_DISEASES = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid', 'Arthritis', 'Kidney Disease'];

export function PatientProfileClient({ user, patient }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    name: user?.name || '',
    phone: patient?.phone || '',
    address: patient?.address || '',
    dateOfBirth: patient?.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
    gender: patient?.gender || '',
  });
  const [medicalForm, setMedicalForm] = useState({
    bloodGroup: patient?.bloodGroup || '',
    allergies: patient?.allergies || [],
    chronicDiseases: patient?.chronicDiseases || [],
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSavePersonal = async () => {
    setLoading(true);
    try {
      const result = await updatePatientProfile({ ...personalForm, type: 'personal' });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const handleSaveMedical = async () => {
    setLoading(true);
    try {
      const result = await updatePatientProfile({ ...medicalForm, type: 'medical' });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Medical info updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const result = await updatePassword(passwordForm);
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const toggleAllergy = (a) => setMedicalForm(p => ({ ...p, allergies: p.allergies.includes(a) ? p.allergies.filter(x => x !== a) : [...p.allergies, a] }));
  const toggleDisease = (d) => setMedicalForm(p => ({ ...p, chronicDiseases: p.chronicDiseases.includes(d) ? p.chronicDiseases.filter(x => x !== d) : [...p.chronicDiseases, d] }));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <Avatar src={user?.image} name={user?.name} size="2xl" className="ring-4 ring-white/30" />
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-primary-600" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-black font-heading">{user?.name}</h1>
            <p className="text-white/80 text-sm">{user?.email}</p>
            <span className="mt-1 inline-block px-2.5 py-0.5 bg-white/20 backdrop-blur rounded-full text-xs font-medium">Patient</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
        {[{ key: 'personal', label: 'Personal Info', icon: User }, { key: 'medical', label: 'Medical Info', icon: Droplets }, { key: 'security', label: 'Security', icon: Shield }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        {activeTab === 'personal' && (
          <div className="space-y-4">
            {[{ key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
              { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+92 300 1234567' },
              { key: 'address', label: 'Address', type: 'text', placeholder: 'Your address' },
              { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', placeholder: '' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                <input type={type} value={personalForm[key]} onChange={e => setPersonalForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {['male', 'female', 'other'].map(g => (
                  <button key={g} type="button" onClick={() => setPersonalForm(p => ({ ...p, gender: g }))}
                    className={`py-2 text-sm font-medium rounded-xl border-2 capitalize transition-all ${
                      personalForm.gender === g ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                    }`}>{g}</button>
                ))}
              </div>
            </div>
            <button onClick={handleSavePersonal} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Group</label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map(bg => (
                  <button key={bg} type="button" onClick={() => setMedicalForm(p => ({ ...p, bloodGroup: bg }))}
                    className={`py-2 text-sm font-bold rounded-xl border-2 transition-all ${
                      medicalForm.bloodGroup === bg ? 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:border-gray-300'
                    }`}>{bg}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allergies</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map(a => (
                  <button key={a} type="button" onClick={() => toggleAllergy(a)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all ${
                      medicalForm.allergies.includes(a) ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:border-gray-300'
                    }`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chronic Diseases</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_DISEASES.map(d => (
                  <button key={d} type="button" onClick={() => toggleDisease(d)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all ${
                      medicalForm.chronicDiseases.includes(d) ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:border-gray-300'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
            <button onClick={handleSaveMedical} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save Medical Info'}
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Change your password to keep your account secure.</p>
            {[{ key: 'currentPassword', label: 'Current Password' }, { key: 'newPassword', label: 'New Password' }, { key: 'confirmPassword', label: 'Confirm New Password' }].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                <input type="password" value={passwordForm[key]} onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              <Shield className="w-4 h-4" />{loading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
