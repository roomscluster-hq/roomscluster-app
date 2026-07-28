"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Attendee {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  leftAt?: string | null;
}

interface AttendanceCardProps {
  attendance?: Attendee[];
  isLoading: boolean;
  onDownloadTxt: () => void;
  onDownloadCsv: () => void;
  formatDateTime: (date: string) => string;
}

export function AttendanceCard({
  attendance,
  isLoading,
  onDownloadTxt,
  onDownloadCsv,
  formatDateTime,
}: AttendanceCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-semibold text-ink-900">
          Attendance ({attendance?.length ?? 0})
        </h2>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : !attendance || attendance.length === 0 ? (
          <div className="bg-surface-50 border border-surface-200 rounded-lg px-4 py-6 text-center">
            <p className="text-sm text-ink-700/60">
              👥 No attendance data yet.
            </p>
            <p className="text-xs text-ink-700/40 mt-1">
              Attendees will appear here once they join the session.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-surface-200 mb-4">
              {attendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-ink-900 truncate">{a.name}</p>
                      <p className="text-xs text-ink-700/40 truncate">{a.email}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-ink-700/60">{a.role}</p>
                    <p className="text-xs text-ink-700/40">
                      Joined {formatDateTime(a.joinedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={onDownloadTxt}>
                Download .txt
              </Button>
              <Button variant="secondary" size="sm" onClick={onDownloadCsv}>
                Download .csv
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
