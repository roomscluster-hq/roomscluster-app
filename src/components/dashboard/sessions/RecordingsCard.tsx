"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Recording {
  id: string;
  filename: string;
  createdAt: string;
  duration: number | null;
  size: number | null;
}

interface RecordingsCardProps {
  recordings?: Recording[];
  isLoading: boolean;
  onDownload: (id: string) => void;
  formatDuration: (seconds: number | null) => string;
  formatFileSize: (bytes: number | null) => string;
  formatDateTime: (date: string) => string;
}

function RecordingItem({
  rec,
  onDownload,
  formatDuration,
  formatFileSize,
  formatDateTime,
}: {
  rec: Recording;
  onDownload: (id: string) => void;
  formatDuration: (seconds: number | null) => string;
  formatFileSize: (bytes: number | null) => string;
  formatDateTime: (date: string) => string;
}) {
  const isAudio = rec.filename.endsWith('.mp3');
  const baseName = rec.filename
    .split("/")
    .pop()
    ?.replace(/\.(mp4|mp3)$/, "") ?? rec.filename;

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0">{isAudio ? '🎵' : '🎥'}</span>
        <div className="min-w-0">
          <p className="text-sm text-ink-900 truncate">{baseName}</p>
          <p className="text-xs text-ink-700/40">
            {formatDateTime(rec.createdAt)} · {formatDuration(rec.duration)} ·{" "}
            {formatFileSize(rec.size)}
          </p>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onDownload(rec.id)}
        className="shrink-0"
      >
        Download
      </Button>
    </div>
  );
}

export function RecordingsCard({
  recordings,
  isLoading,
  onDownload,
  formatDuration,
  formatFileSize,
  formatDateTime,
}: RecordingsCardProps) {
  // Separate recordings by type
  const videoRecordings = recordings?.filter((rec) => rec.filename.endsWith('.mp4')) ?? [];
  const audioRecordings = recordings?.filter((rec) => rec.filename.endsWith('.mp3')) ?? [];

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-semibold text-ink-900">
          Recordings ({recordings?.length ?? 0})
        </h2>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : !recordings || recordings.length === 0 ? (
          <div className="bg-surface-50 border border-surface-200 rounded-lg px-4 py-6 text-center">
            <p className="text-sm text-ink-700/60">
              🎥 No recordings yet for this session.
            </p>
            <p className="text-xs text-ink-700/40 mt-1">
              Start a recording from the room&apos;s control bar while live.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video Recordings Section */}
            {videoRecordings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-ink-700/70 mb-2 flex items-center gap-2">
                  <span>🎥</span>
                  <span>Video Recordings ({videoRecordings.length})</span>
                </h3>
                <div className="divide-y divide-surface-200 border border-surface-200 rounded-lg px-3">
                  {videoRecordings.map((rec) => (
                    <RecordingItem
                      key={rec.id}
                      rec={rec}
                      onDownload={onDownload}
                      formatDuration={formatDuration}
                      formatFileSize={formatFileSize}
                      formatDateTime={formatDateTime}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Audio Recordings Section */}
            {audioRecordings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-ink-700/70 mb-2 flex items-center gap-2">
                  <span>🎵</span>
                  <span>Audio Recordings ({audioRecordings.length})</span>
                </h3>
                <div className="divide-y divide-surface-200 border border-surface-200 rounded-lg px-3">
                  {audioRecordings.map((rec) => (
                    <RecordingItem
                      key={rec.id}
                      rec={rec}
                      onDownload={onDownload}
                      formatDuration={formatDuration}
                      formatFileSize={formatFileSize}
                      formatDateTime={formatDateTime}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
