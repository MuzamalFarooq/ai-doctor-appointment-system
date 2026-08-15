'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, ChevronLeft, Plus, X, AlertTriangle, CheckCircle, Clock, Zap, Activity, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';

// metadata must be in a server component

const COMMON_SYMPTOMS = [
  'Fever', 'Headache', 'Cough', 'Sore throat', 'Body pain', 'Fatigue',
  'Nausea', 'Vomiting', 'Diarrhea', 'Chest pain', 'Shortness of breath',
  'Dizziness', 'Rash', 'Joint pain', 'Back pain', 'Stomach pain',
  'Loss of appetite', 'Weight loss', 'Swelling', 'Blurred vision'
];

const COMMON_DISEASES = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid', 'None'];

const URGENCY_CONFIG = {
  EMERGENCY: { label: 'Emergency', color: 'danger', icon: Zap, desc: 'Seek immediate medical attention or call emergency services.' },
  WITHIN_24_HOURS: { label: 'Within 24 Hours', color: 'warning', icon: Clock, desc: 'You should see a doctor within the next 24 hours.' },
  THIS_WEEK: { label: 'This Week', color: 'info', icon: Calendar, desc: 'Book an appointment this week.' },
  ROUTINE: { label: 'Routine Consultation', color: 'success', icon: CheckCircle, desc: 'Schedule a routine appointment at your convenience.' },
};

