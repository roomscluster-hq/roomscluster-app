"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Recording } from "@/lib/api/recording.api";

interface RecordingsCardProps {
  recordings?: Recording[];
  isLoading: boolean;
  onDownload: (id: string) => void;
  onGenerateTranscript?: (id: string) => void;
  generatingTranscriptId?: string | null;
  formatDuration: (seconds: number | null) => string;
  formatFileSize: (bytes: number | null) => string;
  formatDateTime: (date: string) => string;
}

function TranscriptModal({
  isOpen,
  onClose,
  transcript,
  recordingName,
}: {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
  recordingName: string;
}) {
  if (!isOpen) return null;

  function handleDownload() {
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recordingName}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-surface-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
          <h3 className="text-lg font-semibold text-ink-900 dark:text-white truncate pr-4">
            Transcript: {recordingName}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {/* Info banner */}
          <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg flex items-start gap-2">
            <svg className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-primary-700 dark:text-primary-300">
              Speaker labels are auto-detected. Voice recognition coming soon.
            </p>
          </div>
          <div className="space-y-4">
            {transcript.split('\n\n').map((paragraph, i) => {
              const isSpeaker = paragraph.startsWith('Speaker ');
              if (isSpeaker) {
                const colonIndex = paragraph.indexOf(': ');
                const label = colonIndex > 0 ? paragraph.substring(0, colonIndex) : paragraph.split('\n')[0];
                const text = colonIndex > 0 ? paragraph.substring(colonIndex + 2) : paragraph.substring(paragraph.indexOf('\n') + 1);
                return (
                  <div key={i} className="flex gap-3">
                    <span className="text-xs font-bold text-primary-600 shrink-0 pt-0.5 w-20">
                      {label}
                    </span>
                    <p className="text-ink-800 dark:text-ink-200 leading-relaxed text-sm">
                      {text}
                    </p>
                  </div>
                );
              }
              return (
                <p key={i} className="text-ink-800 dark:text-ink-200 leading-relaxed text-sm">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Footer with Download + Close */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download .txt
          </button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function RecordingItem({
  rec,
  onDownload,
  onGenerateTranscript,
  isGeneratingTranscript,
  formatDuration,
  formatFileSize,
  formatDateTime,
}: {
  rec: Recording;
  onDownload: (id: string) => void;
  onGenerateTranscript?: (id: string) => void;
  isGeneratingTranscript: boolean;
  formatDuration: (seconds: number | null) => string;
  formatFileSize: (bytes: number | null) => string;
  formatDateTime: (date: string) => string;
}) {
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const isAudio = rec.filename.endsWith('.mp3');
  const baseName = rec.filename
    .split("/")
    .pop()
    ?.replace(/\.(mp4|mp3)$/, "") ?? rec.filename;

  const hasTranscript = !!rec.transcript;

  return (
    <>
      <div className="py-3">
        <div className="flex items-center justify-between gap-3">
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

        {/* Transcript actions */}
        {onGenerateTranscript && (
          <div className="mt-2 pl-11">
            {isGeneratingTranscript ? (
              <div className="flex items-center gap-2 text-xs text-ink-600">
                <Spinner />
                <span>Generating transcript...</span>
              </div>
            ) : hasTranscript ? (
              <button
                onClick={() => setIsTranscriptOpen(true)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Transcript
              </button>
            ) : (
              <button
                onClick={() => onGenerateTranscript(rec.id)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Generate Transcript
              </button>
            )}
          </div>
        )}
      </div>

      <TranscriptModal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        transcript={rec.transcript || ""}
        recordingName={baseName}
      />
    </>
  );
}

export function RecordingsCard({
  recordings,
  isLoading,
  onDownload,
  onGenerateTranscript,
  generatingTranscriptId,
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
                      onGenerateTranscript={onGenerateTranscript}
                      isGeneratingTranscript={generatingTranscriptId === rec.id}
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
                      onGenerateTranscript={onGenerateTranscript}
                      isGeneratingTranscript={generatingTranscriptId === rec.id}
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
