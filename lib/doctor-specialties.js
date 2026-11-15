/**
 * Canonical 18 Medical Specialties for MediConnect
 * Standardized taxonomy for specialties, provider titles, and descriptions.
 */

export const DOCTOR_SPECIALTIES = [
  {
    id: 1,
    name: 'Cardiology',
    practitionerTitle: 'Cardiologist',
    description: 'Heart and cardiovascular care',
    iconName: 'HeartPulse',
    color: '#EF4444',
    aliases: ['Cardiology', 'Cardiologist', 'Heart Specialist', 'Cardiac'],
  },
  {
    id: 2,
    name: 'Dentistry',
    practitionerTitle: 'Dentist',
    description: 'Oral health and dental care',
    iconName: 'Smile',
    color: '#06B6D4',
    aliases: ['Dentistry', 'Dentist', 'Dental Surgeon', 'Oral Surgeon'],
  },
  {
    id: 3,
    name: 'Dermatology',
    practitionerTitle: 'Dermatologist',
    description: 'Skin, hair, and nail care',
    iconName: 'Activity',
    color: '#F59E0B',
    aliases: ['Dermatology', 'Dermatologist', 'Skin Specialist'],
  },
  {
    id: 4,
    name: 'ENT',
    practitionerTitle: 'ENT Specialist',
    description: 'Ear, nose, and throat care',
    iconName: 'Stethoscope',
    color: '#3B82F6',
    aliases: ['ENT', 'ENT Specialist', 'Otolaryngologist', 'Ear Nose Throat'],
  },
  {
    id: 5,
    name: 'Endocrinology',
    practitionerTitle: 'Endocrinologist',
    description: 'Hormone and endocrine system care',
    iconName: 'Activity',
    color: '#8B5CF6',
    aliases: ['Endocrinology', 'Endocrinologist', 'Diabetes Specialist', 'Hormone Specialist'],
  },
  {
    id: 6,
    name: 'Gastroenterology',
    practitionerTitle: 'Gastroenterologist',
    description: 'Digestive system and gastrointestinal care',
    iconName: 'Activity',
    color: '#10B981',
    aliases: ['Gastroenterology', 'Gastroenterologist', 'GI Specialist', 'Liver Specialist'],
  },
  {
    id: 7,
    name: 'General Medicine',
    practitionerTitle: 'General Physician',
    description: 'Primary care for common health concerns',
    iconName: 'Stethoscope',
    color: '#059669',
    aliases: ['General Medicine', 'General Physician', 'Internal Medicine', 'GP', 'General Practitioner', 'Medical Specialist'],
  },
  {
    id: 8,
    name: 'General Surgery',
    practitionerTitle: 'General Surgeon',
    description: 'Consultation for surgical concerns',
    iconName: 'Scissors',
    color: '#DC2626',
    aliases: ['General Surgery', 'General Surgeon', 'Surgeon'],
  },
  {
    id: 9,
    name: 'Gynecology',
    practitionerTitle: 'Gynecologist',
    description: "Women's reproductive and gynecologic care",
    iconName: 'HeartPulse',
    color: '#EC4899',
    aliases: ['Gynecology', 'Gynecologist', 'OB/GYN', 'Obstetrician', "Women's Health"],
  },
  {
    id: 10,
    name: 'Neurology',
    practitionerTitle: 'Neurologist',
    description: 'Brain, nerve, and nervous system care',
    iconName: 'Brain',
    color: '#6366F1',
    aliases: ['Neurology', 'Neurologist', 'Brain Specialist', 'Nerve Specialist'],
  },
  {
    id: 11,
    name: 'Oncology',
    practitionerTitle: 'Oncologist',
    description: 'Specialist cancer care',
    iconName: 'Microscope',
    color: '#E11D48',
    aliases: ['Oncology', 'Oncologist', 'Cancer Specialist'],
  },
  {
    id: 12,
    name: 'Ophthalmology',
    practitionerTitle: 'Ophthalmologist',
    description: 'Eye health and vision care',
    iconName: 'Eye',
    color: '#14B8A6',
    aliases: ['Ophthalmology', 'Ophthalmologist', 'Eye Specialist'],
  },
  {
    id: 13,
    name: 'Orthopedics',
    practitionerTitle: 'Orthopedic Surgeon',
    description: 'Bone, joint, and musculoskeletal care',
    iconName: 'Bone',
    color: '#475569',
    aliases: ['Orthopedics', 'Orthopedic', 'Orthopedic Surgeon', 'Bone Specialist', 'Joint Specialist'],
  },
  {
    id: 14,
    name: 'Pediatrics',
    practitionerTitle: 'Pediatrician',
    description: 'Medical care for infants, children, and adolescents',
    iconName: 'Baby',
    color: '#F43F5E',
    aliases: ['Pediatrics', 'Pediatrician', 'Child Specialist', 'Children Doctor'],
  },
  {
    id: 15,
    name: 'Physiotherapy',
    practitionerTitle: 'Physiotherapist',
    description: 'Movement and rehabilitation care',
    iconName: 'Bone',
    color: '#0D9488',
    aliases: ['Physiotherapy', 'Physiotherapist', 'Physical Therapy', 'Rehabilitation'],
  },
  {
    id: 16,
    name: 'Psychiatry',
    practitionerTitle: 'Psychiatrist',
    description: 'Assessment and care for mental health concerns',
    iconName: 'Brain',
    color: '#7C3AED',
    aliases: ['Psychiatry', 'Psychiatrist', 'Mental Health Specialist'],
  },
  {
    id: 17,
    name: 'Pulmonology',
    practitionerTitle: 'Pulmonologist',
    description: 'Lung and respiratory care',
    iconName: 'Wind',
    color: '#0284C7',
    aliases: ['Pulmonology', 'Pulmonologist', 'Chest Specialist', 'Respiratory Specialist'],
  },
  {
    id: 18,
    name: 'Urology',
    practitionerTitle: 'Urologist',
    description: 'Urinary tract and urologic care',
    iconName: 'Activity',
    color: '#D97706',
    aliases: ['Urology', 'Urologist', 'Kidney & Bladder Specialist'],
  },
];