export default function AISymptomCheckerPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [symptomInput, setSymptomInput] = useState('');
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    existingDiseases: [],
    allergies: '',
    symptoms: [],
    duration: '',
    painLevel: 5,
    additionalInfo: '',
  });

  const addSymptom = (symptom) => {
    if (!formData.symptoms.includes(symptom) && formData.symptoms.length < 15) {
      setFormData(prev => ({ ...prev, symptoms: [...prev.symptoms, symptom] }));
    }
    setSymptomInput('');
  };

  const removeSymptom = (symptom) => {
    setFormData(prev => ({ ...prev, symptoms: prev.symptoms.filter(s => s !== symptom) }));
  };

  const toggleDisease = (disease) => {
    setFormData(prev => ({
      ...prev,
      existingDiseases: prev.existingDiseases.includes(disease)
        ? prev.existingDiseases.filter(d => d !== disease)
        : [...prev.existingDiseases, disease],
    }));
  };

  const handleAnalyze = async () => {
    if (formData.symptoms.length === 0) { toast.error('Please add at least one symptom'); return; }
    setLoading(true);
    setStep(4);
    try {
      const res = await fetch('/api/ai/symptom-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      toast.error('AI analysis failed. Please try again.');
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const progress = step === 4 ? 100 : ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <Badge variant="gradient" className="mb-3">Powered by GPT-4o</Badge>
          <h1 className="text-3xl font-black font-heading text-gray-900 dark:text-white mb-2">
            AI Symptom Checker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Describe your symptoms and get personalized doctor recommendations
          </p>
        </motion.div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 mb-8">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <strong>Medical Disclaimer:</strong> This AI tool provides informational guidance only and does not constitute medical diagnosis or advice. Always consult a qualified healthcare professional for medical decisions. In emergencies, call 115 (Pakistan Emergency) immediately.
          </p>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Step {step} of 3</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {['Basic Info', 'Symptoms', 'Details'].map((label, i) => (
                <span key={label} className={`text-xs font-medium ${i + 1 <= step ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>{label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-card p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div key="step1" initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }} variants={fadeUp}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Age <span className="text-red-500">*</span></label>
                      <input type="number" min="0" max="120" value={formData.age}
                        onChange={e => setFormData(p => ({ ...p, age: e.target.value }))}
                        placeholder="e.g. 32" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-3 gap-2">
                        {['male', 'female', 'other'].map(g => (
                          <button key={g} type="button" onClick={() => setFormData(p => ({ ...p, gender: g }))}
                            className={`py-3 text-xs font-medium rounded-xl border-2 transition-all capitalize ${
                              formData.gender === g ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                            }`}>{g}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Existing Conditions</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_DISEASES.map(d => (
                        <button key={d} type="button" onClick={() => toggleDisease(d)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all ${
                            formData.existingDiseases.includes(d) ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                          }`}>{d}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Known Allergies</label>
                    <input type="text" value={formData.allergies} onChange={e => setFormData(p => ({ ...p, allergies: e.target.value }))}
                      placeholder="e.g. Penicillin, Peanuts (or None)" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                </div>

                <button onClick={() => { if (!formData.age || !formData.gender) { toast.error('Please fill in age and gender'); return; } setStep(2); }}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Symptoms */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate="visible" exit={{ opacity: 0, x: -20 }} variants={fadeUp}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Symptoms</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Add all symptoms you are currently experiencing.</p>

                {/* Symptom Input */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input type="text" value={symptomInput} onChange={e => setSymptomInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (symptomInput.trim()) addSymptom(symptomInput.trim()); } }}
                      placeholder="Type a symptom and press Enter..." className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                    <button onClick={() => { if (symptomInput.trim()) addSymptom(symptomInput.trim()); }}
                      className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Added Symptoms */}
                  {formData.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.symptoms.map(symptom => (
                        <span key={symptom} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                          {symptom}
                          <button onClick={() => removeSymptom(symptom)} className="hover:text-red-500 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Add */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Common symptoms:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SYMPTOMS.filter(s => !formData.symptoms.includes(s)).slice(0, 12).map(s => (
                      <button key={s} onClick={() => addSymptom(s)}
                        className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 transition-colors flex items-center gap-1">
                        <Plus className="w-3 h-3" /> {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => { if (formData.symptoms.length === 0) { toast.error('Add at least one symptom'); return; } setStep(3); }}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate="visible" exit={{ opacity: 0, x: -20 }} variants={fadeUp}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Symptom Details</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How long have you had these symptoms?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1-2 days', '3-7 days', '1-2 weeks', '3-4 weeks', '1-3 months', '3+ months'].map(d => (
                        <button key={d} type="button" onClick={() => setFormData(p => ({ ...p, duration: d }))}
                          className={`py-2 text-xs font-medium rounded-xl border-2 transition-all ${
                            formData.duration === d ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                          }`}>{d}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pain/Discomfort Level: <span className="text-primary-600 dark:text-primary-400 font-bold">{formData.painLevel}/10</span>
                    </label>
                    <div className="relative">
                      <input type="range" min="0" max="10" value={formData.painLevel}
                        onChange={e => setFormData(p => ({ ...p, painLevel: parseInt(e.target.value) }))}
                        className="w-full accent-primary-600" />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>No pain</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                      </div>
                    </div>
                    <div className={`mt-2 text-xs font-medium ${
                      formData.painLevel >= 8 ? 'text-red-500' : formData.painLevel >= 5 ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      {formData.painLevel >= 8 ? 'Severe — Consider immediate care' : formData.painLevel >= 5 ? 'Moderate — See a doctor soon' : 'Mild — Monitor symptoms'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Additional Information (optional)</label>
                    <textarea rows={3} value={formData.additionalInfo}
                      onChange={e => setFormData(p => ({ ...p, additionalInfo: e.target.value }))}
                      placeholder="Any other relevant information: recent travel, medications, family history..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={handleAnalyze} disabled={!formData.duration}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    <Brain className="w-4 h-4" /> Analyze with AI
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Results */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} variants={fadeUp}>
                {loading ? (
                  <div className="text-center py-16">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 rounded-full border-4 border-primary-100 dark:border-primary-900 border-t-primary-600 mx-auto mb-6"
                    />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Analyzing Your Symptoms</h3>
                    <p className="text-gray-500 text-sm">Our AI is reviewing your health data...</p>
                    <div className="flex justify-center gap-1 mt-4">
                      {['Checking symptoms', 'Finding specialists', 'Matching doctors'].map((label, i) => (
                        <motion.span key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.8 }}
                          className="text-xs text-primary-500 bg-primary-50 dark:bg-primary-950 px-3 py-1 rounded-full">
                          {label}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">AI Analysis Results</h2>
                      <p className="text-xs text-gray-400">Based on your reported symptoms and health information</p>
                    </div>

                    {/* Urgency */}
                    {result.urgencyLevel && (() => {
                      const config = URGENCY_CONFIG[result.urgencyLevel];
                      const UrgencyIcon = config.icon;
                      return (
                        <div className={`p-4 rounded-2xl border-2 ${
                          result.urgencyLevel === 'EMERGENCY' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' :
                          result.urgencyLevel === 'WITHIN_24_HOURS' ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20' :
                          result.urgencyLevel === 'THIS_WEEK' ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' :
                          'border-green-300 bg-green-50 dark:bg-green-900/20'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <UrgencyIcon className="w-5 h-5" />
                            <span className="font-bold text-sm">Urgency: {config.label}</span>
                          </div>
                          <p className="text-sm opacity-80">{config.desc}</p>
                        </div>
                      );
                    })()}

                    {/* Recommended Specialist */}
                    {result.recommendedSpecialization && (
                      <div className="bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">Recommended Specialist</p>
                        <p className="text-xl font-bold text-primary-800 dark:text-primary-200">{result.recommendedSpecialization}</p>
                      </div>
                    )}

                    {/* AI Analysis */}
                    {result.analysis && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">AI Analysis</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.analysis}</p>
                      </div>
                    )}

                    {/* Recommended Doctors */}
                    {result.recommendedDoctors && result.recommendedDoctors.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Recommended Doctors</p>
                        <div className="space-y-3">
                          {result.recommendedDoctors.map((doctor, i) => (
                            <div key={doctor.id} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{i + 1}</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{doctor.user?.name}</p>
                                <p className="text-xs text-gray-400">{doctor.specialization} • {doctor.experience}y exp • ★ {doctor.rating}</p>
                              </div>
                              <Link href={`/doctors/${doctor.id}?action=book`} className="px-3 py-2 bg-primary-600 text-white text-xs font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                                Book
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={() => { setStep(1); setResult(null); setFormData({ age: '', gender: '', existingDiseases: [], allergies: '', symptoms: [], duration: '', painLevel: 5, additionalInfo: '' }); }}
                      className="w-full py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm">
                      Start New Analysis
                    </button>

                    {/* Medical Disclaimer */}
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-600 dark:text-amber-400">This analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Analysis failed. <button onClick={() => setStep(3)} className="text-primary-600 underline">Try again</button></p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
