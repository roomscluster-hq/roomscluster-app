"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TranscriptCardProps {
  onDownloadTxt: () => void;
  onDownloadCsv: () => void;
}

export function TranscriptCard({ onDownloadTxt, onDownloadCsv }: TranscriptCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-semibold text-ink-900">Chat Transcript</h2>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-700/60">
            Download the full chat log from this session.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onDownloadTxt}>
              Download .txt
            </Button>
            <Button variant="secondary" size="sm" onClick={onDownloadCsv}>
              Download .csv
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
