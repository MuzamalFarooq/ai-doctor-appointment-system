import { prisma } from '@/lib/prisma';
import { Brain, User, AlertTriangle, Clock } from 'lucide-react';

export const metadata = { title: 'AI Logs' };

const URGENCY_COLOR = {
  EMERGENCY: 'text-red-600 bg-red-50 border-red-200',
  WITHIN_24_HOURS: 'text-amber-600 bg-amber-50 border-amber-200',
  THIS_WEEK: 'text-blue-600 bg-blue-50 border-blue-200',
  ROUTINE: 'text-green-600 bg-green-50 border-green-200',
};

export default async function AILogsPage() {
  let logs = [];
  try {
    logs = await prisma.aIRecommendation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  } catch {}

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">AI Symptom Check Logs</h1>
          <p className="text-gray-500 text-sm">{logs.length} total analyses performed</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No AI analyses yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{log.age ? `${log.age}y` : 'Unknown age'} • {log.gender || 'Unknown gender'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(log.symptoms || []).map(s => <span key={s} className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded-full">{s}</span>)}
                  </div>
                </div>
                <div className="text-right">
                  {log.urgencyLevel && <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${URGENCY_COLOR[log.urgencyLevel] || ''}`}>{log.urgencyLevel.replace('_', ' ')}</span>}
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {log.recommendedSpecialization && (
                <p className="text-xs text-gray-500">Recommended: <strong className="text-primary-600 dark:text-primary-400">{log.recommendedSpecialization}</strong></p>
              )}
              {log.aiResponse && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 italic">{log.aiResponse}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
