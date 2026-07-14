"use client";

import { useEffect, useRef, useState } from "react";
import {
  LocalParticipant,
  RemoteParticipant,
  Track,
  TrackPublication,
} from "livekit-client";
import { getInitials, cn } from "@/lib/utils";
import { MicOff } from "lucide-react";

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

// ── Screen share tile ───────────────────────────────
function ScreenShareTile({ participant }: { participant: LocalParticipant | RemoteParticipant }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const name = participant.name ?? participant.identity;

  useEffect(() => {
    if (!videoRef.current) return;
    const pubs = [...participant.videoTrackPublications.values()];
    const screenTrack = pubs.find(
      (pub) => pub.track?.source === Track.Source.ScreenShare
    )?.track;
    if (screenTrack && videoRef.current) screenTrack.attach(videoRef.current);
    return () => { screenTrack?.detach(); };
  }, [participant]);

  // Listen for native fullscreen exit (e.g. pressing Escape)
  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement) setIsFullscreen(false);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        // Fallback: some mobile browsers don't support requestFullscreen
        // Try on the video element directly
        const video = videoRef.current as any;
        if (video?.webkitEnterFullscreen) {
          video.webkitEnterFullscreen(); // iOS Safari
          setIsFullscreen(true);
        }
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-ink-900 rounded-xl overflow-hidden border-2 border-primary-500 w-full group",
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-0" : ""
      )}
      style={isFullscreen ? {} : { aspectRatio: "16/9" }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
      />

      {/* Top bar — name + fullscreen button */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/60 to-transparent">
        <div className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded font-medium">
          {name} — Screen
        </div>

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 transition"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            // Shrink icon
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          ) : (
            // Expand icon
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile tap-to-fullscreen hint — shown briefly on first render */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition md:hidden pointer-events-none">
        Tap ⛶ to fullscreen
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
        "relative bg-ink-800 rounded-xl overflow-hidden w-full h-full border-2 transition-colors duration-150",
        isLocal ? "border-primary-600/60" : "border-transparent",
        isSpeaking && "border-success-500"
      )}
    >
      {isCameraEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-ink-800">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {getInitials(name ?? "?")}
          </div>
          <span className="text-white/60 text-xs">{name}</span>
        </div>
      )}

      {hasRaisedHand && (
        <div className="absolute top-2 left-2 bg-warning-500 rounded-full px-2 py-0.5 flex items-center gap-1 shadow">
          <span className="text-sm leading-none">✋</span>
          <span className="text-white text-xs font-medium">Hand raised</span>
        </div>
      )}

      {isLocal && (
        <div className="absolute top-2 right-2 bg-primary-600/80 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
          You
        </div>
      )}

      {/* Name tag — only when camera is on */}
      {isCameraEnabled && (
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
          {name}
        </div>
      )}

      {!participant.isMicrophoneEnabled && (
        <div className="absolute bottom-2 right-2 bg-danger-600/80 rounded-full p-1">
          <MicOff className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}

// ── Grid layout calculator ──────────────────────────
// Returns [cols, rows] that best fills the space for n participants
// Matches the Teams/Meet approach of filling the viewport
function getGridDimensions(count: number): [number, number] {
  if (count === 1) return [1, 1];
  if (count === 2) return [2, 1];
  if (count === 3) return [3, 1];
  if (count === 4) return [2, 2];
  if (count <= 6) return [3, 2];
  if (count <= 9) return [3, 3];
  if (count <= 12) return [4, 3];
  return [4, 3]; // paginate beyond 12
}

const PAGE_SIZE = 12;

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

  // Screen sharing participants
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
  const [cols, rows] = getGridDimensions(paginated.length);

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      const id = setTimeout(() => setPage(totalPages - 1), 0);
      return () => clearTimeout(id);
    }
    return;
  }, [totalPages, page]);

  return (
    <div className="flex flex-col h-full w-full gap-2 p-2">
      {/* Hidden audio renderers */}
      {remoteParticipants.map(p => (
        <AudioRenderer key={p.identity} participant={p} />
      ))}

      {/* Screen share strip — above grid */}
      {screenSharingSources.length > 0 && (
        <div className="shrink-0 flex gap-2">
          {screenSharingSources.map(p => (
            <ScreenShareTile key={`screen-${p.identity}`} participant={p} />
          ))}
        </div>
      )}

      {/* Video grid — fills remaining space */}
      <div
        className="flex-1 min-h-0 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
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

      {/* Pagination */}
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
          <span className="text-white/60 text-xs">Page {page + 1} of {totalPages}</span>
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