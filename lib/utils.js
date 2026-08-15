import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, fmt = 'PPP') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function timeAgo(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCurrency(amount, currency = 'PKR') {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function generateSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(str, length = 150) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function getStatusColor(status) {
  const colors = {
    PENDING: 'text-amber-600 bg-amber-50 border-amber-200',
    CONFIRMED: 'text-blue-600 bg-blue-50 border-blue-200',
    COMPLETED: 'text-green-600 bg-green-50 border-green-200',
    CANCELLED: 'text-red-600 bg-red-50 border-red-200',
    RESCHEDULED: 'text-purple-600 bg-purple-50 border-purple-200',
    NO_SHOW: 'text-gray-600 bg-gray-50 border-gray-200',
    PAID: 'text-green-600 bg-green-50 border-green-200',
    FAILED: 'text-red-600 bg-red-50 border-red-200',
    REFUNDED: 'text-orange-600 bg-orange-50 border-orange-200',
    APPROVED: 'text-green-600 bg-green-50 border-green-200',
    REJECTED: 'text-red-600 bg-red-50 border-red-200',
    SUSPENDED: 'text-orange-600 bg-orange-50 border-orange-200',
  };
  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
}

export function generateTimeSlots(start, end, duration = 30) {
  const slots = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  let current = startH * 60 + startM;
  const endTime = endH * 60 + endM;
  while (current + duration <= endTime) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    const nextH = Math.floor((current + duration) / 60);
    const nextM = (current + duration) % 60;
    slots.push({
      start: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      end: `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`,
      label: `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`,
    });
    current += duration;
  }
  return slots;
}

export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const SPECIALIZATIONS = [
  { name: 'General Physician', icon: '🩺', color: 'blue' },
  { name: 'Cardiologist', icon: '❤️', color: 'red' },
  { name: 'Dermatologist', icon: '🧴', color: 'pink' },
  { name: 'Neurologist', icon: '🧠', color: 'purple' },
  { name: 'Orthopedic', icon: '🦴', color: 'orange' },
  { name: 'Pediatrician', icon: '👶', color: 'yellow' },
  { name: 'Gynecologist', icon: '👩⚕️', color: 'rose' },
  { name: 'Psychiatrist', icon: '🧘', color: 'indigo' },
  { name: 'Ophthalmologist', icon: '👁️', color: 'cyan' },
  { name: 'ENT Specialist', icon: '👂', color: 'teal' },
  { name: 'Urologist', icon: '🫀', color: 'violet' },
  { name: 'Oncologist', icon: '🔬', color: 'emerald' },
];
