'use client';
import { useState } from 'react';
import { FileText, Download, Calendar, User, Pill, Search, ChevronDown, ChevronUp } from 'lucide-react';

export function PrescriptionsClient({ prescriptions }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = prescriptions.filter(p =>
    p.doctor?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">My Prescriptions</h1>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(rx => (
            <div key={rx.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{rx.diagnosis || 'Prescription'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {rx.doctor?.user?.name}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(rx.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {rx.pdfUrl && (
                    <a href={rx.pdfUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-xl transition-colors">
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {expanded === rx.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expanded === rx.id && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-5 space-y-4">
                  {rx.medicines && rx.medicines.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Medicines</p>
                      <div className="space-y-2">
                        {rx.medicines.map((med, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <Pill className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{med.name}</p>
                              <p className="text-xs text-gray-500">{med.dosage} • {med.frequency} • {med.duration}</p>
                              {med.instructions && <p className="text-xs text-gray-400 italic mt-0.5">{med.instructions}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {rx.instructions && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Instructions</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{rx.instructions}</p>
                    </div>
                  )}
                  {rx.followUpDate && (
                    <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                      <Calendar className="w-4 h-4" /> Follow-up: {new Date(rx.followUpDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
