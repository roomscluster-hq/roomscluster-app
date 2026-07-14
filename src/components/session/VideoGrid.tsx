"use client";

import { useEffect, useRef, useState } from "react";
import {
  LocalParticipant,
  RemoteParticipant,
  Track,
  TrackPublication,
} from "livekit-client";
import { getInitials, cn } from "@/lib/utils";

interface RaisedHand {
  userId: string;
  name: string;
  email: string;
}

// ── Audio renderer ──────────────────────────────────
function AudioRenderer({ participant }: { participant: RemoteParticipant }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const attachExisting = () => {
      const pubs = [...participant.audioTrackPublications.values()];
      for (const pub of pubs) {
        if (pub.track && pub.track.source === Track.Source.Microphone) {
          pub.track.attach(el);
        }
      }
    };

    attachExisting();

    const handleSubscribed = (_: any, pub: TrackPublication) => {
      if (pub.track?.source === Track.Source.Microphone) pub.track.attach(el);
    };
    const handleUnsubscribed = (_: any, pub: TrackPublication) => {
      if (pub.track?.source === Track.Source.Microphone) pub.track.detach(el);
    };

    participant.on("trackSubscribed", handleSubscribed);
    participant.on("trackUnsubscribed", handleUnsubscribed);

    return () => {
      participant.off("trackSubscribed", handleSubscribed);
      participant.off("trackUnsubscribed", handleUnsubscribed);
      const pubs = [...participant.audioTrackPublications.values()];
      for (const pub of pubs) pub.track?.detach(el);
    };
  }, [participant]);

  return <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />;
}

// ── Screen share renderer ───────────────────────────
function ScreenShareTile({ participant }: { participant: LocalParticipant | RemoteParticipant }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const name = participant.name ?? participant.identity;

  useEffect(() => {
    if (!videoRef.current) return;
    const pubs = [...participant.videoTrackPublications.values()];
    const screenTrack = pubs.find(
      (pub) => pub.track?.source === Track.Source.ScreenShare
    )?.track;

    if (screenTrack && videoRef.current) {
      screenTrack.attach(videoRef.current);
    }
    return () => { screenTrack?.detach(); };
  }, [participant]);

  return (
    <div className="col-span-2 md:col-span-4 relative bg-ink-800 rounded-card overflow-hidden border-2 border-primary-500 aspect-video">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
      <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded font-medium">
        {name} — Screen
      </div>
    </div>
  );
}

// ── Video tile ──────────────────────────────────────
interface VideoTileProps {
  participant: LocalParticipant | RemoteParticipant;
  isLocal?: boolean;
  hasRaisedHand?: boolean;
  isSpeaking?: boolean;
}

function VideoTile({ participant, isLocal, hasRaisedHand, isSpeaking }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const name = participant.name ?? participant.identity;
  const isCameraEnabled = participant.isCameraEnabled;

  useEffect(() => {
    if (!videoRef.current) return;
    const pubs = [...participant.videoTrackPublications.values()] as TrackPublication[];
    const videoTrack = pubs.find((pub) => pub.track?.source === Track.Source.Camera)?.track;
    if (videoTrack && videoRef.current) videoTrack.attach(videoRef.current);
    return () => { videoTrack?.detach(); };
  }, [participant, isCameraEnabled]);

  return (
    <div
      className={cn(
        "relative bg-ink-800 rounded-card overflow-hidden aspect-video border-2 transition-colors",
        isLocal ? "border-primary-600/50" : "border-transparent",
        isSpeaking && "border-success-500"
      )}
    >
      {isCameraEnabled ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
            {getInitials(name ?? "?")}
          </div>
        </div>
      )}

      {hasRaisedHand && (
        <div className="absolute top-2 left-2 bg-warning-500 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-md">
          <span className="text-sm leading-none">✋</span>
          <span className="text-white text-xs font-medium">Hand raised</span>
        </div>
      )}
      {isLocal && (
        <div className="absolute top-2 right-2 bg-primary-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
          You
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
        {name}
      </div>
      {!participant.isMicrophoneEnabled && (
        <div className="absolute bottom-2 right-2 bg-danger-600 rounded-full p-1">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1 1 0 000-.501A10.008 10.008 0 0010 3a9.958 9.958 0 00-4.512 1.074L3.28 2.22zM10 5a3 3 0 013 3v1.28l-4.513-4.513A3 3 0 0110 5z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Main VideoGrid ──────────────────────────────────
const PAGE_SIZE = 12; // 4 cols × 3 rows

interface VideoGridProps {
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  raisedHands?: RaisedHand[];
  activeSpeakerIds?: Set<string>;
}

export function VideoGrid({
  localParticipant,
  remoteParticipants,
  raisedHands = [],
  activeSpeakerIds,
}: VideoGridProps) {
  const [page, setPage] = useState(0);
  const raisedHandIds = new Set(raisedHands.map(h => h.userId));

  // Find screen sharing participants
  const screenSharingSources = [
    ...(localParticipant ? [localParticipant] : []),
    ...remoteParticipants,
  ].filter(p =>
    [...p.videoTrackPublications.values()].some(
      pub => pub.track?.source === Track.Source.ScreenShare
    )
  );

  const allParticipants = [
    ...(localParticipant ? [{ participant: localParticipant as LocalParticipant | RemoteParticipant, isLocal: true }] : []),
    ...remoteParticipants.map(p => ({ participant: p as LocalParticipant | RemoteParticipant, isLocal: false })),
  ];

  const totalPages = Math.ceil(allParticipants.length / PAGE_SIZE);
  const paginated = allParticipants.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset to page 0 if participants drop and current page is out of range
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      const id = setTimeout(() => setPage(totalPages - 1), 0);
      return () => clearTimeout(id);
    }
    return;
  }, [totalPages, page]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Audio renderers — hidden, one per remote participant */}
      {remoteParticipants.map(p => (
        <AudioRenderer key={p.identity} participant={p} />
      ))}

      {/* Screen share — shown above grid when active */}
      {screenSharingSources.map(p => (
        <ScreenShareTile key={`screen-${p.identity}`} participant={p} />
      ))}

      {/* Video grid — 4 cols × 3 rows, paginated */}
      <div
        className="grid gap-3 flex-1 min-h-0"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          alignContent: "start",
        }}
      >
        {paginated.map(({ participant, isLocal }) => (
          <VideoTile
            key={participant.identity}
            participant={participant}
            isLocal={isLocal}
            hasRaisedHand={raisedHandIds.has(participant.identity)}
            isSpeaking={activeSpeakerIds?.has(participant.identity)}
          />
        ))}
      </div>

      {/* Pagination — only shown when more than 12 participants */}
      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-center gap-4 py-1">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
            Prev
          </button>

          <span className="text-white/60 text-xs">
            Page {page + 1} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm transition"
          >
            Next
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}