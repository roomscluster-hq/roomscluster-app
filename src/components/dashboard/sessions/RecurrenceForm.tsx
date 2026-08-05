"use client";


export interface RecurrenceOptions {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  endType: 'DATE' | 'COUNT';
  endDate?: string;
  endCount?: number;
}

interface RecurrenceFormProps {
  value: RecurrenceOptions;
  onChange: (value: RecurrenceOptions) => void;
}

export function RecurrenceForm({ value, onChange }: RecurrenceFormProps) {
  function update(patch: Partial<RecurrenceOptions>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-900">Recurring Session</p>
          <p className="text-xs text-ink-700/60 mt-0.5">
            Automatically create multiple sessions on a schedule
          </p>
        </div>
        <button
          type="button"
          onClick={() => update({ enabled: !value.enabled })}
          className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
            value.enabled ? "bg-primary-600" : "bg-surface-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-surface-0 rounded-full shadow transition-transform ${
              value.enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Recurrence options */}
      {value.enabled && (
        <div className="space-y-4 pl-4 border-l-2 border-primary-100">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              Repeat every
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={30}
                value={value.interval}
                onChange={(e) => update({ interval: parseInt(e.target.value) || 1 })}
                className="w-16 h-10 border border-surface-200 bg-surface-0 text-ink-900 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              <select
                value={value.frequency}
                onChange={(e) =>
                  update({ frequency: e.target.value as RecurrenceOptions['frequency'] })
                }
                className="flex-1 h-10 border border-surface-200 bg-surface-0 text-ink-900 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="DAILY">Day(s)</option>
                <option value="WEEKLY">Week(s)</option>
                <option value="MONTHLY">Month(s)</option>
              </select>
            </div>
          </div>

          {/* End type */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              Ends
            </label>
            <div className="space-y-2">
              {/* End by date */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="endType"
                  value="DATE"
                  checked={value.endType === 'DATE'}
                  onChange={() => update({ endType: 'DATE' })}
                  className="text-primary-600"
                />
                <span className="text-sm text-ink-700">On date</span>
                {value.endType === 'DATE' && (
                  <input
                    type="date"
                    value={value.endDate ?? ''}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => update({ endDate: e.target.value })}
                    className="ml-2 h-9 border border-surface-200 bg-surface-0 text-ink-900 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                )}
              </label>

              {/* End after count */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="endType"
                  value="COUNT"
                  checked={value.endType === 'COUNT'}
                  onChange={() => update({ endType: 'COUNT' })}
                  className="text-primary-600"
                />
                <span className="text-sm text-ink-700">After</span>
                {value.endType === 'COUNT' && (
                  <div className="flex items-center gap-2 ml-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={value.endCount ?? 4}
                      onChange={(e) =>
                        update({ endCount: parseInt(e.target.value) || 1 })
                      }
                      className="w-16 h-9 border border-surface-200 bg-surface-0 text-ink-900 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                    <span className="text-sm text-ink-700">occurrences</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-primary-50 rounded-lg px-3 py-2">
            <p className="text-xs text-primary-700">
              {getSummary(value)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getSummary(value: RecurrenceOptions): string {
  if (!value.enabled) return '';
  const freq = value.frequency === 'DAILY'
    ? value.interval === 1 ? 'day' : `${value.interval} days`
    : value.frequency === 'WEEKLY'
    ? value.interval === 1 ? 'week' : `${value.interval} weeks`
    : value.interval === 1 ? 'month' : `${value.interval} months`;

  const end = value.endType === 'DATE' && value.endDate
    ? `until ${new Date(value.endDate).toLocaleDateString()}`
    : value.endType === 'COUNT' && value.endCount
    ? `for ${value.endCount} occurrences`
    : '';

  return `Repeats every ${freq}${end ? ' ' + end : ''}`;
}