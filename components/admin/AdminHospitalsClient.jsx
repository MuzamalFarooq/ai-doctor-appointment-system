'use client';
import { useState } from 'react';
import { 
  Building, Plus, Search, MapPin, Phone, Mail, Globe, 
  Trash2, Edit3, CheckCircle, XCircle, Stethoscope, Power
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { createHospital, updateHospital, toggleHospitalStatus, deleteHospital } from '@/actions/admin.actions';
import toast from 'react-hot-toast';

const COMMON_FACILITIES = [
  '24/7 Emergency', 'ICU', 'Radiology / X-Ray', 'Laboratory', 'Pharmacy', 
  'Operation Theater', 'Pediatric Care', 'Cardiac Care', 'MRI & CT Scan', 'Ultrasound'
];

export function AdminHospitalsClient({ hospitals: initialHospitals }) {
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    facilities: [],
    isActive: true,
  });

  const cities = ['ALL', ...new Set(hospitals.map(h => h.city).filter(Boolean))];

  const filtered = hospitals
    .filter(h => selectedCity === 'ALL' || h.city === selectedCity)
    .filter(h => {
      const q = search.toLowerCase();
      return h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.address.toLowerCase().includes(q);
    });

  const openCreateModal = () => {
    setEditingHospital(null);
    setFormData({
      name: '',
      address: '',
      city: 'Islamabad',
      phone: '',
      email: '',
      website: '',
      facilities: ['24/7 Emergency', 'Pharmacy'],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (h) => {
    setEditingHospital(h);
    setFormData({
      name: h.name,
      address: h.address,
      city: h.city,
      phone: h.phone || '',
      email: h.email || '',
      website: h.website || '',
      facilities: h.facilities || [],
      isActive: h.isActive,
    });
    setIsModalOpen(true);
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.city) {
      toast.error('Please fill in name, address, and city.');
      return;
    }

    setLoading(true);
    if (editingHospital) {
      const res = await updateHospital(editingHospital.id, formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success('Hospital updated successfully');
        setHospitals(prev => prev.map(h => h.id === editingHospital.id ? { ...h, ...formData } : h));
        setIsModalOpen(false);
      }
    } else {
      const res = await createHospital(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success('Hospital added successfully');
        setHospitals(prev => [res.hospital, ...prev]);
        setIsModalOpen(false);
      }
    }
    setLoading(false);
  };

  const handleToggleActive = async (id) => {
    const res = await toggleHospitalStatus(id);
    if (res?.error) toast.error(res.error);
    else {
      toast.success('Status updated');
      setHospitals(prev => prev.map(h => h.id === id ? { ...h, isActive: !h.isActive } : h));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hospital?')) return;
    const res = await deleteHospital(id);
    if (res?.error) toast.error(res.error);
    else {
      toast.success('Hospital deleted');
      setHospitals(prev => prev.filter(h => h.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Hospitals & Medical Centers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage partner hospitals, diagnostic centers, and healthcare facilities
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Hospital
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by hospital name or address..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                selectedCity === city
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Hospitals */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Building className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No Hospitals Found</h3>
          <p className="text-sm text-gray-500 mt-1">Add your first healthcare facility to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(h => (
            <div
              key={h.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                h.isActive ? 'border-gray-100 dark:border-gray-700' : 'border-red-200 dark:border-red-900/40 bg-red-50/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{h.name}</h3>
                      <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {h.city}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    h.isActive ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300' : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {h.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  {h.address}
                </p>

                {/* Contact info */}
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300 mb-4">
                  {h.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" /> {h.phone}
                    </p>
                  )}
                  {h.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" /> {h.email}
                    </p>
                  )}
                  {h.website && (
                    <p className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-gray-400" />
                      <a href={h.website} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline truncate">
                        {h.website}
                      </a>
                    </p>
                  )}
                </div>

                {/* Facilities Badges */}
                {h.facilities?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Facilities</p>
                    <div className="flex flex-wrap gap-1">
                      {h.facilities.map(f => (
                        <span key={f} className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/80 gap-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Stethoscope className="w-3.5 h-3.5 text-primary-500" />
                  <span>{h._count?.doctors || h.doctors?.length || 0} Doctors</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(h.id)}
                    className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                    title={h.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(h)}
                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Delete Hospital"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Hospital / Clinic Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Shifa International Hospital"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Islamabad"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+92 51 8463000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Pitras Bukhari Rd, Sector H-8/4"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@hospital.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Website URL</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://hospital.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Select Facilities</label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                {COMMON_FACILITIES.map(fac => {
                  const selected = formData.facilities.includes(fac);
                  return (
                    <button
                      type="button"
                      key={fac}
                      onClick={() => handleFacilityToggle(fac)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        selected
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}{fac}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active & accepting patient appointments
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-60"
              >
                {loading ? 'Saving...' : editingHospital ? 'Save Changes' : 'Create Hospital'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
