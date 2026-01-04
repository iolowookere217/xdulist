'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { todosApi } from '@/lib/api/todos';
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart3,
  Loader2
} from 'lucide-react';

type Period = 'day' | 'week' | 'month';

export default function TodoSummary() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('day');

  const { data, isLoading } = useQuery({
    queryKey: ['todo-summary', selectedPeriod],
    queryFn: () => todosApi.getSummary(selectedPeriod),
  });

  const summary = data?.data?.summary;
  const trends = data?.data?.trends;

  const periods: { value: Period; label: string }[] = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Task Summary</h2>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-600">{summary.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>

            {/* Completion Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {summary.completionRate}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${summary.completionRate}%` }}
                />
              </div>
            </div>

            {/* Trends (for week/month) */}
            {trends && Object.keys(trends).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-700">Daily Breakdown</h3>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(trends).map(([date, data]) => (
                    <div key={date} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {new Date(date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600">
                          ✓ {data.completed}
                        </span>
                        <span className="text-orange-600">
                          ○ {data.pending}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Data Message */}
            {summary.total === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  No tasks for this period yet
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Unable to load summary</p>
          </div>
        )}
      </div>
    </div>
  );
}
