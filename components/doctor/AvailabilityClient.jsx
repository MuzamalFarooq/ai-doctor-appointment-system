'use client';
import { useState } from 'react';
import { Clock, Save, Calendar } from 'lucide-react';
import { saveAvailability } from '@/actions/doctor.actions';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOT_DURATIONS = [15, 20, 30, 45, 60];

export function AvailabilityClient({ availability: initialAvailability }) {
  const [schedule, setSchedule] = useState(() => {
    return DAYS.map((day, i) => {
      const existing = initialAvailability.find(a => a.dayOfWeek === i);
      return {
        dayOfWeek: i,
        isAvailable: existing?.isAvailable ?? (i !== 0 && i !== 6),
        startTime: existing?.startTime ?? '09:00',
        endTime: existing?.endTime ?? '17:00',
        slotDuration: existing?.slotDuration ?? 30,
      };
    });
  });
  const [loading, setLoading] = useState(false);

  const toggleDay = (i) => setSchedule(prev => prev.map((d, idx) => idx === i ? { ...d, isAvailable: !d.isAvailable } : d));
  const updateDay = (i, field, value) => setSchedule(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d));

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await saveAvailability(schedule);
      if (result?.error) toast.error(result.error);
      else toast.success('Availability saved!');
    } catch { toast.error('Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Manage Availability</h1>
          <p className="text-gray-500 text-sm mt-1">Set your working hours for each day of the week</p>
        </div>
        <button onClick={handleSave} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
          <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      {/* Quick Summary */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {DAYS.map((day, i) => (
          <button key={day} onClick={() => toggleDay(i)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              schedule[i].isAvailable ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
            }`}>
            {SHORT_DAYS[i]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {schedule.map((day, i) => (
          <div key={i} className={`bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all ${
            day.isAvailable ? 'border-primary-200 dark:border-primary-800' : 'border-gray-100 dark:border-gray-700 opacity-60'
          } p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleDay(i)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${day.isAvailable ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${day.isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="font-semibold text-gray-900 dark:text-white">{DAYS[i]}</span>
              </div>
              {day.isAvailable && <span className="text-xs text-primary-500 font-medium bg-primary-50 dark:bg-primary-950/50 px-2 py-1 rounded-full">Available</span>}
            </div>
            {day.isAvailable && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Time</label>
                  <input type="time" value={day.startTime} onChange={e => updateDay(i, 'startTime', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Time</label>
                  <input type="time" value={day.endTime} onChange={e => updateDay(i, 'endTime', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Slot (min)</label>
                  <select value={day.slotDuration} onChange={e => updateDay(i, 'slotDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {SLOT_DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