/**
 * Array of canonical specialty names
 */
export const CANONICAL_SPECIALTIES = DOCTOR_SPECIALTIES.map(s => s.name);

/**
 * Mapping of any lowercase alias to canonical specialty name
 */
const ALIAS_MAP = new Map();
DOCTOR_SPECIALTIES.forEach(spec => {
  spec.aliases.forEach(alias => {
    ALIAS_MAP.set(alias.toLowerCase().trim(), spec.name);
  });
  ALIAS_MAP.set(spec.name.toLowerCase().trim(), spec.name);
  ALIAS_MAP.set(spec.practitionerTitle.toLowerCase().trim(), spec.name);
});

/**
 * Normalizes any specialty variation (e.g., 'Cardiologist', 'cardiologist', 'heart specialist')
 * to its canonical specialty category ('Cardiology').
 */
export function normalizeSpecialty(input) {
  if (!input || typeof input !== 'string') return 'General Medicine';
  const clean = input.toLowerCase().trim();
  if (ALIAS_MAP.has(clean)) {
    return ALIAS_MAP.get(clean);
  }
  // Substring matching fallback
  for (const [alias, canonical] of ALIAS_MAP.entries()) {
    if (clean.includes(alias) || alias.includes(clean)) {
      return canonical;
    }
  }
  return input.trim();
}

/**
 * Gets the full metadata object for a canonical specialty
 */
export function getSpecialtyMeta(name) {
  const canonical = normalizeSpecialty(name);
  return DOCTOR_SPECIALTIES.find(s => s.name === canonical) || {
    name: canonical,
    practitionerTitle: canonical,
    description: `Expert medical care in ${canonical}.`,
    iconName: 'Stethoscope',
    color: '#059669',
  };
}

export default DOCTOR_SPECIALTIES;
