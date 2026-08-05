"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileText, FileSpreadsheet, Users } from "lucide-react";

interface Attendee {
  id?: string;
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
}: AttendanceCardProps) {
  const count = attendance?.length ?? 0;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary-600" />
            <h2 className="font-semibold text-ink-900">Attendance</h2>
          </div>
          {isLoading ? (
            <Spinner />
          ) : (
            <span className="text-sm text-ink-700/60">
              {count} attendee{count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : count === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
              <Users size={24} className="text-ink-700/30" />
            </div>
            <p className="text-sm text-ink-700/60">
              No attendance data yet
            </p>
            <p className="text-xs text-ink-700/40 mt-1">
              Attendees will appear here once they join the session
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-ink-700/70">
              Download the full attendance record in your preferred format
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={onDownloadTxt}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <FileText size={16} className="text-ink-700/60" />
                <span>.txt</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onDownloadCsv}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <FileSpreadsheet size={16} className="text-success-600" />
                <span>.csv</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
