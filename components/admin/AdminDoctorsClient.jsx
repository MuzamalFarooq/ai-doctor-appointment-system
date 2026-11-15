'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  User,
  Star,
  MapPin,
  Stethoscope,
  Shield,
  Clock,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Calendar,
  DollarSign,
  Award,
  FileText,
  Mail,
  Building2,
  Filter,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { approveDoctor, rejectDoctor, suspendDoctor } from '@/actions/doctor.actions';
import { createDoctor, updateDoctor, deleteDoctorSafe } from '@/actions/admin.actions';
import { DOCTOR_SPECIALTIES } from '@/lib/doctor-specialties';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

const WEEK_DAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' },
];

const INITIAL_FORM = {
  name: '',
  email: '',
  profilePhoto: '',
  specialization: 'Cardiology',
  degree: 'MBBS, FCPS',
  experience: 8,
  consultationFee: 2500,
  city: 'Islamabad',
  location: 'Shifa International Hospital, H-8/4',
  hospitalName: 'Shifa International Hospital',
  licenseNumber: 'PMDC-12345-P',
  languages: 'English, Urdu',
  biography: '',
  availableDays: [1, 2, 3, 4, 5, 6],
  startTime: '09:00',
  endTime: '13:00',
  slotDuration: 30,
};

const STATUS_STYLE = {
  PENDING: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300',
  APPROVED: 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
  REJECTED: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
  SUSPENDED: 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300',
};

