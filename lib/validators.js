import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['PATIENT', 'DOCTOR']).default('PATIENT'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const doctorProfileSchema = z.object({
  specialization: z.string().min(1, 'Specialization is required'),
  degree: z.array(z.string()).min(1, 'At least one degree is required'),
  experience: z.number().min(0).max(60),
  consultationFee: z.number().min(100),
  languages: z.array(z.string()).min(1),
  city: z.string().min(1),
  biography: z.string().min(50).max(2000).optional(),
  licenseNumber: z.string().min(1, 'License number is required'),
});

export const appointmentSchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Time slot is required'),
  reason: z.string().min(10, 'Please describe your reason for visit').max(500),
  symptoms: z.array(z.string()).optional(),
  type: z.enum(['in-person', 'video']).default('in-person'),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000).optional(),
});

export const symptomCheckerSchema = z.object({
  symptoms: z.array(z.string()).min(1, 'Please add at least one symptom'),
  age: z.number().min(0).max(120),
  gender: z.enum(['male', 'female', 'other']),
  existingDiseases: z.array(z.string()).optional(),
  duration: z.string().min(1),
  painLevel: z.number().min(0).max(10),
  allergies: z.array(z.string()).optional(),
});

export const prescriptionSchema = z.object({
  appointmentId: z.string().min(1),
  diagnosis: z.string().min(1),
  medicines: z.array(z.object({
    name: z.string().min(1),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
    duration: z.string().min(1),
    instructions: z.string().optional(),
  })).min(1),
  instructions: z.string().optional(),
  followUpDate: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(20).max(1000),
});
