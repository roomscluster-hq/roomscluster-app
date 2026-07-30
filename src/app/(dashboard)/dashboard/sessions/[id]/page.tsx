"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { SessionSettingsPanel } from "@/components/session/SessionSettingsPanel";
import { useSessionDetail } from "@/hooks/dashboard/useSessionDetail";
import {
  SessionHeader,
  SessionStats,
  JoinLinkCard,
  RecordingsCard,
  TranscriptCard,
  AttendanceCard,
  SessionActions,
} from "@/components/dashboard/sessions";
import { formatDateTime, getJoinUrl } from "@/lib/utils";

export default function SessionDetailPage() {
  const {
    id,
    session,
    attendance,
    recordings,
    isLoading,
    attendanceLoading,
    recordingsLoading,
    startSession,
    endSession,
    confirmDelete,
    handleDownloadRecording,
    handleDownloadTranscript,
    handleDownloadAttendance,
    formatDuration,
    formatFileSize,
    isStarting,
    isEnding,
    isDeleting,
  } = useSessionDetail();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!session) return null;

  const joinUrl = getJoinUrl(session.joinCode);

  return (
    <div className="max-w-3xl">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <SessionHeader
          title={session.title}
          description={session.description ?? ""}
          status={session.status}
        />
        <SessionActions
          status={session.status}
          joinCode={session.joinCode}
          onStart={startSession}
          onEnd={endSession}
          onDelete={confirmDelete}
          isStarting={isStarting}
          isEnding={isEnding}
          isDeleting={isDeleting}
        />
      </div>

      {/* Stats */}
      <SessionStats
        participants={session._count?.participants ?? 0}
        registrations={session._count?.registrations ?? 0}
        scheduledAt={session.scheduledAt}
        formatDateTime={formatDateTime}
      />

      {/* Join Link */}
      <JoinLinkCard joinUrl={joinUrl} />

      {/* Session Settings */}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-semibold text-ink-900">Meeting Settings</h2>
        </CardHeader>
        <CardContent>
          <SessionSettingsPanel sessionId={id} />
        </CardContent>
      </Card>

      {/* Recordings */}
      <RecordingsCard
        recordings={recordings}
        isLoading={recordingsLoading}
        onDownload={handleDownloadRecording}
        formatDuration={formatDuration}
        formatFileSize={formatFileSize}
        formatDateTime={formatDateTime}
      />

      {/* Chat Transcript */}
      <TranscriptCard
        onDownloadTxt={() => handleDownloadTranscript("txt")}
        onDownloadCsv={() => handleDownloadTranscript("csv")}
      />

      {/* Attendance */}
      <AttendanceCard
        attendance={attendance}
        isLoading={attendanceLoading}
        onDownloadTxt={() => handleDownloadAttendance("txt")}
        onDownloadCsv={() => handleDownloadAttendance("csv")}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}