export function AdminDoctorsClient({ doctors: initialDoctors }) {
  const [doctors, setDoctors] = useState(initialDoctors || []);
  const [activeTab, setActiveTab] = useState('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Filtering
  const filtered = doctors
    .filter(d => activeTab === 'ALL' || d.status === activeTab)
    .filter(d => specialtyFilter === 'ALL' || d.specialization?.toLowerCase() === specialtyFilter.toLowerCase())
    .filter(d => {
      const q = search.toLowerCase();
      return (
        d.user?.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.city?.toLowerCase().includes(q) ||
        d.user?.email?.toLowerCase().includes(q) ||
        d.licenseNumber?.toLowerCase().includes(q)
      );
    });

  // Fast Status Actions
  const handleApprove = async (id) => {
    setLoading(id + 'approve');
    const result = await approveDoctor(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Doctor verified and approved!');
      setDoctors(prev => prev.map(d => (d.id === id ? { ...d, status: 'APPROVED', isVerified: true } : d)));
    }
    setLoading(null);
  };

  const handleReject = async (id) => {
    setLoading(id + 'reject');
    const result = await rejectDoctor(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Doctor rejected.');
      setDoctors(prev => prev.map(d => (d.id === id ? { ...d, status: 'REJECTED' } : d)));
    }
    setLoading(null);
  };

  const handleSuspend = async (id) => {
    setLoading(id + 'suspend');
    const result = await suspendDoctor(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Doctor suspended.');
      setDoctors(prev => prev.map(d => (d.id === id ? { ...d, status: 'SUSPENDED' } : d)));
    }
    setLoading(null);
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData(INITIAL_FORM);
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (doc) => {
    const activeDays = Array.isArray(doc.availability) && doc.availability.length > 0
      ? doc.availability.filter(a => a.isAvailable).map(a => a.dayOfWeek)
      : [1, 2, 3, 4, 5, 6];

    const firstAvail = doc.availability?.[0];

    setFormData({
      name: doc.user?.name || '',
      email: doc.user?.email || '',
      profilePhoto: doc.profilePhoto || doc.user?.image || '',
      specialization: doc.specialization || 'Cardiology',
      degree: Array.isArray(doc.degree) ? doc.degree.join(', ') : doc.degree || 'MBBS',
      experience: doc.experience || 0,
      consultationFee: doc.consultationFee || 2000,
      city: doc.city || 'Islamabad',
      location: doc.location || '',
      hospitalName: doc.hospital?.name || doc.location || '',
      licenseNumber: doc.licenseNumber || '',
      languages: Array.isArray(doc.languages) ? doc.languages.join(', ') : 'English, Urdu',
      biography: doc.biography || '',
      status: doc.status || 'APPROVED',
      isVerified: Boolean(doc.isVerified),
      availableDays: activeDays,
      startTime: firstAvail?.startTime || '09:00',
      endTime: firstAvail?.endTime || '13:00',
      slotDuration: firstAvail?.slotDuration || 30,
    });
    setEditDoctor(doc);
  };

  // Submit Add Doctor
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        profilePhoto: formData.profilePhoto,
        specialization: formData.specialization,
        degree: formData.degree.split(',').map(s => s.trim()).filter(Boolean),
        experience: Number(formData.experience) || 0,
        consultationFee: Number(formData.consultationFee) || 0,
        city: formData.city,
        location: formData.location || formData.hospitalName,
        hospitalName: formData.hospitalName,
        licenseNumber: formData.licenseNumber,
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        biography: formData.biography,
        availableDays: formData.availableDays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotDuration: formData.slotDuration,
      };

      const res = await createDoctor(payload);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Dr. ${formData.name} added successfully!`);
        if (res.doctor) {
          setDoctors(prev => [res.doctor, ...prev]);
        }
        setIsAddOpen(false);
      }
    } catch {
      toast.error('Failed to create doctor profile');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Doctor
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDoctor) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        profilePhoto: formData.profilePhoto,
        specialization: formData.specialization,
        degree: formData.degree.split(',').map(s => s.trim()).filter(Boolean),
        experience: Number(formData.experience) || 0,
        consultationFee: Number(formData.consultationFee) || 0,
        city: formData.city,
        location: formData.location || formData.hospitalName,
        licenseNumber: formData.licenseNumber,
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        biography: formData.biography,
        status: formData.status,
        isVerified: formData.isVerified,
        availableDays: formData.availableDays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotDuration: formData.slotDuration,
      };

      const res = await updateDoctor(editDoctor.id, payload);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Doctor profile updated successfully!');
        setDoctors(prev =>
          prev.map(d =>
            d.id === editDoctor.id
              ? {
                  ...d,
                  ...payload,
                  user: {
                    ...d.user,
                    name: payload.name,
                    image: payload.profilePhoto || d.user?.image,
                  },
                }
              : d
          )
        );
        setEditDoctor(null);
      }
    } catch {
      toast.error('Failed to update doctor profile');
    } finally {
      setSubmitting(false);
    }
  };

  // Safe Delete / Deactivate Doctor
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await deleteDoctorSafe(deleteTarget.id);
      if (res.error) {
        toast.error(res.error);
      } else if (res.action === 'deactivated') {
        toast(res.message, { icon: '🛡️', duration: 5000 });
        setDoctors(prev =>
          prev.map(d => (d.id === deleteTarget.id ? { ...d, status: 'SUSPENDED', isVerified: false } : d))
        );
      } else {
        toast.success('Doctor permanently removed.');
        setDoctors(prev => prev.filter(d => d.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to process doctor deletion');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDay = (dayId) => {
    setFormData(prev => {
      const exists = prev.availableDays.includes(dayId);
      const next = exists ? prev.availableDays.filter(d => d !== dayId) : [...prev.availableDays, dayId];
      return { ...prev, availableDays: next };
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Specialized Doctors Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage provider profiles, credentials, availability schedules, and verifications across 18 canonical specialties ({doctors.length} doctors total)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Doctor
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by doctor name, specialty, city, license..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={specialtyFilter}
                onChange={e => setSpecialtyFilter(e.target.value)}
                className="w-full md:w-56 text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All 18 Specialties</option>
                {DOCTOR_SPECIALTIES.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.practitionerTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 border-t border-gray-100 dark:border-gray-700/60 pt-3">
          {STATUS_TABS.map(tab => {
            const count = tab === 'ALL' ? doctors.length : doctors.filter(d => d.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab}
                <span
                  className={`ml-1.5 text-[11px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctors Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Stethoscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-900 dark:text-white">No doctors match your criteria</p>
          <p className="text-sm text-gray-500 mt-1">Try relaxing your search terms or selecting another specialty.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(doctor => (
            <div
              key={doctor.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={doctor.profilePhoto || doctor.user?.image}
                      name={doctor.user?.name}
                      size="lg"
                    />
                    {doctor.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm" title="Verified License">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-900 dark:text-white text-base truncate">
                        {doctor.user?.name}
                      </p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${STATUS_STYLE[doctor.status] || ''}`}>
                        {doctor.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                      {doctor.specialization}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{doctor.user?.email}</p>
                  </div>
                </div>

                {/* Details Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-xl mb-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{doctor.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                    <span>{(doctor.rating || 5.0).toFixed(1)} rating</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Award className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{Array.isArray(doctor.degree) ? doctor.degree.join(', ') : doctor.degree || 'MBBS'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>PKR {(doctor.consultationFee || 0).toLocaleString()}</span>
                  </div>
                </div>

                {doctor.licenseNumber && (
                  <p className="text-[11px] text-gray-400 mb-2 font-mono flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-500" /> License: {doctor.licenseNumber}
                  </p>
                )}

                {doctor.hospital?.name && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{doctor.hospital.name}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700/80 space-y-2">
                {/* Fast status actions */}
                <div className="flex gap-1.5">
                  {doctor.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(doctor.id)}
                      disabled={loading === doctor.id + 'approve'}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {doctor.status === 'PENDING' && (
                    <button
                      onClick={() => handleReject(doctor.id)}
                      disabled={loading === doctor.id + 'reject'}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                  {doctor.status === 'APPROVED' && (
                    <button
                      onClick={() => handleSuspend(doctor.id)}
                      disabled={loading === doctor.id + 'suspend'}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-amber-500 text-amber-600 text-xs font-semibold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors disabled:opacity-60"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Suspend
                    </button>
                  )}
                </div>

                {/* Edit, Delete, View Profile row */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(doctor)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>

                  <Link
                    href={`/doctors/${doctor.id}`}
                    target="_blank"
                    className="p-1.5 text-gray-500 hover:text-primary-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/60 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="View Public Profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => setDeleteTarget(doctor)}
                    className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    title="Delete / Deactivate Doctor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD DOCTOR MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Specialized Doctor Profile" size="xl">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Doctor Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Ayesha Khan"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Account Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor.email@mediconnect.pk"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Medical Specialty (1 of 18) *
              </label>
              <select
                value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
              >
                {DOCTOR_SPECIALTIES.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.practitionerTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Qualifications / Degrees *
              </label>
              <input
                type="text"
                required
                value={formData.degree}
                onChange={e => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. MBBS, FCPS (Cardiology)"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Experience (Years) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Consultation Fee (PKR) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.consultationFee}
                onChange={e => setFormData({ ...formData, consultationFee: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="Islamabad / Lahore / Karachi"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                PMDC License Number *
              </label>
              <input
                type="text"
                required
                value={formData.licenseNumber}
                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="PMDC-XXXXX-P"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Hospital / Clinic Affiliation
              </label>
              <input
                type="text"
                value={formData.hospitalName}
                onChange={e => setFormData({ ...formData, hospitalName: e.target.value, location: e.target.value })}
                placeholder="e.g. Shifa International Hospital"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Profile Photo URL
              </label>
              <input
                type="url"
                value={formData.profilePhoto}
                onChange={e => setFormData({ ...formData, profilePhoto: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Professional Biography
            </label>
            <textarea
              rows="3"
              value={formData.biography}
              onChange={e => setFormData({ ...formData, biography: e.target.value })}
              placeholder="Detailed description of clinical background, areas of expertise, and patient care approach..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
            />
          </div>

          {/* Schedule Settings */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
            <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" /> Weekly Availability Schedule
            </p>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                Active Clinic Days:
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map(day => {
                  const active = formData.availableDays.includes(day.id);
                  return (
                    <button
                      type="button"
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Shift Start</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Shift End</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Slot Duration</label>
                <select
                  value={formData.slotDuration}
                  onChange={e => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 shadow-sm"
            >
              {submitting ? 'Creating Doctor Profile...' : 'Save & Publish Doctor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT DOCTOR MODAL */}
      {editDoctor && (
        <Modal isOpen={Boolean(editDoctor)} onClose={() => setEditDoctor(null)} title={`Edit Dr. ${editDoctor.user?.name}`} size="xl">
          <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Doctor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Medical Specialty (1 of 18) *
                </label>
                <select
                  value={formData.specialization}
                  onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                >
                  {DOCTOR_SPECIALTIES.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.practitionerTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Qualifications / Degrees *
                </label>
                <input
                  type="text"
                  required
                  value={formData.degree}
                  onChange={e => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Consultation Fee (PKR) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={formData.consultationFee}
                  onChange={e => setFormData({ ...formData, consultationFee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  PMDC License Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Profile Photo URL (Replace Image)
                </label>
                <input
                  type="url"
                  value={formData.profilePhoto}
                  onChange={e => setFormData({ ...formData, profilePhoto: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Biography
              </label>
              <textarea
                rows="3"
                value={formData.biography}
                onChange={e => setFormData({ ...formData, biography: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
              />
            </div>

            {/* Schedule Section */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
              <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" /> Weekly Availability Schedule
              </p>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Active Days:</label>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map(day => {
                    const active = formData.availableDays.includes(day.id);
                    return (
                      <button
                        type="button"
                        key={day.id}
                        onClick={() => toggleDay(day.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          active
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Shift Start</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Shift End</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Slot Duration</label>
                  <select
                    value={formData.slotDuration}
                    onChange={e => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setEditDoctor(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* SAFE DELETE CONFIRMATION DIALOG */}
      {deleteTarget && (
        <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete / Deactivate Doctor">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs">Medical History Preservation Policy</p>
                <p className="text-xs mt-1 text-amber-700 dark:text-amber-300">
                  {deleteTarget._count?.appointments > 0 ? (
                    <>
                      <strong>Dr. {deleteTarget.user?.name}</strong> has{' '}
                      <strong>{deleteTarget._count.appointments} appointment records</strong> in the system. To preserve patient medical histories and prevent data loss, this doctor will be safely <strong>SUSPENDED</strong> and hidden from public search rather than hard deleted.
                    </>
                  ) : (
                    <>
                      Are you sure you want to permanently delete <strong>Dr. {deleteTarget.user?.name}</strong> ({deleteTarget.specialization})? This action cannot be undone.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? 'Processing...' : deleteTarget._count?.appointments > 0 ? 'Safely Suspend Doctor' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}